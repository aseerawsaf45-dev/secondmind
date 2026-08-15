import { X, ExternalLink, Star, Sparkles, ArrowRight, Link2, FileText, Film, MessageCircle, Edit2, Check, Plus, Loader } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import { TAG_COLORS } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/youtube';

interface ItemDetailModalProps {
  item: MemoryItem | null;
  onClose: () => void;
  onSelectItem: (item: MemoryItem) => void;
  onFavorite: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => void;
  initialEditMode?: boolean;
  allItems: MemoryItem[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  link: <Link2 size={14} />,
  note: <FileText size={14} />,
  video: <Film size={14} />,
  tweet: <MessageCircle size={14} />,
  pdf: <FileText size={14} />,
};

export default function ItemDetailModal({ item, onClose, onSelectItem, onFavorite, onUpdate, onDelete, initialEditMode, allItems }: ItemDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditSummary(item.summary);
      setEditTags([...item.tags]);
      setIsEditing(!!initialEditMode);
    }
  }, [item, initialEditMode]);

  if (!item) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(item.id, {
      title: editTitle,
      content: editContent,
      summary: editSummary,
      tags: editTags
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const relatedItems = allItems.filter(i => item.relatedIds.includes(i.id));
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: 'min(92dvh, 850px)',
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
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(6, 86, 91,0.15)',
            border: '1px solid rgba(6, 86, 91,0.3)',
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
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-ghost btn-icon"
              style={{ color: isEditing ? 'var(--violet-bright)' : 'var(--text-muted)' }}
              title={isEditing ? 'Cancel' : 'Edit Memory'}
            >
              <Edit2 size={15} />
            </button>
            {!isEditing && (
              <button
                onClick={() => onFavorite(item.id)}
                className="btn btn-ghost btn-icon"
                style={{ color: item.isFavorite ? '#F59E0B' : 'var(--text-muted)' }}
              >
                <Star size={15} fill={item.isFavorite ? '#F59E0B' : 'none'} />
              </button>
            )}
            {item.url && !isEditing && (
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
            <button
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="btn btn-ghost btn-icon"
              style={{ color: '#ef4444' }}
              title="Delete Memory"
            >
              <X size={15} style={{ display: 'none' }} />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-icon">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px' }}>
          {isEditing ? (
            <input
              className="input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', width: '100%' }}
              placeholder="Memory Title"
            />
          ) : (
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '20px' }}>
              {item.title}
            </h1>
          )}

          {/* Two-column: content + AI panel */}
          <div className="item-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
            {/* Main Content */}
            <div>
              {/* Media Preview / YouTube Embed */}
              {(() => {
                const ytVideoId = item.url ? extractYouTubeVideoId(item.url) : null;
                const displayThumbnail = item.thumbnailUrl || (item.url ? getYouTubeThumbnailUrl(item.url) : null);

                if (ytVideoId) {
                  return (
                    <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', background: '#000' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${ytVideoId}`}
                        title={item.title}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }

                if (displayThumbnail) {
                  return (
                    <div style={{ width: '100%', maxHeight: '280px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', background: 'var(--bg-card)' }}>
                      <img src={displayThumbnail} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  );
                }

                return null;
              })()}

              {isEditing ? (
                <textarea
                  className="input"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '24px', width: '100%', minHeight: '150px' }}
                  placeholder="Memory Content"
                />
              ) : (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
                  {item.content}
                </p>
              )}

              {/* Tags */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(isEditing ? editTags : item.tags).map(tag => {
                    const color = TAG_COLORS[tag] || '#6B7280';
                    return (
                      <span key={tag} className="tag-pill" style={{
                        background: `${color}20`,
                        color: color,
                        borderColor: `${color}40`,
                        fontSize: '12px',
                        padding: '4px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {tag}
                        {isEditing && (
                          <X 
                            size={12} 
                            style={{ cursor: 'pointer', opacity: 0.6 }} 
                            onClick={() => removeTag(tag)}
                          />
                        )}
                      </span>
                    );
                  })}
                  {isEditing && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        className="input"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTag()}
                        placeholder="Add tag..."
                        style={{ fontSize: '12px', padding: '4px 8px', width: '100px', height: 'auto' }}
                      />
                      <button onClick={addTag} className="btn btn-ghost btn-icon" style={{ padding: '4px' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
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
                background: 'linear-gradient(135deg, rgba(6, 86, 91,0.1), rgba(0, 58, 68,0.05))',
                border: '1px solid rgba(6, 86, 91,0.25)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Sparkles size={12} style={{ color: 'var(--violet-bright)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--violet-bright)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    AI Summary
                  </span>
                </div>
                {isEditing ? (
                  <textarea
                    className="input"
                    value={editSummary}
                    onChange={e => setEditSummary(e.target.value)}
                    style={{ fontSize: '12px', lineHeight: 1.7, width: '100%', minHeight: '100px', background: 'transparent', border: 'none', padding: 0 }}
                  />
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {item.summary}
                  </p>
                )}
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
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isSaving ? <Loader size={14} className="spin" /> : <Check size={14} />}
                  Save Changes
                </button>
              ) : (
                item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ textDecoration: 'none', justifyContent: 'center' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    {item.type === 'pdf' ? 'View PDF' : 'Open original'}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
