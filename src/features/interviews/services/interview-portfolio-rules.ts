import { sanitizeSearchTerm } from "@/features/applications/services/application-filters";
import { INTERVIEW_DEBRIEF_SECTIONS } from "@/features/interview-debrief/constants";
import { INTERVIEW_PREPARATION_SECTIONS } from "@/features/interview-preparation/constants";
import { INTERVIEW_TYPES } from "@/features/interviews/constants";
import type {
  InterviewListItem,
  InterviewPortfolioDebrief,
  InterviewPortfolioFilters,
  InterviewPortfolioFocus,
  InterviewPortfolioItem,
  InterviewPortfolioPreparation,
  InterviewPortfolioSort,
  InterviewPortfolioState,
  InterviewPortfolioSummary,
} from "@/features/interviews/types/interview";
import type { InterviewType } from "@/types/database";

type RawFilters = Record<string, string | string[] | undefined>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATES: readonly InterviewPortfolioState[] = [
  "all",
  "upcoming",
  "awaiting",
  "finished",
];
const FOCUSES: readonly InterviewPortfolioFocus[] = [
  "all",
  "preparation",
  "debrief",
  "thank_you",
];
const SORTS: readonly InterviewPortfolioSort[] = ["next", "recent", "company"];
const INTERVIEW_TYPE_VALUES = INTERVIEW_TYPES.map((type) => type.value);
const OPEN_RESULTS = new Set<InterviewListItem["result"]>([
  "scheduled",
  "rescheduled",
]);

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function hasText(value: string | null) {
  return Boolean(value?.trim());
}

function normalize(value: string) {
  return value.toLocaleLowerCase("pt-BR");
}

function getState(
  interview: InterviewListItem,
  now: number,
): Exclude<InterviewPortfolioState, "all"> {
  if (!OPEN_RESULTS.has(interview.result)) return "finished";
  return Date.parse(interview.scheduled_at) >= now ? "upcoming" : "awaiting";
}

export function parseInterviewPortfolioFilters(
  raw: RawFilters,
): InterviewPortfolioFilters {
  const companyId = first(raw.company);
  const type = first(raw.type);
  const state = first(raw.state);
  const focus = first(raw.focus);
  const sort = first(raw.sort);

  return {
    query: sanitizeSearchTerm(first(raw.q)),
    companyId: UUID_PATTERN.test(companyId) ? companyId : "",
    type: INTERVIEW_TYPE_VALUES.includes(type as InterviewType)
      ? (type as InterviewType)
      : "",
    state: STATES.includes(state as InterviewPortfolioState)
      ? (state as InterviewPortfolioState)
      : "all",
    focus: FOCUSES.includes(focus as InterviewPortfolioFocus)
      ? (focus as InterviewPortfolioFocus)
      : "all",
    sort: SORTS.includes(sort as InterviewPortfolioSort)
      ? (sort as InterviewPortfolioSort)
      : "next",
  };
}

export function buildInterviewPortfolioItems(
  interviews: InterviewListItem[],
  preparations: InterviewPortfolioPreparation[],
  debriefs: InterviewPortfolioDebrief[],
  nowIso: string,
): InterviewPortfolioItem[] {
  const preparationsByInterview = new Map(
    preparations.map((preparation) => [preparation.interview_id, preparation]),
  );
  const debriefsByInterview = new Map(
    debriefs.map((debrief) => [debrief.interview_id, debrief]),
  );
  const now = Date.parse(nowIso);

  return interviews.map((interview) => {
    const preparation = preparationsByInterview.get(interview.id);
    const debrief = debriefsByInterview.get(interview.id);
    const preparationCompleted = preparation
      ? [
          preparation.company_research,
          preparation.role_alignment,
          preparation.star_stories,
          preparation.questions_to_ask,
          preparation.logistics_notes,
        ].filter(hasText).length
      : 0;
    const debriefCompleted = debrief
      ? [
          debrief.went_well,
          debrief.improve_next_time,
          debrief.questions_received,
          debrief.follow_up_notes,
        ].filter(hasText).length + (debrief.overall_rating ? 1 : 0)
      : 0;
    const state = getState(interview, now);
    const isDebriefApplicable =
      state !== "upcoming" && interview.result !== "cancelled";
    const preparationTotal = INTERVIEW_PREPARATION_SECTIONS.length;
    const debriefTotal = INTERVIEW_DEBRIEF_SECTIONS.length + 1;

    return {
      ...interview,
      state,
      preparationCompleted,
      preparationTotal,
      preparationPercentage: Math.round(
        (preparationCompleted / preparationTotal) * 100,
      ),
      debriefCompleted,
      debriefTotal,
      debriefPercentage: Math.round((debriefCompleted / debriefTotal) * 100),
      thankYouSent: debrief?.thank_you_sent_at != null,
      preparationPending:
        state === "upcoming" && preparationCompleted < preparationTotal,
      debriefPending: isDebriefApplicable && debriefCompleted < debriefTotal,
      thankYouPending:
        isDebriefApplicable && debrief?.thank_you_sent_at == null,
    };
  });
}

export function filterAndSortInterviewPortfolio(
  items: InterviewPortfolioItem[],
  filters: InterviewPortfolioFilters,
) {
  const query = normalize(filters.query);
  const filtered = items.filter((item) => {
    if (query) {
      const searchable = normalize(
        [
          item.application.job_title,
          item.application.company.name,
          item.contact?.name,
          item.interviewer_name,
        ]
          .filter(Boolean)
          .join(" "),
      );
      if (!searchable.includes(query)) return false;
    }
    if (
      filters.companyId &&
      item.application.company_id !== filters.companyId
    ) {
      return false;
    }
    if (filters.type && item.type !== filters.type) return false;
    if (filters.state !== "all" && item.state !== filters.state) return false;
    if (filters.focus === "preparation" && !item.preparationPending) {
      return false;
    }
    if (filters.focus === "debrief" && !item.debriefPending) return false;
    if (filters.focus === "thank_you" && !item.thankYouPending) return false;
    return true;
  });

  return filtered.toSorted((left, right) => {
    if (filters.sort === "company") {
      const byCompany = left.application.company.name.localeCompare(
        right.application.company.name,
        "pt-BR",
      );
      if (byCompany !== 0) return byCompany;
      const byRole = left.application.job_title.localeCompare(
        right.application.job_title,
        "pt-BR",
      );
      if (byRole !== 0) return byRole;
    }
    if (filters.sort === "recent") {
      const byRecent =
        Date.parse(right.scheduled_at) - Date.parse(left.scheduled_at);
      if (byRecent !== 0) return byRecent;
    }
    if (filters.sort === "next") {
      const rank = { upcoming: 0, awaiting: 1, finished: 2 } as const;
      const byState = rank[left.state] - rank[right.state];
      if (byState !== 0) return byState;
      const direction = left.state === "upcoming" ? 1 : -1;
      const bySchedule =
        (Date.parse(left.scheduled_at) - Date.parse(right.scheduled_at)) *
        direction;
      if (bySchedule !== 0) return bySchedule;
    }
    return left.id.localeCompare(right.id);
  });
}

export function summarizeInterviewPortfolio(
  items: InterviewPortfolioItem[],
): InterviewPortfolioSummary {
  return items.reduce<InterviewPortfolioSummary>(
    (summary, item) => {
      summary.totalInterviews += 1;
      if (item.state === "upcoming") summary.upcomingInterviews += 1;
      if (item.preparationPending) summary.preparationPending += 1;
      if (item.debriefPending) summary.debriefPending += 1;
      return summary;
    },
    {
      totalInterviews: 0,
      upcomingInterviews: 0,
      preparationPending: 0,
      debriefPending: 0,
    },
  );
}
