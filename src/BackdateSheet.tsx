import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import NumberField from './NumberField';

interface Props {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: (minutesAgo: number) => void;
}

const PRESETS_MIN = [5, 15, 30, 60, 120];

export default function BackdateSheet({ visible, title, onCancel, onConfirm }: Props) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>How long ago did this happen?</Text>

          <View style={styles.presetRow}>
            {PRESETS_MIN.map((m) => (
              <Pressable key={m} style={styles.preset} onPress={() => onConfirm(m)}>
                <Text style={styles.presetText}>{m < 60 ? `${m}m` : `${m / 60}h`}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.customLabel}>Or a custom time ago:</Text>
          <View style={styles.customRow}>
            <NumberField label="Hours" value={hours} min={0} max={23} onChange={setHours} width={56} />
            <NumberField label="Minutes" value={minutes} min={0} max={59} onChange={setMinutes} width={56} />
            <Pressable style={styles.customButton} onPress={() => onConfirm(hours * 60 + minutes)}>
              <Text style={styles.customButtonText}>Log</Text>
            </Pressable>
          </View>

          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  subtitle: {
    fontSize: 13,
    color: '#49454F',
    marginTop: 4,
    marginBottom: 14,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preset: {
    backgroundColor: '#F0EBFA',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  presetText: {
    color: '#6650A4',
    fontWeight: '600',
    fontSize: 14,
  },
  customLabel: {
    fontSize: 13,
    color: '#49454F',
    marginTop: 18,
    marginBottom: 8,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  customButton: {
    backgroundColor: '#6650A4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  customButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  cancelText: {
    color: '#79747E',
    fontSize: 14,
  },
});
