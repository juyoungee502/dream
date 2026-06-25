import { NextResponse } from "next/server";
import { createServerSupabase } from "@/src/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
        { status: 500 },
      ),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "관리자 로그인이 필요해요." },
        { status: 401 },
      ),
    };
  }

  return { ok: true as const, user };
}

