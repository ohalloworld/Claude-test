import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tone } from './statusColors';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  tone: Tone;
  onPress: () => void;
}

export default function TrackerButton({ icon, title, subtitle, tone, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tone.background, borderColor: tone.border },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: tone.title }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: tone.subtitle }]}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: 88,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 3,
  },
});
