import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type PersonWithMokjang = {
  name: string;
  mokjangs: { name: string } | null;
};

type GroupMemberRow = {
  person_id: string;
  people: PersonWithMokjang | null;
};

type AttendanceAvatarRow = {
  id: string;
  person_id: string;
  avatar_id: number | null;
};

export async function GET(request: Request) {
  const supabase = createAdminSupabase();
  const { searchParams } = new URL(request.url);
  const attendanceId = searchParams.get("attendanceId");

  if (!attendanceId) {
    return NextResponse.json(
      { ok: false, message: "출석 정보를 찾을 수 없어요." },
      { status: 400 },
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  const { data: attendance } = await supabase
    .from("attendances")
    .select("event_id,person_id,people(name)")
    .eq("id", attendanceId)
    .maybeSingle();

  if (!attendance) {
    return NextResponse.json(
      { ok: false, message: "출석 정보를 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const { data: event } = await supabase
    .from("events")
    .select("status")
    .eq("id", attendance.event_id)
    .single();

  if (event?.status !== "confirmed") {
    return NextResponse.json(
      { ok: false, message: "아직 조 편성이 완료되지 않았어요." },
      { status: 409 },
    );
  }

  const { data: groups } = await supabase
    .from("small_groups")
    .select("id,group_number")
    .eq("event_id", attendance.event_id)
    .eq("is_confirmed", true);

  const groupIds = groups?.map((group) => group.id) ?? [];

  if (groupIds.length === 0) {
    return NextResponse.json(
      { ok: false, message: "아직 조 편성이 완료되지 않았어요." },
      { status: 409 },
    );
  }

  const { data: membership } = await supabase
    .from("small_group_members")
    .select("small_group_id")
    .eq("person_id", attendance.person_id)
    .in("small_group_id", groupIds)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { ok: false, message: "내 조를 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const group = groups?.find((item) => item.id === membership.small_group_id);
  const { data: memberData } = await supabase
    .from("small_group_members")
    .select("person_id,people(name,mokjangs(name))")
    .eq("small_group_id", membership.small_group_id);
  const members = (memberData ?? []) as unknown as GroupMemberRow[];
  const personIds = members.map((member) => member.person_id);
  const attendanceByPersonId = await getAttendanceAvatars(
    supabase,
    attendance.event_id,
    personIds,
  );
  const myPerson = attendance.people as { name?: string } | null;

  return NextResponse.json({
    ok: true,
    myName: myPerson?.name ?? "참석자",
    myAttendanceId: attendanceId,
    groupNumber: group?.group_number,
    members: members.map((member) => {
      const person = member.people;
      const memberAttendance = attendanceByPersonId.get(member.person_id);

      return {
        attendanceId: memberAttendance?.id ?? member.person_id,
        name: person?.name ?? "참석자",
        mokjangName: person?.mokjangs?.name ?? "목장",
        avatarId: memberAttendance?.avatar_id ?? null,
      };
    }),
  });
}

async function getAttendanceAvatars(
  supabase: NonNullable<ReturnType<typeof createAdminSupabase>>,
  eventId: string,
  personIds: string[],
) {
  const rowsByPersonId = new Map<string, AttendanceAvatarRow>();

  if (personIds.length === 0) {
    return rowsByPersonId;
  }

  const withAvatar = await supabase
    .from("attendances")
    .select("id,person_id,avatar_id")
    .eq("event_id", eventId)
    .in("person_id", personIds);

  if (!withAvatar.error) {
    for (const row of withAvatar.data ?? []) {
      rowsByPersonId.set(row.person_id, row);
    }

    return rowsByPersonId;
  }

  // Keep the group result usable until the optional avatar migration is applied.
  if (withAvatar.error.code !== "42703") {
    return rowsByPersonId;
  }

  const withoutAvatar = await supabase
    .from("attendances")
    .select("id,person_id")
    .eq("event_id", eventId)
    .in("person_id", personIds);

  for (const row of withoutAvatar.data ?? []) {
    rowsByPersonId.set(row.person_id, { ...row, avatar_id: null });
  }

  return rowsByPersonId;
}
