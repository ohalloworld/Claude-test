import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tone } from './statusColors';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  tone: Tone;
  onPress: () => void;
  onQuickLogEarlier?: () => void;
}

export default function TrackerButton({ icon, title, subtitle, tone, onPress, onQuickLogEarlier }: Props) {
  return (
    <View style={[styles.button, { backgroundColor: tone.background, borderColor: tone.border }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.mainArea, pressed && styles.pressed]}
      >
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: tone.title }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: tone.subtitle }]}>{subtitle}</Text>
        </View>
      </Pressable>
      {onQuickLogEarlier && (
        <Pressable onPress={onQuickLogEarlier} hitSlop={10} style={styles.clockButton}>
          <Text style={styles.clockIcon}>🕐</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 88,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingLeft: 18,
    paddingRight: 8,
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
  clockButton: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  clockIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
});
