import { AppShell } from "@/src/components/AppShell";
import { CheckInForm } from "@/src/components/CheckInForm";
import { FALLBACK_MOKJANGS } from "@/src/lib/constants";
import { createServerSupabase } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const supabase = await createServerSupabase();
  const mokjangs = supabase
    ? await supabase
        .from("mokjangs")
        .select("id,name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .then(({ data }) => data ?? FALLBACK_MOKJANGS)
    : FALLBACK_MOKJANGS;

  return (
    <AppShell status="출석 접수 중">
      <section className="mb-5 px-1 pt-2">
        <p className="mb-3 text-sm font-black text-[var(--green-dark)]">
          WE ARE DREAMERS
        </p>
        <h1 className="text-[34px] font-black leading-tight tracking-[-0.055em]">
          산모임
          <br />
          출석하기
        </h1>
        <p className="mt-3 text-[15px] font-semibold leading-6 text-[var(--muted)]">
          이름을 입력하고 목장을 선택해주세요.
        </p>
      </section>
      <CheckInForm mokjangs={mokjangs} />
    </AppShell>
  );
}

