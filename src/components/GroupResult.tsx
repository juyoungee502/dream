"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type GroupMember = {
  name: string;
  mokjangName: string;
};

type GroupResultData = {
  ok: boolean;
  myName?: string;
  groupNumber?: number;
  members?: GroupMember[];
  message?: string;
};

export function GroupResult({ attendanceId }: { attendanceId: string }) {
  const router = useRouter();
  const [data, setData] = useState<GroupResultData | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch(
        `/api/my-group?attendanceId=${encodeURIComponent(attendanceId)}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as GroupResultData;

      if (response.status === 409) {
        router.replace(`/waiting?attendanceId=${encodeURIComponent(attendanceId)}`);
        return;
      }

      setData(result);
    }

    load().catch(() => {
      setData({ ok: false, message: "조 결과를 불러오지 못했어요." });
    });
  }, [attendanceId, router]);

  if (!data) {
    return (
      <section className="soft-card mt-12 p-6 text-center">
        <div className="mx-auto spinner" />
      </section>
    );
  }

  if (!data.ok) {
    return (
      <section className="soft-card mt-10 p-6 text-center">
        <h1 className="text-2xl font-black">결과를 확인할 수 없어요</h1>
        <p className="mt-3 font-semibold text-[var(--muted)]">
          {data.message ?? "다시 한 번 시도해주세요."}
        </p>
        <Link className="btn btn-secondary mt-6 w-full" href="/check-in">
          출석 화면으로
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="soft-card p-6 text-center">
        <span className="pill mb-4">조 편성 확정</span>
        <h1 className="text-[30px] font-black leading-tight tracking-[-0.05em]">
          {data.myName}님은
          <br />
          {data.groupNumber}조예요
        </h1>
      </div>

      <div className="soft-card mt-4 p-5">
        <h2 className="text-xl font-black tracking-[-0.04em]">같은 조 조원</h2>
        <div className="mt-4 grid gap-2">
          {data.members?.map((member) => (
            <div
              className="flex items-center justify-between gap-3 rounded-[17px] border border-[var(--line)] bg-white px-4 py-3"
              key={`${member.name}-${member.mokjangName}`}
            >
              <strong className="text-[16px] tracking-[-0.03em]">{member.name}</strong>
              <span className="pill min-h-0 py-1 text-xs">{member.mokjangName}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

