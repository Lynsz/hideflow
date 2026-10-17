import { describe, expect, it } from "vitest";

import {
  filterAndSummarizeTechnologyPortfolio,
  parseTechnologyPortfolioFilter,
} from "@/features/technologies/services/technology-portfolio-rules";
import type { TechnologyPortfolioLink } from "@/features/technologies/types/technology-portfolio";

const links: TechnologyPortfolioLink[] = [
  {
    application_id: "application-a",
    technology: { id: "react", name: "React" },
    application: {
      id: "application-a",
      job_title: "Frontend Developer",
      archived_at: null,
      company: { name: "Acme" },
    },
  },
  {
    application_id: "application-b",
    technology: { id: "react", name: "React" },
    application: {
      id: "application-b",
      job_title: "UI Engineer",
      archived_at: "2026-10-01T00:00:00.000Z",
      company: { name: "Beta" },
    },
  },
  {
    application_id: "application-a",
    technology: { id: "typescript", name: "TypeScript" },
    application: {
      id: "application-a",
      job_title: "Frontend Developer",
      archived_at: null,
      company: { name: "Acme" },
    },
  },
];

describe("technology portfolio rules", () => {
  it("normalizes filters to the supported portfolio slices", () => {
    expect(parseTechnologyPortfolioFilter("active")).toBe("active");
    expect(parseTechnologyPortfolioFilter(["archived"])).toBe("all");
    expect(parseTechnologyPortfolioFilter("unexpected")).toBe("all");
  });

  it("groups technologies, preserves contextual links and ranks deterministically", () => {
    const result = filterAndSummarizeTechnologyPortfolio(links, "all");

    expect(result.items).toEqual([
      {
        id: "react",
        name: "React",
        applications: [
          {
            id: "application-a",
            jobTitle: "Frontend Developer",
            companyName: "Acme",
          },
          { id: "application-b", jobTitle: "UI Engineer", companyName: "Beta" },
        ],
      },
      {
        id: "typescript",
        name: "TypeScript",
        applications: [
          {
            id: "application-a",
            jobTitle: "Frontend Developer",
            companyName: "Acme",
          },
        ],
      },
    ]);
    expect(result.summary).toEqual({
      technologies: 2,
      links: 3,
      activeApplications: 1,
      topTechnology: "React",
    });
  });

  it("filters archived applications before grouping", () => {
    const result = filterAndSummarizeTechnologyPortfolio(links, "active");

    expect(result.items.map((item) => item.name)).toEqual([
      "React",
      "TypeScript",
    ]);
    expect(result.summary.links).toBe(2);
  });
});
