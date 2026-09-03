import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  message: string;
  onUndo: () => void;
}

export default function UndoBanner({ message, onUndo }: Props) {
  return (
    <View style={styles.banner}>
      <Text style={styles.message}>{message}</Text>
      <Pressable onPress={onUndo} hitSlop={12}>
        <Text style={styles.undo}>UNDO</Text>
      </Pressable>
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
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
});
