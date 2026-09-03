export interface Thresholds {
  // Pain meds: not age-based (depends on the medication/label, not the baby's
  // age) — this is just a plain reminder timer the parent sets themselves.
  painMedsCautionHours: number;
  painMedsConcernHours: number;

  // Feeding: hours since last feed.
  feedingCautionHours: number;
  feedingConcernHours: number;

  // Wet nappy: count so far today.
  wetYellowMin: number; // >= this many => at least yellow
  wetGreenMin: number; // >= this many => green

  // Poo nappy: count so far today. Below wetYellowMin-equivalent or above
  // pooRedAbove is flagged; the middle band is green.
  pooYellowMin: number;
  pooGreenMin: number;
  pooGreenMax: number;
  pooRedAbove: number;
}

export const DEFAULT_PAIN_MEDS_THRESHOLDS: Pick<
  Thresholds,
  'painMedsCautionHours' | 'painMedsConcernHours'
> = {
  painMedsCautionHours: 6,
  painMedsConcernHours: 7,
};

interface AgeBand {
  maxWeeks: number; // band applies while age < maxWeeks
  feedingCautionHours: number;
  feedingConcernHours: number;
  wetYellowMin: number;
  wetGreenMin: number;
  pooYellowMin: number;
  pooGreenMin: number;
  pooGreenMax: number;
  pooRedAbove: number;
}

// General, approximate guidance only — not medical advice. Every value here
// is editable in the app; treat these as a reasonable starting point, not a
// diagnosis. Always follow your pediatrician's guidance for your baby.
const AGE_BANDS: AgeBand[] = [
  {
    maxWeeks: 2,
    feedingCautionHours: 2,
    feedingConcernHours: 3,
    wetYellowMin: 4,
    wetGreenMin: 6,
    pooYellowMin: 1,
    pooGreenMin: 3,
    pooGreenMax: 6,
    pooRedAbove: 8,
  },
  {
    maxWeeks: 6,
    feedingCautionHours: 2.5,
    feedingConcernHours: 3.5,
    wetYellowMin: 4,
    wetGreenMin: 6,
    pooYellowMin: 1,
    pooGreenMin: 2,
    pooGreenMax: 6,
    pooRedAbove: 8,
  },
  {
    maxWeeks: 12,
    feedingCautionHours: 3,
    feedingConcernHours: 4,
    wetYellowMin: 3,
    wetGreenMin: 5,
    pooYellowMin: 1,
    pooGreenMin: 2,
    pooGreenMax: 5,
    pooRedAbove: 7,
  },
  {
    maxWeeks: 26,
    feedingCautionHours: 3.5,
    feedingConcernHours: 4.5,
    wetYellowMin: 3,
    wetGreenMin: 5,
    pooYellowMin: 0,
    pooGreenMin: 1,
    pooGreenMax: 4,
    pooRedAbove: 6,
  },
  {
    maxWeeks: 52,
    feedingCautionHours: 4,
    feedingConcernHours: 5,
    wetYellowMin: 3,
    wetGreenMin: 5,
    pooYellowMin: 0,
    pooGreenMin: 1,
    pooGreenMax: 3,
    pooRedAbove: 5,
  },
];

const FALLBACK_BAND: AgeBand = {
  maxWeeks: Infinity,
  feedingCautionHours: 4,
  feedingConcernHours: 6,
  wetYellowMin: 3,
  wetGreenMin: 5,
  pooYellowMin: 0,
  pooGreenMin: 1,
  pooGreenMax: 3,
  pooRedAbove: 5,
};

export function defaultThresholdsForAge(ageWeeks: number | null): Thresholds {
  const band =
    ageWeeks === null
      ? AGE_BANDS[2] // a reasonable general default when age isn't set
      : AGE_BANDS.find((b) => ageWeeks < b.maxWeeks) ?? FALLBACK_BAND;

  return {
    ...DEFAULT_PAIN_MEDS_THRESHOLDS,
    feedingCautionHours: band.feedingCautionHours,
    feedingConcernHours: band.feedingConcernHours,
    wetYellowMin: band.wetYellowMin,
    wetGreenMin: band.wetGreenMin,
    pooYellowMin: band.pooYellowMin,
    pooGreenMin: band.pooGreenMin,
    pooGreenMax: band.pooGreenMax,
    pooRedAbove: band.pooRedAbove,
  };
}
