'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Sparkles, ChevronDown, Menu, Plus } from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';
import MemoryCard from '@/components/MemoryCard';
import SearchOverlay from '@/components/SearchOverlay';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import CreateCollectionModal from '@/components/CreateCollectionModal';
import type { MemoryItem } from '@/lib/data';

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
  removeItemFromCollectionAction,
  fetchCollectionItemMapAction,
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

  // Load items and collections from Database
  const loadData = useCallback(async () => {
    if (!userId) return;
    const activeUserId = userId;

    const [fetchedItems, fetchedCollections, itemMap] = await Promise.all([
      fetchItemsAction(activeUserId),
      fetchCollectionsAction(activeUserId),
      fetchCollectionItemMapAction(activeUserId),
    ]);

    setItems(fetchedItems);
    setCollections(fetchedCollections);
    setItemCollectionMap(itemMap);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setCaptureOpen(true);
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
      await toggleFavoriteAction(userId, id, next);
    },
    [items, userId]
  );

  const handleCreateCollection = async (data: any) => {
    if (!userId) return;
    const saved = await createCollectionAction(userId, data);
    if (saved) {
      loadData();
    }
  };

  const handleAddToCollection = useCallback(
    async (itemId: string, collectionId: string) => {
      if (!userId) return;
      const coll = collections.find(c => c.id === collectionId);
      
      // Update local itemCollectionMap immediately
      setItemCollectionMap(prev => ({
        ...prev,
        [itemId]: Array.from(new Set([...(prev[itemId] || []), collectionId])),
      }));

      // If smart collection, also tag the item
      if (coll && coll.isSmart) {
        const item = items.find(i => i.id === itemId);
        if (item && !item.tags.includes(coll.name)) {
          const nextTags = [...item.tags, coll.name];
          setItems(prev => prev.map(i => (i.id === itemId ? { ...i, tags: nextTags } : i)));
          await updateItemAction(userId, itemId, { tags: nextTags });
        }
      }

      const success = await addItemToCollectionAction(itemId, collectionId, userId);
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

      // If smart collection, also remove the tag
      if (coll && coll.isSmart) {
        const item = items.find(i => i.id === itemId);
        if (item && item.tags.includes(coll.name)) {
          const nextTags = item.tags.filter(t => t !== coll.name);
          setItems(prev => prev.map(i => (i.id === itemId ? { ...i, tags: nextTags } : i)));
          await updateItemAction(userId, itemId, { tags: nextTags });
        }
      }

      const success = await removeItemFromCollectionAction(itemId, collectionId, userId);
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
      await deleteItemAction(activeUserId, id);
    },
    [userId, selectedItem]
  );

  const handleUpdate = useCallback(
    async (id: string, data: any) => {
      if (!userId) return;
      const success = await updateItemAction(userId, id, data);
      if (success) {
        setItems(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
        setSelectedItem(prev => (prev?.id === id ? { ...prev, ...data } : prev));
      }
    },
    [userId]
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

      const tempId = `temp-${Date.now()}`;
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

      const saved = await saveItemAction(activeUserId, data);
      if (saved) {
        setItems(prev => prev.map(i => (i.id === tempId ? saved : i)));
      }
    },
    [userId]
  );

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
          color1="#06565B"
          color2="#66A4AC"
          color3="#FFFFFF"
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
                        background: sortBy === opt ? 'rgba(6, 86, 91,0.15)' : 'transparent',
                        color: sortBy === opt ? 'var(--violet-bright)' : 'var(--text-secondary)',
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
            <EmptyState filter={activeFilter} onCapture={() => setCaptureOpen(true)} />
          ) : filteredItems !== null ? (
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
      />
      <CaptureModal
        isOpen={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onSave={handleSave}
        user={activeUser}
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

function EmptyState({ filter, onCapture }: { filter: string; onCapture: () => void }) {
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
    title: 'Nothing here yet',
    sub: 'Save your first piece of content',
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
      minHeight: '60vh',
      width: '100%',
    }}>
      <div className="animate-float" style={{
        width: '96px',
        height: '96px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, rgba(6, 86, 91,0.2) 0%, rgba(0, 58, 68,0.15) 100%)',
        border: '1px solid rgba(102, 164, 172,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        marginBottom: '24px',
        boxShadow: '0 20px 40px rgba(6, 86, 91,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
        backdropFilter: 'blur(20px)',
      }}>
        {msg.emoji}
      </div>
      <h2
        style={{
          fontSize: '26px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.025em',
          fontFamily: 'var(--font-heading)',
        }}
      >
        {msg.title}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '340px', lineHeight: 1.5 }}>
        {msg.sub}
      </p>
      <button onClick={onCapture} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '14px' }}>
        <Sparkles size={16} />
        Save something
      </button>
    </div>
  );
}
