import type { MemoryItem } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';
import { CATEGORY_DEFINITIONS, isItemInCategory } from '@/lib/categories';
import { isFacebookUrl, getFacebookThumbnailUrl } from '@/lib/facebook';
import { idbGet, idbSet, idbDelete } from '@/lib/idb';

const PREFIX = 'secondmind_guest_';

export const localDb = {
  fetchItems: async (): Promise<MemoryItem[]> => {
    const raw = await idbGet<MemoryItem[]>(PREFIX + 'items', []);
    // Remove any template / demo / test / preexisting data saved links only from guest mode
    const clean = raw.filter(
      item =>
        item &&
        !item.id.startsWith('demo-') &&
        !item.id.startsWith('test-') &&
        !item.id.startsWith('mock-') &&
        !item.id.startsWith('sample-')
    );
    if (clean.length !== raw.length) {
      await idbSet(PREFIX + 'items', clean);
      try {
        const map = await idbGet<Record<string, string[]>>(PREFIX + 'itemMap', {});
        let mapChanged = false;
        const cleanIds = new Set(clean.map(c => c.id));
        for (const id of Object.keys(map)) {
          if (!cleanIds.has(id)) {
            delete map[id];
            mapChanged = true;
          }
        }
        if (mapChanged) {
          await idbSet(PREFIX + 'itemMap', map);
        }
      } catch {}
    }
    return clean;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveItem: async (data: any): Promise<MemoryItem> => {
    const items = await localDb.fetchItems();
    let finalThumbnail = data.thumbnailUrl;
    if (data.url && isFacebookUrl(data.url)) {
      if (!finalThumbnail || finalThumbnail.includes('fbcdn.net') || finalThumbnail.includes('facebook.com')) {
        finalThumbnail = getFacebookThumbnailUrl(data.url, data.title);
      }
    }

    const newItem: MemoryItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: data.type,
      title: data.title || 'Untitled Memory',
      content: data.content || '',
      url: data.url,
      thumbnailUrl: finalThumbnail,
      sourceDomain: data.url
        ? (() => {
            try {
              return new URL(data.url).hostname.replace('www.', '');
            } catch {
              return undefined;
            }
          })()
        : undefined,
      summary: data.summary || '',
      tags: data.tags || [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: false,
    };
    await idbSet(PREFIX + 'items', [newItem, ...items]);
    return newItem;
  },

  toggleFavorite: async (id: string, isFavorite: boolean): Promise<void> => {
    const items = await localDb.fetchItems();
    await idbSet(
      PREFIX + 'items',
      items.map(i => (i.id === id ? { ...i, isFavorite } : i))
    );
  },

  deleteItem: async (id: string): Promise<void> => {
    const items = await localDb.fetchItems();
    await idbSet(PREFIX + 'items', items.filter(i => i.id !== id));
    const map = await localDb.fetchCollectionItemMap();
    delete map[id];
    await idbSet(PREFIX + 'itemMap', map);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateItem: async (id: string, data: any): Promise<boolean> => {
    const items = await localDb.fetchItems();
    await idbSet(
      PREFIX + 'items',
      items.map(i => (i.id === id ? { ...i, ...data } : i))
    );
    return true;
  },

  fetchCollections: async (): Promise<Collection[]> => {
    const raw = await idbGet<Collection[]>(PREFIX + 'collections', []);
    let clean = raw.filter(c => !c.id.startsWith('demo-coll-'));
    if (clean.length === 0) {
      const defaults = CATEGORY_DEFINITIONS.map(def => ({
        id: `guest-cat-${def.id}`,
        name: def.name,
        emoji: def.emoji,
        color: def.color,
        isSmart: true,
        rules: { matchTags: def.matchTags },
        itemCount: 0,
      }));
      await idbSet(PREFIX + 'collections', defaults);
      clean = defaults;
    } else if (clean.length !== raw.length) {
      await idbSet(PREFIX + 'collections', clean);
    }
    return clean;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createCollection: async (data: any): Promise<Collection> => {
    const colls = await localDb.fetchCollections();
    const newColl: Collection = {
      id: `local-coll-${Date.now()}`,
      name: data.name,
      emoji: data.emoji || '📁',
      color: data.color || '#9CA3AF',
      isSmart: data.isSmart || false,
      rules: data.rules || {},
      itemCount: 0,
    };
    await idbSet(PREFIX + 'collections', [...colls, newColl]);
    return newColl;
  },

  deleteCollection: async (id: string): Promise<boolean> => {
    const colls = await localDb.fetchCollections();
    await idbSet(
      PREFIX + 'collections',
      colls.filter(c => c.id !== id)
    );
    const map = await localDb.fetchCollectionItemMap();
    for (const itemId in map) {
      map[itemId] = map[itemId].filter(cId => cId !== id);
    }
    await idbSet(PREFIX + 'itemMap', map);
    return true;
  },

  fetchCollectionItemMap: async (): Promise<Record<string, string[]>> => {
    return idbGet<Record<string, string[]>>(PREFIX + 'itemMap', {});
  },

  addItemToCollection: async (itemId: string, collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    if (!map[itemId]) map[itemId] = [];
    if (!map[itemId].includes(collectionId)) {
      map[itemId].push(collectionId);
      await idbSet(PREFIX + 'itemMap', map);
    }
    return true;
  },

  addItemsToCollection: async (itemIds: string[], collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    itemIds.forEach(id => {
      if (!map[id]) map[id] = [];
      if (!map[id].includes(collectionId)) map[id].push(collectionId);
    });
    await idbSet(PREFIX + 'itemMap', map);
    return true;
  },

  removeItemFromCollection: async (itemId: string, collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    if (map[itemId]) {
      map[itemId] = map[itemId].filter(id => id !== collectionId);
      await idbSet(PREFIX + 'itemMap', map);
    }
    return true;
  },

  seedDefaultCollections: async (): Promise<void> => {
    const colls = await localDb.fetchCollections();
    const existingNames = new Set(colls.map(c => c.name));
    const toAdd = CATEGORY_DEFINITIONS
      .filter(def => !existingNames.has(def.name))
      .map(def => ({
        id: `guest-cat-${def.id}`,
        name: def.name,
        emoji: def.emoji,
        color: def.color,
        isSmart: true,
        rules: { matchTags: def.matchTags },
        itemCount: 0,
      }));

    if (toAdd.length > 0) {
      await idbSet(PREFIX + 'collections', [...colls, ...toAdd]);
    }
  },

  seedDemoContent: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    await idbDelete(PREFIX + 'demo_seeded');
  },

  autoAssignItemToCollections: async (): Promise<boolean> => {
    try {
      const items = await localDb.fetchItems();
      const colls = await localDb.fetchCollections();
      const existingMap = await localDb.fetchCollectionItemMap();
      const map: Record<string, string[]> = {};

      const smartCollIds = new Set(colls.filter(c => c.isSmart).map(c => c.id));

      for (const item of items) {
        // Retain manual collection assignments
        const manualIds = (existingMap[item.id] || []).filter(id => !smartCollIds.has(id));
        map[item.id] = [...manualIds];
        const itemTags = item.tags || [];

        for (const coll of colls) {
          if (!coll.isSmart) continue;
          const matchTags: string[] = Array.isArray(coll.rules?.matchTags) ? coll.rules.matchTags : [];
          const hasTagMatch = matchTags.some(t => itemTags.includes(t)) || itemTags.includes(coll.name);
          const hasCategoryMatch = isItemInCategory(item, coll.name);

          if ((hasTagMatch || hasCategoryMatch) && !map[item.id].includes(coll.id)) {
            map[item.id].push(coll.id);
          }
        }
      }

      await idbSet(PREFIX + 'itemMap', map);
      return true;
    } catch {
      return false;
    }
  },

  /** Checks if there are real user items stored waiting to be migrated */
  hasUnmigratedGuestData: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(PREFIX + 'items');
      if (raw) {
        const items = JSON.parse(raw) as MemoryItem[];
        return (
          Array.isArray(items) &&
          items.some(
            i =>
              i &&
              !i.id.startsWith('demo-') &&
              !i.id.startsWith('test-') &&
              !i.id.startsWith('mock-') &&
              !i.id.startsWith('sample-')
          )
        );
      }
    } catch {}
    return false;
  },

  /** Retrieves guest data for account migration (excluding any preexisting demo/test data) */
  getGuestDataForMigration: async () => {
    const items = (await localDb.fetchItems()).filter(
      i =>
        i &&
        !i.id.startsWith('demo-') &&
        !i.id.startsWith('test-') &&
        !i.id.startsWith('mock-') &&
        !i.id.startsWith('sample-')
    );
    const collections = await localDb.fetchCollections();
    const itemMap = await localDb.fetchCollectionItemMap();
    return { items, collections, itemMap };
  },

  /** Clears guest items after successful migration */
  clearGuestData: (): void => {
    if (typeof window === 'undefined') return;
    idbDelete(PREFIX + 'items');
    idbDelete(PREFIX + 'collections');
    idbDelete(PREFIX + 'itemMap');
    idbDelete(PREFIX + 'demo_seeded');
  },

  /** Exports all guest data as a downloadable JSON file */
  exportData: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    const items = await localDb.fetchItems();
    const collections = await localDb.fetchCollections();
    const itemMap = await localDb.fetchCollectionItemMap();
    const blob = new Blob(
      [JSON.stringify({ items, collections, itemMap, exportedAt: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secondmind-guest-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
