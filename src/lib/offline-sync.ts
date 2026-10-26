import type { MemoryItem } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';
import { idbGet, idbSet } from '@/lib/idb';

export interface OfflineAction {
  id: string;
  type:
    | 'save'
    | 'toggleFavorite'
    | 'delete'
    | 'update'
    | 'createCollection'
    | 'deleteCollection'
    | 'addItemToCollection'
    | 'removeItemFromCollection';
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  tempId?: string;
  createdAt: number;
}

export interface CachedUserData {
  items: MemoryItem[];
  collections: Collection[];
  itemMap: Record<string, string[]>;
  cachedAt?: number;
}

export interface SyncHandlers {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveItem: (userId: string, data: any) => Promise<MemoryItem | null>;
  toggleFavorite: (userId: string, itemId: string, isFavorite: boolean) => Promise<void>;
  deleteItem: (userId: string, itemId: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateItem: (userId: string, itemId: string, data: any) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createCollection: (userId: string, data: any) => Promise<Collection | null>;
  deleteCollection: (collectionId: string, userId: string) => Promise<boolean>;
  addItemToCollection: (itemId: string, collectionId: string, userId: string) => Promise<boolean>;
  removeItemFromCollection: (itemId: string, collectionId: string, userId: string) => Promise<boolean>;
}

const STORAGE_PREFIX = 'secondmind_offline_';
const QUEUE_KEY = `${STORAGE_PREFIX}queue`;
const LAST_ACCOUNT_KEY = `${STORAGE_PREFIX}last_account_id`;
const LATEST_CACHE_KEY = `${STORAGE_PREFIX}latest_cache`;

function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.warn('[OfflineSync] Failed to read from localStorage:', key, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[OfflineSync] Failed to write to localStorage:', key, err);
  }
}

function resolveTargetUserId(userId?: string): string {
  if (userId && userId !== 'offline-user' && userId !== 'guest') {
    return userId;
  }
  if (typeof window !== 'undefined') {
    try {
      const lastId = localStorage.getItem(LAST_ACCOUNT_KEY);
      if (lastId && lastId !== 'offline-user' && lastId !== 'guest') {
        return lastId;
      }
    } catch {}
  }
  return userId || 'offline-user';
}

export const offlineSync = {
  /**
   * Check if browser is currently online
   */
  isOnline: (): boolean => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  },

  /**
   * Remember the last signed-in user ID for offline resume
   */
  setLastKnownAccountId: (userId: string): void => {
    if (typeof window === 'undefined' || !userId || userId === 'guest' || userId === 'offline-user') return;
    try {
      localStorage.setItem(LAST_ACCOUNT_KEY, userId);
    } catch {}
  },

  getLastKnownAccountId: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(LAST_ACCOUNT_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Cache user's data from server for offline access
   */
  cacheUserData: (
    userId: string,
    items: MemoryItem[],
    collections: Collection[],
    itemMap: Record<string, string[]>
  ): void => {
    if (typeof window === 'undefined' || !userId) return;
    
    const targetId = resolveTargetUserId(userId);
    const data: CachedUserData = {
      items,
      collections,
      itemMap,
      cachedAt: Date.now(),
    };
    // Save under the specific user ID
    const userCacheKey = `${STORAGE_PREFIX}user_${targetId}_data`;
    safeSet<CachedUserData>(userCacheKey, data);
    idbSet(userCacheKey, data).catch(() => {});

    // Also persist to general latest cache for immediate offline retrieval
    if (targetId !== 'guest') {
      safeSet<CachedUserData>(LATEST_CACHE_KEY, data);
      idbSet(LATEST_CACHE_KEY, data).catch(() => {});
      offlineSync.setLastKnownAccountId(targetId);
    }
  },

  /**
   * Retrieve cached data asynchronously with IndexedDB fallthrough
   */
  getCachedUserDataAsync: async (userId: string): Promise<CachedUserData> => {
    const syncResult = offlineSync.getCachedUserData(userId);
    if (syncResult.items && syncResult.items.length > 0) return syncResult;

    const targetId = resolveTargetUserId(userId);
    const userCacheKey = `${STORAGE_PREFIX}user_${targetId}_data`;
    const idbResult = await idbGet<CachedUserData>(userCacheKey, { items: [], collections: [], itemMap: {}, cachedAt: 0 });
    if (idbResult.items && idbResult.items.length > 0) return idbResult;

    return idbGet<CachedUserData>(LATEST_CACHE_KEY, syncResult);
  },

  /**
   * Retrieve cached data for user. Seamlessly falls back through:
   * 1. Exact user cache
   * 2. Last known account cache
   * 3. Latest general cache
   * 4. Any available offline user cache in localStorage
   * 5. Guest items
   */
  getCachedUserData: (userId: string): CachedUserData => {
    const defaultData: CachedUserData = { items: [], collections: [], itemMap: {}, cachedAt: 0 };
    if (typeof window === 'undefined') return defaultData;

    const targetId = resolveTargetUserId(userId);
    const userCacheKey = `${STORAGE_PREFIX}user_${targetId}_data`;
    const cached = safeGet<CachedUserData>(userCacheKey, defaultData);
    if (cached.items && cached.items.length > 0) {
      return cached;
    }

    // Fallback 1: latest general cache
    const latest = safeGet<CachedUserData>(LATEST_CACHE_KEY, defaultData);
    if (latest.items && latest.items.length > 0) {
      return latest;
    }

    // Fallback 2: Any cached user data key in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${STORAGE_PREFIX}user_`) && key.endsWith('_data')) {
          const fallback = safeGet<CachedUserData>(key, defaultData);
          if (fallback.items && fallback.items.length > 0) {
            return fallback;
          }
        }
      }
    } catch {}
    
    // Fallback 3: Guest items
    if (targetId !== 'guest') {
      const guestItems = safeGet<MemoryItem[]>('secondmind_guest_items', []);
      const guestColls = safeGet<Collection[]>('secondmind_guest_collections', []);
      const guestMap = safeGet<Record<string, string[]>>('secondmind_guest_itemMap', {});
      if (guestItems.length > 0) {
        return { items: guestItems, collections: guestColls, itemMap: guestMap, cachedAt: Date.now() };
      }
    }

    return cached;
  },

  /**
   * Add an item to local cache when created offline
   */
  addOfflineItem: (userId: string, item: MemoryItem): void => {
    const targetId = resolveTargetUserId(userId);
    const cached = offlineSync.getCachedUserData(targetId);
    const updatedItems = [item, ...cached.items.filter(i => i.id !== item.id)];
    offlineSync.cacheUserData(targetId, updatedItems, cached.collections, cached.itemMap);
  },

  /**
   * Update an item in local cache
   */
  updateCachedItem: (userId: string, updatedItem: Partial<MemoryItem> & { id: string }): void => {
    const targetId = resolveTargetUserId(userId);
    const cached = offlineSync.getCachedUserData(targetId);
    const updatedItems = cached.items.map(item =>
      item.id === updatedItem.id ? { ...item, ...updatedItem } : item
    );
    offlineSync.cacheUserData(targetId, updatedItems, cached.collections, cached.itemMap);
  },

  /**
   * Toggle favorite in local cache
   */
  toggleCachedFavorite: (userId: string, itemId: string, isFavorite: boolean): void => {
    const targetId = resolveTargetUserId(userId);
    const cached = offlineSync.getCachedUserData(targetId);
    const updatedItems = cached.items.map(item =>
      item.id === itemId ? { ...item, isFavorite } : item
    );
    offlineSync.cacheUserData(targetId, updatedItems, cached.collections, cached.itemMap);
  },

  /**
   * Delete item from local cache
   */
  deleteCachedItem: (userId: string, itemId: string): void => {
    const targetId = resolveTargetUserId(userId);
    const cached = offlineSync.getCachedUserData(targetId);
    const updatedItems = cached.items.filter(item => item.id !== itemId);
    const updatedMap = { ...cached.itemMap };
    delete updatedMap[itemId];
    offlineSync.cacheUserData(targetId, updatedItems, cached.collections, updatedMap);
  },

  /**
   * Enqueue an action to be synchronized once back online
   */
  enqueueAction: (action: Omit<OfflineAction, 'id'>): void => {
    const queue = safeGet<OfflineAction[]>(QUEUE_KEY, []);
    const newAction: OfflineAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    safeSet<OfflineAction[]>(QUEUE_KEY, [...queue, newAction]);
  },

  /**
   * Get all pending offline actions
   */
  getPendingActions: (): OfflineAction[] => {
    return safeGet<OfflineAction[]>(QUEUE_KEY, []);
  },

  /**
   * Get count of pending actions
   */
  getPendingCount: (): number => {
    return safeGet<OfflineAction[]>(QUEUE_KEY, []).length;
  },

  /**
   * Clear all pending actions
   */
  clearPendingActions: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch {}
  },

  /**
   * Replay and sync all queued actions to the server
   */
  syncPendingActions: async (
    userId: string,
    handlers: SyncHandlers
  ): Promise<{ syncedCount: number; errors: number }> => {
    if (typeof window === 'undefined' || !offlineSync.isOnline()) {
      return { syncedCount: 0, errors: 0 };
    }

    const queue = offlineSync.getPendingActions();
    if (queue.length === 0) return { syncedCount: 0, errors: 0 };

    let syncedCount = 0;
    let errors = 0;
    const remainingQueue: OfflineAction[] = [];

    // Map temporary offline IDs to real server IDs
    const idMapping: Record<string, string> = {};

    for (const action of queue) {
      try {
        let effectiveUserId = action.userId;
        if (!effectiveUserId || effectiveUserId === 'offline-user') {
          effectiveUserId = (userId && userId !== 'offline-user' && userId !== 'guest')
            ? userId
            : (offlineSync.getLastKnownAccountId() || userId);
        }

        if (!effectiveUserId || effectiveUserId === 'guest') {
          // Guest actions remain in local storage
          remainingQueue.push(action);
          continue;
        }

        switch (action.type) {
          case 'save': {
            const saved = await handlers.saveItem(effectiveUserId, action.payload);
            if (saved) {
              if (action.tempId) {
                idMapping[action.tempId] = saved.id;
              }
              // Update local cache to replace temp ID with server ID
              const cached = offlineSync.getCachedUserData(effectiveUserId);
              let remappedItems = cached.items.map(i => (action.tempId && i.id === action.tempId ? saved : i));
              if (!remappedItems.some(i => i.id === saved.id)) {
                remappedItems = [saved, ...remappedItems];
              }
              offlineSync.cacheUserData(effectiveUserId, remappedItems, cached.collections, cached.itemMap);
              syncedCount++;
            } else {
              errors++;
              remainingQueue.push(action);
            }
            break;
          }

          case 'toggleFavorite': {
            const targetItemId = idMapping[action.payload.itemId] || action.payload.itemId;
            await handlers.toggleFavorite(effectiveUserId, targetItemId, action.payload.isFavorite);
            syncedCount++;
            break;
          }

          case 'delete': {
            const targetItemId = idMapping[action.payload.itemId] || action.payload.itemId;
            await handlers.deleteItem(effectiveUserId, targetItemId);
            syncedCount++;
            break;
          }

          case 'update': {
            const targetItemId = idMapping[action.payload.itemId] || action.payload.itemId;
            await handlers.updateItem(effectiveUserId, targetItemId, action.payload.data);
            syncedCount++;
            break;
          }

          case 'createCollection': {
            const coll = await handlers.createCollection(effectiveUserId, action.payload);
            if (coll && action.tempId) {
              idMapping[action.tempId] = coll.id;
            }
            syncedCount++;
            break;
          }

          case 'deleteCollection': {
            const targetCollId = idMapping[action.payload.collectionId] || action.payload.collectionId;
            await handlers.deleteCollection(targetCollId, effectiveUserId);
            syncedCount++;
            break;
          }

          case 'addItemToCollection': {
            const targetItemId = idMapping[action.payload.itemId] || action.payload.itemId;
            const targetCollId = idMapping[action.payload.collectionId] || action.payload.collectionId;
            await handlers.addItemToCollection(targetItemId, targetCollId, effectiveUserId);
            syncedCount++;
            break;
          }

          case 'removeItemFromCollection': {
            const targetItemId = idMapping[action.payload.itemId] || action.payload.itemId;
            const targetCollId = idMapping[action.payload.collectionId] || action.payload.collectionId;
            await handlers.removeItemFromCollection(targetItemId, targetCollId, effectiveUserId);
            syncedCount++;
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.warn('[OfflineSync] Failed to sync action, retaining in queue:', action, err);
        errors++;
        remainingQueue.push(action);
      }
    }

    safeSet<OfflineAction[]>(QUEUE_KEY, remainingQueue);
    return { syncedCount, errors };
  },

  /**
   * Listen to online / offline network state changes
   */
  listenToNetworkStatus: (onStatusChange: (isOnline: boolean) => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};

    const handleOnline = () => onStatusChange(true);
    const handleOffline = () => onStatusChange(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
};
