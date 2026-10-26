'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { commandPaletteVariant } from '@/lib/motion';
import type { MemoryItem } from '@/lib/data';
import { semanticSearchAction } from '@/lib/db-items';
import { getPrimaryCategory } from '@/lib/categories';
import { ContentTypeIcon, CollectionIcon, FlaticonIcon } from '@/components/icons/PremiumIcons';
import {
  searchAndRankMemories,
  synthesizeVaultAnswer,
  type SynthesizedAnswer,
} from '@/lib/memory-search';

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

export default function SearchOverlay({ isOpen, onClose, onSelectItem, items = [], userId }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryItem[]>([]);
  const [synthesizedAnswer, setSynthesizedAnswer] = useState<SynthesizedAnswer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract unique popular tags from items for fallback exploration
  const vaultTags = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      (item.tags || []).forEach(t => {
        const clean = String(t || '').trim();
        if (clean) counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 8);
  }, [items]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    const clean = val.trim();
    if (!clean) {
      setResults([]);
      setSynthesizedAnswer(null);
      setIsSearching(false);
      setSelectedIndex(0);
      return;
    }

    // 1. Instant local ranking (0ms synchronous latency)
    const localMatches = searchAndRankMemories(items, clean);
    setResults(localMatches);
    setSelectedIndex(0);

    // 2. Synthesize cited AI answer directly from matched vault memories
    const synthesis = synthesizeVaultAnswer(clean, localMatches);
    setSynthesizedAnswer(synthesis);
  };

  // Focus input and reset on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setQuery('');
        setResults([]);
        setSynthesizedAnswer(null);
        setSelectedIndex(0);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Non-blocking background semantic search for authenticated online users
  useEffect(() => {
    let isCancelled = false;
    const clean = query.trim();

    if (!clean || clean.length < 3) {
      setIsSearching(false);
      return;
    }

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const isRealUser = userId && userId !== 'guest' && userId !== 'offline-user';

    if (!isRealUser || !isOnline) {
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (isCancelled) return;
      setIsSearching(true);

      try {
        const semanticResults = await semanticSearchAction(userId, clean, 6);
        if (isCancelled) return;

        // Smoothly merge server semantic hits with local hits without wiping state
        setResults(prev => {
          const map = new Map<string, MemoryItem>();
          prev.forEach(i => map.set(i.id, i));
          semanticResults.forEach(i => {
            if (!map.has(i.id)) {
              map.set(i.id, i);
            }
          });
          const merged = Array.from(map.values());
          // Update synthesis if new relevant items arrived
          const updatedSynthesis = synthesizeVaultAnswer(clean, merged);
          if (updatedSynthesis) {
            setSynthesizedAnswer(updatedSynthesis);
          }
          return merged;
        });
      } catch {
        // Retain instant local matches
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, userId]);

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, Math.max(0, results.length - 1)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        if (results[selectedIndex]) {
          onSelectItem(results[selectedIndex]);
          onClose();
        } else if (synthesizedAnswer && synthesizedAnswer.citations.length > 0) {
          const firstCited = items.find(i => i.id === synthesizedAnswer.citations[0].id);
          if (firstCited) {
            onSelectItem(firstCited);
            onClose();
          }
        }
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, results, selectedIndex, synthesizedAnswer, items, onClose, onSelectItem]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="search-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 7, 14, 0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '80px 16px 20px',
          }}
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
              background: '#0D111C',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(6, 182, 212, 0.2)',
            }}
          >
            {/* Search Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <FlaticonIcon name="search" variant="bold" animation="sparkle" size={18} color="#06B6D4" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search memory or ask a question..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '15.5px',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                }}
              />
              {query && (
                <button
                  onClick={() => handleQueryChange('')}
                  className="btn btn-ghost btn-icon"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    padding: '4px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                  title="Clear input"
                >
                  <X size={14} />
                </button>
              )}
              <kbd
                className="hide-xs"
                style={{
                  padding: '3px 8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Scrollable Content */}
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {/* Dynamic Header / Count */}
              {query.trim() && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 18px 6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.45)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {results.length} Memory Result{results.length === 1 ? '' : 's'}
                  </span>
                  {isSearching && (
                    <span
                      style={{
                        fontSize: '11.5px',
                        color: '#67E8F9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 500,
                      }}
                    >
                      <FlaticonIcon name="sparkles" variant="solid" animation="spin" size={11} color="#06B6D4" />
                      Scanning vault...
                    </span>
                  )}
                </div>
              )}

              {/* Radiant AI Answer Card (Synthesized from memories) */}
              {synthesizedAnswer && results.length > 0 && (
                <div style={{ padding: '8px 14px' }}>
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      padding: '14px 16px',
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.07) 100%)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '14px',
                      boxShadow: '0 8px 24px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FlaticonIcon name="brain" variant="bold" animation="pulse" size={14} color="#06B6D4" />
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            color: '#67E8F9',
                          }}
                        >
                          SecondMind Synthesis
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '10.5px',
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontWeight: 500,
                        }}
                      >
                        {synthesizedAnswer.citations.length} Source{synthesizedAnswer.citations.length > 1 ? 's' : ''} Cited
                      </span>
                    </div>

                    {/* Synthesized Text */}
                    <p
                      style={{
                        fontSize: '13.5px',
                        lineHeight: 1.55,
                        color: 'rgba(255, 255, 255, 0.92)',
                        margin: '0 0 12px 0',
                        fontWeight: 400,
                      }}
                    >
                      {synthesizedAnswer.answer}
                    </p>

                    {/* Cited Source Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>Sources:</span>
                      {synthesizedAnswer.citations.map((c, i) => {
                        const targetItem = items.find(it => it.id === c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              if (targetItem) {
                                onSelectItem(targetItem);
                                onClose();
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 9px',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.14)',
                              borderRadius: '7px',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              maxWidth: '220px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.6)';
                              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            }}
                            title={`Jump to: ${c.title}`}
                          >
                            <span style={{ color: '#06B6D4', fontWeight: 700 }}>[{i + 1}]</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Matched Memory Results */}
              {results.length > 0 && (
                <div style={{ padding: '6px 8px 12px' }}>
                  {results.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '11px 12px',
                        borderRadius: '11px',
                        background: idx === selectedIndex ? 'rgba(6, 182, 212, 0.14)' : 'transparent',
                        border: idx === selectedIndex ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.14s ease',
                        marginBottom: '2px',
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div style={{ flexShrink: 0, marginTop: '2px' }}>
                        <ContentTypeIcon type={item.type || 'link'} size={17} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: idx === selectedIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '3px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title || 'Untitled Memory'}
                        </div>
                        {item.summary && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'rgba(255, 255, 255, 0.55)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.4,
                            }}
                          >
                            {item.summary}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {(() => {
                            const cat = getPrimaryCategory(item.tags, `${item.title} ${item.content}`, item.url);
                            if (!cat || cat.id === 'general') return null;
                            return (
                              <span
                                key="cat-badge"
                                style={{
                                  padding: '1.5px 7px',
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
                                <CollectionIcon name={cat.name} color={cat.color} size={11} badgeSize={15} />
                                <span>{cat.name}</span>
                              </span>
                            );
                          })()}
                          {(item.tags || []).slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              style={{
                                padding: '1px 7px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '999px',
                                fontSize: '10px',
                                color: 'rgba(255, 255, 255, 0.5)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        style={{
                          color: idx === selectedIndex ? '#67E8F9' : 'rgba(255, 255, 255, 0.25)',
                          flexShrink: 0,
                          marginTop: '3px',
                          transition: 'color 0.15s ease',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Zero Results State with Dynamic Tag Chips */}
              {query.trim() && results.length === 0 && (
                <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <FlaticonIcon name="search" variant="bold" animation="pulse" size={28} color="#06B6D4" />
                  </div>
                  <div style={{ color: '#FFFFFF', fontSize: '14.5px', fontWeight: 600 }}>
                    No exact matches for &quot;{query}&quot;
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12.5px', marginTop: '4px' }}>
                    Try broader keywords or explore common topics in your vault:
                  </div>

                  {vaultTags.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        justifyContent: 'center',
                        marginTop: '16px',
                        maxWidth: '460px',
                        margin: '16px auto 0',
                      }}
                    >
                      {vaultTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleQueryChange(tag)}
                          style={{
                            padding: '5px 12px',
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.25)',
                            borderRadius: '999px',
                            color: '#67E8F9',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.25)';
                          }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Initial Empty State — Quick Suggestions & Recent Memories */}
              {!query.trim() && (
                <div style={{ padding: '16px' }}>
                  <div
                    style={{
                      padding: '4px 12px 10px',
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.45)',
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Ask your vault anything
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
                        borderRadius: '9px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontSize: '13px',
                        transition: 'all 0.14s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                      }}
                    >
                      <FlaticonIcon name="sparkles" variant="bold" animation="pulse" size={13} color="#06B6D4" />
                      <span>{s}</span>
                    </button>
                  ))}

                  {items.length > 0 && (
                    <>
                      <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />
                      <div
                        style={{
                          padding: '4px 12px 10px',
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontWeight: 700,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Recent Memories
                      </div>
                      {items.slice(0, 3).map(item => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectItem(item);
                            onClose();
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '9px 12px',
                            borderRadius: '9px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.14s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <FlaticonIcon name="clock" variant="bold" animation="pulse" size={12} color="#67E8F9" />
                          <span
                            style={{
                              fontSize: '13px',
                              color: 'rgba(255, 255, 255, 0.8)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.title || 'Untitled Memory'}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
