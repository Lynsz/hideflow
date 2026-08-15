import { describe, expect, it } from "vitest";

import { APPLICATION_STATUS_LABELS } from "@/features/applications/constants";
import {
  filterKanbanApplications,
  groupKanbanApplications,
  moveKanbanApplication,
  parseKanbanFilters,
  restoreKanbanApplication,
} from "@/features/applications/services/application-kanban";
import type { KanbanApplication } from "@/features/applications/types/application";

const applications: KanbanApplication[] = [
  {
    id: "application-1",
    job_title: "Frontend Engineer",
    company: { id: "company-1", name: "Acme" },
    location: "São Paulo",
    work_mode: "remote",
    employment_type: "clt",
    salary_min: 8000,
    salary_max: 10000,
    currency: "BRL",
    applied_at: "2026-08-10",
    status: "applied",
    updated_at: "2026-08-14T10:00:00Z",
  },
  {
    id: "application-2",
    job_title: "Product Designer",
    company: { id: "company-2", name: "Orbit" },
    location: null,
    work_mode: "hybrid",
    employment_type: "pj",
    salary_min: null,
    salary_max: null,
    currency: "BRL",
    applied_at: null,
    status: "screening",
    updated_at: "2026-08-13T10:00:00Z",
  },
];

describe("application Kanban", () => {
  it("agrupa candidaturas nas colunas oficiais, inclusive vazias", () => {
    const groups = groupKanbanApplications(applications);

    expect(groups.applied).toHaveLength(1);
    expect(groups.screening[0]?.id).toBe("application-2");
    expect(groups.hired).toEqual([]);
  });

  it("mantém os labels centrais dos status", () => {
    expect(APPLICATION_STATUS_LABELS.hr_interview).toBe("Entrevista RH");
    expect(APPLICATION_STATUS_LABELS.hired).toBe("Contratada");
    expect(APPLICATION_STATUS_LABELS.withdrawn).toBe("Desisti");
  });

  it("busca por vaga e empresa", () => {
    const base = parseKanbanFilters({});

    expect(
      filterKanbanApplications(applications, {
        ...base,
        query: "frontend",
      }).map((item) => item.id),
    ).toEqual(["application-1"]);
    expect(
      filterKanbanApplications(applications, {
        ...base,
        query: "orbit",
      }).map((item) => item.id),
    ).toEqual(["application-2"]);
  });

  it("combina modalidade, contrato e empresa", () => {
    expect(
      filterKanbanApplications(applications, {
        query: "",
        workMode: "remote",
        employmentType: "clt",
        companyId: "company-1",
      }).map((item) => item.id),
    ).toEqual(["application-1"]);
  });

  it("move somente quando o status realmente muda", () => {
    const moved = moveKanbanApplication(
      applications,
      "application-1",
      "screening",
      "2026-08-15T10:00:00Z",
    );
    const unchanged = moveKanbanApplication(
      applications,
      "application-1",
      "applied",
    );

    expect(moved.changed).toBe(true);
    expect(moved.items[0]?.status).toBe("screening");
    expect(unchanged.changed).toBe(false);
    expect(unchanged.items).toEqual(applications);
  });

  it("restaura o card após falha da atualização otimista", () => {
    const moved = moveKanbanApplication(
      applications,
      "application-1",
      "rejected",
    );
    const restored = restoreKanbanApplication(moved.items, moved.previous!);

    expect(restored).toEqual(applications);
  });
});
