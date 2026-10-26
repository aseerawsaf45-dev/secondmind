'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Hash, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { commandPaletteVariant } from '@/lib/motion';
import type { MemoryItem } from '@/lib/data';
import { semanticSearchAction } from '@/lib/db-items';
import { getPrimaryCategory } from '@/lib/categories';
import { ContentTypeIcon, CollectionIcon, FlaticonIcon } from '@/components/icons/PremiumIcons';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: MemoryItem) => void;
  items: MemoryItem[];
  userId?: string;
}

const QUICK_SUGGESTIONS = [
  'AI and machine learning resources',
  'Morning routine research',
  'Business and startup ideas',
  'Design principles and UX laws',
  'Philosophy and mental models',
];

export default function SearchOverlay({ isOpen, onClose, onSelectItem, items, userId }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    let isCancelled = false;
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // 1. Instant local match (0ms latency)
    const localMatches = items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.content.toLowerCase().includes(q)
    );
    setResults(localMatches);

    // 2. Debounced semantic search with cancellation guard
    const timer = setTimeout(async () => {
      if (isCancelled) return;
      if (userId && q.length > 2) {
        setIsSearching(true);
        try {
          const semanticResults = await semanticSearchAction(userId, query, 5);
          if (isCancelled) return;

          const mergedMap = new Map<string, MemoryItem>();
          localMatches.forEach(i => mergedMap.set(i.id, i));
          semanticResults.forEach(i => {
            if (!mergedMap.has(i.id)) {
              mergedMap.set(i.id, i);
            }
          });

          setResults(Array.from(mergedMap.values()));
          setSelectedIndex(0);
        } catch {
          // Keep local matches on error
        } finally {
          if (!isCancelled) {
            setIsSearching(false);
          }
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, items, userId]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        onSelectItem(results[selectedIndex]);
        onClose();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, results, selectedIndex, onClose, onSelectItem]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="search-overlay"
          onClick={onClose}
        >
          <motion.div
            variants={commandPaletteVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '680px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <FlaticonIcon name="search" variant="bold" animation="sparkle" size={17} color="#06B6D4" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search memory or ask..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="btn btn-ghost btn-icon"
              style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '4px' }}
            >
              <X size={14} />
            </button>
          )}
          <kbd
            className="hide-xs"
            style={{
              padding: '2px 8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'inherit',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Content */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {/* Searching state */}
          {isSearching && (
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaticonIcon name="sparkles" variant="solid" animation="spin" size={16} color="#06B6D4" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Searching your memory...</span>
            </div>
          )}

          {/* Results */}
          {!isSearching && results.length > 0 && (
            <div style={{ padding: '8px' }}>
              <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {results.length} results
              </div>
              {results.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => { onSelectItem(item); onClose(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: idx === selectedIndex ? 'var(--bg-card-hover)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    <ContentTypeIcon type={item.type} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.summary}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {(() => {
                        const cat = getPrimaryCategory(item.tags, `${item.title} ${item.content}`, item.url);
                        if (!cat || cat.id === 'general') return null;
                        return (
                          <span
                            key="cat-badge"
                            style={{
                              padding: '2px 8px',
                              background: `${cat.color}18`,
                              border: `1px solid ${cat.color}35`,
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 650,
                              color: cat.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CollectionIcon name={cat.name} color={cat.color} size={11} badgeSize={16} />
                            <span>{cat.name}</span>
                          </span>
                        );
                      })()}
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ padding: '1px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '10px', color: 'var(--text-muted)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!isSearching && query && results.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Nothing found for &quot;{query}&quot;</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Try different keywords or save more content</div>
            </div>
          )}

          {/* Empty state — suggestions */}
          {!query && (
            <div style={{ padding: '16px' }}>
              <div style={{ padding: '4px 12px 10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Try asking
              </div>
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQueryChange(s)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <FlaticonIcon name="sparkles" variant="bold" animation="pulse" size={12} color="#38BDF8" />
                  {s}
                </button>
              ))}

              <div style={{ margin: '12px 0', borderTop: '1px solid var(--border)' }} />

              <div style={{ padding: '4px 12px 10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Recent
              </div>
              {items.slice(0, 3).map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelectItem(item); onClose(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <FlaticonIcon name="clock" variant="bold" animation="pulse" size={12} color="#67E8F9" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
