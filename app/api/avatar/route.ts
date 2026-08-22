import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type AvatarBody = {
  attendanceId?: string;
  avatarId?: number;
};

export async function POST(request: Request) {
  let body: AvatarBody;

  try {
    body = (await request.json()) as AvatarBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 내용을 확인할 수 없어요." },
      { status: 400 },
    );
  }

  const attendanceId = body.attendanceId?.trim() ?? "";
  const avatarId = body.avatarId;

  if (!isUuid(attendanceId)) {
    return NextResponse.json(
      { ok: false, message: "출석 정보를 확인할 수 없어요." },
      { status: 400 },
    );
  }

  if (
    typeof avatarId !== "number" ||
    !Number.isInteger(avatarId) ||
    avatarId < 1 ||
    avatarId > 16
  ) {
    return NextResponse.json(
      { ok: false, message: "캐릭터 번호를 확인해주세요." },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabase();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("attendances")
    .update({ avatar_id: avatarId })
    .eq("id", attendanceId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to save attendance avatar", {
      code: error.code,
      message: error.message,
    });

    return NextResponse.json(
      { ok: false, message: "캐릭터를 저장하지 못했어요." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, message: "출석 정보를 찾을 수 없어요." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
