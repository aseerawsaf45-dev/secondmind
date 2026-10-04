'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Sparkles, ChevronDown, Menu, Plus, Download, LayoutGrid, List, Copy, Check, ExternalLink, Star, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useClerk, useUser } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';
import MemoryCard from '@/components/MemoryCard';
import SearchOverlay from '@/components/SearchOverlay';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import CreateCollectionModal from '@/components/CreateCollectionModal';
import type { MemoryItem } from '@/lib/data';
import { localDb } from '@/lib/local-db';

import {
  fetchItemsAction,
  saveItemAction,
  toggleFavoriteAction,
  deleteItemAction,
  updateItemAction,
  deleteUserAccountAndDataAction,
} from '@/lib/db-items';
import {
  fetchCollectionsAction,
  createCollectionAction,
  addItemToCollectionAction,
  addItemsToCollectionAction,
  removeItemFromCollectionAction,
  fetchCollectionItemMapAction,
  deleteCollectionAction,
  seedDefaultCollectionsAction,
  autoAssignItemToCollectionsAction,
  Collection,
} from '@/lib/db-collections';

import Scanner from '@/components/Scanner';
import MagicBento from '@/components/MagicBento';

type SortOption = 'newest' | 'oldest' | 'favorites';

export default function Dashboard({ user: serverUser }: { user: any }) {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();

  const activeUser = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || serverUser?.email,
        fullName: clerkUser.fullName || serverUser?.fullName || 'User',
      }
    : serverUser;

  const userId = activeUser?.id;

  const [items, setItems] = useState<MemoryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [itemCollectionMap, setItemCollectionMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);
  const [initialCaptureUrl, setInitialCaptureUrl] = useState('');
  const [initialCaptureNote, setInitialCaptureNote] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [migrationPrompt, setMigrationPrompt] = useState<{ count: number } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('secondmind_view_mode');
      if (saved === 'list' || saved === 'grid') setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('secondmind_view_mode', mode);
    } catch (_) {}
  };

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  // Initialize onboarding dismissed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('secondmind_onboarding_dismissed');
      if (dismissed === '1') setOnboardingDismissed(true);
    }
  }, []);

  // Load items and collections from Database
  const loadData = useCallback(async () => {
    if (!userId) return;
    const activeUserId = userId;

    // Seed default category collections (idempotent — skips already-existing ones)
    userId === 'guest' ? localDb.seedDefaultCollections() : seedDefaultCollectionsAction(activeUserId).catch(() => {});

    const [fetchedItems, fetchedCollections, itemMap] = await Promise.all([
      userId === 'guest' ? localDb.fetchItems() : fetchItemsAction(activeUserId),
      userId === 'guest' ? localDb.fetchCollections() : fetchCollectionsAction(activeUserId),
      userId === 'guest' ? localDb.fetchCollectionItemMap() : fetchCollectionItemMapAction(activeUserId),
    ]);

    setItems(fetchedItems);
    setCollections(fetchedCollections);
    setItemCollectionMap(itemMap);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Seed demo content for guests arriving from /try (checks cookie flag)
  useEffect(() => {
    if (userId !== 'guest') return;
    const hasSeedCookie = document.cookie.includes('guest_seed_demo=true');
    if (hasSeedCookie) {
      document.cookie = 'guest_seed_demo=; path=/; max-age=0';
      localDb.seedDemoContent().then(() => {
        loadData();
        showToast('✨ Loaded sample knowledge base for instant exploration', 'success');
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, loadData, showToast]);

  // Migrate guest data to authenticated account
  const performMigration = useCallback(async (guestItems: MemoryItem[]) => {
    if (!userId || userId === 'guest') return;
    setIsMigrating(true);
    try {
      let migratedCount = 0;
      for (const item of guestItems) {
        await saveItemAction(userId, {
          type: item.type,
          title: item.title,
          content: item.content,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          summary: item.summary,
          tags: item.tags,
        });
        migratedCount++;
      }
      localDb.clearGuestData();
      setMigrationPrompt(null);
      await loadData();
      showToast(`🎉 Migrated ${migratedCount} memories from guest session to your account!`, 'success');
    } catch (err) {
      console.error('Migration failed:', err);
      showToast('Failed to migrate some items. Please try again.', 'error');
    } finally {
      setIsMigrating(false);
    }
  }, [userId, loadData, showToast]);

  // Check for unmigrated guest data on authenticated login
  useEffect(() => {
    if (!userId || userId === 'guest') return;
    if (typeof window === 'undefined') return;

    if (localDb.hasUnmigratedGuestData()) {
      const hasMigrateParam = window.location.search.includes('migrate=1');
      localDb.getGuestDataForMigration().then(({ items: guestItems }) => {
        if (!guestItems || guestItems.length === 0) return;
        if (hasMigrateParam) {
          performMigration(guestItems);
        } else {
          setMigrationPrompt({ count: guestItems.length });
        }
      });
    }
  }, [userId, performMigration]);

  // Global paste handler: paste a URL or text anywhere to capture instantly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInput) return;

      const text = e.clipboardData?.getData('text');
      if (!text || !text.trim()) return;

      const trimmed = text.trim();
      e.preventDefault();

      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || (trimmed.includes('.') && !trimmed.includes(' ') && trimmed.length < 200)) {
        setInitialCaptureUrl(trimmed);
        setInitialCaptureNote('');
        setCaptureOpen(true);
        showToast('📋 Detected URL from clipboard — analyzing...', 'info');
      } else {
        setInitialCaptureNote(trimmed);
        setInitialCaptureUrl('');
        setCaptureOpen(true);
        showToast('📋 Captured note from clipboard', 'info');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [showToast]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setInitialCaptureUrl('');
        setInitialCaptureNote('');
        setCaptureOpen(true);
        return;
      }
      if (!isInput && e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
        return;
      }
      if (!isInput && e.key === '1') {
        setActiveFilter('all');
      } else if (!isInput && e.key === '2') {
        setActiveFilter('favorites');
      } else if (!isInput && e.key === '3') {
        setActiveFilter('ai-insights');
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  const handleEditItem = (item: MemoryItem) => {
    setIsEditMode(true);
    setSelectedItem(item);
  };

  const handleFavorite = useCallback(
    async (id: string) => {
      if (!userId) return;
      const item = items.find(i => i.id === id);
      if (!item) return;
      const next = !item.isFavorite;
      setItems(prev => prev.map(i => (i.id === id ? { ...i, isFavorite: next } : i)));
      showToast(next ? '⭐ Starred item' : 'Removed from favorites', 'info');
      await (userId === 'guest' ? localDb.toggleFavorite(id, next) : toggleFavoriteAction(userId, id, next));
    },
    [items, userId, showToast]
  );

  const handleCreateCollection = async (data: any) => {
    if (!userId) return;
    const { itemIds, ...collectionData } = data;
    const saved = await (userId === 'guest' ? localDb.createCollection(collectionData) : createCollectionAction(userId, collectionData));
    if (saved) {
      if (Array.isArray(itemIds) && itemIds.length > 0) {
        await (userId === 'guest' ? localDb.addItemsToCollection(itemIds, saved.id) : addItemsToCollectionAction(itemIds, saved.id, userId));
        // Auto-tag each selected item with the collection name
        const collectionTag = saved.name.trim();
        await Promise.all(
          itemIds.map(async (itemId: string) => {
            const item = items.find(i => i.id === itemId);
            if (item && collectionTag && !item.tags.includes(collectionTag)) {
              await (userId === 'guest' ? localDb.updateItem(itemId, { tags: [...item.tags, collectionTag] }) : updateItemAction(userId, itemId, { tags: [...item.tags, collectionTag] }));
            }
          })
        );
      }
      await loadData();
    }
  };

  const handleDeleteCollection = useCallback(
    async (collectionId: string) => {
      if (!userId) return;
      if (!confirm('Delete this collection? Saved links will not be deleted.')) return;
      const success = await (userId === 'guest' ? localDb.deleteCollection(collectionId) : deleteCollectionAction(collectionId, userId));
      if (success) {
        setCollections(prev => prev.filter(c => c.id !== collectionId));
        if (activeFilter === `collection:${collectionId}`) {
          setActiveFilter('all');
        }
        await loadData();
      }
    },
    [userId, activeFilter, loadData]
  );

  const handleAddToCollection = useCallback(
    async (itemId: string, collectionId: string) => {
      if (!userId) return;
      const coll = collections.find(c => c.id === collectionId);

      // Update local itemCollectionMap immediately
      setItemCollectionMap(prev => ({
        ...prev,
        [itemId]: Array.from(new Set([...(prev[itemId] || []), collectionId])),
      }));

      // Always auto-tag the item with the collection name
      if (coll) {
        const item = items.find(i => i.id === itemId);
        const collectionTag = coll.name.trim();
        if (item && collectionTag && !item.tags.includes(collectionTag)) {
          const nextTags = [...item.tags, collectionTag];
          setItems(prev => prev.map(i => (i.id === itemId ? { ...i, tags: nextTags } : i)));
          await (userId === 'guest' ? localDb.updateItem(itemId, { tags: nextTags }) : updateItemAction(userId, itemId, { tags: nextTags }));
        }
      }

      const success = await (userId === 'guest' ? localDb.addItemToCollection(itemId, collectionId) : addItemToCollectionAction(itemId, collectionId, userId));
      if (success) {
        loadData();
      }
    },
    [collections, items, loadData, userId]
  );

  const handleRemoveFromCollection = useCallback(
    async (itemId: string, collectionId: string) => {
      if (!userId) return;
      const coll = collections.find(c => c.id === collectionId);

      // Remove from local itemCollectionMap
      setItemCollectionMap(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || []).filter(id => id !== collectionId),
      }));

      // Always remove the collection name tag from the item
      if (coll) {
        const item = items.find(i => i.id === itemId);
        const collectionTag = coll.name.trim();
        if (item && collectionTag && item.tags.includes(collectionTag)) {
          const nextTags = item.tags.filter(t => t !== collectionTag);
          setItems(prev => prev.map(i => (i.id === itemId ? { ...i, tags: nextTags } : i)));
          await (userId === 'guest' ? localDb.updateItem(itemId, { tags: nextTags }) : updateItemAction(userId, itemId, { tags: nextTags }));
        }
      }

      const success = await (userId === 'guest' ? localDb.removeItemFromCollection(itemId, collectionId) : removeItemFromCollectionAction(itemId, collectionId, userId));
      if (success) {
        loadData();
      }
    },
    [collections, items, loadData, userId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!userId) return;
      const activeUserId = userId;
      if (!confirm('Are you sure you want to delete this memory?')) return;
      setItems(prev => prev.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      await (userId === 'guest' ? localDb.deleteItem(id) : deleteItemAction(activeUserId, id));
      showToast('🗑️ Memory deleted', 'info');
    },
    [userId, selectedItem, showToast]
  );

  const handleUpdate = useCallback(
    async (id: string, data: any) => {
      if (!userId) return;
      const success = await (userId === 'guest' ? localDb.updateItem(id, data) : updateItemAction(userId, id, data));
      if (success) {
        setItems(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
        setSelectedItem(prev => (prev?.id === id ? { ...prev, ...data } : prev));
        showToast('✓ Memory updated', 'success');
      }
    },
    [userId, showToast]
  );

  const handleSave = useCallback(
    async (data: {
      type: string;
      title: string;
      content: string;
      url?: string;
      thumbnailUrl?: string;
      summary?: string;
      tags?: string[];
    }) => {
      if (!userId) return;
      const activeUserId = userId;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const placeholder: MemoryItem = {
        id: tempId,
        type: data.type as MemoryItem['type'],
        title: data.title,
        content: data.content,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        sourceDomain: data.url
          ? (() => {
              try {
                return new URL(data.url!).hostname.replace('www.', '');
              } catch {
                return undefined;
              }
            })()
          : undefined,
        summary: data.summary || 'Saving...',
        tags: data.tags || [],
        isFavorite: false,
        createdAt: new Date().toISOString(),
        relatedIds: [],
        aiProcessed: !!data.summary || !!data.tags?.length,
      };
      setItems(prev => [placeholder, ...prev]);

      const saved = await (userId === 'guest' ? localDb.saveItem(data) : saveItemAction(activeUserId, data));
      if (saved) {
        setItems(prev => prev.map(i => (i.id === tempId ? saved : i)));
        showToast('✨ Memory saved & processed with AI!', 'success');

        // Auto-assign to matching category collections based on AI tags
        if (saved.tags?.length) {
          userId === 'guest' ? localDb.autoAssignItemToCollections() : autoAssignItemToCollectionsAction(activeUserId, saved.id, saved.tags)
            .then(() => loadData())
            .catch(() => {});
        }

        if (activeFilter.startsWith('collection:')) {
          const collId = activeFilter.slice(11);
          handleAddToCollection(saved.id, collId);
        }
      }
    },
    [userId, activeFilter, handleAddToCollection, showToast]
  );

  const handleSeedDemoMemory = useCallback(async () => {
    const demoData = {
      type: 'link' as const,
      title: 'The AI Memory & Knowledge Synthesis Revolution (Demo)',
      content: 'An exploration of how personal AI memory assistants store, index, and synthesize research notes into answerable, cited insights across multi-modal inputs.',
      url: 'https://secondmind.ai/demo-research',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
      summary: 'Personal AI memory systems shift storage from static bookmarking to connected retrieval, turning saved links and notes into a synthesized knowledge graph.',
      tags: ['AI', 'Research', 'Productivity'],
    };
    await handleSave(demoData);
  }, [handleSave]);

  // Filter logic
  const filteredItems = (() => {
    let filtered = [...items];

    if (activeFilter === 'favorites') {
      filtered = filtered.filter(i => i.isFavorite);
    } else if (activeFilter === 'recent') {
      filtered = filtered.slice(0, 5);
    } else if (activeFilter === 'ai-insights') {
      return null;
    } else if (['link', 'note', 'image', 'pdf', 'tweet', 'video'].includes(activeFilter)) {
      filtered = filtered.filter(i => {
        if (activeFilter === 'tweet') {
          const url = (i.url || '').toLowerCase();
          return i.type === 'tweet' || url.includes('x.com') || url.includes('twitter.com');
        }
        return i.type === activeFilter;
      });
    } else if (activeFilter.startsWith('tag:')) {
      const tag = activeFilter.slice(4);
      filtered = filtered.filter(i => i.tags.includes(tag));
    } else if (activeFilter.startsWith('collection:')) {
      const collId = activeFilter.slice(11);
      const coll = collections.find(c => c.id === collId);
      if (coll && coll.isSmart) {
        filtered = filtered.filter(i => i.tags.includes(coll.name));
      } else {
        filtered = filtered.filter(i => itemCollectionMap[i.id]?.includes(collId));
      }
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'favorites') {
      filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }

    return filtered;
  })();

  const itemCounts = {
    all: items.length,
    favorites: items.filter(i => i.isFavorite).length,
    link: items.filter(i => i.type === 'link').length,
    note: items.filter(i => i.type === 'note').length,
    pdf: items.filter(i => i.type === 'pdf').length,
    tweet: items.filter(i => {
      const url = (i.url || '').toLowerCase();
      return i.type === 'tweet' || url.includes('x.com') || url.includes('twitter.com');
    }).length,
    video: items.filter(i => i.type === 'video').length,
  };

  const getTitle = () => {
    if (activeFilter === 'all') return 'All Memory';
    if (activeFilter === 'favorites') return 'Favorites';
    if (activeFilter === 'recent') return 'Recently Added';
    if (activeFilter === 'ai-insights') return 'AI Insights';
    if (activeFilter.startsWith('tag:')) return `#${activeFilter.slice(4)}`;
    if (activeFilter.startsWith('collection:')) {
      const coll = collections.find(c => c.id === activeFilter.slice(11));
      return coll ? `${coll.emoji} ${coll.name}` : 'Collection';
    }
    return activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) + 's';
  };

  return (
    <div className="noise-bg" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      {/* WebGL Ambient Scanner Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.35 }}>
        <Scanner
          color1="#312E81"
          color2="#6366F1"
          color3="#06B6D4"
          speed={0.3}
          sweepSpeed={0.2}
          sweepWidth={1.6}
          sweepFalloff={6}
          scale={1.5}
          frequency={2}
          ripple={0.22}
          bandDensity={11}
          lineSharpness={5.5}
          glow={0.22}
          scanDirection="vertical"
          colorSpread={0.7}
          brightness={1}
          contrast={1.15}
          softness={1.4}
          vignette={0.45}
          scanline
          grain
          grainIntensity={0.05}
          opacity={1}
          mouseInteraction
          mouseRadius={0.5}
          mouseStrength={0.5}
        />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="sidebar-mobile-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={f => {
          setActiveFilter(f);
          setSidebarOpen(false);
        }}
        onSearchOpen={() => {
          setSearchOpen(true);
          setSidebarOpen(false);
        }}
        onCaptureOpen={() => {
          setCaptureOpen(true);
          setSidebarOpen(false);
        }}
        onCreateCollectionOpen={() => {
          setCreateCollectionOpen(true);
          setSidebarOpen(false);
        }}
        onSettingsOpen={() => {
          setSettingsOpen(true);
          setSidebarOpen(false);
        }}
        onDeleteCollection={handleDeleteCollection}
        itemCounts={itemCounts}
        collections={collections}
        user={activeUser}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-ghost btn-icon mobile-menu-btn"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {getTitle()}
            </h1>
            {filteredItems !== null && (
              <span
                style={{
                  padding: '2px 10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                {filteredItems.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCaptureOpen(true)}
              className="btn btn-primary mobile-capture-btn"
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <Plus size={14} />
              <span className="hide-xs">Save</span>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="btn btn-ghost hide-xs"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <Search size={13} />
              Search
              <kbd
                style={{
                  padding: '1px 6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Grid vs List View Mode Toggle */}
            <div
              className="hide-xs"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '9px',
                padding: '2px',
                gap: '2px',
              }}
            >
              <button
                onClick={() => handleViewModeChange('grid')}
                style={{
                  padding: '5px 8px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'grid' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: viewMode === 'grid' ? '#A5B4FC' : 'rgba(255, 255, 255, 0.45)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 140ms ease',
                }}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                style={{
                  padding: '5px 8px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'list' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: viewMode === 'list' ? '#A5B4FC' : 'rgba(255, 255, 255, 0.45)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 140ms ease',
                }}
                title="High-density list view"
              >
                <List size={14} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="btn btn-ghost"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <SlidersHorizontal size={13} />
                <span className="hide-xs">
                  {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Favorites'}
                </span>
                <ChevronDown size={11} />
              </button>
              {showSortMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '10px',
                    padding: '6px',
                    zIndex: 50,
                    minWidth: '140px',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  {(['newest', 'oldest', 'favorites'] as SortOption[]).map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setShowSortMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '7px',
                        border: 'none',
                        background: sortBy === opt ? 'rgba(99, 102, 241, 0.22)' : 'transparent',
                        color: sortBy === opt ? '#A5B4FC' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        fontWeight: sortBy === opt ? 600 : 400,
                      }}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)} first
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Authenticated Migration Banner (for users who have local guest data) */}
        {migrationPrompt && userId !== 'guest' && (
          <div
            style={{
              margin: '12px 24px 0',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.28) 0%, rgba(6, 182, 212, 0.18) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '13px',
              color: '#FFFFFF',
              flexWrap: 'wrap',
              boxShadow: '0 4px 20px rgba(6,86,91,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <Sparkles size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              <div>
                <strong>Welcome!</strong> We found <strong>{migrationPrompt.count}</strong> memories from your guest preview.
                <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '6px' }} className="hide-xs">
                  Save them to sync permanently to your cloud account.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <button
                disabled={isMigrating}
                onClick={() => localDb.getGuestDataForMigration().then(({ items: gItems }) => performMigration(gItems))}
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px', background: '#10B981', border: 'none', fontWeight: 700 }}
              >
                {isMigrating ? 'Saving...' : 'Save to my account'}
              </button>
              <button
                onClick={() => {
                  localDb.clearGuestData();
                  setMigrationPrompt(null);
                  showToast('Guest preview data dismissed', 'info');
                }}
                className="btn btn-ghost"
                style={{ padding: '6px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Guest Conversion Banner */}
        {userId === 'guest' && !guestBannerDismissed && (
          <div
            style={{
              margin: '12px 24px 0',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '12px',
              color: '#FFFFFF',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>⚡</span>
              <div style={{ minWidth: 0 }}>
                <strong>Guest Mode</strong> — Your data is stored only in this browser.
                <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: '6px' }} className="hide-xs">
                  Sign up to back up and sync across devices.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
              <button
                onClick={() => localDb.exportData()}
                className="btn btn-ghost"
                title="Export your guest data as JSON"
                style={{ padding: '5px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Download size={11} />
                Export
              </button>
              <a
                href={`/signup?migrate=1`}
                className="btn btn-primary"
                style={{ padding: '5px 12px', fontSize: '11px', background: '#F59E0B', color: '#000', border: 'none', fontWeight: 700 }}
              >
                Save to account
              </a>
              <a
                href="/login"
                className="btn btn-ghost"
                style={{ padding: '5px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}
              >
                Sign in
              </a>
              <button
                onClick={() => setGuestBannerDismissed(true)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '4px' }}
                aria-label="Dismiss banner"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Quick-Start Pro Tips Strip */}
        {!onboardingDismissed && items.length > 0 && items.length <= 12 && (
          <div
            style={{
              margin: '10px 24px 0',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ color: '#66A4AC', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px' }}>
                ⚡ POWER TIPS:
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Press <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', fontSize: '10px' }}>⌘K</kbd> to ask anything
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Press <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', fontSize: '10px' }}>⌘V</kbd> to paste-save anywhere
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Press <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', fontSize: '10px' }}>?</kbd> for shortcuts
              </span>
            </div>
            <button
              onClick={() => {
                setOnboardingDismissed(true);
                if (typeof window !== 'undefined') localStorage.setItem('secondmind_onboarding_dismissed', '1');
              }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px' }}
              title="Dismiss tip"
            >
              ✕
            </button>
          </div>
        )}

        {/* Horizontal Quick-Filter Strip */}
        <div className="horizontal-filter-strip">
          {[
            { id: 'all', label: 'All', icon: '🧠' },
            { id: 'favorites', label: 'Favorites', icon: '⭐' },
            { id: 'ai-insights', label: 'AI Insights', icon: '✨' },
            { id: 'link', label: 'Links', icon: '🔗' },
            { id: 'video', label: 'Videos', icon: '🎬' },
            { id: 'tweet', label: 'X / Tweets', icon: '𝕏' },
            { id: 'note', label: 'Notes', icon: '📝' },
            { id: 'pdf', label: 'PDFs', icon: '📄' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`horizontal-filter-pill ${activeFilter === f.id ? 'active' : ''}`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div
          style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
          onClick={() => setShowSortMenu(false)}
          className="dashboard-body"
        >
          {loading ? (
            <LoadingState />
          ) : activeFilter === 'ai-insights' ? (
            <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto' }}>
              <AIInsightsPanel items={items} collections={collections} onSelectItem={item => setSelectedItem(item)} />
            </div>
          ) : filteredItems !== null && filteredItems.length === 0 ? (
            <EmptyState filter={activeFilter} onCapture={() => setCaptureOpen(true)} onSeedDemo={handleSeedDemoMemory} />
          ) : filteredItems !== null ? (
            viewMode === 'grid' ? (
              <div className="masonry-grid">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="animate-fade-in-up masonry-item"
                    style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both', opacity: 0 }}
                  >
                    <MemoryCard
                      item={item}
                      collections={collections}
                      itemCollections={itemCollectionMap[item.id] || []}
                      onClick={() => {
                        setSelectedItem(item);
                        setIsEditMode(false);
                      }}
                      onFavorite={() => handleFavorite(item.id)}
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => handleDelete(item.id)}
                      onAddToCollection={collId => handleAddToCollection(item.id, collId)}
                      onRemoveFromCollection={collId => handleRemoveFromCollection(item.id, collId)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(13, 14, 25, 0.65)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* High-density table header */}
                <div
                  className="hide-xs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 18px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontFamily: 'var(--font-mono), monospace',
                    textTransform: 'uppercase',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '220px', flexShrink: 0 }}>SOURCE & DOMAIN</div>
                  <div style={{ flex: 1, minWidth: 0 }}>TITLE & SUMMARY</div>
                  <div style={{ width: '180px', flexShrink: 0 }}>TAGS</div>
                  <div style={{ width: '90px', flexShrink: 0, textAlign: 'right' }}>SAVED</div>
                  <div style={{ width: '116px', flexShrink: 0, textAlign: 'center' }}>ACTIONS</div>
                </div>

                {filteredItems.map(item => (
                  <ListViewRow
                    key={item.id}
                    item={item}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsEditMode(false);
                    }}
                    onFavorite={() => handleFavorite(item.id)}
                    onEdit={() => handleEditItem(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            )
          ) : null}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="mobile-bottom-bar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`mobile-nav-item ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '16px' }}>🧠</span>
            <span>Memory</span>
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="mobile-nav-item"
          >
            <Search size={18} />
            <span>Search</span>
          </button>

          <button
            onClick={() => setCaptureOpen(true)}
            className="mobile-nav-fab"
            aria-label="Add memory"
          >
            <Plus size={22} />
          </button>

          <button
            onClick={() => setActiveFilter('favorites')}
            className={`mobile-nav-item ${activeFilter === 'favorites' ? 'active' : ''}`}
          >
            <span style={{ fontSize: '16px' }}>⭐</span>
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setActiveFilter('ai-insights')}
            className={`mobile-nav-item ${activeFilter === 'ai-insights' ? 'active' : ''}`}
          >
            <Sparkles size={18} />
            <span>Insights</span>
          </button>
        </div>
      </main>

      {/* Overlays */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectItem={item => {
          setSelectedItem(item);
          setSearchOpen(false);
        }}
        items={items}
      />
      <CreateCollectionModal
        isOpen={createCollectionOpen}
        onClose={() => setCreateCollectionOpen(false)}
        onSave={handleCreateCollection}
        items={items}
      />
      <CaptureModal
        isOpen={captureOpen}
        onClose={() => {
          setCaptureOpen(false);
          setInitialCaptureUrl('');
          setInitialCaptureNote('');
        }}
        onSave={handleSave}
        user={activeUser}
        existingItems={items}
        onAskAboutItem={() => setSearchOpen(true)}
        initialUrl={initialCaptureUrl}
        initialNote={initialCaptureNote}
      />
      <ItemDetailModal
        item={selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setIsEditMode(false);
        }}
        onSelectItem={item => setSelectedItem(item)}
        onFavorite={handleFavorite}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        initialEditMode={isEditMode}
        allItems={items}
      />

      {/* Settings Modal */}
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setSettingsOpen(false)}
          />
          <div
            className="glass animate-fade-in-up"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              borderRadius: '16px',
              position: 'relative',
              zIndex: 1,
              border: '1px solid var(--border)',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Settings
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Manage your account and preferences.
            </p>
            <div
              style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}
              >
                Account Email
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                {activeUser?.email || 'N/A'}
              </div>
            </div>
            <div
              style={{
                padding: '16px',
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '12px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                Privacy & Data Deletion
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
                Permanently delete all your memories, collections, and your dedicated database branch.
              </p>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)',
                    color: '#f87171',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  Delete All My Data
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 500 }}>
                    Are you sure? This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={isDeletingData}
                      onClick={async () => {
                        if (!userId) return;
                        setIsDeletingData(true);
                        try {
                          await deleteUserAccountAndDataAction(userId);
                          await signOut({ redirectUrl: '/login' });
                        } catch (e) {
                          console.error('Failed to delete data:', e);
                          setIsDeletingData(false);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: isDeletingData ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isDeletingData ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingData}
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setConfirmDelete(false);
                }}
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              <button
                onClick={() => signOut({ redirectUrl: '/login' })}
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239,68,68,0.1)',
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {shortcutsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => setShortcutsOpen(false)}
          />
          <div
            className="glass animate-fade-in-up"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              borderRadius: '16px',
              position: 'relative',
              zIndex: 1,
              border: '1px solid var(--border-strong)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⌨️</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Search & Ask AI', keys: ['⌘', 'K'] },
                { label: 'New Memory', keys: ['⌘', 'N'] },
                { label: 'Paste-to-Capture anywhere', keys: ['⌘', 'V'] },
                { label: 'View All Memories', keys: ['1'] },
                { label: 'View Favorites', keys: ['2'] },
                { label: 'View AI Insights', keys: ['3'] },
                { label: 'Show this cheat sheet', keys: ['?'] },
                { label: 'Close open overlay', keys: ['ESC'] },
              ].map(s => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {s.keys.map(k => (
                      <kbd
                        key={k}
                        style={{
                          padding: '2px 8px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className="animate-fade-in-up"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(11, 11, 20, 0.95)',
            border: toast.type === 'error'
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : toast.type === 'success'
              ? '1px solid rgba(16, 185, 129, 0.4)'
              : '1px solid rgba(102, 164, 172, 0.4)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function ListViewRow({
  item,
  onClick,
  onFavorite,
  onEdit,
  onDelete,
}: {
  item: MemoryItem;
  onClick: () => void;
  onFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const cleanDomain = item.sourceDomain
    ? item.sourceDomain.replace(/^www\./, '')
    : item.url
    ? (() => {
        try {
          return new URL(item.url).hostname.replace(/^www\./, '');
        } catch (_) {
          return null;
        }
      })()
    : null;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
    } catch (_) {
      return 'Recently';
    }
  })();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.url) {
      try {
        await navigator.clipboard.writeText(item.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {}
    }
  };

  return (
    <div
      onClick={onClick}
      className="list-view-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
        gap: '16px',
        transition: 'background 140ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Favicon & Domain */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '220px', flexShrink: 0 }}>
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {cleanDomain ? (
            <img
              src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=32`}
              alt=""
              width={14}
              height={14}
              style={{ borderRadius: '2px' }}
              onError={e => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span style={{ fontSize: '11px' }}>🔗</span>
          )}
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.65)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'var(--font-mono), monospace',
          }}
        >
          {cleanDomain || item.type}
        </span>
      </div>

      {/* Title & Preview */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#FFFFFF',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.title}
          </span>
          {item.isFavorite && <Star size={11} fill="#F59E0B" color="#F59E0B" />}
        </div>
        <span
          style={{
            fontSize: '11.5px',
            color: 'rgba(255, 255, 255, 0.45)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.summary}
        </span>
      </div>

      {/* Tags */}
      <div className="hide-xs" style={{ display: 'flex', gap: '5px', flexShrink: 0, width: '180px', overflow: 'hidden' }}>
        {item.tags.slice(0, 2).map(tag => (
          <span
            key={tag}
            style={{
              padding: '2px 7px',
              borderRadius: '5px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.22)',
              color: '#A5B4FC',
              fontSize: '10px',
              fontFamily: 'var(--font-mono), monospace',
              whiteSpace: 'nowrap',
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Timestamp */}
      <div
        className="hide-xs"
        style={{
          width: '90px',
          flexShrink: 0,
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'var(--font-mono), monospace',
          textAlign: 'right',
        }}
      >
        {timeAgo}
      </div>

      {/* Quick Action Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        {item.url && (
          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy link'}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              border: 'none',
              background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: copied ? '#34D399' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
          </button>
        )}
        <button
          onClick={onFavorite}
          title="Toggle favorite"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            border: 'none',
            background: item.isFavorite ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            color: item.isFavorite ? '#F59E0B' : 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Star size={12} fill={item.isFavorite ? '#F59E0B' : 'none'} />
        </button>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open original"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} />
          </a>
        )}
        <button
          onClick={onDelete}
          title="Delete item"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'rgba(239, 68, 68, 0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="masonry-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="masonry-item">
          <div
            className="shimmer"
            style={{ height: `${140 + (i % 3) * 60}px`, borderRadius: '14px' }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filter, onCapture, onSeedDemo }: { filter: string; onCapture: () => void; onSeedDemo: () => void }) {
  const messages: Record<string, { emoji: string; title: string; sub: string }> = {
    favorites: { emoji: '⭐', title: 'No favorites yet', sub: 'Star items you want to revisit quickly' },
    link: { emoji: '🔗', title: 'No links saved', sub: 'Save URLs to articles, tools, and resources' },
    note: { emoji: '📝', title: 'No notes yet', sub: 'Capture thoughts, ideas, and insights' },
    pdf: { emoji: '📄', title: 'No PDFs saved', sub: 'Upload research papers and documents' },
    tweet: { emoji: '𝕏', title: 'No tweets saved', sub: 'Capture interesting tweets you want to remember' },
    video: { emoji: '🎬', title: 'No videos saved', sub: 'Save YouTube links and video content' },
  };

  const msg = messages[filter] || {
    emoji: '🧠',
    title: 'Your SecondMind is Ready',
    sub: 'Transform scattered notes, links, and documents into an answerable knowledge base.',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 24px',
      margin: 'auto',
      maxWidth: '720px',
      width: '100%',
    }}>
      <div className="animate-float" style={{
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        marginBottom: '20px',
        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
        backdropFilter: 'blur(20px)',
      }}>
        {msg.emoji}
      </div>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.025em',
          fontFamily: 'var(--font-heading)',
        }}
      >
        {msg.title}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '460px', lineHeight: 1.5 }}>
        {msg.sub}
      </p>

      {filter === 'all' && (
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          {[
            { step: '1', title: 'Save One Memory', desc: 'Paste a link, upload a file, or type a quick note.' },
            { step: '2', title: 'Watch AI Organize', desc: 'AI extracts summaries, key takeaways, and tags automatically.' },
            { step: '3', title: 'Ask Anything (⌘K)', desc: 'Search or ask questions against your personal knowledge base.' },
          ].map(s => (
            <div
              key={s.step}
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981', fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {s.step}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{s.title}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onCapture} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '12px' }}>
          <Sparkles size={16} />
          Save Content
        </button>
        {filter === 'all' && (
          <button
            onClick={onSeedDemo}
            className="btn btn-ghost"
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF',
            }}
          >
            ✨ Try a Demo Memory
          </button>
        )}
      </div>
    </div>
  );
}
