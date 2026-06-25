import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type PersonWithMokjang = {
  name: string;
  mokjangs: { name: string } | null;
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
  const { data: members } = await supabase
    .from("small_group_members")
    .select("people(name,mokjangs(name))")
    .eq("small_group_id", membership.small_group_id);

  const myPerson = attendance.people as { name?: string } | null;

  return NextResponse.json({
    ok: true,
    myName: myPerson?.name ?? "참석자",
    groupNumber: group?.group_number,
    members:
      members?.map((member) => {
        const person = member.people as PersonWithMokjang | null;
        return {
          name: person?.name ?? "참석자",
          mokjangName: person?.mokjangs?.name ?? "목장",
        };
      }) ?? [],
  });
}

