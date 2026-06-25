import { NextResponse } from "next/server";
import { FRIENDLY_ERROR } from "@/src/lib/constants";
import { normalizeName } from "@/src/lib/normalize";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type CheckInBody = {
  name?: string;
  mokjangId?: string;
};

export async function POST(request: Request) {
  const supabase = createAdminSupabase();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  let body: CheckInBody;

  try {
    body = (await request.json()) as CheckInBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 내용을 확인할 수 없어요." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const mokjangId = body.mokjangId ?? "";

  if (!name) {
    return NextResponse.json(
      { ok: false, message: "이름을 입력해주세요." },
      { status: 400 },
    );
  }

  if (!mokjangId) {
    return NextResponse.json(
      { ok: false, message: "목장을 선택해주세요." },
      { status: 400 },
    );
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("status", "open")
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError) {
    return NextResponse.json({ ok: false, message: FRIENDLY_ERROR }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json(
      { ok: false, message: "지금은 출석 가능한 산모임이 없어요." },
      { status: 409 },
    );
  }

  const normalizedName = normalizeName(name);
  const { data: person, error: personError } = await supabase
    .from("people")
    .upsert(
      { name, normalized_name: normalizedName, mokjang_id: mokjangId },
      { onConflict: "normalized_name,mokjang_id" },
    )
    .select("id")
    .single();

  if (personError || !person) {
    return NextResponse.json({ ok: false, message: FRIENDLY_ERROR }, { status: 500 });
  }

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendances")
    .insert({ event_id: event.id, person_id: person.id })
    .select("id")
    .single();

  if (attendance?.id) {
    return NextResponse.json({ ok: true, attendanceId: attendance.id });
  }

  if (attendanceError?.code === "23505") {
    const { data: existing, error: existingError } = await supabase
      .from("attendances")
      .select("id")
      .eq("event_id", event.id)
      .eq("person_id", person.id)
      .single();

    if (!existingError && existing?.id) {
      return NextResponse.json({ ok: true, attendanceId: existing.id });
    }
  }

  return NextResponse.json({ ok: false, message: FRIENDLY_ERROR }, { status: 500 });
}

