"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { MokjangOption } from "@/src/lib/constants";

type CheckInFormProps = {
  mokjangs: MokjangOption[];
};

export function CheckInForm({ mokjangs }: CheckInFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mokjangId, setMokjangId] = useState(mokjangs[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const selectedName = useMemo(
    () => mokjangs.find((mokjang) => mokjang.id === mokjangId)?.name ?? "목장 선택",
    [mokjangId, mokjangs],
  );

  if (mokjangs.length === 0) {
    return (
      <section className="soft-card checkin-card text-center">
        <h2 className="text-xl font-black tracking-[-0.04em]">목장 목록이 없어요</h2>
        <p className="mt-4 text-[15px] font-semibold leading-6 text-[var(--muted)]">
          Supabase mokjangs 테이블에 활성 목장을 추가해주세요.
        </p>
      </section>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("이름을 입력해주세요.");
      return;
    }

    if (!mokjangId) {
      setMessage("목장을 선택해주세요.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, mokjangId }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        attendanceId?: string;
        message?: string;
      };

      if (!response.ok || !result.ok || !result.attendanceId) {
        setMessage(result.message ?? "출석 처리 중 문제가 생겼어요.");
        return;
      }

      router.push(`/done?attendanceId=${encodeURIComponent(result.attendanceId)}`);
    } catch {
      setMessage("출석 처리 중 문제가 생겼어요. 다시 한 번 시도해주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="soft-card checkin-card" onSubmit={onSubmit}>
      <div className="form-block">
        <div className="field-title">
          <label htmlFor="name">이름</label>
          <span>실명으로 입력</span>
        </div>
        <input
          id="name"
          className="field"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="이름을 입력해주세요"
          autoComplete="name"
        />
      </div>

      <div className="form-block">
        <div className="field-title">
          <span>목장 선택</span>
          <span>현재 소속 기준</span>
        </div>
        <div className="grid-mokjang">
          {mokjangs.map((mokjang) => (
            <button
              className="mokjang-button"
              data-selected={mokjang.id === mokjangId}
              key={mokjang.id}
              type="button"
              onClick={() => setMokjangId(mokjang.id)}
            >
              {mokjang.name}
            </button>
          ))}
        </div>
        <div className="selection-bar">
          <span>선택된 목장</span>
          <span>{selectedName}</span>
        </div>
      </div>

      {message ? <p className="form-message">{message}</p> : null}

      <div className="cta-stack">
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "출석 처리 중..." : "출석했어요!"}
        </button>
        <Link className="admin-text-link" href="/admin/login">
          관리자 페이지
        </Link>
      </div>
    </form>
  );
}
