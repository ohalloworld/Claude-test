export enum EventType {
  PAIN_MEDS = 'PAIN_MEDS',
  FEEDING = 'FEEDING',
  SLEEP_START = 'SLEEP_START',
  SLEEP_END = 'SLEEP_END',
  WET_NAPPY = 'WET_NAPPY',
  POO_NAPPY = 'POO_NAPPY',
}

export const EVENT_LABELS: Record<EventType, string> = {
  [EventType.PAIN_MEDS]: 'Pain Meds',
  [EventType.FEEDING]: 'Feeding',
  [EventType.SLEEP_START]: 'Sleep Start',
  [EventType.SLEEP_END]: 'Sleep End',
  [EventType.WET_NAPPY]: 'Wet Nappy',
  [EventType.POO_NAPPY]: 'Poo Nappy',
};

export interface TrackedEvent {
  id: string;
  type: EventType;
  timestamp: number;
}
