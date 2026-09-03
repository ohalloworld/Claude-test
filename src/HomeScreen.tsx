import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatElapsedSince } from './format';
import TrackerButton from './TrackerButton';
import UndoBanner from './UndoBanner';
import { EventType, TrackedEvent } from './types';
import { HomeStats } from './useEvents';

interface Props {
  stats: HomeStats;
  logEvent: (type: EventType) => Promise<TrackedEvent>;
  deleteEvent: (id: string) => void;
}

export default function HomeScreen({ stats, logEvent, deleteEvent }: Props) {
  const [now, setNow] = useState(Date.now());
  const [undo, setUndo] = useState<{ event: TrackedEvent; label: string } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  const handleLog = async (type: EventType, label: string) => {
    const event = await logEvent(type);
    setUndo({ event, label: `${label} logged` });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 4000);
  };

  const handleUndo = () => {
    if (!undo) return;
    deleteEvent(undo.event.id);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndo(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Baby Tracker</Text>

        <TrackerButton
          title="Pain Meds"
          subtitle={stats.lastPainMeds ? `Last: ${formatElapsedSince(stats.lastPainMeds, now)}` : 'Not logged yet'}
          onPress={() => handleLog(EventType.PAIN_MEDS, 'Pain meds')}
        />
        <TrackerButton
          title="Feeding"
          subtitle={stats.lastFeeding ? `Last: ${formatElapsedSince(stats.lastFeeding, now)}` : 'Not logged yet'}
          onPress={() => handleLog(EventType.FEEDING, 'Feeding')}
        />
        <TrackerButton
          title={stats.isSleeping ? 'End Sleep' : 'Start Sleep'}
          subtitle={
            stats.isSleeping && stats.sleepStartedAt
              ? `Sleeping for ${formatElapsedSince(stats.sleepStartedAt, now)}`
              : 'Not sleeping'
          }
          onPress={() =>
            handleLog(
              stats.isSleeping ? EventType.SLEEP_END : EventType.SLEEP_START,
              stats.isSleeping ? 'Sleep ended' : 'Sleep started'
            )
          }
        />
        <TrackerButton
          title="Wet Nappy"
          subtitle={`Today: ${stats.wetNappyCountToday}`}
          onPress={() => handleLog(EventType.WET_NAPPY, 'Wet nappy')}
        />
        <TrackerButton
          title="Poo Nappy"
          subtitle={`Today: ${stats.poopNappyCountToday}`}
          onPress={() => handleLog(EventType.POO_NAPPY, 'Poo nappy')}
        />
      </ScrollView>

      {undo && <UndoBanner message={undo.label} onUndo={handleUndo} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2FA',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 8,
  },
});
