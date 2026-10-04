'use client';

import { useState, useMemo } from 'react';
import { X, Check, Search, CheckSquare, Square, Link2, FileText, Film, MessageCircle, FolderPlus, Loader } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';

interface ManageCollectionItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  items: MemoryItem[];
  itemCollectionMap: Record<string, string[]>;
  onSave: (collectionId: string, itemIdsToAdd: string[], itemIdsToRemove: string[]) => Promise<void>;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  link: <Link2 size={13} />,
  note: <FileText size={13} />,
  video: <Film size={13} />,
  tweet: <MessageCircle size={13} />,
  pdf: <FileText size={13} />,
};

export default function ManageCollectionItemsModal({
  isOpen,
  onClose,
  collection,
  items,
  itemCollectionMap,
  onSave,
}: ManageCollectionItemsModalProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'link' | 'other'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Initialize selected items based on current membership
  useMemo(() => {
    if (isOpen && collection) {
      const currentIds = items
        .filter(item => itemCollectionMap[item.id]?.includes(collection.id))
        .map(item => item.id);
      setSelectedItemIds(currentIds);
      setInitialLoaded(true);
    } else {
      setInitialLoaded(false);
    }
  }, [isOpen, collection, items, itemCollectionMap]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (filterType === 'link') {
      result = result.filter(i => i.type === 'link' || !!i.url);
    } else if (filterType === 'other') {
      result = result.filter(i => i.type !== 'link' && !i.url);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        i =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.url || '').toLowerCase().includes(q) ||
          (i.summary || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, searchQuery, filterType]);

  if (!isOpen || !collection) return null;

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const currentVisibleIds = filteredItems.map(i => i.id);
  const isAllVisibleSelected =
    currentVisibleIds.length > 0 && currentVisibleIds.every(id => selectedItemIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllVisibleSelected) {
      setSelectedItemIds(prev => prev.filter(id => !currentVisibleIds.includes(id)));
    } else {
      setSelectedItemIds(prev => Array.from(new Set([...prev, ...currentVisibleIds])));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const originalIds = items
      .filter(item => itemCollectionMap[item.id]?.includes(collection.id))
      .map(item => item.id);

    const toAdd = selectedItemIds.filter(id => !originalIds.includes(id));
    const toRemove = originalIds.filter(id => !selectedItemIds.includes(id));

    await onSave(collection.id, toAdd, toRemove);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'min(90vh, 740px)',
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
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'rgba(6, 86, 91,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              {collection.emoji || '📁'}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Manage {collection.name}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Checkmark memories to add or remove them from this collection
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Search & Actions Toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {selectedItemIds.length} link{selectedItemIds.length === 1 ? '' : 's'} included
            </span>
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
                  padding: '2px 4px',
                }}
              >
                {isAllVisibleSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                {isAllVisibleSelected ? 'Deselect visible' : 'Select all visible'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '6px 10px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search saved memories..."
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
        </div>

        {/* Checklist of saved links */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
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
                    padding: '8px 10px',
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
                  {/* Checkmark box */}
                  <div
                    style={{
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
                    }}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Type icon */}
                  <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {TYPE_ICONS[item.type] || <Link2 size={13} />}
                  </div>

                  {/* Title & Domain */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: isChecked ? '#A7F3D0' : 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </div>
                    {item.sourceDomain && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.sourceDomain}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
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

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn btn-primary" style={{ flex: 2 }}>
            {isSaving ? <Loader size={16} className="spin" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
