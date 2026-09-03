import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Chips {
  prompt: string;
  options: string[];
  onSelect: (option: string) => void;
}

interface Props {
  message: string;
  onUndo: () => void;
  chips?: Chips;
}

export default function UndoBanner({ message, onUndo, chips }: Props) {
  return (
    <View style={styles.banner}>
      <View style={styles.topRow}>
        <Text style={styles.message}>{message}</Text>
        <Pressable onPress={onUndo} hitSlop={12}>
          <Text style={styles.undo}>UNDO</Text>
        </Pressable>
      </View>
      {chips && (
        <View style={styles.chipRow}>
          <Text style={styles.chipPrompt}>{chips.prompt}</Text>
          <View style={styles.chips}>
            {chips.options.map((opt) => (
              <Pressable key={opt} style={styles.chip} onPress={() => chips.onSelect(opt)}>
                <Text style={styles.chipText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#322F35',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  undo: {
    color: '#D0BCFF',
    fontWeight: '700',
    fontSize: 14,
  },
  chipRow: {
    marginTop: 10,
  },
  chipPrompt: {
    color: '#D8D2E0',
    fontSize: 12,
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#4A4458',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
