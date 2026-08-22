"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DreamerWaitingAnimation } from "@/src/components/DreamerWaitingAnimation";

type WaitingScreenProps = {
  attendanceId: string;
};

export function WaitingScreen({ attendanceId }: WaitingScreenProps) {
  const router = useRouter();
  const [message, setMessage] = useState("관리자가 출석을 확인하고 조 매칭을 진행하고 있어요.");
  const delayRef = useRef(3000);

  useEffect(() => {
    if (!attendanceId) {
      router.replace("/check-in");
      return;
    }

    let active = true;
    let timer: number;

    async function poll() {
      try {
        const response = await fetch(
          `/api/my-group/status?attendanceId=${encodeURIComponent(attendanceId)}`,
          { cache: "no-store" },
        );
        const result = (await response.json()) as {
          ok: boolean;
          ready?: boolean;
          message?: string;
        };

        if (!active) return;

        if (response.ok && result.ok && result.ready) {
          router.replace(`/my-group?attendanceId=${encodeURIComponent(attendanceId)}`);
          return;
        }

        setMessage(result.message ?? "아직 조 편성이 완료되지 않았어요.");
        delayRef.current = 3000;
      } catch {
        if (!active) return;
        setMessage("연결이 잠시 불안정해요. 천천히 다시 확인하고 있어요.");
        delayRef.current = Math.min(delayRef.current + 2000, 12000);
      }

      timer = window.setTimeout(poll, delayRef.current);
    }

    timer = window.setTimeout(poll, 600);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [attendanceId, router]);

  return (
    <DreamerWaitingAnimation
      attendanceId={attendanceId}
      statusMessage={message}
    />
  );
}
