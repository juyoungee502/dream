import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "dream_admin";

export function getAdminPin() {
  return process.env.ADMIN_PIN ?? "";
}

export function isValidPinFormat(pin: string) {
  return /^\d{4}$/.test(pin);
}

export function createAdminSessionValue(pin: string) {
  const salt =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "dream-admin";

  return createHash("sha256").update(`${pin}:${salt}`).digest("hex");
}

export async function hasAdminSession() {
  const pin = getAdminPin();

  if (!isValidPinFormat(pin)) {
    return false;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!session) {
    return false;
  }

  const expected = createAdminSessionValue(pin);

  try {
    return timingSafeEqual(Buffer.from(session), Buffer.from(expected));
  } catch {
    return false;
  }
}
