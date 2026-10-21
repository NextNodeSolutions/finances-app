// Steps a reader can count in: 1, 2, 2.5 and 5 times a power of ten.
const NICE_STEP_FACTORS = [1, 2, 2.5, 5] as const;
const MAX_INTERVALS = 6;
const TICK_PRECISION = 12;

type NiceScale = {
  domain: [number, number];
  ticks: number[];
};

function countIntervals(min: number, max: number, step: number): number {
  return Math.ceil(max / step) - Math.floor(min / step);
}

// Axis domain and ticks that cover [min, max] with round, evenly spaced
// values (100,000 / 0 / -100,000 ...) instead of raw 105,000 steps: the
// smallest nice step of at least minStep that needs at most MAX_INTERVALS
// intervals.
export function getNiceScale(min: number, max: number, minStep = 0): NiceScale {
  const span = max - min || Math.abs(max) || 1;
  const magnitude = 10 ** Math.floor(Math.log10(span / MAX_INTERVALS));
  const candidates = [1, 10, 100].flatMap(scale =>
    NICE_STEP_FACTORS.map(factor => factor * magnitude * scale),
  );
  const step =
    candidates.find(
      candidate =>
        candidate >= minStep &&
        countIntervals(min, max, candidate) <= MAX_INTERVALS,
    ) ?? Math.max(100 * magnitude, minStep);

  const start = Math.floor(min / step) * step;
  const intervalCount = Math.max(countIntervals(min, max, step), 1);
  const ticks = Array.from({ length: intervalCount + 1 }, (_, index) =>
    Number((start + index * step).toPrecision(TICK_PRECISION)),
  );

  return { domain: [start, start + intervalCount * step], ticks };
}
