"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ResetAttendanceControl } from "@/src/components/ResetAttendanceControl";
import styles from "./MatchingManager.module.css";

export type MatchingMember = {
  personId: string;
  name: string;
  mokjangName: string;
};

export type MatchingGroup = {
  id: string;
  groupNumber: number;
  isConfirmed: boolean;
  members: MatchingMember[];
};

type MatchingManagerProps = {
  status: string;
  groups: MatchingGroup[];
};

export function MatchingManager({ status, groups }: MatchingManagerProps) {
  const router = useRouter();
  const [displayGroups, setDisplayGroups] = useState(groups);
  const [published, setPublished] = useState(status === "confirmed");
  const [pendingAction, setPendingAction] = useState("");
  const [movingPersonId, setMovingPersonId] = useState("");
  const [message, setMessage] = useState("");
  const memberCount = useMemo(
    () => displayGroups.reduce((total, group) => total + group.members.length, 0),
    [displayGroups],
  );

  useEffect(() => {
    setDisplayGroups(groups);
  }, [groups]);

  useEffect(() => {
    setPublished(status === "confirmed");
  }, [status]);

  async function startMatching() {
    setPendingAction("start");
    setMessage("");

    try {
      const response = await fetch("/api/matching/start", { method: "POST" });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "조 편성을 시작하지 못했어요.");
      }

      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "조 편성을 시작하지 못했어요.");
    } finally {
      setPendingAction("");
    }
  }

  async function publishGroups() {
    setPendingAction("confirm");
    setMessage("");

    try {
      const response = await fetch("/api/matching/confirm", { method: "POST" });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "조 편성을 공개하지 못했어요.");
      }

      setPublished(true);
      setMessage("조 편성이 공개됐어요.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "조 편성을 공개하지 못했어요.");
    } finally {
      setPendingAction("");
    }
  }

  async function moveMember(personId: string, fromGroupId: string, toGroupId: string) {
    if (fromGroupId === toGroupId || movingPersonId) return;

    const snapshot = displayGroups;
    const sourceGroup = snapshot.find((group) => group.id === fromGroupId);
    const targetGroup = snapshot.find((group) => group.id === toGroupId);
    const member = sourceGroup?.members.find((item) => item.personId === personId);

    if (!member || !targetGroup) return;

    setMovingPersonId(personId);
    setMessage("");
    setDisplayGroups((current) =>
      current.map((group) => {
        if (group.id === fromGroupId) {
          return {
            ...group,
            members: group.members.filter((item) => item.personId !== personId),
          };
        }

        if (group.id === toGroupId) {
          return { ...group, members: [...group.members, member] };
        }

        return group;
      }),
    );

    try {
      const response = await fetch("/api/matching/move-member", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personId, fromGroupId, toGroupId }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "조원을 이동하지 못했어요.");
      }

      setMessage(`${member.name}님을 ${targetGroup.groupNumber}조로 이동했어요.`);
      router.refresh();
    } catch (error) {
      setDisplayGroups(snapshot);
      setMessage(error instanceof Error ? error.message : "조원을 이동하지 못했어요.");
    } finally {
      setMovingPersonId("");
    }
  }

  return (
    <section className={styles.page}>
      <nav className={styles.navigation} aria-label="관리자 메뉴">
        <Link className={styles.navItem} href="/admin">
          운영
        </Link>
        <Link className={`${styles.navItem} ${styles.active}`} href="/admin/matching">
          조 편성
        </Link>
        <Link className={styles.navItem} href="/admin/rules">
          배정 금지
        </Link>
      </nav>

      <section className={`soft-card ${styles.overview}`}>
        <div className={styles.overviewHeader}>
          <div>
            <p className={styles.kicker}>{published ? "공개 완료" : "조 편성 검토"}</p>
            <h1>{published ? "조 편성이 공개됐어요" : "현재 편성된 조"}</h1>
          </div>
          <span className="pill">{published ? "공개 중" : "검토 중"}</span>
        </div>

        <div className={styles.metrics}>
          <span>
            <strong>{displayGroups.length}</strong>개 조
          </span>
          <span>
            <strong>{memberCount}</strong>명
          </span>
        </div>

        {displayGroups.length === 0 && !published ? (
          <button
            className="btn btn-primary w-full"
            disabled={pendingAction !== ""}
            onClick={startMatching}
            type="button"
          >
            {pendingAction === "start" ? "조 편성 중..." : "조 편성 시작"}
          </button>
        ) : null}

        {message ? <p className={styles.message}>{message}</p> : null}
      </section>

      <div className={styles.groupList}>
        {displayGroups.map((group) => (
          <article className={`soft-card ${styles.groupCard}`} key={group.id}>
            <header className={styles.groupHeader}>
              <h2>{group.groupNumber}조</h2>
              <span>{group.members.length}명</span>
            </header>

            <div className={styles.memberList}>
              {group.members.map((member) => (
                <div className={styles.memberRow} key={member.personId}>
                  <span className={styles.memberIdentity}>
                    <strong>{member.name}</strong>
                    <small>{member.mokjangName}</small>
                  </span>

                  {published ? (
                    <span className={styles.groupLabel}>{group.groupNumber}조</span>
                  ) : (
                    <select
                      aria-label={`${member.name} 이동할 조`}
                      className={styles.groupSelect}
                      disabled={movingPersonId !== "" || pendingAction !== ""}
                      onChange={(event) =>
                        moveMember(member.personId, group.id, event.target.value)
                      }
                      value={group.id}
                    >
                      {displayGroups.map((optionGroup) => (
                        <option key={optionGroup.id} value={optionGroup.id}>
                          {optionGroup.groupNumber}조
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              {group.members.length === 0 ? (
                <p className={styles.emptyGroup}>조원이 없어요.</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {displayGroups.length > 0 && !published ? (
        <div className={styles.publishBar}>
          <button
            className="btn btn-primary w-full"
            disabled={pendingAction !== "" || movingPersonId !== ""}
            onClick={publishGroups}
            type="button"
          >
            {pendingAction === "confirm" ? "공개 중..." : "확정하고 바로 공개"}
          </button>
        </div>
      ) : null}

      {published ? <ResetAttendanceControl /> : null}
    </section>
  );
}
