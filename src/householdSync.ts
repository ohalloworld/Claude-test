import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { ensureSignedIn, firestore } from './firebase';
import { BabyProfile } from './profile';
import { Thresholds } from './thresholds';
import { TrackedEvent } from './types';

export type EventChange = { type: 'upsert'; event: TrackedEvent } | { type: 'remove'; id: string };

function eventsCollection(householdId: string) {
  if (!firestore) throw new Error('Firestore not configured');
  return collection(firestore, 'households', householdId, 'events');
}

function profileDoc(householdId: string) {
  if (!firestore) throw new Error('Firestore not configured');
  return doc(firestore, 'households', householdId, 'profile', 'main');
}

/** Subscribes to remote event changes. Fires once per changed doc, not a full snapshot each time. */
export function subscribeToHouseholdEvents(
  householdId: string,
  onChange: (change: EventChange) => void
): () => void {
  if (!firestore) return () => {};
  const unsubscribe = onSnapshot(eventsCollection(householdId), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'removed') {
        onChange({ type: 'remove', id: change.doc.id });
      } else {
        const data = change.doc.data() as DocumentData;
        onChange({
          type: 'upsert',
          event: {
            id: change.doc.id,
            type: data.type,
            timestamp: data.timestamp,
            detail: data.detail,
            loggedBy: data.loggedBy,
          },
        });
      }
    });
  });
  return unsubscribe;
}

export async function pushEventToHousehold(householdId: string, event: TrackedEvent): Promise<void> {
  if (!firestore) return;
  try {
    await ensureSignedIn();
    const payload: DocumentData = { type: event.type, timestamp: event.timestamp, updatedAt: serverTimestamp() };
    if (event.detail !== undefined) payload.detail = event.detail;
    if (event.loggedBy !== undefined) payload.loggedBy = event.loggedBy;
    await setDoc(doc(eventsCollection(householdId), event.id), payload, { merge: true });
  } catch {
    // Best-effort background sync — local storage already has the write.
  }
}

export async function deleteEventFromHousehold(householdId: string, eventId: string): Promise<void> {
  if (!firestore) return;
  try {
    await ensureSignedIn();
    await deleteDoc(doc(eventsCollection(householdId), eventId));
  } catch {
    // Best-effort — will reconcile next time the app is online.
  }
}

export function subscribeToHouseholdProfile(
  householdId: string,
  onChange: (profile: Partial<BabyProfile>) => void
): () => void {
  if (!firestore) return () => {};
  const unsubscribe = onSnapshot(profileDoc(householdId), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data() as DocumentData;
    onChange({
      dateOfBirth: data.dateOfBirth ?? null,
      thresholdOverrides: (data.thresholdOverrides ?? {}) as Partial<Thresholds>,
      painMedsPresets: data.painMedsPresets ?? undefined,
    });
  });
  return unsubscribe;
}

export async function pushProfileToHousehold(householdId: string, profile: BabyProfile): Promise<void> {
  if (!firestore) return;
  try {
    await ensureSignedIn();
    await setDoc(
      profileDoc(householdId),
      {
        dateOfBirth: profile.dateOfBirth,
        thresholdOverrides: profile.thresholdOverrides,
        painMedsPresets: profile.painMedsPresets,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Best-effort background sync.
  }
}
