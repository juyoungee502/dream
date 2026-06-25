import { NextResponse } from "next/server";
import { hasAdminSession, isValidPinFormat, getAdminPin } from "@/src/lib/admin-pin";

export async function requireAdmin() {
  const pin = getAdminPin();

  if (!isValidPinFormat(pin)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "ADMIN_PIN을 .env.local에 4자리 숫자로 설정해주세요." },
        { status: 500 },
      ),
    };
  }

  if (!(await hasAdminSession())) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "관리자 비밀번호가 필요해요." },
        { status: 401 },
      ),
    };
  }

  return { ok: true as const };
}

