import { useCallback, useEffect, useMemo, useState } from 'react';
import { clearDeviceSettings, DeviceSettings, EMPTY_DEVICE_SETTINGS, loadDeviceSettings, saveDeviceSettings } from './deviceSettings';
import { createHousehold, HouseholdResult, joinHousehold } from './household';
import { pushProfileToHousehold, subscribeToHouseholdProfile } from './householdSync';
import { ageInWeeks, BabyProfile, clearProfile, EMPTY_PROFILE, loadProfile, saveProfile } from './profile';
import { defaultThresholdsForAge, Thresholds } from './thresholds';

export function useProfile() {
  const [profile, setProfile] = useState<BabyProfile>(EMPTY_PROFILE);
  const [device, setDevice] = useState<DeviceSettings>(EMPTY_DEVICE_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    return Promise.all([loadProfile(), loadDeviceSettings()]).then(([p, d]) => {
      setProfile(p);
      setDevice(d);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Mirror remote profile changes from the shared household.
  useEffect(() => {
    if (!device.householdId) return;
    const unsubscribe = subscribeToHouseholdProfile(device.householdId, (remote) => {
      setProfile((prev) => {
        const next: BabyProfile = {
          dateOfBirth: remote.dateOfBirth !== undefined ? remote.dateOfBirth : prev.dateOfBirth,
          thresholdOverrides: remote.thresholdOverrides ?? prev.thresholdOverrides,
          painMedsPresets: remote.painMedsPresets ?? prev.painMedsPresets,
        };
        saveProfile(next);
        return next;
      });
    });
    return unsubscribe;
  }, [device.householdId]);

  const pushIfLinked = useCallback(
    (next: BabyProfile) => {
      if (device.householdId) pushProfileToHousehold(device.householdId, next);
    },
    [device.householdId]
  );

  const setDateOfBirth = useCallback(
    (dateOfBirth: number | null) => {
      setProfile((prev) => {
        const next = { ...prev, dateOfBirth };
        saveProfile(next);
        pushIfLinked(next);
        return next;
      });
    },
    [pushIfLinked]
  );

  const setThresholdOverride = useCallback(
    <K extends keyof Thresholds>(key: K, value: number | undefined) => {
      setProfile((prev) => {
        const nextOverrides = { ...prev.thresholdOverrides };
        if (value === undefined || Number.isNaN(value)) {
          delete nextOverrides[key];
        } else {
          nextOverrides[key] = value;
        }
        const next = { ...prev, thresholdOverrides: nextOverrides };
        saveProfile(next);
        pushIfLinked(next);
        return next;
      });
    },
    [pushIfLinked]
  );

  const addPainMedsPreset = useCallback(
    (preset: string) => {
      const trimmed = preset.trim();
      if (!trimmed) return;
      setProfile((prev) => {
        if (prev.painMedsPresets.includes(trimmed)) return prev;
        const next = { ...prev, painMedsPresets: [...prev.painMedsPresets, trimmed] };
        saveProfile(next);
        pushIfLinked(next);
        return next;
      });
    },
    [pushIfLinked]
  );

  const removePainMedsPreset = useCallback(
    (preset: string) => {
      setProfile((prev) => {
        const next = { ...prev, painMedsPresets: prev.painMedsPresets.filter((p) => p !== preset) };
        saveProfile(next);
        pushIfLinked(next);
        return next;
      });
    },
    [pushIfLinked]
  );

  const setDisplayName = useCallback((displayName: string) => {
    setDevice((prev) => {
      const next = { ...prev, displayName };
      saveDeviceSettings(next);
      return next;
    });
  }, []);

  const linkHousehold = useCallback((householdId: string) => {
    setDevice((prev) => {
      const next = { ...prev, householdId };
      saveDeviceSettings(next);
      return next;
    });
  }, []);

  const createAndLinkHousehold = useCallback(async (): Promise<HouseholdResult> => {
    const result = await createHousehold();
    if (result.ok && result.householdId) {
      linkHousehold(result.householdId);
      // We're the creator, so seed the shared profile from our current
      // local one. A joiner must NOT do this — see joinAndLinkHousehold —
      // or they'd overwrite the creator's already-set data with their own
      // blank defaults the moment they link.
      pushProfileToHousehold(result.householdId, profile);
    }
    return result;
  }, [linkHousehold, profile]);

  const joinAndLinkHousehold = useCallback(
    async (code: string): Promise<HouseholdResult> => {
      const result = await joinHousehold(code);
      if (result.ok && result.householdId) {
        linkHousehold(result.householdId);
        // Deliberately no push here — the subscription effect above will
        // pull the household's existing profile down onto this device.
      }
      return result;
    },
    [linkHousehold]
  );

  const leaveHousehold = useCallback(() => {
    setDevice((prev) => {
      const next = { ...prev, householdId: null };
      saveDeviceSettings(next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(async () => {
    await Promise.all([clearProfile(), clearDeviceSettings()]);
    setProfile(EMPTY_PROFILE);
    setDevice(EMPTY_DEVICE_SETTINGS);
  }, []);

  const ageWeeks = useMemo(() => ageInWeeks(profile.dateOfBirth), [profile.dateOfBirth]);

  const thresholds: Thresholds = useMemo(() => {
    return { ...defaultThresholdsForAge(ageWeeks), ...profile.thresholdOverrides };
  }, [ageWeeks, profile.thresholdOverrides]);

  return {
    profile,
    householdId: device.householdId,
    displayName: device.displayName,
    loaded,
    ageWeeks,
    thresholds,
    setDateOfBirth,
    setThresholdOverride,
    addPainMedsPreset,
    removePainMedsPreset,
    setDisplayName,
    createAndLinkHousehold,
    joinAndLinkHousehold,
    leaveHousehold,
    resetProfile,
    reload,
  };
}
