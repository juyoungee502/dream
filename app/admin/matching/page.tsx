import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import {
  MatchingManager,
  type MatchingGroup,
} from "@/src/components/MatchingManager";
import { hasAdminSession } from "@/src/lib/admin-pin";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type MemberRow = {
  small_group_id: string;
  person_id: string;
  people:
    | {
        name: string;
        mokjangs: { name: string } | null;
      }
    | null;
};

export const dynamic = "force-dynamic";

export default async function MatchingPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const supabase = createAdminSupabase();

  if (!supabase) {
    redirect("/admin/login");
  }

  const { data: event } = await supabase
    .from("events")
    .select("id,status")
    .in("status", ["open", "matching", "confirmed"])
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const eventId = event?.id ?? "";
  const { data: groupRows } = eventId
    ? await supabase
        .from("small_groups")
        .select("id,group_number,is_confirmed")
        .eq("event_id", eventId)
        .order("group_number", { ascending: true })
    : { data: [] };

  const groupIds = (groupRows ?? []).map((group) => group.id);
  const { data: memberRows } = groupIds.length
    ? await supabase
        .from("small_group_members")
        .select("small_group_id,person_id,people(name,mokjangs(name))")
        .in("small_group_id", groupIds)
    : { data: [] };

  const membersByGroup = new Map<string, MemberRow[]>();
  ((memberRows ?? []) as MemberRow[]).forEach((member) => {
    const bucket = membersByGroup.get(member.small_group_id) ?? [];
    bucket.push(member);
    membersByGroup.set(member.small_group_id, bucket);
  });

  const groups: MatchingGroup[] = (groupRows ?? []).map((group) => ({
    id: group.id,
    groupNumber: group.group_number,
    isConfirmed: group.is_confirmed,
    members: (membersByGroup.get(group.id) ?? []).map((member) => ({
      personId: member.person_id,
      name: member.people?.name ?? "참석자",
      mokjangName: member.people?.mokjangs?.name ?? "목장",
    })),
  }));

  return (
    <AppShell status="관리자" admin>
      <MatchingManager status={event?.status ?? "ready"} groups={groups} />
    </AppShell>
  );
}
