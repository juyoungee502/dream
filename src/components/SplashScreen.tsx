"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/check-in");
    }, 1450);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="app-bg">
      <div className="phone-shell">
        <section className="flex min-h-screen flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[760px]">
          <div className="relative mb-6 aspect-[1.18] w-full max-w-[380px] overflow-hidden rounded-[42px] bg-[#ddd] shadow-[0_22px_46px_rgb(32_36_42_/_12%)]">
            <Image src="/splash.jpg" alt="산모임" fill className="object-cover" priority />
            <Image
              src="/logo.png"
              alt="Dreamers logo"
              width={58}
              height={58}
              className="absolute left-4 top-4 h-[58px] w-[58px] rounded-full bg-white object-cover shadow-lg"
            />
          </div>
          <span className="pill mb-5 text-[15px]">시오스 산모임 출석 중</span>
          <h1 className="text-[46px] font-black leading-none tracking-[-0.06em] text-[var(--foreground)]">
            WE ARE
            <br />
            DREAMERS
          </h1>
          <p className="mt-5 text-[16px] font-bold leading-7 text-[var(--muted)]">
            이름과 목장을 확인하고
            <br />
            오늘의 산모임 조 편성을 기다려주세요.
          </p>
          <div className="mt-8 h-3 w-2/3 max-w-[300px] overflow-hidden rounded-full bg-[rgb(8_127_80_/_12%)]">
            <div className="h-full origin-left animate-[grow_1.35s_linear_forwards] rounded-full bg-[linear-gradient(90deg,#0B8756_0%,#6FB287_100%)]" />
          </div>
        </section>
      </div>
      <style jsx>{`
        @keyframes grow {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </main>
  );
}

