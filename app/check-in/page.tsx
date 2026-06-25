import { AppShell } from "@/src/components/AppShell";
import { CheckInForm } from "@/src/components/CheckInForm";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const supabase = createAdminSupabase();
  const mokjangsResult = supabase
    ? await supabase
        .from("mokjangs")
        .select("id,name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
    : null;
  const mokjangs = mokjangsResult?.data ?? [];

  return (
    <AppShell status="출석 접수 중">
      <section className="hero-copy">
        <p className="hero-kicker">WE ARE DREAMERS</p>
        <h1 className="hero-title">
          산모임
          <br />
          출석하기
        </h1>
        <p className="hero-desc">이름을 입력하고 목장을 선택해주세요.</p>
      </section>
      {mokjangsResult?.error ? (
        <MokjangUnavailable
          message={
            mokjangsResult.error.code === "42P01"
              ? "Supabase SQL Editor에서 src/db/schema.sql을 먼저 실행해주세요."
              : "목장 목록을 Supabase에서 불러오지 못했어요."
          }
        />
      ) : mokjangs.length === 0 ? (
        <MokjangUnavailable message="Supabase mokjangs 테이블에 활성 목장이 없어요. schema.sql을 실행하거나 목장을 추가해주세요." />
      ) : (
        <CheckInForm mokjangs={mokjangs} />
      )}
    </AppShell>
  );
}

function MokjangUnavailable({ message }: { message: string }) {
  return (
    <section className="soft-card checkin-card text-center">
      <h2 className="text-xl font-black tracking-[-0.04em]">목장 목록 준비가 필요해요</h2>
      <p className="mt-4 text-[15px] font-semibold leading-6 text-[var(--muted)]">
        {message}
      </p>
    </section>
  );
}
