import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin-auth";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) return auth.response;

  const supabase = createAdminSupabase();
  const body = (await request.json()) as { personAId?: string; personBId?: string };

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  if (!body.personAId || !body.personBId || body.personAId === body.personBId) {
    return NextResponse.json(
      { ok: false, message: "서로 다른 두 사람을 선택해주세요." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("separation_rules").insert({
    person_a_id: body.personAId,
    person_b_id: body.personBId,
  });

  if (error?.code === "23505") {
    return NextResponse.json({ ok: true });
  }

  if (error) {
    return NextResponse.json(
      { ok: false, message: "규칙을 저장하지 못했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) return auth.response;

  const supabase = createAdminSupabase();
  const body = (await request.json()) as { id?: string };

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  if (!body.id) {
    return NextResponse.json(
      { ok: false, message: "삭제할 규칙을 찾을 수 없어요." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("separation_rules").delete().eq("id", body.id);

  if (error) {
    return NextResponse.json(
      { ok: false, message: "규칙을 삭제하지 못했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

