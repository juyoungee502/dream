"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [personId, setPersonId] = useState("");
  const [fromGroupId, setFromGroupId] = useState("");
  const [toGroupId, setToGroupId] = useState("");
  const allMembers = groups.flatMap((group) =>
    group.members.map((member) => ({ ...member, groupId: group.id })),
  );

  async function runAction(path: string, label: string, done?: () => void) {
    setMessage("");
    setPendingAction(label);

    try {
      const response = await fetch(path, { method: "POST" });
      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
        warnings?: string[];
      };

      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "요청을 처리하지 못했어요.");
        return;
      }

      if (result.warnings?.length) {
        setMessage(result.warnings.join(" "));
      }

      done?.();
      router.refresh();
    } catch {
      setMessage("요청을 처리하지 못했어요.");
    } finally {
      setPendingAction("");
    }
  }

  async function moveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPendingAction("move");

    try {
      const response = await fetch("/api/matching/move-member", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personId, fromGroupId, toGroupId }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "조원을 이동하지 못했어요.");
        return;
      }

      setPersonId("");
      setFromGroupId("");
      setToGroupId("");
      router.refresh();
    } catch {
      setMessage("조원을 이동하지 못했어요.");
    } finally {
      setPendingAction("");
    }
  }

  function selectMember(value: string) {
    setPersonId(value);
    const member = allMembers.find((item) => item.personId === value);
    setFromGroupId(member?.groupId ?? "");
  }

  return (
    <section className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" href="/admin">
          현황
        </Link>
        <Link className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" href="/admin/rules">
          배정 금지
        </Link>
        <Link
          className="btn btn-secondary min-h-10 rounded-full px-4 text-sm"
          href="/admin/matching"
        >
          조 편성
        </Link>
      </div>

      <div className="soft-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[var(--green-dark)]">자동 조 편성</p>
            <h1 className="mt-1 text-[30px] font-black tracking-[-0.055em]">
              편성 관리
            </h1>
          </div>
          <span className="pill">{status}</span>
        </div>
        <div className="mt-5 grid gap-3">
          <button
            className="btn btn-secondary w-full"
            disabled={pendingAction !== "" || status === "confirmed"}
            onClick={() => runAction("/api/matching/start", "start")}
            type="button"
          >
            {pendingAction === "start" ? "편성 중..." : groups.length ? "다시 편성" : "자동 편성"}
          </button>
          <button
            className="btn btn-primary w-full"
            disabled={pendingAction !== "" || groups.length === 0 || status === "confirmed"}
            onClick={() => runAction("/api/matching/confirm", "confirm")}
            type="button"
          >
            {pendingAction === "confirm" ? "확정 중..." : "최종 결과 확정"}
          </button>
        </div>
        {message ? (
          <p className="mt-4 rounded-[18px] bg-[#FEF3C7] px-4 py-3 text-sm font-bold text-[#92400E]">
            {message}
          </p>
        ) : null}
      </div>

      {groups.length > 0 ? (
        <form className="soft-card p-5" onSubmit={moveMember}>
          <h2 className="text-xl font-black tracking-[-0.04em]">수동 조정</h2>
          <div className="mt-4 grid gap-3">
            <select
              className="field"
              value={personId}
              onChange={(event) => selectMember(event.target.value)}
            >
              <option value="">이동할 조원 선택</option>
              {allMembers.map((member) => (
                <option key={`${member.groupId}-${member.personId}`} value={member.personId}>
                  {member.name} · {member.mokjangName}
                </option>
              ))}
            </select>
            <select
              className="field"
              value={toGroupId}
              onChange={(event) => setToGroupId(event.target.value)}
            >
              <option value="">이동할 조 선택</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.groupNumber}조
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-ghost mt-4 w-full"
            disabled={pendingAction !== "" || status === "confirmed"}
            type="submit"
          >
            {pendingAction === "move" ? "이동 중..." : "조원 이동"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {groups.map((group) => (
          <article className="soft-card p-5" key={group.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-[var(--green-dark)]">
                {group.groupNumber}조
              </h2>
              <span className="pill min-h-0 py-1 text-xs">{group.members.length}명</span>
            </div>
            <div className="grid gap-2">
              {group.members.map((member) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-[17px] border border-[var(--line)] bg-white px-4 py-3"
                  key={member.personId}
                >
                  <strong>{member.name}</strong>
                  <span className="pill min-h-0 py-1 text-xs">{member.mokjangName}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
        {groups.length === 0 ? (
          <div className="soft-card p-5 text-center">
            <p className="font-semibold text-[var(--muted)]">
              아직 생성된 조 편성이 없어요.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

