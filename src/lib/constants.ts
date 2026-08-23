export const MOKJANGS = [
  "신실 목장",
  "은수 목장",
  "은택 목장",
  "예은 목장",
  "석민 목장",
  "태양 목장",
  "주람 목장",
  "희현 목장",
  "찬호 목장",
  "은서 목장",
  "예서 목장",
  "민경 목장",
  "새가족 목장",
  "소망 목장",
] as const;

export type MokjangOption = {
  id: string;
  name: string;
};

export const FALLBACK_MOKJANGS: MokjangOption[] = MOKJANGS.map((name) => ({
  id: name,
  name,
}));

export const FRIENDLY_ERROR =
  "처리 중 문제가 생겼어요. 잠시 뒤 다시 한 번 시도해주세요.";
