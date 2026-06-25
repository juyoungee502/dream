import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin-auth";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type MoveBody = {
  personId?: string;
  fromGroupId?: string;
  toGroupId?: string;
};

export async function POST(request: Request) {
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

  const body = (await request.json()) as MoveBody;
  const { personId, fromGroupId, toGroupId } = body;

  if (!personId || !fromGroupId || !toGroupId || fromGroupId === toGroupId) {
    return NextResponse.json(
      { ok: false, message: "이동할 조원을 다시 선택해주세요." },
      { status: 400 },
    );
  }

  const { error: deleteError } = await supabase
    .from("small_group_members")
    .delete()
    .eq("person_id", personId)
    .eq("small_group_id", fromGroupId);

  if (deleteError) {
    return NextResponse.json(
      { ok: false, message: "기존 조에서 조원을 이동하지 못했어요." },
      { status: 500 },
    );
  }

  const { error: insertError } = await supabase
    .from("small_group_members")
    .insert({ person_id: personId, small_group_id: toGroupId });

  if (insertError) {
    return NextResponse.json(
      { ok: false, message: "새 조에 조원을 추가하지 못했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

