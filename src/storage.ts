import type { AppState } from './types';

const STORE = 'state';
const KEY = 'current';

function open(namespace: 'real' | 'demo'): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`deadline-reality-check:${namespace}`, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadState(namespace: 'real' | 'demo'): Promise<AppState | null> {
  const db = await open(namespace);
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve((request.result as AppState | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveState(namespace: 'real' | 'demo', state: AppState): Promise<void> {
  const db = await open(namespace);
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(state, KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearState(namespace: 'real' | 'demo'): Promise<void> {
  const db = await open(namespace);
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
