import "server-only";

import { DATA_EXPORT_PAGE_SIZE } from "@/features/data-export/constants";
import type {
  ExportTableRow,
  UserDataSnapshot,
} from "@/features/data-export/types/data-export";
import { createClient } from "@/lib/supabase/server";

type PageResult<Row> = {
  data: Row[] | null;
  error: { message: string } | null;
};

async function fetchAllById<Row extends { id: string }>(
  loadPage: (cursor: string | null) => PromiseLike<PageResult<Row>>,
) {
  const rows: Row[] = [];
  let cursor: string | null = null;

  while (true) {
    const { data, error } = await loadPage(cursor);
    if (error || !data) throw new Error("Falha ao exportar dados da conta.");

    rows.push(...data);
    if (data.length < DATA_EXPORT_PAGE_SIZE) return rows;
    cursor = data.at(-1)!.id;
  }
}

type CompositeCursor = {
  applicationId: string;
  relatedId: string;
};

async function fetchAllByCompositeKey<Row extends { application_id: string }>(
  relatedKey: keyof Row,
  loadPage: (cursor: CompositeCursor | null) => PromiseLike<PageResult<Row>>,
) {
  const rows: Row[] = [];
  let cursor: CompositeCursor | null = null;

  while (true) {
    const { data, error } = await loadPage(cursor);
    if (error || !data) throw new Error("Falha ao exportar dados da conta.");

    rows.push(...data);
    if (data.length < DATA_EXPORT_PAGE_SIZE) return rows;
    const last = data.at(-1)!;
    cursor = {
      applicationId: last.application_id,
      relatedId: String(last[relatedKey]),
    };
  }
}

export async function getAuthenticatedUserDataExport(): Promise<{
  email: string;
  snapshot: UserDataSnapshot;
} | null> {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;

  if (authError || !userId) return null;
  const email =
    typeof authData.claims.email === "string" ? authData.claims.email : "";

  const profileRequest = supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  const companiesRequest = fetchAllById<ExportTableRow<"companies">>(
    (cursor) => {
      let request = supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .order("id")
        .limit(DATA_EXPORT_PAGE_SIZE);
      if (cursor) request = request.gt("id", cursor);
      return request;
    },
  );
  const applicationsRequest = fetchAllById<ExportTableRow<"applications">>(
    (cursor) => {
      let request = supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("id")
        .limit(DATA_EXPORT_PAGE_SIZE);
      if (cursor) request = request.gt("id", cursor);
      return request;
    },
  );
  const contactsRequest = fetchAllById<ExportTableRow<"contacts">>((cursor) => {
    let request = supabase
      .from("contacts")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const applicationContactsRequest = fetchAllByCompositeKey<
    ExportTableRow<"application_contacts">
  >("contact_id", (cursor) => {
    let request = supabase
      .from("application_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("application_id")
      .order("contact_id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) {
      request = request.or(
        `application_id.gt.${cursor.applicationId},and(application_id.eq.${cursor.applicationId},contact_id.gt.${cursor.relatedId})`,
      );
    }
    return request;
  });
  const interviewsRequest = fetchAllById<ExportTableRow<"interviews">>(
    (cursor) => {
      let request = supabase
        .from("interviews")
        .select("*")
        .eq("user_id", userId)
        .order("id")
        .limit(DATA_EXPORT_PAGE_SIZE);
      if (cursor) request = request.gt("id", cursor);
      return request;
    },
  );
  const interviewPreparationsRequest = fetchAllById<
    ExportTableRow<"interview_preparations">
  >((cursor) => {
    let request = supabase
      .from("interview_preparations")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const interviewDebriefsRequest = fetchAllById<
    ExportTableRow<"interview_debriefs">
  >((cursor) => {
    let request = supabase
      .from("interview_debriefs")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const interviewEventsRequest = fetchAllById<
    ExportTableRow<"interview_events">
  >((cursor) => {
    let request = supabase
      .from("interview_events")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const applicationHistoryRequest = fetchAllById<
    ExportTableRow<"application_history">
  >((cursor) => {
    let request = supabase
      .from("application_history")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const documentsRequest = fetchAllById<ExportTableRow<"documents">>(
    (cursor) => {
      let request = supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("id")
        .limit(DATA_EXPORT_PAGE_SIZE);
      if (cursor) request = request.gt("id", cursor);
      return request;
    },
  );
  const remindersRequest = fetchAllById<ExportTableRow<"reminders">>(
    (cursor) => {
      let request = supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .order("id")
        .limit(DATA_EXPORT_PAGE_SIZE);
      if (cursor) request = request.gt("id", cursor);
      return request;
    },
  );
  const technologiesRequest = fetchAllById<ExportTableRow<"technologies">>(
    (cursor) => {
      let request = supabase
        .from("technologies")
        .select("*")
        .eq("user_id", userId)
        .order("id")
        .limit(DATA_EXPORT_PAGE_SIZE);
      if (cursor) request = request.gt("id", cursor);
      return request;
    },
  );
  const applicationTechnologiesRequest = fetchAllByCompositeKey<
    ExportTableRow<"application_technologies">
  >("technology_id", (cursor) => {
    let request = supabase
      .from("application_technologies")
      .select("*")
      .eq("user_id", userId)
      .order("application_id")
      .order("technology_id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) {
      request = request.or(
        `application_id.gt.${cursor.applicationId},and(application_id.eq.${cursor.applicationId},technology_id.gt.${cursor.relatedId})`,
      );
    }
    return request;
  });
  const applicationActivitiesRequest = fetchAllById<
    ExportTableRow<"application_activities">
  >((cursor) => {
    let request = supabase
      .from("application_activities")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const applicationOffersRequest = fetchAllById<
    ExportTableRow<"application_offers">
  >((cursor) => {
    let request = supabase
      .from("application_offers")
      .select("*")
      .eq("user_id", userId)
      .order("id")
      .limit(DATA_EXPORT_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });

  const [
    profile,
    companies,
    applications,
    contacts,
    applicationContacts,
    interviews,
    interviewPreparations,
    interviewDebriefs,
    interviewEvents,
    applicationHistory,
    documents,
    reminders,
    technologies,
    applicationTechnologies,
    applicationActivities,
    applicationOffers,
  ] = await Promise.all([
    profileRequest,
    companiesRequest,
    applicationsRequest,
    contactsRequest,
    applicationContactsRequest,
    interviewsRequest,
    interviewPreparationsRequest,
    interviewDebriefsRequest,
    interviewEventsRequest,
    applicationHistoryRequest,
    documentsRequest,
    remindersRequest,
    technologiesRequest,
    applicationTechnologiesRequest,
    applicationActivitiesRequest,
    applicationOffersRequest,
  ]);

  if (profile.error || !profile.data) {
    throw new Error("Falha ao exportar dados da conta.");
  }

  return {
    email,
    snapshot: {
      profile: profile.data,
      companies,
      applications,
      contacts,
      applicationContacts,
      interviews,
      interviewPreparations,
      interviewDebriefs,
      interviewEvents,
      applicationHistory,
      documents,
      reminders,
      technologies,
      applicationTechnologies,
      applicationActivities,
      applicationOffers,
    },
  };
}
