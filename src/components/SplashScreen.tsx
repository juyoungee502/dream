"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import splashPage from "@/src/img/page1.png";

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/check-in");
    }, 1550);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="splash-page1-screen" aria-label="WE ARE DREAMERS 로딩 화면">
      <div className="splash-page1-frame">
        <Image
          src={splashPage}
          alt="WE ARE DREAMERS 산모임 목장 안내"
          fill
          sizes="(max-aspect-ratio: 853/1844) 100vw, 47vh"
          className="splash-page1-image"
          preload
        />
        <div
          className="splash-page1-progress"
          role="progressbar"
          aria-label="시작 화면 불러오는 중"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span />
        </div>
      </div>
    </main>
  );
}
