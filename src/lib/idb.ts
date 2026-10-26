/**
 * High-performance, asynchronous IndexedDB storage layer for SecondMind offline caching.
 * Replaces synchronous 5MB localStorage with non-blocking, high-capacity client storage
 * and automatically migrates legacy localStorage items on read.
 */

const DB_NAME = 'secondmind_offline_store';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

export async function idbGet<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const db = await getDB();
    const val = await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (val !== undefined && val !== null) {
      return val;
    }
  } catch {
    // Fall back to localStorage if IndexedDB is blocked or disabled
  }

  // Backwards compatibility migration from localStorage
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T;
      // Asynchronously migrate into IndexedDB in background
      idbSet(key, parsed).catch(() => {});
      return parsed;
    }
  } catch {}

  return defaultValue;
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return;
  } catch {
    // Fallback to localStorage if quota allows
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

export async function idbDelete(key: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}

  try {
    localStorage.removeItem(key);
  } catch {}
}
