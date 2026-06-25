import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

export async function GET(request: Request) {
  const supabase = createAdminSupabase();
  const { searchParams } = new URL(request.url);
  const attendanceId = searchParams.get("attendanceId");

  if (!attendanceId) {
    return NextResponse.json(
      { ok: false, ready: false, message: "출석 정보를 찾을 수 없어요." },
      { status: 400 },
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { ok: false, ready: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  const { data: attendance } = await supabase
    .from("attendances")
    .select("event_id,person_id")
    .eq("id", attendanceId)
    .maybeSingle();

  if (!attendance) {
    return NextResponse.json(
      { ok: false, ready: false, message: "출석 정보를 찾을 수 없어요." },
      { status: 404 },
    );
  }

  const { data: event } = await supabase
    .from("events")
    .select("status")
    .eq("id", attendance.event_id)
    .single();

  if (event?.status !== "confirmed") {
    return NextResponse.json({ ok: true, ready: false });
  }

  const { data: groups } = await supabase
    .from("small_groups")
    .select("id")
    .eq("event_id", attendance.event_id)
    .eq("is_confirmed", true);

  const groupIds = groups?.map((group) => group.id) ?? [];

  if (groupIds.length === 0) {
    return NextResponse.json({ ok: true, ready: false });
  }

  const { data: membership } = await supabase
    .from("small_group_members")
    .select("small_group_id")
    .eq("person_id", attendance.person_id)
    .in("small_group_id", groupIds)
    .maybeSingle();

  return NextResponse.json(
    membership
      ? { ok: true, ready: true, groupId: membership.small_group_id }
      : { ok: true, ready: false },
  );
}

