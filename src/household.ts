import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ensureSignedIn, firestore } from './firebase';
import { generateInviteCode, normalizeInviteCode } from './inviteCode';

export interface HouseholdResult {
  ok: boolean;
  householdId?: string;
  message: string;
}

export async function createHousehold(): Promise<HouseholdResult> {
  if (!firestore) return { ok: false, message: 'Sharing isn\'t set up yet — see the Profile tab for setup steps.' };
  try {
    await ensureSignedIn();
    const code = generateInviteCode();
    await setDoc(doc(firestore, 'households', code), { createdAt: serverTimestamp() });
    return { ok: true, householdId: code, message: `Created! Share the code "${code}" with your partner.` };
  } catch {
    return { ok: false, message: 'Could not create a household. Check your connection and try again.' };
  }
}

export async function joinHousehold(rawCode: string): Promise<HouseholdResult> {
  if (!firestore) return { ok: false, message: 'Sharing isn\'t set up yet — see the Profile tab for setup steps.' };
  const code = normalizeInviteCode(rawCode);
  if (!code) return { ok: false, message: 'Enter an invite code first.' };
  try {
    await ensureSignedIn();
    const snap = await getDoc(doc(firestore, 'households', code));
    if (!snap.exists()) {
      return { ok: false, message: `No household found for "${code}". Double-check the code.` };
    }
    return { ok: true, householdId: code, message: 'Linked! Your data will now sync with your partner.' };
  } catch {
    return { ok: false, message: 'Could not join. Check your connection and try again.' };
  }
}
