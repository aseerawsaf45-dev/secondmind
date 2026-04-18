'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Hash, Clock, Sparkles } from 'lucide-react';
import { MOCK_ITEMS } from '@/lib/data';
import type { MemoryItem } from '@/lib/data';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: MemoryItem) => void;
}

const QUICK_SUGGESTIONS = [
  'AI and machine learning resources',
  'Morning routine research',
  'Business and startup ideas',
  'Design principles and UX laws',
  'Philosophy and mental models',
];

export default function SearchOverlay({ isOpen, onClose, onSelectItem }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = MOCK_ITEMS.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q)) ||
          item.content.toLowerCase().includes(q)
      );
      setResults(filtered);
      setIsSearching(false);
      setSelectedIndex(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

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

  if (!isOpen) return null;

  const typeIcon = (type: string) => {
    const map: Record<string, string> = {
      link: '🔗', note: '📝', image: '🖼️', pdf: '📄', tweet: '🐦', video: '🎬',
    };
    return map[type] || '📎';
  };

  return (
    <div className="search-overlay animate-fade-in" onClick={onClose}>
      <div
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
        className="animate-fade-in-up"
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your memory... or ask anything"
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
              onClick={() => setQuery('')}
              className="btn btn-ghost btn-icon"
              style={{ width: '28px', height: '28px', borderRadius: '6px', padding: '4px' }}
            >
              <X size={14} />
            </button>
          )}
          <kbd style={{
            padding: '2px 8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'inherit',
          }}>ESC</kbd>
        </div>

        {/* Content */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {/* Searching state */}
          {isSearching && (
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} style={{ color: 'var(--violet-bright)', animation: 'spin 1s linear infinite' }} />
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
                  <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{typeIcon(item.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.summary}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
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
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Nothing found for "{query}"</div>
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
                  onClick={() => setQuery(s)}
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
                  <Hash size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  {s}
                </button>
              ))}

              <div style={{ margin: '12px 0', borderTop: '1px solid var(--border)' }} />

              <div style={{ padding: '4px 12px 10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Recent
              </div>
              {MOCK_ITEMS.slice(0, 3).map(item => (
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
                  <Clock size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
