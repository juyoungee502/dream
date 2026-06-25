import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  getAdminPin,
  isValidPinFormat,
} from "@/src/lib/admin-pin";

type LoginBody = {
  pin?: string;
};

export async function POST(request: Request) {
  const configuredPin = getAdminPin();

  if (!isValidPinFormat(configuredPin)) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_PIN을 .env.local에 4자리 숫자로 설정해주세요." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as LoginBody;
  const pin = body.pin ?? "";

  if (!isValidPinFormat(pin) || pin !== configuredPin) {
    return NextResponse.json(
      { ok: false, message: "관리자 비밀번호가 맞지 않아요." },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionValue(pin), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
