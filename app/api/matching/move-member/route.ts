import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/admin-auth";
import { createAdminSupabase } from "@/src/lib/supabase/admin";

type MoveBody = {
  personId?: string;
  fromGroupId?: string;
  toGroupId?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return auth.response;
  }

  const supabase = createAdminSupabase();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수 설정이 필요해요." },
      { status: 500 },
    );
  }

  let body: MoveBody;

  try {
    body = (await request.json()) as MoveBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 내용을 확인할 수 없어요." },
      { status: 400 },
    );
  }

  const personId = body.personId?.trim() ?? "";
  const fromGroupId = body.fromGroupId?.trim() ?? "";
  const toGroupId = body.toGroupId?.trim() ?? "";

  if (
    !isUuid(personId) ||
    !isUuid(fromGroupId) ||
    !isUuid(toGroupId) ||
    fromGroupId === toGroupId
  ) {
    return NextResponse.json(
      { ok: false, message: "이동할 조원과 조를 다시 확인해주세요." },
      { status: 400 },
    );
  }

  const { data: groups, error: groupsError } = await supabase
    .from("small_groups")
    .select("id,event_id,is_confirmed")
    .in("id", [fromGroupId, toGroupId]);

  if (groupsError || !groups || groups.length !== 2) {
    return NextResponse.json(
      { ok: false, message: "이동할 조를 확인하지 못했어요." },
      { status: 404 },
    );
  }

  const sourceGroup = groups.find((group) => group.id === fromGroupId);
  const targetGroup = groups.find((group) => group.id === toGroupId);

  if (
    !sourceGroup ||
    !targetGroup ||
    sourceGroup.event_id !== targetGroup.event_id ||
    sourceGroup.is_confirmed ||
    targetGroup.is_confirmed
  ) {
    return NextResponse.json(
      { ok: false, message: "공개 전 같은 산모임의 조끼리만 이동할 수 있어요." },
      { status: 409 },
    );
  }

  const { data: event } = await supabase
    .from("events")
    .select("status")
    .eq("id", sourceGroup.event_id)
    .maybeSingle();

  if (event?.status !== "matching") {
    return NextResponse.json(
      { ok: false, message: "조 편성 검토 중에만 조원을 이동할 수 있어요." },
      { status: 409 },
    );
  }

  const { data: membership, error: membershipError } = await supabase
    .from("small_group_members")
    .select("id")
    .eq("person_id", personId)
    .eq("small_group_id", fromGroupId)
    .maybeSingle();

  if (membershipError || !membership) {
    return NextResponse.json(
      { ok: false, message: "현재 조에서 해당 조원을 찾지 못했어요." },
      { status: 404 },
    );
  }

  const { error: updateError } = await supabase
    .from("small_group_members")
    .update({ small_group_id: toGroupId })
    .eq("id", membership.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, message: "조원을 이동하지 못했어요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
