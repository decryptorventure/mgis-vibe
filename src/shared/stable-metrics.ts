function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function stableInt(seed: string, min: number, max: number): number {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  const range = Math.max(upper - lower + 1, 1);
  return lower + (hashSeed(seed) % range);
}

export function stableFloat(seed: string, min: number, max: number, precision = 2): number {
  const hash = hashSeed(seed);
  const ratio = (hash % 10000) / 10000;
  const value = min + ratio * (max - min);
  return Number(value.toFixed(precision));
}

export function stablePick<T>(seed: string, options: readonly T[]): T {
  return options[stableInt(seed, 0, options.length - 1)];
}
