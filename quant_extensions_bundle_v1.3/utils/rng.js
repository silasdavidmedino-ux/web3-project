// Deterministic RNG utilities for reproducible Monte Carlo.
export function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

export function mulberry32(seedUint32) {
  let a = seedUint32 >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeSeededRngFromString(seedStr) {
  const seedFn = xmur3(String(seedStr || ""));
  const s = seedFn();
  return mulberry32(s);
}

export function makeSnapshotRng({ seedBase, roundId, tag, engineId }) {
  const key = `${seedBase}::R${roundId}::${tag}::${engineId}`;
  return makeSeededRngFromString(key);
}

export function makeRandomSeedBase() {
  try {
    const a = new Uint32Array(4);
    crypto.getRandomValues(a);
    return Array.from(a).map(x => x.toString(16).padStart(8, "0")).join("");
  } catch {
    return `t${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
  }
}
