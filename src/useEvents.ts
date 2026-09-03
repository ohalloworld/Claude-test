import { useCallback, useEffect, useMemo, useState } from 'react';
import { clearEvents, loadEvents, saveEvents } from './storage';
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

  const reload = useCallback(() => {
    return loadEvents().then((loadedEvents) => {
      setEvents(loadedEvents);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const logEventAt = useCallback(async (type: EventType, timestamp: number): Promise<TrackedEvent> => {
    const event: TrackedEvent = { id: makeId(), type, timestamp };
    setEvents((prev) => {
      const next = [event, ...prev].sort((a, b) => b.timestamp - a.timestamp);
      saveEvents(next);
      return next;
    });
    return event;
  }, []);

  const logEvent = useCallback((type: EventType) => logEventAt(type, Date.now()), [logEventAt]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEvents(next);
      return next;
    });
  }, []);

  const updateEventTime = useCallback((id: string, timestamp: number) => {
    setEvents((prev) => {
      const next = prev
        .map((e) => (e.id === id ? { ...e, timestamp } : e))
        .sort((a, b) => b.timestamp - a.timestamp);
      saveEvents(next);
      return next;
    });
  }, []);

  const setEventDetail = useCallback((id: string, detail: string) => {
    setEvents((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, detail } : e));
      saveEvents(next);
      return next;
    });
  }, []);

  const resetAllEvents = useCallback(async () => {
    await clearEvents();
    setEvents([]);
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

  return {
    events,
    loaded,
    homeStats,
    logEvent,
    logEventAt,
    deleteEvent,
    updateEventTime,
    setEventDetail,
    resetAllEvents,
    reload,
  };
}
