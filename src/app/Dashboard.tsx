'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Sparkles, Grid3X3, LayoutList, ChevronDown } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MemoryCard from '@/components/MemoryCard';
import SearchOverlay from '@/components/SearchOverlay';
import CaptureModal from '@/components/CaptureModal';
import ItemDetailModal from '@/components/ItemDetailModal';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { MOCK_ITEMS, MOCK_COLLECTIONS } from '@/lib/data';
import type { MemoryItem } from '@/lib/data';
import { signout } from '@/app/login/actions';

type SortOption = 'newest' | 'oldest' | 'favorites';

export default function Dashboard({ user }: { user: any }) {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Global keyboard shortcut for search
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

  const handleFavorite = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
  }, []);

  const handleSave = useCallback((data: { type: string; title: string; content: string; url?: string }) => {
    const newItem: MemoryItem = {
      id: String(Date.now()),
      type: data.type as MemoryItem['type'],
      title: data.title,
      content: data.content,
      url: data.url,
      sourceDomain: data.url ? new URL(data.url).hostname.replace('www.', '') : undefined,
      summary: 'AI is analyzing this content...',
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: false,
    };
    setItems(prev => [newItem, ...prev]);

    // Simulate AI processing
    setTimeout(() => {
      setItems(prev => prev.map(i =>
        i.id === newItem.id
          ? { ...i, summary: 'AI-processed summary will appear here after analysis.', tags: ['AI', 'Technology'], aiProcessed: true }
          : i
      ));
    }, 3000);
  }, []);

  // Filter logic
  const filteredItems = (() => {
    let filtered = [...items];

    if (activeFilter === 'favorites') {
      filtered = filtered.filter(i => i.isFavorite);
    } else if (activeFilter === 'recent') {
      filtered = filtered.slice(0, 5);
    } else if (activeFilter === 'ai-insights') {
      return null; // render insights panel
    } else if (['link', 'note', 'image', 'pdf', 'tweet', 'video'].includes(activeFilter)) {
      filtered = filtered.filter(i => i.type === activeFilter);
    } else if (activeFilter.startsWith('tag:')) {
      const tag = activeFilter.slice(4);
      filtered = filtered.filter(i => i.tags.includes(tag));
    } else if (activeFilter.startsWith('collection:')) {
      const collId = activeFilter.slice(11);
      const coll = MOCK_COLLECTIONS.find(c => c.id === collId);
      if (coll) {
        const tagForColl: Record<string, string[]> = {
          'c1': ['AI', 'Research'],
          'c2': ['Business'],
          'c3': ['Productivity'],
          'c4': ['Design'],
          'c5': ['Philosophy'],
          'c6': ['Science'],
        };
        const tags = tagForColl[collId] || [];
        filtered = filtered.filter(i => i.tags.some(t => tags.includes(t)));
      }
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'favorites') {
      filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }

    return filtered;
  })();

  // Item counts for sidebar
  const itemCounts = {
    all: items.length,
    favorites: items.filter(i => i.isFavorite).length,
    link: items.filter(i => i.type === 'link').length,
    note: items.filter(i => i.type === 'note').length,
    pdf: items.filter(i => i.type === 'pdf').length,
    tweet: items.filter(i => i.type === 'tweet').length,
    video: items.filter(i => i.type === 'video').length,
  };

  // Title for current filter
  const getTitle = () => {
    if (activeFilter === 'all') return 'All Memory';
    if (activeFilter === 'favorites') return 'Favorites';
    if (activeFilter === 'recent') return 'Recently Added';
    if (activeFilter === 'ai-insights') return 'AI Insights';
    if (activeFilter.startsWith('tag:')) return `#${activeFilter.slice(4)}`;
    if (activeFilter.startsWith('collection:')) {
      const coll = MOCK_COLLECTIONS.find(c => c.id === activeFilter.slice(11));
      return coll ? `${coll.emoji} ${coll.name}` : 'Collection';
    }
    return activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) + 's';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        left: '10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-20%',
        right: '5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSearchOpen={() => setSearchOpen(true)}
        onCaptureOpen={() => setCaptureOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        itemCounts={itemCounts}
        user={user}
      />

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '0 28px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(8,8,15,0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {getTitle()}
            </h1>
            {filteredItems !== null && (
              <span style={{
                padding: '2px 10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}>
                {filteredItems.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="btn btn-ghost"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <Search size={13} />
              Search
              <kbd style={{
                padding: '1px 6px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'inherit',
              }}>⌘K</kbd>
            </button>

            {/* Sort */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="btn btn-ghost"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <SlidersHorizontal size={13} />
                {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Favorites'}
                <ChevronDown size={11} />
              </button>
              {showSortMenu && (
                <div style={{
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
                }}>
                  {(['newest', 'oldest', 'favorites'] as SortOption[]).map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '7px',
                        border: 'none',
                        background: sortBy === opt ? 'rgba(124,58,237,0.15)' : 'transparent',
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

        {/* Body */}
        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}
          onClick={() => { setShowSortMenu(false); }}
        >
          {activeFilter === 'ai-insights' ? (
            <div style={{ maxWidth: '720px' }}>
              <AIInsightsPanel onSelectItem={item => setSelectedItem(item)} />
            </div>
          ) : filteredItems !== null && filteredItems.length === 0 ? (
            <EmptyState filter={activeFilter} onCapture={() => setCaptureOpen(true)} />
          ) : filteredItems !== null ? (
            <>
              {/* AI processing notice */}
              {items.some(i => !i.aiProcessed) && (
                <div style={{
                  marginBottom: '20px',
                  padding: '10px 16px',
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Sparkles size={13} style={{ color: 'var(--violet-bright)', animation: 'float 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    AI is processing your latest items — tags and summaries will appear shortly
                  </span>
                </div>
              )}

              {/* Masonry grid */}
              <div className="masonry-grid">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both', opacity: 0 }}
                  >
                    <MemoryCard
                      item={item}
                      onClick={() => setSelectedItem(item)}
                      onFavorite={() => handleFavorite(item.id)}
                    />
                  </div>
                ))}
              </div>
            </>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setSettingsOpen(false)} />
          <div className="glass animate-fade-in-up" style={{ width: '400px', padding: '24px', borderRadius: '16px', position: 'relative', zIndex: 1, border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Settings</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Manage your account and preferences.</p>
            
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 600 }}>Account Email</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{user?.email || 'N/A'}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setSettingsOpen(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Close
              </button>
              <form action={signout} style={{ flex: 1, display: 'flex' }}>
                <button type="submit" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}>
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
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
