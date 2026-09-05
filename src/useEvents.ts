import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteEventFromHousehold, pushEventToHousehold, subscribeToHouseholdEvents } from './householdSync';
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

export function useEvents(householdId: string | null, displayName: string) {
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

  // Mirror remote changes from the shared household into local storage.
  useEffect(() => {
    if (!householdId) return;
    const unsubscribe = subscribeToHouseholdEvents(householdId, (change) => {
      setEvents((prev) => {
        let next: TrackedEvent[];
        if (change.type === 'remove') {
          next = prev.filter((e) => e.id !== change.id);
        } else {
          const exists = prev.some((e) => e.id === change.event.id);
          next = exists
            ? prev.map((e) => (e.id === change.event.id ? change.event : e))
            : [change.event, ...prev];
          next = next.sort((a, b) => b.timestamp - a.timestamp);
        }
        saveEvents(next);
        return next;
      });
    });
    return unsubscribe;
  }, [householdId]);

  const logEventAt = useCallback(
    async (type: EventType, timestamp: number): Promise<TrackedEvent> => {
      const event: TrackedEvent = { id: makeId(), type, timestamp };
      if (displayName) event.loggedBy = displayName;
      setEvents((prev) => {
        const next = [event, ...prev].sort((a, b) => b.timestamp - a.timestamp);
        saveEvents(next);
        return next;
      });
      if (householdId) pushEventToHousehold(householdId, event);
      return event;
    },
    [householdId, displayName]
  );

  const logEvent = useCallback((type: EventType) => logEventAt(type, Date.now()), [logEventAt]);

  const deleteEvent = useCallback(
    (id: string) => {
      setEvents((prev) => {
        const next = prev.filter((e) => e.id !== id);
        saveEvents(next);
        return next;
      });
      if (householdId) deleteEventFromHousehold(householdId, id);
    },
    [householdId]
  );

  const updateEventTime = useCallback(
    (id: string, timestamp: number) => {
      setEvents((prev) => {
        const next = prev
          .map((e) => (e.id === id ? { ...e, timestamp } : e))
          .sort((a, b) => b.timestamp - a.timestamp);
        saveEvents(next);
        return next;
      });
      if (householdId) {
        const existing = events.find((e) => e.id === id);
        if (existing) pushEventToHousehold(householdId, { ...existing, timestamp });
      }
    },
    [householdId, events]
  );

  const setEventDetail = useCallback(
    (id: string, detail: string) => {
      setEvents((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, detail } : e));
        saveEvents(next);
        return next;
      });
      if (householdId) {
        const existing = events.find((e) => e.id === id);
        if (existing) pushEventToHousehold(householdId, { ...existing, detail });
      }
    },
    [householdId, events]
  );

  const resetAllEvents = useCallback(async () => {
    await clearEvents();
    setEvents([]);
  }, []);

  // Uploads this device's current local history into a household — used
  // right after linking (create or join) so pre-existing entries aren't
  // stranded on one device. Safe to call from both sides: events are
  // independently-keyed documents, not a single overwritable doc like
  // Profile, so both partners' histories simply union together rather than
  // one clobbering the other.
  const pushAllEventsToHousehold = useCallback(
    async (targetHouseholdId: string): Promise<number> => {
      await Promise.all(events.map((event) => pushEventToHousehold(targetHouseholdId, event)));
      return events.length;
    },
    [events]
  );

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
    pushAllEventsToHousehold,
    reload,
  };
}
