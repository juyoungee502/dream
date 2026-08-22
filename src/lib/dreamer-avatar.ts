import type { StaticImageData } from "next/image";
import avatar1 from "@/src/img/1.png";
import avatar2 from "@/src/img/2.png";
import avatar3 from "@/src/img/3.png";
import avatar4 from "@/src/img/4.png";
import avatar5 from "@/src/img/5.png";
import avatar6 from "@/src/img/6.png";
import avatar7 from "@/src/img/7.png";
import avatar8 from "@/src/img/8.png";
import avatar9 from "@/src/img/9.png";
import avatar10 from "@/src/img/10.png";
import avatar11 from "@/src/img/11.png";
import avatar12 from "@/src/img/12.png";
import avatar13 from "@/src/img/13.png";
import avatar14 from "@/src/img/14.png";
import avatar15 from "@/src/img/15.png";
import avatar16 from "@/src/img/16.png";

export const DREAMER_AVATAR_COUNT = 16;

const DREAMER_AVATARS: Record<number, StaticImageData> = {
  1: avatar1,
  2: avatar2,
  3: avatar3,
  4: avatar4,
  5: avatar5,
  6: avatar6,
  7: avatar7,
  8: avatar8,
  9: avatar9,
  10: avatar10,
  11: avatar11,
  12: avatar12,
  13: avatar13,
  14: avatar14,
  15: avatar15,
  16: avatar16,
};

type DreamerMember = {
  attendanceId: string;
  avatarId?: number | null;
};

export function getDreamerImage(avatarId: number) {
  return DREAMER_AVATARS[normalizeAvatarId(avatarId)];
}

export function getDefaultAvatarId(attendanceId: string) {
  return (stableHash(attendanceId) % DREAMER_AVATAR_COUNT) + 1;
}

export function getEffectiveAvatarId(
  member: DreamerMember,
  explicitAvatarId?: number | null,
) {
  if (isDreamerAvatarId(explicitAvatarId)) {
    return explicitAvatarId;
  }

  if (isDreamerAvatarId(member.avatarId)) {
    return member.avatarId;
  }

  return getDefaultAvatarId(member.attendanceId);
}

export function getDreamerSets(attendanceId: string) {
  const avatarIds = Array.from(
    { length: DREAMER_AVATAR_COUNT },
    (_, index) => index + 1,
  );
  let seed = stableHash(attendanceId) || 1;

  for (let index = avatarIds.length - 1; index > 0; index -= 1) {
    seed = nextSeed(seed);
    const targetIndex = seed % (index + 1);
    [avatarIds[index], avatarIds[targetIndex]] = [
      avatarIds[targetIndex],
      avatarIds[index],
    ];
  }

  return Array.from({ length: 4 }, (_, index) =>
    avatarIds.slice(index * 4, index * 4 + 4),
  );
}

export function getDreamerAvatarStorageKeys(attendanceId: string) {
  return {
    avatarId: `dreamerAvatarId:${attendanceId}`,
    explicit: `dreamerAvatarExplicit:${attendanceId}`,
  };
}

export function isDreamerAvatarId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= DREAMER_AVATAR_COUNT
  );
}

function normalizeAvatarId(avatarId: number) {
  return isDreamerAvatarId(avatarId) ? avatarId : 1;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function nextSeed(seed: number) {
  let next = seed >>> 0;
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  return next >>> 0;
}
