import type { StaticImageData } from "next/image";
import avatar1 from "@/src/img/01_bear.png";
import avatar2 from "@/src/img/02_rabbit.png";
import avatar3 from "@/src/img/03_dog.png";
import avatar4 from "@/src/img/04_cat_glasses.png";
import avatar5 from "@/src/img/05_fox.png";
import avatar6 from "@/src/img/06_penguin.png";
import avatar7 from "@/src/img/07_otter.png";
import avatar8 from "@/src/img/08_sheep.png";
import avatar9 from "@/src/img/09_dino.png";
import avatar10 from "@/src/img/10_hedgehog.png";
import avatar11 from "@/src/img/11_calico_cat.png";
import avatar12 from "@/src/img/12_chick.png";
import avatar13 from "@/src/img/13_panda.png";
import avatar14 from "@/src/img/14_polarbear.png";
import avatar15 from "@/src/img/15_squirrel.png";
import avatar16 from "@/src/img/16_elephant.png";
import avatar17 from "@/src/img/17_koala.png";
import {
  DREAMER_AVATAR_COUNT,
  DREAMERS_PER_SET,
} from "@/src/lib/dreamer-avatar-config";

export { DREAMER_AVATAR_COUNT } from "@/src/lib/dreamer-avatar-config";

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
  17: avatar17,
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

  return splitIntoBalancedSets(avatarIds);
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

function splitIntoBalancedSets(avatarIds: number[]) {
  const setCount = Math.ceil(avatarIds.length / DREAMERS_PER_SET);
  const minimumSetSize = Math.floor(avatarIds.length / setCount);
  const largerSetCount = avatarIds.length % setCount;
  let offset = 0;

  return Array.from({ length: setCount }, (_, index) => {
    const size = minimumSetSize + (index < largerSetCount ? 1 : 0);
    const set = avatarIds.slice(offset, offset + size);
    offset += size;
    return set;
  });
}
