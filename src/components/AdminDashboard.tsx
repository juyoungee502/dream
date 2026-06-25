"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminDashboardProps = {
  status: string;
  total: number;
  mokjangCounts: { name: string; count: number }[];
  recent: { id: string; name: string; mokjangName: string; checkedInAt: string }[];
};

export function AdminDashboard({
  status,
  total,
  mokjangCounts,
  recent,
}: AdminDashboardProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");
  const [message, setMessage] = useState("");

  async function startMatching() {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/matching/start", { method: "POST" });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "조 편성을 시작하지 못했어요.");
        return;
      }

      router.push("/admin/matching");
      router.refresh();
    } catch {
      setMessage("조 편성을 시작하지 못했어요.");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function resetAttendance() {
    if (resetText.trim() !== "초기화") {
      setMessage("출석명단을 초기화하려면 입력칸에 초기화를 입력해주세요.");
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/reset-attendance", { method: "POST" });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "출석명단을 초기화하지 못했어요.");
        return;
      }

      setResetOpen(false);
      setResetText("");
      setMessage(result.message ?? "출석명단을 초기화했어요.");
      router.refresh();
    } catch {
      setMessage("출석명단을 초기화하지 못했어요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link className="btn btn-secondary min-h-10 rounded-full px-4 text-sm" href="/admin">
          현황
        </Link>
        <Link className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" href="/admin/rules">
          배정 금지
        </Link>
        <Link
          className="btn btn-ghost min-h-10 rounded-full px-4 text-sm"
          href="/admin/matching"
        >
          조 편성
        </Link>
        <button className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" onClick={logout}>
          로그아웃
        </button>
      </div>

      <div className="soft-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[var(--green-dark)]">오늘의 산모임</p>
            <h1 className="mt-1 text-[30px] font-black tracking-[-0.055em]">
              출석 현황
            </h1>
          </div>
          <span className="pill">{status}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-[var(--line)] bg-white p-4">
            <div className="text-[32px] font-black text-[var(--green-dark)]">{total}</div>
            <div className="text-sm font-bold text-[var(--muted)]">전체 출석</div>
          </div>
          <div className="rounded-[22px] border border-[var(--line)] bg-white p-4">
            <div className="text-[32px] font-black text-[var(--green-dark)]">
              {mokjangCounts.length}
            </div>
            <div className="text-sm font-bold text-[var(--muted)]">목장 수</div>
          </div>
        </div>
        <button
          className="btn btn-primary mt-5 w-full"
          disabled={pending || status === "confirmed"}
          onClick={startMatching}
          type="button"
        >
          {pending ? "조 편성 중..." : "산모임 시작"}
        </button>
        {message ? (
          <p className="mt-4 rounded-[18px] bg-[#FEF3C7] px-4 py-3 text-sm font-bold text-[#92400E]">
            {message}
          </p>
        ) : null}
      </div>

      <div className="soft-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-[-0.04em]">출석명단 초기화</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">
              오늘 출석 기록과 조 편성 결과를 지우고 다시 출석을 받을 수 있어요.
            </p>
          </div>
          <span className="pill min-h-0 shrink-0 py-1 text-xs">{total}명</span>
        </div>

        {resetOpen ? (
          <div className="mt-4 grid gap-3">
            <input
              className="field"
              inputMode="text"
              onChange={(event) => setResetText(event.target.value)}
              placeholder="초기화 입력"
              value={resetText}
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn btn-ghost w-full"
                disabled={pending}
                onClick={() => {
                  setResetOpen(false);
                  setResetText("");
                }}
                type="button"
              >
                취소
              </button>
              <button
                className="btn btn-danger w-full"
                disabled={pending || resetText.trim() !== "초기화"}
                onClick={resetAttendance}
                type="button"
              >
                {pending ? "초기화 중..." : "초기화"}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-danger mt-4 w-full"
            disabled={pending || total === 0}
            onClick={() => {
              setMessage("");
              setResetOpen(true);
            }}
            type="button"
          >
            출석명단 초기화
          </button>
        )}
      </div>

      <div className="soft-card p-5">
        <h2 className="text-xl font-black tracking-[-0.04em]">목장별 현황</h2>
        <div className="mt-4 grid gap-2">
          {mokjangCounts.length > 0 ? (
            mokjangCounts.map((item) => (
              <div
                className="flex items-center justify-between rounded-[17px] border border-[var(--line)] bg-white px-4 py-3"
                key={item.name}
              >
                <strong>{item.name}</strong>
                <span className="pill min-h-0 py-1 text-xs">{item.count}명</span>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-[var(--muted)]">아직 출석자가 없어요.</p>
          )}
        </div>
      </div>

      <div className="soft-card p-5">
        <h2 className="text-xl font-black tracking-[-0.04em]">최근 출석자</h2>
        <div className="mt-4 grid gap-2">
          {recent.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-[17px] border border-[var(--line)] bg-white px-4 py-3"
              key={item.id}
            >
              <span>
                <strong className="block">{item.name}</strong>
                <span className="text-xs font-bold text-[var(--muted)]">
                  {new Date(item.checkedInAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
              <span className="pill min-h-0 py-1 text-xs">{item.mokjangName}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
