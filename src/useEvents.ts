import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadEvents, saveEvents } from './storage';
import { startOfDay } from './format';
import { EventType, TrackedEvent } from './types';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface HomeStats {
  lastPainMeds: number | null;
  lastFeeding: number | null;
  isSleeping: boolean;
  sleepStartedAt: number | null;
  wetNappyCountToday: number;
  poopNappyCountToday: number;
}

export function useEvents() {
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadEvents().then((loadedEvents) => {
      setEvents(loadedEvents);
      setLoaded(true);
    });
  }, []);

  const logEvent = useCallback(async (type: EventType): Promise<TrackedEvent> => {
    const event: TrackedEvent = { id: makeId(), type, timestamp: Date.now() };
    setEvents((prev) => {
      const next = [event, ...prev];
      saveEvents(next);
      return next;
    });
    return event;
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEvents(next);
      return next;
    });
  }, []);

  const homeStats: HomeStats = useMemo(() => {
    const todayStart = startOfDay(Date.now());
    const todayEvents = events.filter((e) => e.timestamp >= todayStart);

    const lastPainMeds = events.find((e) => e.type === EventType.PAIN_MEDS)?.timestamp ?? null;
    const lastFeeding = events.find((e) => e.type === EventType.FEEDING)?.timestamp ?? null;

    const lastSleepEvent = events.find(
      (e) => e.type === EventType.SLEEP_START || e.type === EventType.SLEEP_END
    );
    const isSleeping = lastSleepEvent?.type === EventType.SLEEP_START;
    const sleepStartedAt = isSleeping ? lastSleepEvent!.timestamp : null;

    return {
      lastPainMeds,
      lastFeeding,
      isSleeping,
      sleepStartedAt,
      wetNappyCountToday: todayEvents.filter((e) => e.type === EventType.WET_NAPPY).length,
      poopNappyCountToday: todayEvents.filter((e) => e.type === EventType.POO_NAPPY).length,
    };
  }, [events]);

  return { events, loaded, homeStats, logEvent, deleteEvent };
}
