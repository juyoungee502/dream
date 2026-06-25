"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClientSupabase } from "@/src/lib/supabase/client";
import { hasSupabaseBrowserEnv } from "@/src/lib/supabase/env";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const configured = hasSupabaseBrowserEnv();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!configured) {
      setMessage("Supabase 환경변수 설정이 필요해요.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClientSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage("이메일 또는 비밀번호를 다시 확인해주세요.");
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
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-black">
          이메일
          <input
            className="field"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="admin@example.com"
          />
        </label>
        <label className="grid gap-2 text-sm font-black">
          비밀번호
          <input
            className="field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="비밀번호"
          />
        </label>
      </div>
      {message ? (
        <p className="mt-4 rounded-[18px] bg-[#FEF3C7] px-4 py-3 text-sm font-bold text-[#92400E]">
          {message}
        </p>
      ) : null}
      <button className="btn btn-primary mt-5 w-full" disabled={pending} type="submit">
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}

