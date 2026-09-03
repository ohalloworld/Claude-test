import { useCallback, useEffect, useMemo, useState } from 'react';
import { ageInWeeks, BabyProfile, EMPTY_PROFILE, loadProfile, saveProfile } from './profile';
import { defaultThresholdsForAge, Thresholds } from './thresholds';

export function useProfile() {
  const [profile, setProfile] = useState<BabyProfile>(EMPTY_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      setLoaded(true);
    });
  }, []);

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

  const ageWeeks = useMemo(() => ageInWeeks(profile.dateOfBirth), [profile.dateOfBirth]);

  const thresholds: Thresholds = useMemo(() => {
    return { ...defaultThresholdsForAge(ageWeeks), ...profile.thresholdOverrides };
  }, [ageWeeks, profile.thresholdOverrides]);

  return { profile, loaded, ageWeeks, thresholds, setDateOfBirth, setThresholdOverride };
}
