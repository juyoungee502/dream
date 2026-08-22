"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import splash2026 from "@/src/img/2026s.jpg";

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
        <section className="splash-wrap">
          <div className="splash-photo-card">
            <Image
              src={splash2026}
              alt="산모임"
              fill
              sizes="(max-width: 460px) calc(100vw - 32px), 380px"
              className="object-cover"
              priority
            />
            <Image
              src="/logo.png"
              alt="Dreamers logo"
              width={58}
              height={58}
              className="splash-logo"
              priority
            />
          </div>
          <span className="splash-pill">꿈꾸는 청년부 더드림</span>
          <h1 className="splash-title">
            WE ARE
            <br />
            DREAMERS
          </h1>
          <p className="splash-desc">재미있는 산모임 시간!</p>
          <div className="splash-progress">
            <div />
          </div>
        </section>
      </div>
    </main>
  );
}
