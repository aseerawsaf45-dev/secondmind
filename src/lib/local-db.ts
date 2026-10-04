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

const DEMO_ITEMS: MemoryItem[] = [
  {
    id: 'demo-1',
    type: 'link',
    title: 'Attention Is All You Need — The Transformer Paper',
    content: 'The seminal paper introducing the Transformer architecture, which became the foundation for all modern large language models including GPT, BERT, and T5.',
    url: 'https://arxiv.org/abs/1706.03762',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop',
    sourceDomain: 'arxiv.org',
    summary: 'Introduces the Transformer model using self-attention, removing recurrence entirely. Achieved state-of-the-art on translation tasks while being more parallelizable.',
    tags: ['AI', 'Research', 'ML', 'Transformers'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    relatedIds: ['demo-2', 'demo-3'],
    aiProcessed: true,
  },
  {
    id: 'demo-2',
    type: 'link',
    title: 'Building a Second Brain: A Proven Method to Organize Your Digital Life',
    content: 'Tiago Forte\'s framework for capturing, organizing, distilling, and expressing information from anywhere.',
    url: 'https://www.buildingasecondbrain.com/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop',
    sourceDomain: 'buildingasecondbrain.com',
    summary: 'The CODE framework: Capture → Organize → Distill → Express. Key insight: your mind is for having ideas, not storing them.',
    tags: ['Productivity', 'PKM', 'Knowledge Management'],
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    relatedIds: ['demo-1'],
    aiProcessed: true,
  },
  {
    id: 'demo-3',
    type: 'note',
    title: '📝 Key takeaway: Spaced Repetition meets AI',
    content: 'Idea: combine spaced repetition scheduling with AI-generated questions based on your saved knowledge base. Instead of flashcards, the AI generates contextual questions from your notes and links, surfacing them at the optimal forgetting curve interval.',
    thumbnailUrl: undefined,
    summary: 'Personal note about building an AI-powered spaced repetition system on top of a knowledge base.',
    tags: ['Ideas', 'Productivity', 'AI', 'Learning'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    relatedIds: ['demo-1', 'demo-2'],
    aiProcessed: true,
  },
  {
    id: 'demo-4',
    type: 'video',
    title: 'Andrej Karpathy: Let\'s build GPT from scratch',
    content: 'A 2-hour walkthrough of building a GPT language model from scratch using Python and PyTorch.',
    url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
    thumbnailUrl: 'https://img.youtube.com/vi/kCc8FmEb1nY/maxresdefault.jpg',
    sourceDomain: 'youtube.com',
    summary: 'Karpathy builds a character-level GPT from scratch. Covers bigram models, self-attention, multi-head attention, feedforward layers, and training. Best introduction to Transformers in code.',
    tags: ['AI', 'ML', 'Education', 'Python'],
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    relatedIds: ['demo-1'],
    aiProcessed: true,
  },
  {
    id: 'demo-5',
    type: 'link',
    title: 'The Feynman Technique: Learn Anything in Four Steps',
    content: 'Richard Feynman\'s method of learning any subject by explaining it simply, identifying gaps, reviewing, and simplifying further.',
    url: 'https://fs.blog/feynman-technique/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&auto=format&fit=crop',
    sourceDomain: 'fs.blog',
    summary: '4 steps: (1) Choose a concept, (2) Explain it in plain English, (3) Identify gaps, (4) Simplify and use analogies. If you can\'t explain it simply, you don\'t understand it.',
    tags: ['Learning', 'Mental Models', 'Productivity'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    relatedIds: ['demo-3'],
    aiProcessed: true,
  },
  {
    id: 'demo-6',
    type: 'link',
    title: 'Why RAG is Not Enough: Advanced Techniques for Production AI',
    content: 'An exploration of why naive RAG implementations fail in production and what hybrid retrieval, reranking, and agentic patterns actually look like.',
    url: 'https://www.pinecone.io/learn/series/rag/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop',
    sourceDomain: 'pinecone.io',
    summary: 'Covers hybrid search (BM25 + vector), reranking with cross-encoders, hypothetical document embeddings (HyDE), and multi-step reasoning agents. Production RAG needs all of these.',
    tags: ['AI', 'RAG', 'Engineering', 'LLMs'],
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    relatedIds: ['demo-1', 'demo-4'],
    aiProcessed: true,
  },
  {
    id: 'demo-7',
    type: 'note',
    title: '💡 Product Idea: AI Meeting Memory',
    content: 'What if you could paste a meeting transcript into SecondMind and it automatically extracts: decisions made, action items with owners, open questions, context for follow-ups, and links it to relevant saved research? Meetings generate knowledge that currently gets lost.',
    summary: 'Product idea: meeting transcript → structured memory with decisions, actions, and linked context.',
    tags: ['Ideas', 'Product', 'AI', 'Productivity'],
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 0.2).toISOString(),
    relatedIds: ['demo-3'],
    aiProcessed: true,
  },
  {
    id: 'demo-8',
    type: 'link',
    title: 'Design Principles Behind the iPhone — Jony Ive\'s Philosophy',
    content: 'An analysis of the design philosophy that made the iPhone revolutionary — simplicity, materiality, and the removal of everything that isn\'t essential.',
    url: 'https://www.apple.com/designed-by-apple/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop',
    sourceDomain: 'apple.com',
    summary: 'Key principle: deeply understand the problem before touching form. True simplicity is not the absence of complexity but the mastery of it. Every unnecessary detail is a failure of design.',
    tags: ['Design', 'Product', 'Philosophy'],
    isFavorite: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    relatedIds: [],
    aiProcessed: true,
  },
];

const DEMO_COLLECTIONS: Collection[] = [
  { id: 'demo-coll-1', name: 'AI & ML', emoji: '🤖', color: '#10B981', isSmart: false, rules: {}, itemCount: 4 },
  { id: 'demo-coll-2', name: 'Productivity', emoji: '⚡', color: '#F59E0B', isSmart: false, rules: {}, itemCount: 3 },
  { id: 'demo-coll-3', name: 'Ideas', emoji: '💡', color: '#A78BFA', isSmart: false, rules: {}, itemCount: 2 },
];

const DEMO_ITEM_MAP: Record<string, string[]> = {
  'demo-1': ['demo-coll-1'],
  'demo-4': ['demo-coll-1'],
  'demo-6': ['demo-coll-1'],
  'demo-2': ['demo-coll-2'],
  'demo-3': ['demo-coll-2', 'demo-coll-3'],
  'demo-5': ['demo-coll-2'],
  'demo-7': ['demo-coll-3'],
};

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
      sourceDomain: data.url ? (() => { try { return new URL(data.url).hostname.replace('www.', ''); } catch { return undefined; } })() : undefined,
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
    const colls = await localDb.fetchCollections();
    if (colls.length === 0) {
      setLocal('collections', [
        { id: 'c1', name: 'Read Later', emoji: '📚', color: '#3B82F6', isSmart: false, rules: {}, itemCount: 0 },
        { id: 'c2', name: 'Inspiration', emoji: '✨', color: '#8B5CF6', isSmart: false, rules: {}, itemCount: 0 },
      ]);
    }
  },

  /** Seeds 8 rich demo items + 3 demo collections. Idempotent — skips if already seeded. */
  seedDemoContent: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    const seeded = localStorage.getItem(PREFIX + 'demo_seeded');
    if (seeded) return; // already done
    setLocal('items', DEMO_ITEMS);
    setLocal('collections', DEMO_COLLECTIONS);
    setLocal('itemMap', DEMO_ITEM_MAP);
    localStorage.setItem(PREFIX + 'demo_seeded', '1');
  },
  
  autoAssignItemToCollections: async (): Promise<boolean> => {
    return true; // No-op for guests
  },

  /** Checks if there are guest items stored in localStorage waiting to be migrated */
  hasUnmigratedGuestData: (): boolean => {
    if (typeof window === 'undefined') return false;
    const items = getLocal<MemoryItem[]>('items', []);
    return items.length > 0;
  },

  /** Retrieves guest data for account migration */
  getGuestDataForMigration: async () => {
    const items = await localDb.fetchItems();
    const collections = await localDb.fetchCollections();
    const itemMap = await localDb.fetchCollectionItemMap();
    return { items, collections, itemMap };
  },

  /** Clears guest items from localStorage after successful migration */
  clearGuestData: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PREFIX + 'items');
    localStorage.removeItem(PREFIX + 'collections');
    localStorage.removeItem(PREFIX + 'itemMap');
    localStorage.removeItem(PREFIX + 'demo_seeded');
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
