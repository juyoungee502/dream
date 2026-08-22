"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./DreamerWaitingAnimation.module.css";

type DreamerWaitingAnimationProps = {
  statusMessage: string;
};

const DREAMERS = [
  { src: "/dreamers/bear.webp", alt: "곰 드리머" },
  { src: "/dreamers/rabbit.webp", alt: "토끼 드리머" },
  { src: "/dreamers/dog.webp", alt: "강아지 드리머" },
  { src: "/dreamers/cat-glasses.webp", alt: "안경 쓴 고양이 드리머" },
] as const;

const STAGE_MESSAGES = [
  "함께할 드리머를 찾고 있어요.",
  "드리머들이 하나둘 모이고 있어요.",
  "드리머들이 하나둘 모이고 있어요.",
  "우리 조가 거의 완성됐어요.",
] as const;

export function DreamerWaitingAnimation({
  statusMessage,
}: DreamerWaitingAnimationProps) {
  const [loadingStage, setLoadingStage] = useState(1);

  useEffect(() => {
    DREAMERS.forEach(({ src }) => {
      const image = new window.Image();
      image.src = src;
    });

    const timers = [
      window.setTimeout(() => setLoadingStage(2), 3000),
      window.setTimeout(() => setLoadingStage(3), 6000),
      window.setTimeout(() => setLoadingStage(4), 9000),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <section className={`soft-card ${styles.card}`}>
      <div className={`spinner ${styles.spinner}`} aria-hidden="true" />
      <h1 className={styles.title}>조 편성 대기 중...</h1>
      <p className={styles.description} aria-live="polite">
        {STAGE_MESSAGES[loadingStage - 1]}
      </p>

      <div className={styles.dreamers} aria-label="모이고 있는 드리머들">
        {DREAMERS.slice(0, loadingStage).map((dreamer) => (
          <div className={styles.dreamer} key={dreamer.src}>
            <Image
              src={dreamer.src}
              alt={dreamer.alt}
              fill
              loading="eager"
              sizes="(max-width: 460px) 16vw, 72px"
              className={styles.dreamerImage}
            />
          </div>
        ))}
      </div>

      <span className={styles.statusMessage} aria-live="polite">
        {statusMessage}
      </span>
    </section>
  );
}
