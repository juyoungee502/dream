"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ResetAttendanceControl } from "@/src/components/ResetAttendanceControl";
import styles from "./AdminDashboard.module.css";

type AdminDashboardProps = {
  status: string;
  total: number;
  mokjangCounts: { name: string; count: number }[];
  recent: { id: string; name: string; mokjangName: string; checkedInAt: string }[];
};

const STATUS_LABEL: Record<string, string> = {
  ready: "준비 중",
  open: "출석 접수 중",
  matching: "조 편성 검토 중",
  confirmed: "결과 공개 중",
  closed: "출석 마감",
};

export function AdminDashboard({
  status,
  total,
  mokjangCounts,
  recent,
}: AdminDashboardProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const statusLabel = STATUS_LABEL[status] ?? status;
  const summary = useMemo(() => {
    if (status === "confirmed") {
      return "확정된 조가 참석자에게 공개되고 있어요.";
    }

    if (status === "matching") {
      return "현재 편성된 조를 검토하고 필요한 조원만 옮겨주세요.";
    }

    if (total === 0) {
      return "QR을 공유하고 출석을 기다리면 돼요.";
    }

    return "출석이 끝나면 조 편성을 시작해주세요.";
  }, [status, total]);

  async function startMatching() {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/matching/start", { method: "POST" });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "조 편성을 시작하지 못했어요.");
      }

      router.push("/admin/matching");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "조 편성을 시작하지 못했어요.");
      setPending(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <section className={styles.page}>
      <nav className={styles.navigation} aria-label="관리자 메뉴">
        <Link className={`${styles.navItem} ${styles.active}`} href="/admin">
          운영
        </Link>
        <Link className={styles.navItem} href="/admin/matching">
          조 편성
        </Link>
        <Link className={styles.navItem} href="/admin/rules">
          배정 금지
        </Link>
        <button className={styles.navItem} onClick={logout} type="button">
          로그아웃
        </button>
      </nav>

      <section className={`soft-card ${styles.statusCard}`}>
        <div className={styles.statusHeader}>
          <div>
            <p className={styles.kicker}>오늘의 산모임</p>
            <h1 className={styles.title}>{statusLabel}</h1>
          </div>
          <span className="pill">{statusLabel}</span>
        </div>
        <p className={styles.summary}>{summary}</p>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <strong>{total}</strong>
            <span>출석</span>
          </div>
          <div className={styles.metric}>
            <strong>{mokjangCounts.length}</strong>
            <span>목장</span>
          </div>
        </div>

        {status === "confirmed" ? (
          <Link className="btn btn-primary w-full" href="/admin/matching">
            공개된 조 확인
          </Link>
        ) : status === "matching" ? (
          <Link className="btn btn-primary w-full" href="/admin/matching">
            조 편성 이어서 확인
          </Link>
        ) : (
          <button
            className="btn btn-primary w-full"
            disabled={pending || total === 0}
            onClick={startMatching}
            type="button"
          >
            {pending ? "조 편성 중..." : "조 편성 시작"}
          </button>
        )}

        {message ? <p className={styles.message}>{message}</p> : null}
      </section>

      <section className={`soft-card ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2>목장별 출석</h2>
          <span className="pill">{mokjangCounts.length}개</span>
        </div>
        <div className={styles.list}>
          {mokjangCounts.length > 0 ? (
            mokjangCounts.map((item) => (
              <div className={styles.listRow} key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.count}명</span>
              </div>
            ))
          ) : (
            <p className={styles.empty}>아직 출석자가 없어요.</p>
          )}
        </div>
      </section>

      <section className={`soft-card ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2>최근 출석</h2>
          <button className={styles.refreshButton} onClick={() => router.refresh()} type="button">
            새로고침
          </button>
        </div>
        <div className={styles.list}>
          {recent.length > 0 ? (
            recent.map((item) => (
              <div className={styles.attendanceRow} key={item.id}>
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {new Date(item.checkedInAt).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </span>
                <span className="pill">{item.mokjangName}</span>
              </div>
            ))
          ) : (
            <p className={styles.empty}>최근 출석자가 없어요.</p>
          )}
        </div>
      </section>

      {status === "confirmed" ? <ResetAttendanceControl /> : null}
    </section>
  );
}
