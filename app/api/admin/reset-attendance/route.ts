import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin-auth";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

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

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .in("status", ["open", "matching", "confirmed"])
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError) {
    return NextResponse.json(
      { ok: false, message: "초기화할 산모임을 확인하지 못했어요." },
      { status: 500 },
    );
  }

  if (!event) {
    return NextResponse.json({ ok: true, message: "초기화할 출석명단이 없어요." });
  }

  const { error: groupsError } = await supabase
    .from("small_groups")
    .delete()
    .eq("event_id", event.id);

  if (groupsError) {
    return NextResponse.json(
      { ok: false, message: "조 편성 결과를 초기화하지 못했어요." },
      { status: 500 },
    );
  }

  const { error: attendancesError } = await supabase
    .from("attendances")
    .delete()
    .eq("event_id", event.id);

  if (attendancesError) {
    return NextResponse.json(
      { ok: false, message: "출석명단을 초기화하지 못했어요." },
      { status: 500 },
    );
  }

  const { error: eventUpdateError } = await supabase
    .from("events")
    .update({ status: "open", started_at: null, confirmed_at: null })
    .eq("id", event.id);

  if (eventUpdateError) {
    return NextResponse.json(
      { ok: false, message: "산모임 상태를 초기화하지 못했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, message: "출석명단을 초기화했어요." });
}
