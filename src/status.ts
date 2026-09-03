import { Thresholds } from './thresholds';

export type Status = 'green' | 'yellow' | 'red' | 'neutral';

export function hoursSinceStatus(
  lastTimestamp: number | null,
  cautionHours: number,
  concernHours: number,
  now: number = Date.now()
): Status {
  if (lastTimestamp === null) return 'neutral';
  const hours = (now - lastTimestamp) / (60 * 60 * 1000);
  if (hours >= concernHours) return 'red';
  if (hours >= cautionHours) return 'yellow';
  return 'green';
}

// Counts are compared against a target that scales with how much of the day
// has passed, so a count of 0 at 6am isn't flagged the same as 0 at 8pm. The
// first few hours of the day are never flagged red — too early to tell.
function paceStatus(count: number, hoursElapsedToday: number, yellowMin: number, greenMin: number): Status {
  if (greenMin <= 0) return 'green';
  const dayFraction = Math.max(hoursElapsedToday / 24, 0.25);
  const scaledGreenMin = greenMin * dayFraction;
  const scaledYellowMin = yellowMin * dayFraction;

  if (count >= scaledGreenMin) return 'green';
  if (hoursElapsedToday < 4) return 'green';
  if (count >= scaledYellowMin) return 'yellow';
  return 'red';
}

export function wetNappyStatus(count: number, hoursElapsedToday: number, thresholds: Thresholds): Status {
  return paceStatus(count, hoursElapsedToday, thresholds.wetYellowMin, thresholds.wetGreenMin);
}

export function pooNappyStatus(count: number, hoursElapsedToday: number, thresholds: Thresholds): Status {
  if (count > thresholds.pooRedAbove) return 'red';
  if (count > thresholds.pooGreenMax) return 'yellow';
  return paceStatus(count, hoursElapsedToday, thresholds.pooYellowMin, thresholds.pooGreenMin);
}
