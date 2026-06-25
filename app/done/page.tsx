import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";

type DonePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonePage({ searchParams }: DonePageProps) {
  const params = await searchParams;
  const attendanceId = typeof params.attendanceId === "string" ? params.attendanceId : "";

  if (!attendanceId) {
    redirect("/check-in");
  }

  return (
    <AppShell status="출석 완료">
      <section className="soft-card mt-10 p-6 text-center">
        <div className="mx-auto mb-5 grid h-[92px] w-[92px] place-items-center rounded-full bg-[var(--green)] text-5xl font-black text-white shadow-[0_16px_35px_rgb(8_127_80_/_24%)]">
          ✓
        </div>
        <h1 className="text-[30px] font-black tracking-[-0.05em]">출석 완료!</h1>
        <p className="mt-4 text-[16px] font-semibold leading-7 text-[var(--muted)]">
          오늘 산모임 출석이 완료되었어요.
          <br />
          관리자가 조를 매칭하면 결과를 볼 수 있어요.
        </p>
        <div className="mt-6 rounded-[22px] bg-[var(--green-soft)] px-4 py-4 text-[15px] font-black leading-6 text-[var(--green-dark)]">
          관리자 확인 후 조 편성이 확정됩니다.
        </div>
        <Link
          className="btn btn-primary mt-6 w-full"
          href={`/waiting?attendanceId=${encodeURIComponent(attendanceId)}`}
        >
          조 편성 기다리기
        </Link>
      </section>
    </AppShell>
  );
}

