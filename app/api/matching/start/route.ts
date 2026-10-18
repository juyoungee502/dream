import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin-auth";
import {
  createMatchingGroups,
  type Attendee,
  type RecentPairing,
  type SeparationRule,
} from "@/src/lib/matching";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type AttendanceRow = {
  person_id: string;
  people:
    | {
        id: string;
        name: string;
        mokjang_id: string;
        mokjangs: { name: string } | null;
      }
    | null;
};

const RECENT_EVENT_PENALTIES = [8, 4, 2, 1] as const;
const EVENT_LOOKBACK_LIMIT = 8;

export async function POST() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const supabase = createAdminSupabase();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  const { data: event } = await supabase
    .from("events")
    .select("id,status")
    .in("status", ["open", "matching"])
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) {
    return NextResponse.json(
      { ok: false, message: "조 편성을 시작할 수 있는 산모임이 없어요." },
      { status: 409 },
    );
  }

  await supabase
    .from("events")
    .update({ status: "matching", started_at: new Date().toISOString() })
    .eq("id", event.id);

  const { data: attendances, error: attendanceError } = await supabase
    .from("attendances")
    .select("person_id,people(id,name,mokjang_id,mokjangs(name))")
    .eq("event_id", event.id);

  if (attendanceError) {
    return NextResponse.json(
      { ok: false, message: "출석 명단을 불러오지 못했어요." },
      { status: 500 },
    );
  }

  const attendees: Attendee[] = ((attendances ?? []) as AttendanceRow[])
    .filter((row) => row.people)
    .map((row) => ({
      personId: row.person_id,
      name: row.people?.name ?? "참석자",
      mokjangId: row.people?.mokjang_id ?? "",
      mokjangName: row.people?.mokjangs?.name ?? "목장",
    }));

  const { data: rules } = await supabase
    .from("separation_rules")
    .select("person_a_id,person_b_id");

  const recentPairings = await getRecentPairings(supabase, event.id);
  const result = createMatchingGroups(
    attendees,
    (rules ?? []).map(
      (rule): SeparationRule => ({
        personAId: rule.person_a_id,
        personBId: rule.person_b_id,
      }),
    ),
    recentPairings,
  );

  await supabase.from("small_groups").delete().eq("event_id", event.id);

  if (result.groups.length === 0) {
    return NextResponse.json({ ok: true, warnings: ["출석자가 아직 없어요."] });
  }

  const { data: insertedGroups, error: groupsError } = await supabase
    .from("small_groups")
    .insert(
      result.groups.map((group) => ({
        event_id: event.id,
        group_number: group.groupNumber,
        is_confirmed: false,
      })),
    )
    .select("id,group_number");

  if (groupsError || !insertedGroups) {
    return NextResponse.json(
      { ok: false, message: "조 정보를 저장하지 못했어요." },
      { status: 500 },
    );
  }

  const groupIdByNumber = new Map(
    insertedGroups.map((group) => [group.group_number, group.id]),
  );
  const members = result.groups.flatMap((group) => {
    const smallGroupId = groupIdByNumber.get(group.groupNumber);
    return smallGroupId
      ? group.members.map((member) => ({
          small_group_id: smallGroupId,
          person_id: member.personId,
        }))
      : [];
  });

  if (members.length > 0) {
    const { error: memberError } = await supabase
      .from("small_group_members")
      .insert(members);

    if (memberError) {
      return NextResponse.json(
        { ok: false, message: "조원을 저장하지 못했어요." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true, warnings: result.warnings });
}

async function getRecentPairings(
  supabase: NonNullable<ReturnType<typeof createAdminSupabase>>,
  currentEventId: string,
): Promise<RecentPairing[]> {
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id")
    .eq("status", "confirmed")
    .neq("id", currentEventId)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(EVENT_LOOKBACK_LIMIT);

  if (eventsError || !events?.length) {
    if (eventsError) {
      console.error("Failed to load recent matching events", eventsError);
    }
    return [];
  }

  const eventIds = events.map((event) => event.id);
  const { data: groups, error: groupsError } = await supabase
    .from("small_groups")
    .select("id,event_id")
    .in("event_id", eventIds)
    .eq("is_confirmed", true);

  if (groupsError || !groups?.length) {
    if (groupsError) {
      console.error("Failed to load recent matching groups", groupsError);
    }
    return [];
  }

  const groupIds = groups.map((group) => group.id);
  const { data: memberships, error: membershipsError } = await supabase
    .from("small_group_members")
    .select("small_group_id,person_id")
    .in("small_group_id", groupIds);

  if (membershipsError || !memberships?.length) {
    if (membershipsError) {
      console.error("Failed to load recent matching members", membershipsError);
    }
    return [];
  }

  const eventIdByGroupId = new Map(
    groups.map((group) => [group.id, group.event_id]),
  );
  const memberIdsByGroupId = new Map<string, string[]>();

  for (const membership of memberships) {
    const memberIds = memberIdsByGroupId.get(membership.small_group_id) ?? [];
    memberIds.push(membership.person_id);
    memberIdsByGroupId.set(membership.small_group_id, memberIds);
  }

  const groupsByEventId = new Map<string, string[][]>();

  for (const [groupId, memberIds] of memberIdsByGroupId) {
    const eventId = eventIdByGroupId.get(groupId);
    if (!eventId || memberIds.length < 2) continue;

    const eventGroups = groupsByEventId.get(eventId) ?? [];
    eventGroups.push(memberIds);
    groupsByEventId.set(eventId, eventGroups);
  }

  const pairings: RecentPairing[] = [];
  let penaltyIndex = 0;

  for (const event of events) {
    const eventGroups = groupsByEventId.get(event.id);
    if (!eventGroups?.length) continue;

    const penalty = RECENT_EVENT_PENALTIES[penaltyIndex];
    if (penalty === undefined) break;

    for (const memberIds of eventGroups) {
      for (let first = 0; first < memberIds.length; first += 1) {
        for (let second = first + 1; second < memberIds.length; second += 1) {
          pairings.push({
            personAId: memberIds[first],
            personBId: memberIds[second],
            penalty,
          });
        }
      }
    }

    penaltyIndex += 1;
  }

  return pairings;
}

