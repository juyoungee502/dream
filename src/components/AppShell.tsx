import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  status?: string;
  backHref?: string;
  admin?: boolean;
};

export function AppShell({ children, status, backHref, admin }: AppShellProps) {
  return (
    <main className="app-bg">
      <div className="phone-shell">
        <div className="content-pad">
          <header className="mb-5 flex items-center justify-between gap-3">
            <Link href={admin ? "/admin" : "/check-in"} className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Dreamers logo"
                width={54}
                height={54}
                className="h-[54px] w-[54px] rounded-full bg-white object-cover shadow-sm"
                priority
              />
              <span className="leading-tight">
                <span className="block text-[16px] font-black tracking-[-0.04em]">
                  WE ARE DREAMERS
                </span>
                <span className="block text-xs font-bold text-[var(--muted)]">
                  산모임 출석
                </span>
              </span>
            </Link>
            {backHref ? (
              <Link className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" href={backHref}>
                뒤로
              </Link>
            ) : status ? (
              <span className="pill">
                <span className="dot" />
                {status}
              </span>
            ) : null}
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}

