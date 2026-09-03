import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackedEvent } from './types';

const STORAGE_KEY = 'baby-tracker.events.v1';

export async function loadEvents(): Promise<TrackedEvent[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TrackedEvent[];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export async function saveEvents(events: TrackedEvent[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
