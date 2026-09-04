import { startOfDay } from './format';
import { EventType, TrackedEvent } from './types';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function eventsInLastNDays(events: TrackedEvent[], days: number, now: number = Date.now()): TrackedEvent[] {
  const cutoff = now - days * DAY_MS;
  return events.filter((e) => e.timestamp >= cutoff);
}

/**
 * How many days to divide a "per day" average by: the trailing window,
 * capped at how long the log has actually existed. Without this, a log
 * that only started a few days ago would have its per-day averages
 * silently deflated by dividing real counts by a full 7-day denominator.
 */
function effectiveWindowDays(events: TrackedEvent[], maxDays: number, now: number): number {
  if (events.length === 0) return 0;
  const firstTimestamp = Math.min(...events.map((e) => e.timestamp));
  const daysSinceFirst = (now - firstTimestamp) / DAY_MS;
  return Math.min(maxDays, daysSinceFirst);
}

/** Average hours between consecutive events of a type, over the last N days. Null if fewer than 2 events. */
export function avgIntervalHours(
  events: TrackedEvent[],
  type: EventType,
  days: number,
  now: number = Date.now()
): number | null {
  const windowed = eventsInLastNDays(events, days, now)
    .filter((e) => e.type === type)
    .sort((a, b) => a.timestamp - b.timestamp);
  if (windowed.length < 2) return null;
  const totalMs = windowed[windowed.length - 1].timestamp - windowed[0].timestamp;
  return totalMs / (windowed.length - 1) / HOUR_MS;
}

/**
 * Average count per day of a type, over the last N days (including days
 * with zero) — divided by how many days the log has actually spanned, up
 * to `days`, not by `days` itself. Null if there's less than a day of
 * history yet (too little to extrapolate a daily rate from).
 */
export function avgCountPerDay(
  events: TrackedEvent[],
  type: EventType,
  days: number,
  now: number = Date.now()
): number | null {
  const windowDays = effectiveWindowDays(events, days, now);
  if (windowDays < 1) return null;
  const windowed = eventsInLastNDays(events, days, now).filter((e) => e.type === type);
  return windowed.length / windowDays;
}

export function todayCount(events: TrackedEvent[], type: EventType, now: number = Date.now()): number {
  const start = startOfDay(now);
  return events.filter((e) => e.type === type && e.timestamp >= start).length;
}

export interface SleepSession {
  start: number;
  end: number;
}

/** Pairs up SLEEP_START/SLEEP_END events into completed sessions, oldest first. */
export function sleepSessions(events: TrackedEvent[]): SleepSession[] {
  const sorted = [...events]
    .filter((e) => e.type === EventType.SLEEP_START || e.type === EventType.SLEEP_END)
    .sort((a, b) => a.timestamp - b.timestamp);

  const sessions: SleepSession[] = [];
  let openStart: number | null = null;
  for (const e of sorted) {
    if (e.type === EventType.SLEEP_START) {
      openStart = e.timestamp;
    } else if (e.type === EventType.SLEEP_END && openStart !== null) {
      sessions.push({ start: openStart, end: e.timestamp });
      openStart = null;
    }
  }
  return sessions;
}

function sessionsEndingInLastNDays(events: TrackedEvent[], days: number, now: number): SleepSession[] {
  const cutoff = now - days * DAY_MS;
  return sleepSessions(events).filter((s) => s.end >= cutoff);
}

export function avgSleepSessionHours(events: TrackedEvent[], days: number, now: number = Date.now()): number | null {
  const sessions = sessionsEndingInLastNDays(events, days, now);
  if (sessions.length === 0) return null;
  const totalHours = sessions.reduce((sum, s) => sum + (s.end - s.start) / HOUR_MS, 0);
  return totalHours / sessions.length;
}

/** Same effective-window logic as avgCountPerDay — see its comment. */
export function avgSleepHoursPerDay(events: TrackedEvent[], days: number, now: number = Date.now()): number | null {
  const windowDays = effectiveWindowDays(events, days, now);
  if (windowDays < 1) return null;
  const sessions = sessionsEndingInLastNDays(events, days, now);
  const totalHours = sessions.reduce((sum, s) => sum + (s.end - s.start) / HOUR_MS, 0);
  return totalHours / windowDays;
}

export function longestSleepStretchHours(events: TrackedEvent[], days: number, now: number = Date.now()): number | null {
  const sessions = sessionsEndingInLastNDays(events, days, now);
  if (sessions.length === 0) return null;
  return Math.max(...sessions.map((s) => (s.end - s.start) / HOUR_MS));
}

/** Total hours of completed sleep sessions that ended today. */
export function sleepHoursToday(events: TrackedEvent[], now: number = Date.now()): number {
  const start = startOfDay(now);
  const sessions = sleepSessions(events).filter((s) => s.end >= start);
  return sessions.reduce((sum, s) => sum + (s.end - s.start) / HOUR_MS, 0);
}
