import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import { RulesManager, type RulePerson } from "@/src/components/RulesManager";
import { hasAdminSession } from "@/src/lib/admin-pin";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type PersonRow = {
  id: string;
  name: string;
  mokjangs: { name: string } | null;
};

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const supabase = createAdminSupabase();

  if (!supabase) {
    redirect("/admin/login");
  }

  const [{ data: peopleData }, { data: ruleData }] = await Promise.all([
    supabase
      .from("people")
      .select("id,name,mokjangs(name)")
      .order("name", { ascending: true }),
    supabase.from("separation_rules").select("id,person_a_id,person_b_id"),
  ]);

  const people: RulePerson[] = ((peopleData ?? []) as PersonRow[]).map((person) => ({
    id: person.id,
    name: person.name,
    mokjangName: person.mokjangs?.name ?? "목장",
  }));

  return (
    <AppShell status="관리자" admin>
      <RulesManager
        people={people}
        rules={(ruleData ?? []).map((rule) => ({
          id: rule.id,
          personAId: rule.person_a_id,
          personBId: rule.person_b_id,
        }))}
      />
    </AppShell>
  );
}
