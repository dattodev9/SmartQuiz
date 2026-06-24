// ============================================================
// Smart Quiz — Chrome Storage Wrapper
// Type-safe wrappers for chrome.storage.local
// ============================================================

import type { QuizSet, Summary } from '@shared/types';

interface StorageSchema {
  quiz_history: QuizSet[];
  summary_history: Summary[];
  auth_token: string | null;
  user_preferences: {
    numQuestions: number;
    language: string;
  };
}

type StorageKey = keyof StorageSchema;

export async function getStorage<K extends StorageKey>(
  key: K
): Promise<StorageSchema[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as StorageSchema[K] | undefined;
}

export async function setStorage<K extends StorageKey>(
  key: K,
  value: StorageSchema[K]
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeStorage(key: StorageKey): Promise<void> {
  await chrome.storage.local.remove(key);
}

export async function clearAllStorage(): Promise<void> {
  await chrome.storage.local.clear();
}
