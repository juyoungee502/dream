import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import { AdminDashboard } from "@/src/components/AdminDashboard";
import { hasAdminSession } from "@/src/lib/admin-pin";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type AttendanceWithPerson = {
  id: string;
  checked_in_at: string;
  people:
    | {
        name: string;
        mokjangs: { name: string } | null;
      }
    | null;
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const supabase = createAdminSupabase();

  if (!supabase) {
    redirect("/admin/login");
  }

  const { data: event } = await supabase
    .from("events")
    .select("id,status")
    .in("status", ["open", "matching", "confirmed"])
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const eventId = event?.id ?? "";
  const [{ count }, attendanceResult] = await Promise.all([
    eventId
      ? supabase
          .from("attendances")
          .select("id", { count: "exact", head: true })
          .eq("event_id", eventId)
      : Promise.resolve({ count: 0 }),
    eventId
      ? supabase
          .from("attendances")
          .select("id,checked_in_at,people(name,mokjangs(name))")
          .eq("event_id", eventId)
          .order("checked_in_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const attendanceRows = ((attendanceResult.data ?? []) as AttendanceWithPerson[]).map((row) => ({
    id: row.id,
    name: row.people?.name ?? "참석자",
    mokjangName: row.people?.mokjangs?.name ?? "목장",
    checkedInAt: row.checked_in_at,
  }));
  const recent = attendanceRows.slice(0, 12);

  const counts = new Map<string, number>();
  attendanceRows.forEach((row) => {
    counts.set(row.mokjangName, (counts.get(row.mokjangName) ?? 0) + 1);
  });

  return (
    <AppShell status="관리자" admin>
      <AdminDashboard
        status={event?.status ?? "ready"}
        total={count ?? 0}
        mokjangCounts={[...counts.entries()].map(([name, itemCount]) => ({
          name,
          count: itemCount,
        }))}
        recent={recent}
      />
    </AppShell>
  );
}
