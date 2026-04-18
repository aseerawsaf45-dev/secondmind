'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, SlidersHorizontal, Sparkles, ChevronDown, Menu, X, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MemoryCard from '@/components/MemoryCard';
import SearchOverlay from '@/components/SearchOverlay';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import type { MemoryItem } from '@/lib/data';
import { fetchItems, saveItem, toggleFavorite, deleteItem } from '@/lib/supabase-items';
import { fetchCollections, Collection } from '@/lib/supabase-collections';
import { createClient } from '@/utils/supabase/client';
import { signout } from '@/app/login/actions';

type SortOption = 'newest' | 'oldest' | 'favorites';

export default function Dashboard({ user }: { user: any }) {
  const supabase = createClient();
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load items and collections from Supabase on mount
  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      const [fetchedItems, fetchedCollections] = await Promise.all([
        fetchItems(supabase, user.id),
        fetchCollections(supabase, user.id)
      ]);
      setItems(fetchedItems);
      setCollections(fetchedCollections);
      setLoading(false);
    };

    loadData();
  }, [user?.id]);

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

  const handleFavorite = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const next = !item.isFavorite;
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFavorite: next } : i));
    await toggleFavorite(supabase, id, next);
  }, [items]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await deleteItem(supabase, id);
  }, []);

  const handleSave = useCallback(async (data: { type: string; title: string; content: string; url?: string; thumbnailUrl?: string; summary?: string; tags?: string[] }) => {
    if (!user?.id) return;

    // Optimistic placeholder
    const tempId = `temp-${Date.now()}`;
    const placeholder: MemoryItem = {
      id: tempId,
      type: data.type as MemoryItem['type'],
      title: data.title,
      content: data.content,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      sourceDomain: data.url ? (() => { try { return new URL(data.url!).hostname.replace('www.', ''); } catch { return undefined; } })() : undefined,
      summary: data.summary || 'Saving...',
      tags: data.tags || [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: !!data.summary || !!data.tags?.length,
    };
    setItems(prev => [placeholder, ...prev]);

    // Persist to Supabase
    const saved = await saveItem(supabase, user.id, data);
    if (saved) {
      setItems(prev => prev.map(i => i.id === tempId ? saved : i));
    } else {
      // Remove placeholder on error
      setItems(prev => prev.filter(i => i.id !== tempId));
    }
  }, [user?.id, items]);

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
      filtered = filtered.filter(i => i.type === activeFilter);
    } else if (activeFilter.startsWith('tag:')) {
      const tag = activeFilter.slice(4);
      filtered = filtered.filter(i => i.tags.includes(tag));
    } else if (activeFilter.startsWith('collection:')) {
      const collId = activeFilter.slice(11);
      const coll = collections.find(c => c.id === collId);
      if (coll && coll.isSmart) {
        // Smart rule filtering (simplified for now: match by name as a tag)
        filtered = filtered.filter(i => i.tags.includes(coll.name));
      } else {
        // Regular collection logic would need a junction table query
        // For now, if it's not smart, we'll just show all (this needs more backend work)
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
    tweet: items.filter(i => i.type === 'tweet').length,
    video: items.filter(i => i.type === 'video').length,
  };

  const getTitle = () => {
    if (activeFilter === 'all') return 'All Memory';
    if (activeFilter === 'favorites') return 'Favorites';
    if (activeFilter === 'recent') return 'Recently Added';
    if (activeFilter === 'ai-insights') return 'AI Insights';
    if (activeFilter.startsWith('tag:')) return `#${activeFilter.slice(4)}`;
    if (activeFilter.startsWith('collection:')) {
      const coll = collections.find(c => c.id === activeFilter.slice(11)) || 
                   collections.find(c => c.id === activeFilter.slice(11));
      return coll ? `${coll.emoji} ${coll.name}` : 'Collection';
    }
    return activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) + 's';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Ambient background glow */}
      <div style={{ position: 'fixed', top: '-20%', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={(f) => { setActiveFilter(f); setSidebarOpen(false); }}
        onSearchOpen={() => { setSearchOpen(true); setSidebarOpen(false); }}
        onCaptureOpen={() => { setCaptureOpen(true); setSidebarOpen(false); }}
        onSettingsOpen={() => { setSettingsOpen(true); setSidebarOpen(false); }}
        itemCounts={itemCounts}
        collections={collections}
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger – visible on mobile */}
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
              <span style={{ padding: '2px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '12px', color: 'var(--text-muted)' }}>
                {filteredItems.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Quick capture btn (mobile) */}
            <button
              onClick={() => setCaptureOpen(true)}
              className="btn btn-primary mobile-capture-btn"
              style={{ padding: '8px 12px', fontSize: '13px' }}
            >
              <Plus size={14} />
              <span className="hide-xs">Save</span>
            </button>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="btn btn-ghost hide-xs"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <Search size={13} />
              Search
              <kbd style={{ padding: '1px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '10px', fontFamily: 'inherit' }}>⌘K</kbd>
            </button>

            {/* Sort */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="btn btn-ghost"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <SlidersHorizontal size={13} />
                <span className="hide-xs">{sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Favorites'}</span>
                <ChevronDown size={11} />
              </button>
              {showSortMenu && (
                <div style={{ position: 'absolute', top: '44px', right: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: '10px', padding: '6px', zIndex: 50, minWidth: '140px', boxShadow: '0 16px 32px rgba(0,0,0,0.4)' }}>
                  {(['newest', 'oldest', 'favorites'] as SortOption[]).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', border: 'none', background: sortBy === opt ? 'rgba(124,58,237,0.15)' : 'transparent', color: sortBy === opt ? 'var(--violet-bright)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', textAlign: 'left', fontWeight: sortBy === opt ? 600 : 400 }}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)} first
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body */}
        <div
          style={{ flex: 1, padding: '24px', overflowY: 'auto' }}
          onClick={() => setShowSortMenu(false)}
          className="dashboard-body"
        >
          {loading ? (
            <LoadingState />
          ) : activeFilter === 'ai-insights' ? (
            <div style={{ maxWidth: '720px' }}>
              <AIInsightsPanel onSelectItem={item => setSelectedItem(item)} />
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
                    onClick={() => setSelectedItem(item)}
                    onFavorite={() => handleFavorite(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </main>

      {/* Overlays */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectItem={item => { setSelectedItem(item); setSearchOpen(false); }}
      />
      <CaptureModal
        isOpen={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onSave={handleSave}
      />
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSelectItem={item => setSelectedItem(item)}
        onFavorite={handleFavorite}
      />

      {/* Settings Modal */}
      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSettingsOpen(false)} />
          <div className="glass animate-fade-in-up" style={{ width: '100%', maxWidth: '400px', padding: '24px', borderRadius: '16px', position: 'relative', zIndex: 1, border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Settings</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Manage your account and preferences.</p>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 600 }}>Account Email</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.email || 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setSettingsOpen(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Close</button>
              <form action={signout} style={{ flex: 1, display: 'flex' }}>
                <button type="submit" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}>Log out</button>
              </form>
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
          <div className="shimmer" style={{ height: `${140 + (i % 3) * 60}px`, borderRadius: '14px' }} />
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

  const msg = messages[filter] || { emoji: '🧠', title: 'Nothing here yet', sub: 'Save your first piece of content' };

  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>{msg.emoji}</div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{msg.title}</h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>{msg.sub}</p>
      <button onClick={onCapture} className="btn btn-primary">
        <Sparkles size={14} />
        Save something
      </button>
    </div>
  );
}
