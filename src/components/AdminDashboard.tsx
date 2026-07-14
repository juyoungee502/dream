"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const [pending, setPending] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");
  const [message, setMessage] = useState("");
  const statusLabel = STATUS_LABEL[status] ?? status;
  const canCreateGroups = total > 0 && status !== "confirmed";
  const summary = useMemo(() => {
    if (status === "confirmed") {
      return "참석자들이 조 결과를 확인할 수 있어요.";
    }
    if (total === 0) {
      return "QR을 공유하고 출석을 기다리면 돼요.";
    }
    return "출석이 끝났다면 바로 공개하거나 검토 후 공개하세요.";
  }, [status, total]);

  async function postJson(path: string) {
    const response = await fetch(path, { method: "POST" });
    const result = (await response.json()) as {
      ok: boolean;
      message?: string;
      warnings?: string[];
    };

    if (!response.ok || !result.ok) {
      throw new Error(result.message ?? "요청을 처리하지 못했어요.");
    }

    return result;
  }

  async function quickPublish() {
    setPending("quick");
    setMessage("");

    try {
      await postJson("/api/matching/start");
      await postJson("/api/matching/confirm");
      setMessage(`${total}명 조 편성을 공개했어요.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "빠른 공개에 실패했어요.");
    } finally {
      setPending("");
    }
  }

  async function reviewMatching() {
    setPending("review");
    setMessage("");

    try {
      const result = await postJson("/api/matching/start");
      if (result.warnings?.length) {
        setMessage(result.warnings.join(" "));
      }
      router.push("/admin/matching");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "조 편성을 시작하지 못했어요.");
    } finally {
      setPending("");
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

    setPending("reset");
    setMessage("");

    try {
      const result = await postJson("/api/admin/reset-attendance");
      setResetOpen(false);
      setResetText("");
      setMessage(result.message ?? "출석명단을 초기화했어요.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "출석명단을 초기화하지 못했어요.");
    } finally {
      setPending("");
    }
  }

  return (
    <section className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link className="btn btn-secondary min-h-10 rounded-full px-4 text-sm" href="/admin">
          운영
        </Link>
        <Link className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" href="/admin/matching">
          조 확인
        </Link>
        <Link className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" href="/admin/rules">
          배정 금지
        </Link>
        <button className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" onClick={logout}>
          로그아웃
        </button>
      </div>

      <div className="soft-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[var(--green-dark)]">오늘의 산모임</p>
            <h1 className="mt-1 text-[30px] font-black tracking-[-0.055em]">
              {statusLabel}
            </h1>
            <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">{summary}</p>
          </div>
          <span className="pill shrink-0">{statusLabel}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-[var(--line)] bg-white p-4">
            <div className="text-[36px] font-black text-[var(--green-dark)]">{total}</div>
            <div className="text-sm font-bold text-[var(--muted)]">출석</div>
          </div>
          <div className="rounded-[22px] border border-[var(--line)] bg-white p-4">
            <div className="text-[36px] font-black text-[var(--green-dark)]">
              {mokjangCounts.length}
            </div>
            <div className="text-sm font-bold text-[var(--muted)]">목장</div>
          </div>
        </div>

        {status === "confirmed" ? (
          <Link className="btn btn-primary mt-5 w-full" href="/admin/matching">
            공개된 조 보기
          </Link>
        ) : (
          <div className="mt-5 grid gap-2">
            <button
              className="btn btn-primary w-full"
              disabled={pending !== "" || !canCreateGroups}
              onClick={quickPublish}
              type="button"
            >
              {pending === "quick" ? "공개 중..." : "빠른 공개"}
            </button>
            <button
              className="btn btn-secondary w-full"
              disabled={pending !== "" || !canCreateGroups}
              onClick={reviewMatching}
              type="button"
            >
              {pending === "review" ? "편성 중..." : "검토 후 조정"}
            </button>
          </div>
        )}

        {message ? (
          <p className="mt-4 rounded-[18px] bg-[#FEF3C7] px-4 py-3 text-sm font-bold text-[#92400E]">
            {message}
          </p>
        ) : null}
      </div>

      <div className="soft-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-[-0.04em]">목장별 현황</h2>
          <span className="pill min-h-0 py-1 text-xs">{mokjangCounts.length}개</span>
        </div>
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
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-[-0.04em]">최근 출석</h2>
          <button className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" onClick={() => router.refresh()}>
            새로고침
          </button>
        </div>
        <div className="mt-4 grid gap-2">
          {recent.length > 0 ? (
            recent.map((item) => (
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
            ))
          ) : (
            <p className="text-sm font-semibold text-[var(--muted)]">최근 출석자가 없어요.</p>
          )}
        </div>
      </div>

      <div className="soft-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-[-0.04em]">다시 시작</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">
              오늘 출석과 조 편성 결과를 지우고 처음부터 다시 받을 때만 사용하세요.
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
                disabled={pending !== ""}
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
                disabled={pending !== "" || resetText.trim() !== "초기화"}
                onClick={resetAttendance}
                type="button"
              >
                {pending === "reset" ? "초기화 중..." : "초기화"}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-danger mt-4 w-full"
            disabled={pending !== "" || total === 0}
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
    </section>
  );
}
