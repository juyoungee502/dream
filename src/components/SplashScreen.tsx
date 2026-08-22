"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect } from "react";
import groupPhoto from "@/src/img/2026s.jpg";

type RanchStop = {
  name: string;
  side: "left" | "right";
  hair: string;
  outfit: string;
  skin: string;
  longHair?: boolean;
  newFamily?: boolean;
};

const ranchStops: RanchStop[] = [
  { name: "노예은", side: "right", hair: "#65483a", outfit: "#d9a997", skin: "#f3c7a5", longHair: true },
  { name: "박신실", side: "left", hair: "#4d392f", outfit: "#dfe5d1", skin: "#efbf99", longHair: true },
  { name: "서은수", side: "right", hair: "#76503b", outfit: "#a8b692", skin: "#f1c4a0", longHair: true },
  { name: "김은택", side: "left", hair: "#3c342f", outfit: "#9eaf93", skin: "#efbd96" },
  { name: "전석민", side: "right", hair: "#43352e", outfit: "#a6bea8", skin: "#eebd95" },
  { name: "이예서", side: "left", hair: "#66473a", outfit: "#c6d0b8", skin: "#f3c8a5", longHair: true },
  { name: "김희현", side: "right", hair: "#372f2c", outfit: "#b9c6aa", skin: "#efc19b", longHair: true },
  { name: "조은서", side: "left", hair: "#4a362d", outfit: "#94a887", skin: "#edbb95", longHair: true },
  { name: "김찬호", side: "right", hair: "#41362f", outfit: "#8fa899", skin: "#efc29d" },
  { name: "장민경", side: "left", hair: "#5d4436", outfit: "#7e9c82", skin: "#f0c29e", longHair: true },
  { name: "김주람", side: "left", hair: "#6b4938", outfit: "#d5a995", skin: "#f4c9a8", longHair: true },
  { name: "새가족", side: "right", hair: "#49382f", outfit: "#718c66", skin: "#f0c39e", longHair: true, newFamily: true },
];

function RanchPerson({ stop }: { stop: RanchStop }) {
  const colors = {
    "--person-hair": stop.hair,
    "--person-outfit": stop.outfit,
    "--person-skin": stop.skin,
  } as CSSProperties;

  return (
    <span
      className={`ranch-person${stop.longHair ? " ranch-person-long-hair" : ""}`}
      style={colors}
      aria-hidden="true"
    >
      <span className="ranch-person-hair" />
      <span className="ranch-person-head">
        <span className="ranch-person-face" />
      </span>
      <span className="ranch-person-body" />
      <span className="ranch-person-arm ranch-person-arm-left" />
      <span className="ranch-person-arm ranch-person-arm-right" />
    </span>
  );
}

export function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/check-in");
    }, 1750);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="splash-page">
      <section className="splash-experience" aria-label="WE ARE DREAMERS 로딩 화면">
        <div className="splash-hero-photo">
          <Image
            src={groupPhoto}
            alt="꿈꾸는 청년부 더드림 단체사진"
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="splash-hero-image"
            priority
          />
          <div className="splash-photo-shade" />
          <div className="splash-brand-mark" aria-hidden="true">
            <span>WE ARE</span>
            <i />
            <span>DREAMERS</span>
          </div>
        </div>

        <header className="splash-heading">
          <p>꿈꾸는 청년부 더드림</p>
          <h1>
            WE ARE
            <br />
            DREAMERS
          </h1>
        </header>

        <div className="splash-journey">
          <svg className="journey-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              id="journey-route-path"
              d="M 53 1 C 58 7 43 10 47 17 C 52 23 58 25 52 33 C 45 41 43 45 49 51 C 57 58 58 63 51 69 C 43 76 43 81 48 87 C 53 92 58 94 55 99"
            />
            <path
              className="journey-route-track"
              d="M 53 1 C 58 7 43 10 47 17 C 52 23 58 25 52 33 C 45 41 43 45 49 51 C 57 58 58 63 51 69 C 43 76 43 81 48 87 C 53 92 58 94 55 99"
              pathLength="1"
            />
            <path
              className="journey-route-progress"
              d="M 53 1 C 58 7 43 10 47 17 C 52 23 58 25 52 33 C 45 41 43 45 49 51 C 57 58 58 63 51 69 C 43 76 43 81 48 87 C 53 92 58 94 55 99"
              pathLength="1"
            />
            <circle className="journey-route-marker" r="1.5">
              <animateMotion dur="1.55s" fill="freeze">
                <mpath href="#journey-route-path" />
              </animateMotion>
            </circle>
          </svg>

          <ol className="ranch-stops" aria-label="목장 안내">
            {ranchStops.map((stop) => (
              <li key={stop.name} className={`ranch-stop ranch-stop-${stop.side}`}>
                <div className="ranch-stop-content">
                  <RanchPerson stop={stop} />
                  <span className={`ranch-name${stop.newFamily ? " ranch-name-new" : ""}`}>
                    {stop.newFamily && <b aria-hidden="true">+</b>}
                    {stop.name}
                    <small>목장</small>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
