import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import { GroupResult } from "@/src/components/GroupResult";
import shellStyles from "@/src/components/MatchingFlowShell.module.css";

type MyGroupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyGroupPage({ searchParams }: MyGroupPageProps) {
  const params = await searchParams;
  const attendanceId = typeof params.attendanceId === "string" ? params.attendanceId : "";

  if (!attendanceId) {
    redirect("/check-in");
  }

  return (
    <AppShell status="조 편성 완료" shellClassName={shellStyles.shell}>
      <GroupResult attendanceId={attendanceId} />
    </AppShell>
  );
}
