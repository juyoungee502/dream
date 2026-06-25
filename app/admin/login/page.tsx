import { AppShell } from "@/src/components/AppShell";
import { AdminLoginForm } from "@/src/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <AppShell backHref="/check-in" admin>
      <section className="px-1 pt-4">
        <span className="pill mb-4">관리자</span>
        <h1 className="text-[34px] font-black leading-tight tracking-[-0.055em]">
          산모임 운영
          <br />
          로그인
        </h1>
        <p className="mt-3 text-[15px] font-semibold leading-6 text-[var(--muted)]">
          출석 현황과 조 편성은 로그인한 관리자만 확인할 수 있어요.
        </p>
      </section>
      <AdminLoginForm />
    </AppShell>
  );
}

