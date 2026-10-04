import type { MemoryItem } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';

const PREFIX = 'secondmind_guest_';

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const raw = localStorage.getItem(PREFIX + key);
  return raw ? JSON.parse(raw) : defaultValue;
}

function setLocal<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }
}

export const localDb = {
  fetchItems: async (): Promise<MemoryItem[]> => {
    return getLocal<MemoryItem[]>('items', []);
  },
  
  saveItem: async (data: any): Promise<MemoryItem> => {
    const items = await localDb.fetchItems();
    const newItem: MemoryItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: data.type,
      title: data.title || 'Untitled Memory',
      content: data.content || '',
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      summary: data.summary || '',
      tags: data.tags || [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: false,
    };
    setLocal('items', [newItem, ...items]);
    return newItem;
  },
  
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<void> => {
    const items = await localDb.fetchItems();
    setLocal('items', items.map(i => i.id === id ? { ...i, isFavorite } : i));
  },
  
  deleteItem: async (id: string): Promise<void> => {
    const items = await localDb.fetchItems();
    setLocal('items', items.filter(i => i.id !== id));
    
    // Also remove from collections map
    const map = await localDb.fetchCollectionItemMap();
    delete map[id];
    setLocal('itemMap', map);
  },
  
  updateItem: async (id: string, data: any): Promise<boolean> => {
    const items = await localDb.fetchItems();
    setLocal('items', items.map(i => i.id === id ? { ...i, ...data } : i));
    return true;
  },

  fetchCollections: async (): Promise<Collection[]> => {
    return getLocal<Collection[]>('collections', []);
  },
  
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
    setLocal('collections', [...colls, newColl]);
    return newColl;
  },
  
  deleteCollection: async (id: string): Promise<boolean> => {
    const colls = await localDb.fetchCollections();
    setLocal('collections', colls.filter(c => c.id !== id));
    
    // Also clean up map
    const map = await localDb.fetchCollectionItemMap();
    for (const itemId in map) {
      map[itemId] = map[itemId].filter(cId => cId !== id);
    }
    setLocal('itemMap', map);
    return true;
  },
  
  fetchCollectionItemMap: async (): Promise<Record<string, string[]>> => {
    return getLocal<Record<string, string[]>>('itemMap', {});
  },
  
  addItemToCollection: async (itemId: string, collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    if (!map[itemId]) map[itemId] = [];
    if (!map[itemId].includes(collectionId)) {
      map[itemId].push(collectionId);
      setLocal('itemMap', map);
    }
    return true;
  },
  
  addItemsToCollection: async (itemIds: string[], collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    itemIds.forEach(id => {
      if (!map[id]) map[id] = [];
      if (!map[id].includes(collectionId)) map[id].push(collectionId);
    });
    setLocal('itemMap', map);
    return true;
  },
  
  removeItemFromCollection: async (itemId: string, collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    if (map[itemId]) {
      map[itemId] = map[itemId].filter(id => id !== collectionId);
      setLocal('itemMap', map);
    }
    return true;
  },
  
  seedDefaultCollections: async (): Promise<void> => {
    // Basic defaults
    const colls = await localDb.fetchCollections();
    if (colls.length === 0) {
      setLocal('collections', [
        { id: 'c1', name: 'Read Later', emoji: '📚', color: '#3B82F6', isSmart: false, rules: {}, itemCount: 0 },
        { id: 'c2', name: 'Inspiration', emoji: '✨', color: '#8B5CF6', isSmart: false, rules: {}, itemCount: 0 }
      ]);
    }
  },
  
  autoAssignItemToCollections: async (): Promise<boolean> => {
    return true; // No-op for guests
  }
};
