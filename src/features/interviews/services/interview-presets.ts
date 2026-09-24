import type { ContactOption } from "@/features/contacts/types/contact";
import type { InterviewApplicationOption } from "@/features/interviews/types/interview";

export function resolveInterviewPreset(
  applications: InterviewApplicationOption[],
  contacts: ContactOption[],
  requestedApplicationId: string,
  requestedContactId: string,
) {
  const application =
    applications.find((item) => item.id === requestedApplicationId) ??
    applications[0];
  const contact = contacts.find(
    (item) =>
      item.id === requestedContactId &&
      item.company_id === application?.company_id,
  );

  return {
    applicationId: application?.id ?? "",
    contactId: contact?.id ?? "",
  };
}
