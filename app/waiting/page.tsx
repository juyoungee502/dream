import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import { WaitingScreen } from "@/src/components/WaitingScreen";

type WaitingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WaitingPage({ searchParams }: WaitingPageProps) {
  const params = await searchParams;
  const attendanceId = typeof params.attendanceId === "string" ? params.attendanceId : "";

  if (!attendanceId) {
    redirect("/check-in");
  }

  return (
    <AppShell status="결과 대기">
      <WaitingScreen attendanceId={attendanceId} />
    </AppShell>
  );
}

