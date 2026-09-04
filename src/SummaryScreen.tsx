import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatDurationHours } from './format';
import {
  avgCountPerDay,
  avgIntervalHours,
  avgSleepHoursPerDay,
  avgSleepSessionHours,
  longestSleepStretchHours,
  sleepHoursToday,
  todayCount,
} from './statsMath';
import { EventType, TrackedEvent } from './types';

interface Props {
  events: TrackedEvent[];
}

const WINDOW_DAYS = 7;

export default function SummaryScreen({ events }: Props) {
  const now = Date.now();

  const today = useMemo(
    () => ({
      feeds: todayCount(events, EventType.FEEDING, now),
      painMeds: todayCount(events, EventType.PAIN_MEDS, now),
      wet: todayCount(events, EventType.WET_NAPPY, now),
      poo: todayCount(events, EventType.POO_NAPPY, now),
      sleepHours: sleepHoursToday(events, now),
    }),
    [events]
  );

  const averages = useMemo(
    () => ({
      feedInterval: avgIntervalHours(events, EventType.FEEDING, WINDOW_DAYS, now),
      painMedsInterval: avgIntervalHours(events, EventType.PAIN_MEDS, WINDOW_DAYS, now),
      wetPerDay: avgCountPerDay(events, EventType.WET_NAPPY, WINDOW_DAYS, now),
      pooPerDay: avgCountPerDay(events, EventType.POO_NAPPY, WINDOW_DAYS, now),
      sleepPerDay: avgSleepHoursPerDay(events, WINDOW_DAYS, now),
      sleepSession: avgSleepSessionHours(events, WINDOW_DAYS, now),
      longestSleep: longestSleepStretchHours(events, WINDOW_DAYS, now),
    }),
    [events]
  );

  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No entries yet. Once you've logged a few things, your stats will show up here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Summary</Text>

      <Section title="Today">
        <StatRow label="Feeds" value={String(today.feeds)} />
        <StatRow label="Pain meds doses" value={String(today.painMeds)} />
        <StatRow label="Wet nappies" value={String(today.wet)} />
        <StatRow label="Poo nappies" value={String(today.poo)} />
        <StatRow label="Sleep" value={today.sleepHours > 0 ? formatDurationHours(today.sleepHours) : '—'} />
      </Section>

      <Section title="Last 7 days" subtitle="Rolling averages">
        <StatRow
          label="Avg. time between feeds"
          value={averages.feedInterval !== null ? formatDurationHours(averages.feedInterval) : 'Not enough data'}
        />
        <StatRow
          label="Avg. time between pain meds"
          value={averages.painMedsInterval !== null ? formatDurationHours(averages.painMedsInterval) : 'Not enough data'}
        />
        <StatRow
          label="Avg. wet nappies / day"
          value={averages.wetPerDay !== null ? averages.wetPerDay.toFixed(1) : 'Not enough data'}
        />
        <StatRow
          label="Avg. poo nappies / day"
          value={averages.pooPerDay !== null ? averages.pooPerDay.toFixed(1) : 'Not enough data'}
        />
        <StatRow
          label="Avg. sleep / day"
          value={averages.sleepPerDay !== null ? formatDurationHours(averages.sleepPerDay) : 'Not enough data'}
        />
        <StatRow
          label="Avg. sleep session length"
          value={averages.sleepSession !== null ? formatDurationHours(averages.sleepSession) : 'Not enough data'}
        />
        <StatRow
          label="Longest sleep stretch"
          value={averages.longestSleep !== null ? formatDurationHours(averages.longestSleep) : 'Not enough data'}
          highlight
        />
      </Section>
    </ScrollView>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
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
    paddingBottom: 40,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F2FA',
  },
  emptyText: {
    fontSize: 15,
    color: '#49454F',
    textAlign: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 2,
  },
  rows: {
    marginTop: 12,
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#49454F',
    flex: 1,
    paddingRight: 12,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  statValueHighlight: {
    color: '#6650A4',
  },
});
