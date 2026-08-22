"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  getDefaultAvatarId,
  getDreamerAvatarStorageKeys,
  getDreamerImage,
  getDreamerSets,
  isDreamerAvatarId,
} from "@/src/lib/dreamer-avatar";
import styles from "./DreamerWaitingAnimation.module.css";

type DreamerWaitingAnimationProps = {
  attendanceId: string;
  statusMessage: string;
};

export function DreamerWaitingAnimation({
  attendanceId,
  statusMessage,
}: DreamerWaitingAnimationProps) {
  const dreamerSets = useMemo(() => getDreamerSets(attendanceId), [attendanceId]);
  const storageKeys = useMemo(
    () => getDreamerAvatarStorageKeys(attendanceId),
    [attendanceId],
  );
  const [setIndex, setSetIndex] = useState(0);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);
  const effectiveAvatarId =
    selectedAvatarId ?? getDefaultAvatarId(attendanceId);

  useEffect(() => {
    const isExplicit =
      window.sessionStorage.getItem(storageKeys.explicit) === "true";
    const storedAvatarId = Number.parseInt(
      window.sessionStorage.getItem(storageKeys.avatarId) ?? "",
      10,
    );

    if (isExplicit && isDreamerAvatarId(storedAvatarId)) {
      setSelectedAvatarId(storedAvatarId);
    }
  }, [storageKeys]);

  function selectAvatar(avatarId: number) {
    setSelectedAvatarId(avatarId);
    window.sessionStorage.setItem(storageKeys.avatarId, String(avatarId));
    window.sessionStorage.setItem(storageKeys.explicit, "true");
  }

  return (
    <section
      className={`soft-card ${styles.card}`}
      data-effective-avatar-id={effectiveAvatarId}
    >
      <div className={`spinner ${styles.spinner}`} aria-hidden="true" />
      <h1 className={styles.title}>조 편성 대기 중...</h1>
      <p className={styles.waitingDescription}>함께할 조원을 찾고 있어요.</p>

      <div className={styles.divider} />

      <div className={styles.pickerCopy}>
        <span className={styles.eyebrow}>기다리는 동안,</span>
        <p className={styles.description}>오늘의 드리머를 골라보세요!</p>
      </div>

      <div className={styles.avatarGrid} aria-label="드리머 캐릭터 선택">
        {dreamerSets[setIndex].map((avatarId) => {
          const selected = avatarId === selectedAvatarId;

          return (
            <button
              className={`${styles.avatarButton}${selected ? ` ${styles.selected}` : ""}`}
              type="button"
              key={avatarId}
              aria-label={`드리머 캐릭터 ${avatarId}`}
              aria-pressed={selected}
              onClick={() => selectAvatar(avatarId)}
            >
              <Image
                src={getDreamerImage(avatarId)}
                alt=""
                loading="eager"
                sizes="(max-width: 460px) 21vw, 82px"
                className={styles.avatarImage}
              />
              {selected ? (
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        className={styles.pageIndicator}
        aria-label={`${setIndex + 1}번째 드리머 세트`}
      >
        {dreamerSets.map((_, index) => (
          <span
            className={`${styles.pageDot}${
              index === setIndex ? ` ${styles.activePageDot}` : ""
            }`}
            key={index}
            aria-hidden="true"
          />
        ))}
      </div>

      <button
        type="button"
        className={styles.refreshButton}
        onClick={() =>
          setSetIndex((current) => (current + 1) % dreamerSets.length)
        }
      >
        <span aria-hidden="true">↻</span>
        다른 드리머 보기
      </button>

      <span className={styles.statusMessage} aria-live="polite">
        {statusMessage}
      </span>
    </section>
  );
}
