export type ReviewState = {
  interval: number;
  easeFactor: number;
  nextReview: Date;
};

export function scheduleNextReview({
  interval,
  easeFactor,
  quality,
  now = new Date(),
}: {
  interval: number;
  easeFactor: number;
  quality: number;
  now?: Date;
}): ReviewState {
  const clampedQuality = Math.max(0, Math.min(5, quality));
  let nextInterval = interval;
  let nextEase = easeFactor;

  if (clampedQuality < 3) {
    nextInterval = 1;
  } else if (interval === 0) {
    nextInterval = 1;
  } else if (interval === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(interval * nextEase);
  }

  nextEase = Math.max(
    1.3,
    nextEase + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02)),
  );

  const nextReview = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);

  return {
    interval: nextInterval,
    easeFactor: Number(nextEase.toFixed(2)),
    nextReview,
  };
}
