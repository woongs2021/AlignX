// 결정론적 시드 유틸 — 같은 입력이면 항상 같은 값을 낸다. AI 더미 채점(Phase05)과 멘토 더미
// 피드백(Phase06)이 함께 쓴다. Math.random()은 새로고침마다 값이 바뀌어 데모가 무너진다.

/** FNV-1a 해시. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 — 시드 기반 결정론적 PRNG (0 이상 1 미만). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
