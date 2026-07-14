export const MOKJANGS = [
  "찬호 목장",
  "예은 목장",
  "은택 목장",
  "예서 목장",
  "예원 목장",
  "민경 목장",
  "석민 목장",
  "승민 목장",
  "은수 목장",
  "태경 목장",
  "새가족",
  "청년부",
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
