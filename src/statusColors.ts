import { Status } from './status';

export interface Tone {
  background: string;
  border: string;
  title: string;
  subtitle: string;
}

export const STATUS_TONES: Record<Status, Tone> = {
  green: { background: '#E7F6EC', border: '#3FA34D', title: '#1C1B1F', subtitle: '#2E7D32' },
  yellow: { background: '#FFF6DC', border: '#E0A800', title: '#1C1B1F', subtitle: '#8A6D00' },
  red: { background: '#FCE8E6', border: '#D6493B', title: '#1C1B1F', subtitle: '#B3261E' },
  neutral: { background: '#FFFFFF', border: '#CAC4D0', title: '#1C1B1F', subtitle: '#49454F' },
};

export const SLEEP_AWAKE_TONE: Tone = {
  background: '#FFF7E0',
  border: '#F2B705',
  title: '#5C4A00',
  subtitle: '#8A6D00',
};

export const SLEEP_ASLEEP_TONE: Tone = {
  background: '#232042',
  border: '#5B4FA0',
  title: '#F4F1FA',
  subtitle: '#C9C2E8',
};
