"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getDreamerAvatarStorageKeys,
  getDreamerImage,
  getEffectiveAvatarId,
  isDreamerAvatarId,
} from "@/src/lib/dreamer-avatar";
import styles from "./GroupResult.module.css";

type GroupMember = {
  attendanceId: string;
  name: string;
  avatarId: number | null;
};

type GroupResultData = {
  ok: boolean;
  myName?: string;
  myAttendanceId?: string;
  groupNumber?: number;
  members?: GroupMember[];
  message?: string;
};

const SILENT_REFRESH_DELAY_MS = 1500;

export function GroupResult({ attendanceId }: { attendanceId: string }) {
  const router = useRouter();
  const [data, setData] = useState<GroupResultData | null>(null);
  const [explicitAvatarId, setExplicitAvatarId] = useState<number | null>(null);
  const storageKeys = useMemo(
    () => getDreamerAvatarStorageKeys(attendanceId),
    [attendanceId],
  );

  useEffect(() => {
    if (window.sessionStorage.getItem(storageKeys.explicit) !== "true") {
      return;
    }

    const storedAvatarId = Number.parseInt(
      window.sessionStorage.getItem(storageKeys.avatarId) ?? "",
      10,
    );

    if (isDreamerAvatarId(storedAvatarId)) {
      setExplicitAvatarId(storedAvatarId);
    }
  }, [storageKeys]);

  useEffect(() => {
    let active = true;
    let refreshTimer: number | undefined;

    async function load(initial: boolean) {
      const response = await fetch(
        `/api/my-group?attendanceId=${encodeURIComponent(attendanceId)}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as GroupResultData;

      if (!active) return;

      if (initial && response.status === 409) {
        router.replace(`/waiting?attendanceId=${encodeURIComponent(attendanceId)}`);
        return;
      }

      if (initial || result.ok) {
        setData(result);
      }

      if (initial && result.ok) {
        refreshTimer = window.setTimeout(() => {
          void load(false).catch(() => {
            // The first result remains visible when the optional refresh fails.
          });
        }, SILENT_REFRESH_DELAY_MS);
      }
    }

    void load(true).catch(() => {
      if (active) {
        setData({ ok: false, message: "조 결과를 불러오지 못했어요." });
      }
    });

    return () => {
      active = false;
      if (refreshTimer !== undefined) {
        window.clearTimeout(refreshTimer);
      }
    };
  }, [attendanceId, router]);

  if (!data) {
    return (
      <section className={`soft-card ${styles.loadingCard}`}>
        <div className="spinner" />
      </section>
    );
  }

  if (!data.ok) {
    return (
      <section className={`soft-card ${styles.errorCard}`}>
        <h1>결과를 확인할 수 없어요.</h1>
        <p>{data.message ?? "다시 한 번 시도해주세요."}</p>
        <Link className="btn btn-secondary" href="/check-in">
          출석 화면으로
        </Link>
      </section>
    );
  }

  const members = data.members ?? [];
  const layoutClass =
    members.length === 5
      ? styles.fiveMembers
      : members.length >= 6
        ? styles.manyMembers
        : styles.standardMembers;

  return (
    <section className={styles.result}>
      <div className={`soft-card ${styles.heroCard}`}>
        <span className="pill">조 편성 확정</span>
        <h1>
          {data.myName}님은
          <strong>{data.groupNumber}조예요!</strong>
        </h1>
      </div>

      <div className={`soft-card ${styles.membersCard}`}>
        <h2>같은 조 조원</h2>
        <div
          className={`${styles.membersGrid} ${layoutClass}`}
          data-count={members.length}
        >
          {members.map((member) => {
            const isMe = member.attendanceId === attendanceId;
            const avatarId = getEffectiveAvatarId(
              member,
              isMe ? explicitAvatarId : null,
            );

            return (
              <div className={styles.member} key={member.attendanceId}>
                <div className={styles.avatarSlot}>
                  <Image
                    src={getDreamerImage(avatarId)}
                    alt=""
                    sizes="(max-width: 460px) 24vw, 90px"
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.memberName}>
                  <span>{member.name}</span>
                  {isMe ? <span className={styles.me}>나</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
