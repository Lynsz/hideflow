import "server-only";

import type { ActivityMutationValues } from "@/features/activities/schemas/activity-schema";
import { createClient } from "@/lib/supabase/server";

const emptyToNull = (value: string) => (value === "" ? null : value);

export async function insertActivity(
  userId: string,
  values: ActivityMutationValues,
) {
  const supabase = await createClient();
  return supabase
    .from("application_activities")
    .insert({
      user_id: userId,
      application_id: values.applicationId,
      activity_type: values.activityType,
      title: values.title,
      notes: emptyToNull(values.notes),
      occurred_at: values.occurredAt,
    })
    .select("id, application_id")
    .single();
}

export async function deleteActivityRecord(
  userId: string,
  activityId: string,
  applicationId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("application_activities")
    .delete()
    .eq("id", activityId)
    .eq("application_id", applicationId)
    .eq("user_id", userId)
    .select("id, application_id")
    .maybeSingle();
}
