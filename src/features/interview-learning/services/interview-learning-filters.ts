import { INTERVIEW_LEARNING_RATINGS } from "@/features/interview-learning/constants";
import type {
  InterviewLearningFilters,
  InterviewLearningRating,
  InterviewLearningSort,
  InterviewLearningThankYouFilter,
} from "@/features/interview-learning/types/interview-learning";
import { INTERVIEW_TYPES } from "@/features/interviews/constants";
import type { InterviewType } from "@/types/database";

type RawFilters = Record<string, string | string[] | undefined>;

const INTERVIEW_TYPE_VALUES = INTERVIEW_TYPES.map((type) => type.value);
const THANK_YOU_FILTERS: readonly InterviewLearningThankYouFilter[] = [
  "all",
  "pending",
  "sent",
];
const SORTS: readonly InterviewLearningSort[] = [
  "recent",
  "oldest",
  "rating_high",
  "rating_low",
];

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function parseInterviewLearningFilters(
  raw: RawFilters,
): InterviewLearningFilters {
  const interviewType = first(raw.type);
  const rating = first(raw.rating);
  const thankYou = first(raw.thankYou);
  const sort = first(raw.sort);
  const parsedPage = Number.parseInt(first(raw.page), 10);

  return {
    interviewType: INTERVIEW_TYPE_VALUES.includes(
      interviewType as InterviewType,
    )
      ? (interviewType as InterviewType)
      : "",
    rating: INTERVIEW_LEARNING_RATINGS.includes(
      rating as Exclude<InterviewLearningRating, "">,
    )
      ? (rating as InterviewLearningRating)
      : "",
    thankYou: THANK_YOU_FILTERS.includes(
      thankYou as InterviewLearningThankYouFilter,
    )
      ? (thankYou as InterviewLearningThankYouFilter)
      : "all",
    sort: SORTS.includes(sort as InterviewLearningSort)
      ? (sort as InterviewLearningSort)
      : "recent",
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}

export function buildInterviewLearningUrl(
  filters: InterviewLearningFilters,
  overrides: Partial<InterviewLearningFilters> = {},
) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (next.interviewType) params.set("type", next.interviewType);
  if (next.rating) params.set("rating", next.rating);
  if (next.thankYou !== "all") params.set("thankYou", next.thankYou);
  if (next.sort !== "recent") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return `/dashboard/aprendizados${query ? `?${query}` : ""}`;
}
