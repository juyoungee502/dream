"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import splashMap from "@/src/img/page1.png";

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
        <section className="splash-map-screen" aria-label="WE ARE DREAMERS 로딩 화면">
          <div className="splash-map-card">
            <Image
              src={splashMap}
              alt="WE ARE DREAMERS 산모임 목장 안내"
              fill
              sizes="(max-width: 430px) 100vw, min(430px, 48vh)"
              className="splash-map-image"
              priority
            />
            <svg
              className="splash-route-overlay"
              viewBox="0 0 884 1841"
              aria-hidden="true"
            >
              <path
                id="splash-route-path"
                d="M 778 1048 C 712 1045 665 1062 613 1102 C 542 1157 459 1158 369 1184 C 283 1208 224 1273 287 1329 C 363 1397 549 1362 641 1433 C 731 1502 666 1567 534 1581 C 403 1595 354 1671 454 1717 C 542 1758 663 1720 771 1708 C 812 1703 837 1714 854 1740"
                fill="none"
              />
              <path
                className="splash-route-shadow"
                d="M 778 1048 C 712 1045 665 1062 613 1102 C 542 1157 459 1158 369 1184 C 283 1208 224 1273 287 1329 C 363 1397 549 1362 641 1433 C 731 1502 666 1567 534 1581 C 403 1595 354 1671 454 1717 C 542 1758 663 1720 771 1708 C 812 1703 837 1714 854 1740"
                pathLength="1"
                fill="none"
              />
              <path
                className="splash-route-progress"
                d="M 778 1048 C 712 1045 665 1062 613 1102 C 542 1157 459 1158 369 1184 C 283 1208 224 1273 287 1329 C 363 1397 549 1362 641 1433 C 731 1502 666 1567 534 1581 C 403 1595 354 1671 454 1717 C 542 1758 663 1720 771 1708 C 812 1703 837 1714 854 1740"
                pathLength="1"
                fill="none"
              />
              <circle className="splash-route-marker" r="10">
                <animateMotion dur="1.35s" fill="freeze" rotate="auto">
                  <mpath href="#splash-route-path" />
                </animateMotion>
              </circle>
            </svg>
          </div>
        </section>
      </div>
    </main>
  );
}
