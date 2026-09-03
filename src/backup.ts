import { Platform, Share } from 'react-native';
import { BabyProfile, loadProfile, saveProfile } from './profile';
import { loadEvents, saveEvents } from './storage';
import { TrackedEvent } from './types';

export interface BackupPayload {
  version: 1;
  exportedAt: number;
  profile: BabyProfile;
  events: TrackedEvent[];
}

export async function buildBackup(): Promise<BackupPayload> {
  const [profile, events] = await Promise.all([loadProfile(), loadEvents()]);
  return { version: 1, exportedAt: Date.now(), profile, events };
}

function webDownloadJson(json: string, filename: string) {
  // Web-only DOM APIs; routed through `any` since this project's tsconfig
  // targets React Native, not the DOM lib.
  const g: any = globalThis;
  const blob = new g.Blob([json], { type: 'application/json' });
  const url = g.URL.createObjectURL(blob);
  const a = g.document.createElement('a');
  a.href = url;
  a.download = filename;
  g.document.body.appendChild(a);
  a.click();
  g.document.body.removeChild(a);
  g.URL.revokeObjectURL(url);
}

export async function exportBackup(): Promise<{ ok: boolean; message: string }> {
  const payload = await buildBackup();
  const json = JSON.stringify(payload, null, 2);
  const filename = `baby-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (Platform.OS === 'web') {
    webDownloadJson(json, filename);
    return { ok: true, message: 'Backup downloaded.' };
  }

  await Share.share({ message: json, title: filename });
  return { ok: true, message: 'Backup shared.' };
}

function isValidBackup(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<BackupPayload>;
  return Array.isArray(v.events) && typeof v.profile === 'object' && v.profile !== null;
}

export async function restoreFromJson(json: string): Promise<{ ok: boolean; message: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, message: "That file doesn't look like valid backup data." };
  }
  if (!isValidBackup(parsed)) {
    return { ok: false, message: "That file doesn't look like a Baby Tracker backup." };
  }
  await saveEvents(parsed.events);
  await saveProfile(parsed.profile);
  return { ok: true, message: 'Backup restored. Restart the app to see everything.' };
}

/** Web-only: opens a file picker and restores from the chosen JSON file. */
export function pickAndRestoreFileWeb(onDone: (result: { ok: boolean; message: string }) => void) {
  const g: any = globalThis;
  const input = g.document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new g.FileReader();
    reader.onload = async () => {
      const result = await restoreFromJson(String(reader.result));
      onDone(result);
    };
    reader.readAsText(file);
  };
  input.click();
}
