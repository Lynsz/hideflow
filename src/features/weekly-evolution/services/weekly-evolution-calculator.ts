import type {
  WeeklyEvolutionPageData,
  WeeklyEvolutionSources,
  WeeklyEvolutionTargets,
  WeeklyEvolutionWeek,
} from "@/features/weekly-evolution/types/weekly-evolution";
import { formatWeeklyReviewDate } from "@/features/weekly-review/services/weekly-review-period";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEK_IN_MS = 7 * DAY_IN_MS;

function toWeekStart(value: string) {
  const timestamp = Date.parse(
    value.length === 10 ? `${value}T00:00:00.000Z` : value,
  );
  if (Number.isNaN(timestamp)) return null;
  const date = new Date(timestamp);
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return new Date(utcMidnight - daysSinceMonday * DAY_IN_MS)
    .toISOString()
    .slice(0, 10);
}

function increment(
  weeksByStart: Map<string, WeeklyEvolutionWeek>,
  value: string | null,
  key: "applications" | "followUps" | "outreach" | "interviews" | "offers",
) {
  if (!value) return;
  const week = weeksByStart.get(toWeekStart(value) ?? "");
  if (week) week[key] += 1;
}

export function calculateWeeklyEvolution({
  rangeStartDate,
  weeksCount,
  targets,
  sources,
}: {
  rangeStartDate: string;
  weeksCount: number;
  targets: WeeklyEvolutionTargets;
  sources: WeeklyEvolutionSources;
}): WeeklyEvolutionPageData {
  const rangeStart = Date.parse(`${rangeStartDate}T00:00:00.000Z`);
  if (Number.isNaN(rangeStart) || weeksCount < 1) {
    throw new Error("Período de evolução semanal inválido.");
  }

  const weeks = Array.from(
    { length: weeksCount },
    (_, index): WeeklyEvolutionWeek => {
      const startDate = new Date(rangeStart + index * WEEK_IN_MS)
        .toISOString()
        .slice(0, 10);
      return {
        startDate,
        label: formatWeeklyReviewDate(startDate),
        applications: 0,
        followUps: 0,
        outreach: 0,
        interviews: 0,
        offers: 0,
        totalActivity: 0,
        reviewCompleted: false,
        overallRating: null,
        isCurrent: index === weeksCount - 1,
      };
    },
  );
  const weeksByStart = new Map(weeks.map((week) => [week.startDate, week]));

  sources.applications.forEach((item) =>
    increment(weeksByStart, item.applied_at, "applications"),
  );
  sources.followUps.forEach((item) =>
    increment(weeksByStart, item.completed_at, "followUps"),
  );
  sources.outreach.forEach((item) =>
    increment(weeksByStart, item.occurred_at, "outreach"),
  );
  sources.interviews.forEach((item) =>
    increment(weeksByStart, item.scheduled_at, "interviews"),
  );
  sources.offers.forEach((item) =>
    increment(weeksByStart, item.received_at, "offers"),
  );
  sources.reviews.forEach((review) => {
    const week = weeksByStart.get(review.week_start);
    if (!week) return;
    week.reviewCompleted = review.completed_at !== null;
    week.overallRating = review.overall_rating;
  });

  weeks.forEach((week) => {
    week.totalActivity =
      week.applications +
      week.followUps +
      week.outreach +
      week.interviews +
      week.offers;
  });
  const ratings = weeks.flatMap((week) =>
    week.overallRating === null ? [] : [week.overallRating],
  );

  return {
    weeks,
    targets,
    summary: {
      activeWeeks: weeks.filter((week) => week.totalActivity > 0).length,
      completedReviews: weeks.filter((week) => week.reviewCompleted).length,
      averageRating: ratings.length
        ? Math.round(
            (ratings.reduce((total, rating) => total + rating, 0) /
              ratings.length) *
              10,
          ) / 10
        : null,
      applications: weeks.reduce((total, week) => total + week.applications, 0),
      interviews: weeks.reduce((total, week) => total + week.interviews, 0),
      offers: weeks.reduce((total, week) => total + week.offers, 0),
    },
  };
}
