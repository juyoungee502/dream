"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import avatar1 from "@/src/img/1.png";
import avatar2 from "@/src/img/2.png";
import avatar3 from "@/src/img/3.png";
import avatar4 from "@/src/img/4.png";
import avatar5 from "@/src/img/5.png";
import avatar6 from "@/src/img/6.png";
import avatar7 from "@/src/img/7.png";
import avatar8 from "@/src/img/8.png";
import avatar9 from "@/src/img/9.png";
import avatar10 from "@/src/img/10.png";
import avatar11 from "@/src/img/11.png";
import avatar12 from "@/src/img/12.png";
import avatar13 from "@/src/img/13.png";
import avatar14 from "@/src/img/14.png";
import avatar15 from "@/src/img/15.png";
import avatar16 from "@/src/img/16.png";
import styles from "./DreamerWaitingAnimation.module.css";

type DreamerWaitingAnimationProps = {
  attendanceId: string;
  statusMessage: string;
};

const DREAMERS = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16,
] as const;

const SAVE_DELAY_MS = 400;

export function DreamerWaitingAnimation({
  attendanceId,
  statusMessage,
}: DreamerWaitingAnimationProps) {
  const defaultAvatarId = useMemo(
    () => getStableDefaultAvatarId(attendanceId),
    [attendanceId],
  );
  const [selectedAvatarId, setSelectedAvatarId] = useState(defaultAvatarId);
  const saveTimerRef = useRef<number | null>(null);
  const pendingAvatarRef = useRef<number | null>(null);
  const lastSavedAvatarRef = useRef<number | null>(null);
  const storageKey = `dreamerAvatarId:${attendanceId}`;

  const saveAvatar = useCallback(
    (avatarId: number) => {
      pendingAvatarRef.current = null;

      void fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId, avatarId }),
        keepalive: true,
      })
        .then((response) => {
          if (response.ok) {
            lastSavedAvatarRef.current = avatarId;
          }
        })
        .catch(() => {
          // Avatar persistence is optional and must never interrupt matching.
        });
    },
    [attendanceId],
  );

  useEffect(() => {
    const storedAvatarId = Number.parseInt(
      window.sessionStorage.getItem(storageKey) ?? "",
      10,
    );

    if (isAvatarId(storedAvatarId)) {
      setSelectedAvatarId(storedAvatarId);
      pendingAvatarRef.current = storedAvatarId;
      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null;
        saveAvatar(storedAvatarId);
      }, SAVE_DELAY_MS);
    }
  }, [saveAvatar, storageKey]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }

      const pendingAvatarId = pendingAvatarRef.current;

      if (
        pendingAvatarId !== null &&
        pendingAvatarId !== lastSavedAvatarRef.current
      ) {
        saveAvatar(pendingAvatarId);
      }
    };
  }, [saveAvatar]);

  function selectAvatar(avatarId: number) {
    setSelectedAvatarId(avatarId);
    pendingAvatarRef.current = avatarId;
    window.sessionStorage.setItem(storageKey, String(avatarId));

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      saveAvatar(avatarId);
    }, SAVE_DELAY_MS);
  }

  return (
    <section className={`soft-card ${styles.card}`}>
      <div className={`spinner ${styles.spinner}`} aria-hidden="true" />
      <h1 className={styles.title}>조 편성 대기 중...</h1>
      <div className={styles.pickerCopy}>
        <span className={styles.eyebrow}>기다리는 동안</span>
        <p className={styles.description}>마음에 드는 드리머를 골라보세요!</p>
      </div>

      <div className={styles.avatarGrid} aria-label="드리머 캐릭터 선택">
        {DREAMERS.map((dreamer, index) => {
          const avatarId = index + 1;
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
                src={dreamer}
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 460px) 20vw, 78px"
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

      <p className={styles.hint}>선택하지 않아도 괜찮아요.</p>

      <span className={styles.statusMessage} aria-live="polite">
        {statusMessage}
      </span>
    </section>
  );
}

function getStableDefaultAvatarId(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (Math.abs(hash) % DREAMERS.length) + 1;
}

function isAvatarId(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= DREAMERS.length;
}
