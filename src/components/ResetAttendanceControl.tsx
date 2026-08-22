"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./ResetAttendanceControl.module.css";

export function ResetAttendanceControl() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function resetAttendance() {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/reset-attendance", { method: "POST" });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "초기화하지 못했어요.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "초기화하지 못했어요.");
      setPending(false);
    }
  }

  return (
    <section className={`soft-card ${styles.card}`}>
      <div>
        <p className={styles.kicker}>공개 후 초기화</p>
        <h2>다음 산모임 준비</h2>
        <p>현재 출석과 공개된 조 편성 결과가 모두 삭제됩니다.</p>
      </div>

      {confirming ? (
        <div className={styles.confirmation}>
          <strong>정말 초기화할까요?</strong>
          <div className={styles.actions}>
            <button
              className="btn btn-ghost w-full"
              disabled={pending}
              onClick={() => setConfirming(false)}
              type="button"
            >
              취소
            </button>
            <button
              className="btn btn-danger w-full"
              disabled={pending}
              onClick={resetAttendance}
              type="button"
            >
              {pending ? "초기화 중..." : "초기화"}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-danger w-full"
          onClick={() => {
            setMessage("");
            setConfirming(true);
          }}
          type="button"
        >
          출석과 조 편성 초기화
        </button>
      )}

      {message ? <p className={styles.message}>{message}</p> : null}
    </section>
  );
}
