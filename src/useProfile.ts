import { useCallback, useEffect, useMemo, useState } from 'react';
import { ageInWeeks, BabyProfile, clearProfile, EMPTY_PROFILE, loadProfile, saveProfile } from './profile';
import { defaultThresholdsForAge, Thresholds } from './thresholds';

export function useProfile() {
  const [profile, setProfile] = useState<BabyProfile>(EMPTY_PROFILE);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    return loadProfile().then((p) => {
      setProfile(p);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const setDateOfBirth = useCallback((dateOfBirth: number | null) => {
    setProfile((prev) => {
      const next = { ...prev, dateOfBirth };
      saveProfile(next);
      return next;
    });
  }, []);

  const setThresholdOverride = useCallback(<K extends keyof Thresholds>(key: K, value: number | undefined) => {
    setProfile((prev) => {
      const nextOverrides = { ...prev.thresholdOverrides };
      if (value === undefined || Number.isNaN(value)) {
        delete nextOverrides[key];
      } else {
        nextOverrides[key] = value;
      }
      const next = { ...prev, thresholdOverrides: nextOverrides };
      saveProfile(next);
      return next;
    });
  }, []);

  const addPainMedsPreset = useCallback((preset: string) => {
    const trimmed = preset.trim();
    if (!trimmed) return;
    setProfile((prev) => {
      if (prev.painMedsPresets.includes(trimmed)) return prev;
      const next = { ...prev, painMedsPresets: [...prev.painMedsPresets, trimmed] };
      saveProfile(next);
      return next;
    });
  }, []);

  const removePainMedsPreset = useCallback((preset: string) => {
    setProfile((prev) => {
      const next = { ...prev, painMedsPresets: prev.painMedsPresets.filter((p) => p !== preset) };
      saveProfile(next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(async () => {
    await clearProfile();
    setProfile(EMPTY_PROFILE);
  }, []);

  const ageWeeks = useMemo(() => ageInWeeks(profile.dateOfBirth), [profile.dateOfBirth]);

  const thresholds: Thresholds = useMemo(() => {
    return { ...defaultThresholdsForAge(ageWeeks), ...profile.thresholdOverrides };
  }, [ageWeeks, profile.thresholdOverrides]);

  return {
    profile,
    loaded,
    ageWeeks,
    thresholds,
    setDateOfBirth,
    setThresholdOverride,
    addPainMedsPreset,
    removePainMedsPreset,
    resetProfile,
    reload,
  };
}
