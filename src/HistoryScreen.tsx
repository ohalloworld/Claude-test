import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { formatClockTime, formatDateHeader, startOfDay } from './format';
import { EVENT_LABELS, TrackedEvent } from './types';

interface Props {
  events: TrackedEvent[];
}

interface Section {
  title: string;
  data: TrackedEvent[];
}

export default function HistoryScreen({ events }: Props) {
  const sections: Section[] = useMemo(() => {
    const groups = new Map<number, TrackedEvent[]>();
    for (const event of events) {
      const key = startOfDay(event.timestamp);
      const list = groups.get(key) ?? [];
      list.push(event);
      groups.set(key, list);
    }
    return Array.from(groups.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([day, data]) => ({ title: formatDateHeader(day), data }));
  }, [events]);

  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No entries yet. Log something on the Home tab.</Text>
      </View>
    );
  }

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{EVENT_LABELS[item.type]}</Text>
          <Text style={styles.rowTime}>{formatClockTime(item.timestamp)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2FA',
  },
  content: {
    padding: 16,
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1B1F',
    marginTop: 12,
    marginBottom: 4,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
    color: '#1C1B1F',
  },
  rowTime: {
    fontSize: 15,
    color: '#49454F',
  },
});
