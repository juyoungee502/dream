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

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("status", "matching")
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) {
    return NextResponse.json(
      { ok: false, message: "확정할 조 편성이 없어요." },
      { status: 409 },
    );
  }

  await supabase
    .from("small_groups")
    .update({ is_confirmed: true })
    .eq("event_id", event.id);

  const { error } = await supabase
    .from("events")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", event.id);

  if (error) {
    return NextResponse.json(
      { ok: false, message: "조 편성을 확정하지 못했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

