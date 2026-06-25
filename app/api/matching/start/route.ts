import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin-auth";
import {
  createMatchingGroups,
  type Attendee,
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

  const result = createMatchingGroups(
    attendees,
    (rules ?? []).map(
      (rule): SeparationRule => ({
        personAId: rule.person_a_id,
        personBId: rule.person_b_id,
      }),
    ),
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

