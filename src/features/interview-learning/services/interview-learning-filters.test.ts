import { describe, expect, it } from "vitest";

import {
  buildInterviewLearningUrl,
  parseInterviewLearningFilters,
} from "@/features/interview-learning/services/interview-learning-filters";

describe("interview learning filters", () => {
  it("normaliza filtros válidos", () => {
    expect(
      parseInterviewLearningFilters({
        type: "technical",
        rating: "4",
        thankYou: "pending",
        sort: "rating_high",
        page: "3",
      }),
    ).toEqual({
      interviewType: "technical",
      rating: "4",
      thankYou: "pending",
      sort: "rating_high",
      page: 3,
    });
  });

  it("descarta filtros e páginas inválidos", () => {
    expect(
      parseInterviewLearningFilters({
        type: "sales",
        rating: "6",
        thankYou: "automatic",
        sort: "company",
        page: "-1",
      }),
    ).toEqual({
      interviewType: "",
      rating: "",
      thankYou: "all",
      sort: "recent",
      page: 1,
    });
  });

  it("gera URL previsível e permite reiniciar a página", () => {
    const filters = parseInterviewLearningFilters({
      type: "behavioral",
      rating: "2",
      thankYou: "sent",
      sort: "oldest",
      page: "4",
    });

    expect(buildInterviewLearningUrl(filters, { page: 1 })).toBe(
      "/dashboard/aprendizados?type=behavioral&rating=2&thankYou=sent&sort=oldest",
    );
  });
});
