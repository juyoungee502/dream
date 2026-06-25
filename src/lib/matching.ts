export type Attendee = {
  personId: string;
  name: string;
  mokjangId: string;
  mokjangName: string;
};

export type SeparationRule = {
  personAId: string;
  personBId: string;
};

export type MatchingResult = {
  groups: {
    groupNumber: number;
    members: Attendee[];
  }[];
  warnings: string[];
};

type WorkingGroup = {
  groupNumber: number;
  targetSize: number;
  members: Attendee[];
};

export function getGroupSizes(total: number): number[] {
  if (total <= 0) return [];
  if (total <= 3) return [total];

  const groupCount = Math.ceil(total / 5);
  const base = Math.floor(total / groupCount);
  const remainder = total % groupCount;

  return Array.from({ length: groupCount }, (_, index) => {
    return index < remainder ? base + 1 : base;
  });
}

export function createMatchingGroups(
  attendees: Attendee[],
  rules: SeparationRule[],
): MatchingResult {
  const warnings: string[] = [];
  const sizes = getGroupSizes(attendees.length);
  const groups: WorkingGroup[] = sizes.map((targetSize, index) => ({
    groupNumber: index + 1,
    targetSize,
    members: [],
  }));

  const rulePairs = new Set(
    rules.flatMap((rule) => [
      pairKey(rule.personAId, rule.personBId),
      pairKey(rule.personBId, rule.personAId),
    ]),
  );

  const byMokjang = new Map<string, Attendee[]>();
  [...attendees]
    .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
    .forEach((attendee) => {
      const bucket = byMokjang.get(attendee.mokjangId) ?? [];
      bucket.push(attendee);
      byMokjang.set(attendee.mokjangId, bucket);
    });

  const queue = interleaveBuckets([...byMokjang.values()]);

  for (const attendee of queue) {
    const best = findBestGroup(groups, attendee, rulePairs);
    best.members.push(attendee);

    const hasBlockedPair = best.members.some(
      (member) =>
        member.personId !== attendee.personId &&
        rulePairs.has(pairKey(member.personId, attendee.personId)),
    );

    if (hasBlockedPair) {
      warnings.push(
        `${attendee.name} 님의 함께 배정 금지 규칙 일부를 지키지 못했어요.`,
      );
    }
  }

  return {
    groups: groups.map(({ groupNumber, members }) => ({ groupNumber, members })),
    warnings: [...new Set(warnings)],
  };
}

function interleaveBuckets(buckets: Attendee[][]) {
  const ordered = buckets.sort((a, b) => b.length - a.length);
  const result: Attendee[] = [];
  let cursor = 0;

  while (ordered.some((bucket) => bucket.length > 0)) {
    const bucket = ordered[cursor % ordered.length];
    const next = bucket.shift();

    if (next) {
      result.push(next);
    }

    cursor += 1;
  }

  return result;
}

function findBestGroup(
  groups: WorkingGroup[],
  attendee: Attendee,
  rulePairs: Set<string>,
) {
  const candidates = groups.filter(
    (group) => group.members.length < group.targetSize,
  );
  const usable = candidates.length > 0 ? candidates : groups;

  return usable
    .map((group) => ({ group, score: scoreGroup(group, attendee, rulePairs) }))
    .sort((a, b) => a.score - b.score || a.group.groupNumber - b.group.groupNumber)[0]
    .group;
}

function scoreGroup(
  group: WorkingGroup,
  attendee: Attendee,
  rulePairs: Set<string>,
) {
  const sameMokjangCount = group.members.filter(
    (member) => member.mokjangId === attendee.mokjangId,
  ).length;
  const ruleViolations = group.members.filter((member) =>
    rulePairs.has(pairKey(member.personId, attendee.personId)),
  ).length;
  const fillRatio = group.members.length / Math.max(group.targetSize, 1);

  return ruleViolations * 100 + sameMokjangCount * 10 + fillRatio;
}

function pairKey(a: string, b: string) {
  return `${a}:${b}`;
}

