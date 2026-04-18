'use client';

import { X, ExternalLink, Star, Sparkles, ArrowRight, Link2, FileText, Film, MessageCircle } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import { MOCK_ITEMS, TAG_COLORS } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

interface ItemDetailModalProps {
  item: MemoryItem | null;
  onClose: () => void;
  onSelectItem: (item: MemoryItem) => void;
  onFavorite: (id: string) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  link: <Link2 size={14} />,
  note: <FileText size={14} />,
  video: <Film size={14} />,
  tweet: <MessageCircle size={14} />,
};

export default function ItemDetailModal({ item, onClose, onSelectItem, onFavorite }: ItemDetailModalProps) {
  if (!item) return null;

  const relatedItems = MOCK_ITEMS.filter(i => item.relatedIds.includes(i.id));
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
        className="animate-fade-in-up"
      >
        {/* Top bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--violet-bright)',
          }}>
            {TYPE_ICONS[item.type] || <FileText size={14} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              {item.type} · {item.sourceDomain || 'Note'} · {timeAgo}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => onFavorite(item.id)}
              className="btn btn-ghost btn-icon"
              style={{ color: item.isFavorite ? '#F59E0B' : 'var(--text-muted)' }}
            >
              <Star size={15} fill={item.isFavorite ? '#F59E0B' : 'none'} />
            </button>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-icon"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={15} />
              </a>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '20px' }}>
            {item.title}
          </h1>

          {/* Two-column: content + AI panel */}
          <div className="item-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
            {/* Main Content */}
            <div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
                {item.content}
              </p>

              {/* Tags */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.tags.map(tag => {
                    const color = TAG_COLORS[tag] || '#6B7280';
                    return (
                      <span key={tag} className="tag-pill" style={{
                        background: `${color}20`,
                        color: color,
                        borderColor: `${color}40`,
                        fontSize: '12px',
                        padding: '4px 12px',
                      }}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Related items */}
              {relatedItems.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Related in your memory
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {relatedItems.map(rel => (
                      <button
                        key={rel.id}
                        onClick={() => onSelectItem(rel)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--bg-card-hover)';
                          e.currentTarget.style.borderColor = 'var(--border-strong)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--bg-card)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rel.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {rel.tags.slice(0, 2).join(' · ')}
                          </div>
                        </div>
                        <ArrowRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* AI Summary */}
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Sparkles size={12} style={{ color: 'var(--violet-bright)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--violet-bright)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    AI Summary
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {item.summary}
                </p>
              </div>

              {/* Metadata */}
              <div style={{
                padding: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Details
                </div>
                {[
                  { label: 'Type', value: item.type.charAt(0).toUpperCase() + item.type.slice(1) },
                  { label: 'Source', value: item.sourceDomain || '—' },
                  { label: 'Saved', value: timeAgo },
                  { label: 'AI Processed', value: item.aiProcessed ? '✅ Yes' : '⏳ Pending' },
                  { label: 'Related items', value: `${item.relatedIds.length} found` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', justifyContent: 'center' }}
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                  Open original
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
