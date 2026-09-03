import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { formatClockTime, formatDateHeader, startOfDay } from './format';
import NumberField from './NumberField';
import { EVENT_LABELS, TrackedEvent } from './types';

interface Props {
  events: TrackedEvent[];
  deleteEvent: (id: string) => void;
  updateEventTime: (id: string, timestamp: number) => void;
}

interface Section {
  title: string;
  data: TrackedEvent[];
}

export default function HistoryScreen({ events, deleteEvent, updateEventTime }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
        <EventRow
          event={item}
          isEditing={editingId === item.id}
          isConfirmingDelete={confirmDeleteId === item.id}
          onStartEdit={() => {
            setConfirmDeleteId(null);
            setEditingId(item.id);
          }}
          onCancelEdit={() => setEditingId(null)}
          onSaveEdit={(timestamp) => {
            updateEventTime(item.id, timestamp);
            setEditingId(null);
          }}
          onStartDelete={() => {
            setEditingId(null);
            setConfirmDeleteId(item.id);
          }}
          onCancelDelete={() => setConfirmDeleteId(null)}
          onConfirmDelete={() => {
            deleteEvent(item.id);
            setConfirmDeleteId(null);
          }}
        />
      )}
    />
  );
}

function EventRow({
  event,
  isEditing,
  isConfirmingDelete,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  event: TrackedEvent;
  isEditing: boolean;
  isConfirmingDelete: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (timestamp: number) => void;
  onStartDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const eventDate = new Date(event.timestamp);
  const [hour, setHour] = useState(eventDate.getHours());
  const [minute, setMinute] = useState(eventDate.getMinutes());

  React.useEffect(() => {
    if (isEditing) {
      setHour(eventDate.getHours());
      setMinute(eventDate.getMinutes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  if (isConfirmingDelete) {
    return (
      <View style={[styles.row, styles.confirmRow]}>
        <Text style={styles.confirmText}>Delete this entry?</Text>
        <View style={styles.rowActions}>
          <Pressable onPress={onConfirmDelete} style={styles.actionButton}>
            <Text style={styles.deleteConfirmText}>Delete</Text>
          </Pressable>
          <Pressable onPress={onCancelDelete} style={styles.actionButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={[styles.row, styles.editRow]}>
        <Text style={styles.rowLabel}>{EVENT_LABELS[event.type]}</Text>
        <View style={styles.editFields}>
          <NumberField label="Hour" value={hour} min={0} max={23} onChange={setHour} width={56} />
          <NumberField label="Min" value={minute} min={0} max={59} onChange={setMinute} width={56} />
        </View>
        <View style={styles.rowActions}>
          <Pressable
            onPress={() => {
              const updated = new Date(event.timestamp);
              updated.setHours(hour, minute, 0, 0);
              onSaveEdit(updated.getTime());
            }}
            style={styles.actionButton}
          >
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
          <Pressable onPress={onCancelEdit} style={styles.actionButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.rowLabel}>{EVENT_LABELS[event.type]}</Text>
        {event.detail && <Text style={styles.rowDetail}>{event.detail}</Text>}
      </View>
      <View style={styles.rowActions}>
        <Pressable onPress={onStartEdit} hitSlop={8}>
          <Text style={styles.rowTime}>{formatClockTime(event.timestamp)}</Text>
        </Pressable>
        <Pressable onPress={onStartDelete} hitSlop={8} style={styles.deleteButton}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </Pressable>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
    color: '#1C1B1F',
  },
  rowDetail: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowTime: {
    fontSize: 15,
    color: '#6650A4',
    textDecorationLine: 'underline',
  },
  deleteButton: {
    paddingHorizontal: 2,
  },
  deleteIcon: {
    fontSize: 16,
  },
  editRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  editFields: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmRow: {
    backgroundColor: '#FCE8E6',
  },
  confirmText: {
    fontSize: 14,
    color: '#B3261E',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3FA34D',
  },
  cancelText: {
    fontSize: 14,
    color: '#79747E',
  },
  deleteConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B3261E',
  },
});
