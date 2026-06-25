"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!/^\d{4}$/.test(pin)) {
      setMessage("관리자 비밀번호 4자리를 입력해주세요.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "관리자 비밀번호를 다시 확인해주세요.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("관리자 로그인 중 문제가 생겼어요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="soft-card mt-8 p-5" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-black">
        관리자 비밀번호
        <input
          className="field"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
          autoComplete="current-password"
          placeholder="숫자 4자리"
        />
      </label>
      {message ? (
        <p className="mt-4 rounded-[18px] bg-[#FEF3C7] px-4 py-3 text-sm font-bold text-[#92400E]">
          {message}
        </p>
      ) : null}
      <button className="btn btn-primary mt-5 w-full" disabled={pending} type="submit">
        {pending ? "확인 중..." : "관리자 로그인"}
      </button>
    </form>
  );
}

