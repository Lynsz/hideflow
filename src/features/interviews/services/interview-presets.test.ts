import { describe, expect, it } from "vitest";

import type { ContactOption } from "@/features/contacts/types/contact";
import { resolveInterviewPreset } from "@/features/interviews/services/interview-presets";
import type { InterviewApplicationOption } from "@/features/interviews/types/interview";

const applications: InterviewApplicationOption[] = [
  {
    id: "application-a",
    job_title: "Frontend Developer",
    company_id: "company-a",
    company: { id: "company-a", name: "Acme" },
  },
  {
    id: "application-b",
    job_title: "React Developer",
    company_id: "company-b",
    company: { id: "company-b", name: "Beta" },
  },
];

const contacts: ContactOption[] = [
  { id: "contact-a", name: "Ana", company_id: "company-a" },
  { id: "contact-b", name: "Bia", company_id: "company-b" },
];

describe("resolveInterviewPreset", () => {
  it("preserva candidatura e contato autorizados da mesma empresa", () => {
    expect(
      resolveInterviewPreset(
        applications,
        contacts,
        "application-b",
        "contact-b",
      ),
    ).toEqual({ applicationId: "application-b", contactId: "contact-b" });
  });

  it("descarta contato incompatível e normaliza candidatura inexistente", () => {
    expect(
      resolveInterviewPreset(applications, contacts, "missing", "contact-b"),
    ).toEqual({ applicationId: "application-a", contactId: "" });
  });
});
