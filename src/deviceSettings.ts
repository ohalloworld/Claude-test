import AsyncStorage from '@react-native-async-storage/async-storage';

// These live only on this device — they identify which household this app
// is linked to and who's using it, and must never be overwritten by data
// synced down from a shared household.
const DEVICE_SETTINGS_KEY = 'baby-tracker.device.v1';

export interface DeviceSettings {
  householdId: string | null;
  displayName: string;
}

export const EMPTY_DEVICE_SETTINGS: DeviceSettings = {
  householdId: null,
  displayName: '',
};

export async function loadDeviceSettings(): Promise<DeviceSettings> {
  const raw = await AsyncStorage.getItem(DEVICE_SETTINGS_KEY);
  if (!raw) return EMPTY_DEVICE_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<DeviceSettings>;
    return {
      householdId: parsed.householdId ?? null,
      displayName: parsed.displayName ?? '',
    };
  } catch {
    return EMPTY_DEVICE_SETTINGS;
  }
}

export async function saveDeviceSettings(settings: DeviceSettings): Promise<void> {
  await AsyncStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(settings));
}

export async function clearDeviceSettings(): Promise<void> {
  await AsyncStorage.removeItem(DEVICE_SETTINGS_KEY);
}
