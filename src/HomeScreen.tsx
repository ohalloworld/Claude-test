import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BackdateSheet from './BackdateSheet';
import { formatAge } from './profile';
import { formatElapsedSince, startOfDay } from './format';
import { hoursSinceStatus, pooNappyStatus, Status, wetNappyStatus } from './status';
import { SLEEP_ASLEEP_TONE, SLEEP_AWAKE_TONE, STATUS_TONES } from './statusColors';
import { Thresholds } from './thresholds';
import TrackerButton from './TrackerButton';
import UndoBanner from './UndoBanner';
import { EventType, FEEDING_SIDE_OPTIONS, TrackedEvent } from './types';
import { HomeStats } from './useEvents';

interface Props {
  stats: HomeStats;
  thresholds: Thresholds;
  dateOfBirth: number | null;
  painMedsPresets: string[];
  logEvent: (type: EventType) => Promise<TrackedEvent>;
  logEventAt: (type: EventType, timestamp: number) => Promise<TrackedEvent>;
  deleteEvent: (id: string) => void;
  setEventDetail: (id: string, detail: string) => void;
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

interface UndoState {
  event: TrackedEvent;
  label: string;
  chips?: { prompt: string; options: string[] };
}

export default function HomeScreen({
  stats,
  thresholds,
  dateOfBirth,
  painMedsPresets,
  logEvent,
  logEventAt,
  deleteEvent,
  setEventDetail,
  onOpenProfile,
}: Props) {
  const [now, setNow] = useState(Date.now());
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [backdateFor, setBackdateFor] = useState<{ type: EventType; label: string } | null>(null);
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

  const armUndoTimer = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const chipsFor = (type: EventType): { prompt: string; options: string[] } | undefined => {
    if (type === EventType.FEEDING) return { prompt: 'Which side?', options: [...FEEDING_SIDE_OPTIONS] };
    if (type === EventType.PAIN_MEDS && painMedsPresets.length > 0) {
      return { prompt: 'Which dose?', options: painMedsPresets };
    }
    return undefined;
  };

  const handleLog = async (type: EventType, label: string) => {
    const event = await logEvent(type);
    setUndo({ event, label: `${label} logged`, chips: chipsFor(type) });
    armUndoTimer();
  };

  const handleBackdatedLog = async (minutesAgo: number) => {
    if (!backdateFor) return;
    const { type, label } = backdateFor;
    setBackdateFor(null);
    const timestamp = Date.now() - minutesAgo * 60_000;
    const event = await logEventAt(type, timestamp);
    setUndo({ event, label: `${label} logged (backdated)`, chips: chipsFor(type) });
    armUndoTimer();
  };

  const handleUndo = () => {
    if (!undo) return;
    deleteEvent(undo.event.id);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const handleChipSelect = (option: string) => {
    if (!undo) return;
    setEventDetail(undo.event.id, option);
    setUndo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
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
          onQuickLogEarlier={() => setBackdateFor({ type: EventType.PAIN_MEDS, label: 'Pain meds' })}
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
          onQuickLogEarlier={() => setBackdateFor({ type: EventType.FEEDING, label: 'Feeding' })}
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
          onQuickLogEarlier={() =>
            setBackdateFor({
              type: stats.isSleeping ? EventType.SLEEP_END : EventType.SLEEP_START,
              label: stats.isSleeping ? 'Sleep ended' : 'Sleep started',
            })
          }
        />
        <TrackerButton
          icon="💧"
          title="Wet Nappy"
          subtitle={withStatusWord(`Today: ${stats.wetNappyCountToday}`, wetStatus)}
          tone={STATUS_TONES[wetStatus]}
          onPress={() => handleLog(EventType.WET_NAPPY, 'Wet nappy')}
          onQuickLogEarlier={() => setBackdateFor({ type: EventType.WET_NAPPY, label: 'Wet nappy' })}
        />
        <TrackerButton
          icon="💩"
          title="Poo Nappy"
          subtitle={withStatusWord(`Today: ${stats.poopNappyCountToday}`, poopStatus)}
          tone={STATUS_TONES[poopStatus]}
          onPress={() => handleLog(EventType.POO_NAPPY, 'Poo nappy')}
          onQuickLogEarlier={() => setBackdateFor({ type: EventType.POO_NAPPY, label: 'Poo nappy' })}
        />
      </ScrollView>

      {undo && (
        <UndoBanner
          message={undo.label}
          onUndo={handleUndo}
          chips={undo.chips && { ...undo.chips, onSelect: handleChipSelect }}
        />
      )}

      <BackdateSheet
        visible={backdateFor !== null}
        title={backdateFor ? backdateFor.label : ''}
        onCancel={() => setBackdateFor(null)}
        onConfirm={handleBackdatedLog}
      />
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
