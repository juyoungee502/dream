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
          <header className="app-header">
            <Link href={admin ? "/admin" : "/check-in"} className="brand">
              <Image
                src="/logo.png"
                alt="Dreamers logo"
                width={54}
                height={54}
                className="brand-logo"
                priority
              />
              <span>
                <span className="brand-title">WE ARE DREAMERS</span>
                <span className="brand-subtitle">산모임 출석</span>
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

