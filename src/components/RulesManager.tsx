"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export type RulePerson = {
  id: string;
  name: string;
  mokjangName: string;
};

export type RuleItem = {
  id: string;
  personAId: string;
  personBId: string;
};

type RulesManagerProps = {
  people: RulePerson[];
  rules: RuleItem[];
};

export function RulesManager({ people, rules }: RulesManagerProps) {
  const router = useRouter();
  const [personAId, setPersonAId] = useState(people[0]?.id ?? "");
  const [personBId, setPersonBId] = useState(people[1]?.id ?? "");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const personById = new Map(people.map((person) => [person.id, person]));

  async function addRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    try {
      const response = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ personAId, personBId }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "규칙을 추가하지 못했어요.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("규칙을 추가하지 못했어요.");
    } finally {
      setPending(false);
    }
  }

  async function deleteRule(id: string) {
    setMessage("");
    const response = await fetch("/api/admin/rules", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? "규칙을 삭제하지 못했어요.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="grid gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link className="btn btn-ghost min-h-10 rounded-full px-4 text-sm" href="/admin">
          현황
        </Link>
        <Link className="btn btn-secondary min-h-10 rounded-full px-4 text-sm" href="/admin/rules">
          배정 금지
        </Link>
        <Link
          className="btn btn-ghost min-h-10 rounded-full px-4 text-sm"
          href="/admin/matching"
        >
          조 편성
        </Link>
      </div>

      <form className="soft-card p-5" onSubmit={addRule}>
        <span className="pill mb-4">민감정보 저장 없음</span>
        <h1 className="text-[28px] font-black tracking-[-0.055em]">
          함께 배정 금지
        </h1>
        <div className="mt-5 grid gap-3">
          <select
            className="field"
            value={personAId}
            onChange={(event) => setPersonAId(event.target.value)}
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.mokjangName}
              </option>
            ))}
          </select>
          <select
            className="field"
            value={personBId}
            onChange={(event) => setPersonBId(event.target.value)}
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {person.mokjangName}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary mt-4 w-full" disabled={pending} type="submit">
          규칙 추가
        </button>
        {message ? (
          <p className="mt-4 rounded-[18px] bg-[#FEF3C7] px-4 py-3 text-sm font-bold text-[#92400E]">
            {message}
          </p>
        ) : null}
      </form>

      <div className="soft-card p-5">
        <h2 className="text-xl font-black tracking-[-0.04em]">등록된 분리 규칙</h2>
        <div className="mt-4 grid gap-2">
          {rules.map((rule) => {
            const personA = personById.get(rule.personAId);
            const personB = personById.get(rule.personBId);

            return (
              <div
                className="grid gap-3 rounded-[17px] border border-[var(--line)] bg-white p-4"
                key={rule.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <strong>{personA?.name ?? "참석자"}</strong>
                  <span className="text-sm font-black text-[var(--muted)]">분리</span>
                  <strong>{personB?.name ?? "참석자"}</strong>
                </div>
                <button
                  className="btn btn-ghost min-h-10 rounded-full text-sm"
                  onClick={() => deleteRule(rule.id)}
                  type="button"
                >
                  삭제
                </button>
              </div>
            );
          })}
          {rules.length === 0 ? (
            <p className="text-sm font-semibold text-[var(--muted)]">
              아직 등록된 규칙이 없어요.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

