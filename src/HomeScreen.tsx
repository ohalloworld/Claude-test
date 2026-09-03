import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatAge } from './profile';
import { formatElapsedSince, startOfDay } from './format';
import { hoursSinceStatus, pooNappyStatus, Status, wetNappyStatus } from './status';
import { SLEEP_ASLEEP_TONE, SLEEP_AWAKE_TONE, STATUS_TONES } from './statusColors';
import { Thresholds } from './thresholds';
import TrackerButton from './TrackerButton';
import UndoBanner from './UndoBanner';
import { EventType, TrackedEvent } from './types';
import { HomeStats } from './useEvents';

interface Props {
  stats: HomeStats;
  thresholds: Thresholds;
  dateOfBirth: number | null;
  logEvent: (type: EventType) => Promise<TrackedEvent>;
  deleteEvent: (id: string) => void;
  onOpenProfile: () => void;
}

const STATUS_WORD: Record<Status, string> = {
  green: 'on track',
  yellow: 'worth a check',
  red: 'check in soon',
  neutral: '',
};

function withStatusWord(base: string, status: Status): string {
  const word = STATUS_WORD[status];
  return word ? `${base} · ${word}` : base;
}

export default function HomeScreen({ stats, thresholds, dateOfBirth, logEvent, deleteEvent, onOpenProfile }: Props) {
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

  const hoursElapsedToday = (now - startOfDay(now)) / (60 * 60 * 1000);

  const painMedsStatus = hoursSinceStatus(
    stats.lastPainMeds,
    thresholds.painMedsCautionHours,
    thresholds.painMedsConcernHours,
    now
  );
  const feedingStatus = hoursSinceStatus(
    stats.lastFeeding,
    thresholds.feedingCautionHours,
    thresholds.feedingConcernHours,
    now
  );
  const wetStatus = wetNappyStatus(stats.wetNappyCountToday, hoursElapsedToday, thresholds);
  const poopStatus = pooNappyStatus(stats.poopNappyCountToday, hoursElapsedToday, thresholds);

  const sleepTone = stats.isSleeping ? SLEEP_ASLEEP_TONE : SLEEP_AWAKE_TONE;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Baby Tracker</Text>
          <Pressable onPress={onOpenProfile}>
            <Text style={styles.ageLink}>{dateOfBirth ? formatAge(dateOfBirth) : 'Set age →'}</Text>
          </Pressable>
        </View>

        <TrackerButton
          icon="💊"
          title="Pain Meds"
          subtitle={
            stats.lastPainMeds
              ? withStatusWord(`Last: ${formatElapsedSince(stats.lastPainMeds, now)}`, painMedsStatus)
              : 'Not logged yet'
          }
          tone={STATUS_TONES[stats.lastPainMeds ? painMedsStatus : 'neutral']}
          onPress={() => handleLog(EventType.PAIN_MEDS, 'Pain meds')}
        />
        <TrackerButton
          icon="🍼"
          title="Feeding"
          subtitle={
            stats.lastFeeding
              ? withStatusWord(`Last: ${formatElapsedSince(stats.lastFeeding, now)}`, feedingStatus)
              : 'Not logged yet'
          }
          tone={STATUS_TONES[stats.lastFeeding ? feedingStatus : 'neutral']}
          onPress={() => handleLog(EventType.FEEDING, 'Feeding')}
        />
        <TrackerButton
          icon={stats.isSleeping ? '🌙' : '☀️'}
          title={stats.isSleeping ? 'End Sleep' : 'Start Sleep'}
          subtitle={
            stats.isSleeping && stats.sleepStartedAt
              ? `Sleeping for ${formatElapsedSince(stats.sleepStartedAt, now)}`
              : 'Not sleeping'
          }
          tone={sleepTone}
          onPress={() =>
            handleLog(
              stats.isSleeping ? EventType.SLEEP_END : EventType.SLEEP_START,
              stats.isSleeping ? 'Sleep ended' : 'Sleep started'
            )
          }
        />
        <TrackerButton
          icon="💧"
          title="Wet Nappy"
          subtitle={withStatusWord(`Today: ${stats.wetNappyCountToday}`, wetStatus)}
          tone={STATUS_TONES[wetStatus]}
          onPress={() => handleLog(EventType.WET_NAPPY, 'Wet nappy')}
        />
        <TrackerButton
          icon="💩"
          title="Poo Nappy"
          subtitle={withStatusWord(`Today: ${stats.poopNappyCountToday}`, poopStatus)}
          tone={STATUS_TONES[poopStatus]}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  ageLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6650A4',
  },
});
