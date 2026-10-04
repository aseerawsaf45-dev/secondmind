'use client';

import { useState, useMemo } from 'react';
import { X, Sparkles, FolderPlus, Loader, Check, Search, CheckSquare, Square, Link2, FileText, Film, MessageCircle } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; emoji: string; color: string; isSmart: boolean; itemIds?: string[] }) => Promise<void>;
  items?: MemoryItem[];
}

const EMOJIS = ['📁', '🎨', '💼', '🚀', '🧠', '📚', '⚡', '🌈', '🥑', '🎬', '🎮', '💡'];
const COLORS = ['#9CA3AF', '#EF4444', '#F59E0B', '#10B981', '#003a44', '#3B82F6', '#06565b', '#66a4ac'];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  link: <Link2 size={13} />,
  note: <FileText size={13} />,
  video: <Film size={13} />,
  tweet: <MessageCircle size={13} />,
  pdf: <FileText size={13} />,
};

export default function CreateCollectionModal({ isOpen, onClose, onSave, items = [] }: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('#9CA3AF');
  const [isSmart, setIsSmart] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'link' | 'other'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Filter items based on search and type
  const filteredItems = useMemo(() => {
    let result = items;
    if (filterType === 'link') {
      result = result.filter(i => i.type === 'link' || !!i.url);
    } else if (filterType === 'other') {
      result = result.filter(i => i.type !== 'link' && !i.url);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(i =>
        (i.title || '').toLowerCase().includes(q) ||
        (i.url || '').toLowerCase().includes(q) ||
        (i.summary || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, searchQuery, filterType]);

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentVisibleIds = filteredItems.map(i => i.id);
    const allSelected = currentVisibleIds.length > 0 && currentVisibleIds.every(id => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds(prev => prev.filter(id => !currentVisibleIds.includes(id)));
    } else {
      setSelectedItemIds(prev => Array.from(new Set([...prev, ...currentVisibleIds])));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await onSave({ name, emoji, color, isSmart, itemIds: selectedItemIds });
    setIsSaving(false);
    setSaved(true);
    await new Promise(r => setTimeout(r, 600));
    setSaved(false);
    setName('');
    setSelectedItemIds([]);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  const currentVisibleIds = filteredItems.map(i => i.id);
  const isAllVisibleSelected = currentVisibleIds.length > 0 && currentVisibleIds.every(id => selectedItemIds.includes(id));

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 110 }}>
      <div 
        onClick={e => e.stopPropagation()} 
        className="animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'min(90vh, 760px)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(6, 86, 91,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--violet-bright)'
            }}>
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>New Collection</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Create a collection and select existing saved memories</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Collection Name
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Travel Itineraries, Design Inspiration, Reading List..."
              autoFocus
            />
          </div>

          {/* Emoji & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Emoji
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: emoji === e ? 'var(--violet)' : 'transparent',
                      background: emoji === e ? 'rgba(6, 86, 91,0.1)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Color
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2px solid white' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: color === c ? `0 0 10px ${c}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Smart Toggle */}
          <div 
            onClick={() => setIsSmart(!isSmart)}
            style={{ 
              padding: '12px', 
              background: isSmart ? 'rgba(6, 86, 91,0.08)' : 'var(--bg-elevated)', 
              border: `1px solid ${isSmart ? 'var(--violet)' : 'var(--border)'}`, 
              borderRadius: '12px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: isSmart ? 'var(--violet)' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isSmart ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}>
              <Sparkles size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: isSmart ? 'var(--text-primary)' : 'var(--text-muted)' }}>Smart Collection</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auto-organize items by tag name</div>
            </div>
            <div style={{
              width: '32px',
              height: '18px',
              borderRadius: '999px',
              background: isSmart ? 'var(--violet)' : 'rgba(255,255,255,0.1)',
              position: 'relative',
              transition: 'all 0.2s',
              flexShrink: 0
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: isSmart ? '16px' : '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'white',
                transition: 'all 0.2s'
              }} />
            </div>
          </div>

          {/* Existing Saved Links Selection with Checkmarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Add Existing Saved Links ({selectedItemIds.length} selected)
              </label>
              {filteredItems.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--violet-bright)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px'
                  }}
                >
                  {isAllVisibleSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                  {isAllVisibleSelected ? 'Deselect visible' : 'Select all visible'}
                </button>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '6px 10px',
              }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter saved links..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    width: '100%',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Type pill filter */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: filterType === 'all' ? 'var(--bg-elevated)' : 'transparent',
                    color: filterType === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: filterType === 'all' ? 600 : 400,
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('link')}
                  style={{
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: filterType === 'link' ? 'var(--bg-elevated)' : 'transparent',
                    color: filterType === 'link' ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: filterType === 'link' ? 600 : 400,
                  }}
                >
                  Links
                </button>
              </div>
            </div>

            {/* Checklist of saved memories */}
            <div style={{
              maxHeight: '190px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}>
              {filteredItems.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {items.length === 0 ? 'No memories saved yet' : 'No matching items found'}
                </div>
              ) : (
                filteredItems.map(item => {
                  const isChecked = selectedItemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                        border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.3)' : 'transparent'}`,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isChecked) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isChecked) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '5px',
                        border: `1.5px solid ${isChecked ? '#10B981' : 'rgba(255, 255, 255, 0.3)'}`,
                        background: isChecked ? '#10B981' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                      }}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>

                      {/* Icon */}
                      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {TYPE_ICONS[item.type] || <Link2 size={13} />}
                      </div>

                      {/* Title & Domain */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: isChecked ? '#A7F3D0' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.3,
                        }}>
                          {item.title}
                        </div>
                        {item.sourceDomain && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.sourceDomain}
                          </div>
                        )}
                      </div>

                      {/* Tags Preview */}
                      {item.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          {item.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag}
                              style={{
                                fontSize: '9px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving || saved || !name.trim()}
            className="btn btn-primary" 
            style={{ flex: 2 }}
          >
            {isSaving ? (
              <Loader size={16} className="spin" />
            ) : saved ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> Created!
              </span>
            ) : (
              `Create Collection ${selectedItemIds.length > 0 ? `(${selectedItemIds.length} item${selectedItemIds.length > 1 ? 's' : ''})` : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
