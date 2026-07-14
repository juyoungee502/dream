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
  const adminSupabase = supabase;

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
  const mokjangInput = body.mokjangId?.trim() ?? "";

  if (!name) {
    return NextResponse.json(
      { ok: false, message: "이름을 입력해주세요." },
      { status: 400 },
    );
  }

  if (!mokjangInput) {
    return NextResponse.json(
      { ok: false, message: "목장을 선택해주세요." },
      { status: 400 },
    );
  }

  const mokjangResult = await resolveMokjangId(mokjangInput);

  if (!mokjangResult.ok) {
    return NextResponse.json(
      { ok: false, message: mokjangResult.message },
      { status: mokjangResult.status },
    );
  }

  const eventResult = await getOrCreateOpenEvent();

  if (!eventResult.ok) {
    return NextResponse.json(
      { ok: false, message: eventResult.message },
      { status: eventResult.status },
    );
  }

  const normalizedName = normalizeName(name);
  const { data: person, error: personError } = await adminSupabase
    .from("people")
    .upsert(
      {
        name,
        normalized_name: normalizedName,
        mokjang_id: mokjangResult.mokjangId,
      },
      { onConflict: "normalized_name,mokjang_id" },
    )
    .select("id")
    .single();

  if (personError || !person) {
    return NextResponse.json(
      {
        ok: false,
        message: getDatabaseMessage(personError?.code, personError?.message) ?? FRIENDLY_ERROR,
      },
      { status: 500 },
    );
  }

  const { data: attendance, error: attendanceError } = await adminSupabase
    .from("attendances")
    .insert({ event_id: eventResult.eventId, person_id: person.id })
    .select("id")
    .single();

  if (attendance?.id) {
    return NextResponse.json({ ok: true, attendanceId: attendance.id });
  }

  if (attendanceError?.code === "23505") {
    const { data: existing, error: existingError } = await adminSupabase
      .from("attendances")
      .select("id")
      .eq("event_id", eventResult.eventId)
      .eq("person_id", person.id)
      .single();

    if (!existingError && existing?.id) {
      return NextResponse.json({ ok: true, attendanceId: existing.id });
    }
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        getDatabaseMessage(attendanceError?.code, attendanceError?.message) ??
        FRIENDLY_ERROR,
    },
    { status: 500 },
  );

  async function resolveMokjangId(input: string) {
    if (isUuid(input)) {
      const { data, error } = await adminSupabase
        .from("mokjangs")
        .select("id")
        .eq("id", input)
        .maybeSingle();

      if (error) {
        return {
          ok: false as const,
          status: 500,
          message:
            getDatabaseMessage(error.code, error.message) ??
            "목장 정보를 확인하지 못했어요.",
        };
      }

      if (data?.id) {
        return { ok: true as const, mokjangId: data.id };
      }
    }

    return {
      ok: false as const,
      status: 400,
      message: "Supabase에서 불러온 목장을 선택해주세요.",
    };
  }

  async function getOrCreateOpenEvent() {
    const { data: todayEvent, error: todayEventError } = await adminSupabase
    .from("events")
    .select("id,status")
    .eq("event_date", todayDate())
    .in("status", ["ready", "open", "matching", "confirmed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

    if (todayEventError) {
      return {
        ok: false as const,
        status: 500,
        message: getDatabaseMessage(todayEventError.code, todayEventError.message) ?? FRIENDLY_ERROR,
      };
    }

    if (todayEvent?.status === "open") {
      return { ok: true as const, eventId: todayEvent.id };
    }

    if (todayEvent?.id) {
      return {
        ok: false as const,
        status: 409,
        message: "오늘 출석 접수가 마감되었어요. 늦게 오셨다면 관리자에게 말씀해주세요.",
      };
    }

    const { data: createdEvent, error: createEventError } = await adminSupabase
      .from("events")
      .insert({ title: "오늘의 산모임", event_date: todayDate(), status: "open" })
      .select("id")
      .single();

    if (createEventError || !createdEvent) {
      return {
        ok: false as const,
        status: 500,
        message:
          getDatabaseMessage(createEventError?.code, createEventError?.message) ??
          FRIENDLY_ERROR,
      };
    }

    return { ok: true as const, eventId: createdEvent.id };
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDatabaseMessage(code?: string, message?: string) {
  if (message?.toLowerCase().includes("invalid api key")) {
    return "Supabase API 키가 올바르지 않아요. .env.local의 URL과 service_role 키를 다시 확인해주세요.";
  }

  if (code === "42P01") {
    return "Supabase SQL Editor에서 src/db/schema.sql을 먼저 실행해주세요.";
  }

  if (code === "23503") {
    return "목장 또는 산모임 데이터가 아직 준비되지 않았어요. 다시 시도해주세요.";
  }

  return null;
}
