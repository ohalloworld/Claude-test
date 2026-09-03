import AsyncStorage from '@react-native-async-storage/async-storage';
import { Thresholds } from './thresholds';

const PROFILE_KEY = 'baby-tracker.profile.v1';

export interface BabyProfile {
  dateOfBirth: number | null; // epoch ms, start of that day
  thresholdOverrides: Partial<Thresholds>;
}

export const EMPTY_PROFILE: BabyProfile = {
  dateOfBirth: null,
  thresholdOverrides: {},
};

export async function loadProfile(): Promise<BabyProfile> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return EMPTY_PROFILE;
  try {
    const parsed = JSON.parse(raw) as Partial<BabyProfile>;
    return {
      dateOfBirth: parsed.dateOfBirth ?? null,
      thresholdOverrides: parsed.thresholdOverrides ?? {},
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveProfile(profile: BabyProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function ageInWeeks(dateOfBirth: number | null, now: number = Date.now()): number | null {
  if (dateOfBirth === null) return null;
  const ms = now - dateOfBirth;
  if (ms < 0) return 0;
  return ms / (7 * 24 * 60 * 60 * 1000);
}

export function formatAge(dateOfBirth: number | null, now: number = Date.now()): string {
  const weeks = ageInWeeks(dateOfBirth, now);
  if (weeks === null) return 'Age not set';
  if (weeks < 1) {
    const days = Math.floor(weeks * 7);
    return days <= 1 ? '1 day old' : `${days} days old`;
  }
  if (weeks < 12) {
    const wholeWeeks = Math.floor(weeks);
    return wholeWeeks === 1 ? '1 week old' : `${wholeWeeks} weeks old`;
  }
  const months = Math.floor(weeks / (52 / 12));
  return months === 1 ? '1 month old' : `${months} months old`;
}
