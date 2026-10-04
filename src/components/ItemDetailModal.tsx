'use client';

import {
  X,
  ExternalLink,
  Star,
  Sparkles,
  ArrowRight,
  Link2,
  FileText,
  Film,
  MessageCircle,
  Edit2,
  Check,
  Plus,
  Loader,
  Copy,
  Clock,
  Globe,
  Share2,
  Trash2,
  BookOpen,
} from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import { TAG_COLORS } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useMemo } from 'react';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/youtube';
import { motion, AnimatePresence } from 'framer-motion';

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

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  link: { icon: <Link2 size={14} />, label: 'Link', color: '#818CF8' },
  note: { icon: <FileText size={14} />, label: 'Note', color: '#10B981' },
  video: { icon: <Film size={14} />, label: 'Video', color: '#F87171' },
  tweet: { icon: <MessageCircle size={14} />, label: 'Tweet', color: '#38BDF8' },
  pdf: { icon: <FileText size={14} />, label: 'PDF Document', color: '#FBBF24' },
};

export default function ItemDetailModal({
  item,
  onClose,
  onSelectItem,
  onFavorite,
  onUpdate,
  onDelete,
  initialEditMode,
  allItems,
}: ItemDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item) {
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditSummary(item.summary);
      setEditTags([...item.tags]);
      setIsEditing(!!initialEditMode);
    }
  }, [item, initialEditMode]);

  // Clean domain display
  const cleanDomain = useMemo(() => {
    if (!item) return null;
    if (item.sourceDomain) return item.sourceDomain.replace(/^www\./, '');
    if (item.url) {
      try {
        return new URL(item.url).hostname.replace(/^www\./, '');
      } catch (_) {}
    }
    return null;
  }, [item]);

  // Reading time estimate
  const readingMeta = useMemo(() => {
    if (!item) return '1 min read';
    if (item.type === 'video') return 'Video';
    if (item.type === 'pdf') return 'Document';
    const words = (item.content || '').trim().split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 180))} min read`;
  }, [item]);

  // Split summary into key bullet points if multiple sentences
  const keyTakeaways = useMemo(() => {
    if (!item?.summary) return [];
    return item.summary
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }, [item?.summary]);

  if (!item) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(item.id, {
      title: editTitle,
      content: editContent,
      summary: editSummary,
      tags: editTags,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCopyLink = async () => {
    const urlToCopy = item.url || window.location.href;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
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
  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.link;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: 'min(92dvh, 880px)',
          background: 'linear-gradient(180deg, rgba(16, 18, 32, 0.98) 0%, rgba(9, 10, 19, 0.99) 100%)',
          backdropFilter: 'blur(30px) saturate(160%)',
          WebkitBackdropFilter: 'blur(30px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '22px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 120px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* TOP BAR / COMMAND CAPSULE */}
        <div
          style={{
            padding: '14px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          {/* Domain Favicon + Clean Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: typeConfig.color,
                flexShrink: 0,
              }}
            >
              {cleanDomain ? (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`}
                  alt=""
                  width={16}
                  height={16}
                  style={{ borderRadius: '3px' }}
                  onError={e => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                typeConfig.icon
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {cleanDomain || typeConfig.label}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)' }}>·</span>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'var(--font-mono), monospace' }}>
                  {readingMeta}
                </span>
              </div>
              <span style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.4)' }}>Saved {timeAgo}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            {item.url && (
              <button
                onClick={handleCopyLink}
                className="btn btn-ghost"
                style={{
                  height: '32px',
                  padding: '0 10px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: copied ? '#34D399' : 'rgba(255, 255, 255, 0.7)',
                  background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                }}
                title="Copy link to clipboard"
              >
                {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-ghost btn-icon"
              style={{
                width: '32px',
                height: '32px',
                color: isEditing ? '#818CF8' : 'rgba(255, 255, 255, 0.65)',
                background: isEditing ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
              }}
              title={isEditing ? 'Cancel Edit' : 'Edit Memory'}
            >
              <Edit2 size={14} />
            </button>

            {!isEditing && (
              <button
                onClick={() => onFavorite(item.id)}
                className="btn btn-ghost btn-icon"
                style={{
                  width: '32px',
                  height: '32px',
                  color: item.isFavorite ? '#F59E0B' : 'rgba(255, 255, 255, 0.65)',
                  background: item.isFavorite ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px',
                }}
                title="Toggle favorite"
              >
                <Star size={14} fill={item.isFavorite ? '#F59E0B' : 'none'} />
              </button>
            )}

            {item.url && !isEditing && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-icon"
                style={{
                  width: '32px',
                  height: '32px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Open original website"
              >
                <ExternalLink size={14} />
              </a>
            )}

            <button
              onClick={() => {
                if (confirm('Delete this saved item from your memory bank?')) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="btn btn-ghost btn-icon"
              style={{
                width: '32px',
                height: '32px',
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
              }}
              title="Delete Memory"
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{
                width: '32px',
                height: '32px',
                color: 'rgba(255, 255, 255, 0.65)',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
              }}
              title="Close modal (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 26px 28px' }}>
          {isEditing ? (
            <input
              className="input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              style={{
                fontSize: '22px',
                fontWeight: 800,
                fontFamily: 'var(--font-outfit), sans-serif',
                marginBottom: '20px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '12px',
                padding: '10px 14px',
              }}
              placeholder="Memory Title"
            />
          ) : (
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.25,
                letterSpacing: '-0.025em',
                fontFamily: 'var(--font-outfit), sans-serif',
                marginBottom: '22px',
              }}
            >
              {item.title}
            </h1>
          )}

          {/* TWO-COLUMN LAYOUT: MAIN CONTENT + AI SIDECAR */}
          <div className="item-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: '26px' }}>
            {/* LEFT COLUMN: Media Preview & Reader Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* YouTube Embed / Media Preview */}
              {(() => {
                const ytVideoId = item.url ? extractYouTubeVideoId(item.url) : null;
                const displayThumbnail = item.thumbnailUrl || (item.url ? getYouTubeThumbnailUrl(item.url) : null);

                if (ytVideoId) {
                  return (
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: '#000',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                      }}
                    >
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
                    <div
                      style={{
                        width: '100%',
                        maxHeight: '320px',
                        aspectRatio: '16/9',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        background: '#090A12',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={displayThumbnail}
                        alt="Thumbnail preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  );
                }

                return null;
              })()}

              {/* Full Article / Note Content */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontFamily: 'var(--font-mono), monospace',
                    marginBottom: '10px',
                  }}
                >
                  <BookOpen size={12} style={{ color: '#818CF8' }} />
                  <span>READER BODY</span>
                </div>

                {isEditing ? (
                  <textarea
                    className="input"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    style={{
                      fontSize: '14px',
                      lineHeight: 1.8,
                      width: '100%',
                      minHeight: '180px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      color: '#FFFFFF',
                    }}
                    placeholder="Memory Content"
                  />
                ) : (
                  <div
                    style={{
                      fontSize: '14.5px',
                      color: 'rgba(255, 255, 255, 0.78)',
                      lineHeight: 1.8,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {item.content || item.summary || 'No extended content saved.'}
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontFamily: 'var(--font-mono), monospace',
                    marginBottom: '10px',
                  }}
                >
                  TAGS & CATEGORIZATION
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(isEditing ? editTags : item.tags).map(tag => {
                    const color = TAG_COLORS[tag] || '#818CF8';
                    return (
                      <span
                        key={tag}
                        style={{
                          background: `${color}18`,
                          color: color,
                          borderColor: `${color}35`,
                          border: `1px solid ${color}35`,
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'var(--font-mono), monospace',
                        }}
                      >
                        #{tag}
                        {isEditing && (
                          <X
                            size={12}
                            style={{ cursor: 'pointer', opacity: 0.7 }}
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
                        style={{
                          fontSize: '12px',
                          padding: '4px 10px',
                          width: '110px',
                          height: 'auto',
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                        }}
                      />
                      <button onClick={addTag} className="btn btn-ghost btn-icon" style={{ padding: '6px' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Memories */}
              {relatedItems.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontFamily: 'var(--font-mono), monospace',
                      marginBottom: '10px',
                    }}
                  >
                    RELATED IN SECONDMIND
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
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.16s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#FFFFFF',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {rel.title}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255, 255, 255, 0.45)',
                              marginTop: '2px',
                              fontFamily: 'var(--font-mono), monospace',
                            }}
                          >
                            {rel.tags.slice(0, 3).map(t => `#${t}`).join(' · ')}
                          </div>
                        </div>
                        <ArrowRight size={13} style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: AI Executive Brief & Telemetry */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* AI Executive Brief */}
              <div
                style={{
                  padding: '18px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.06) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.28)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                  <Sparkles size={13} style={{ color: '#06B6D4' }} />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#C7D2FE',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    AI EXECUTIVE BRIEF
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    className="input"
                    value={editSummary}
                    onChange={e => setEditSummary(e.target.value)}
                    style={{
                      fontSize: '12.5px',
                      lineHeight: 1.7,
                      width: '100%',
                      minHeight: '120px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#FFFFFF',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {keyTakeaways.length > 1 ? (
                      keyTakeaways.map((point, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: '#818CF8',
                              boxShadow: '0 0 8px #6366F1',
                              marginTop: '6px',
                              flexShrink: 0,
                            }}
                          />
                          <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, margin: 0 }}>
                            {point}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, margin: 0 }}>
                        {item.summary}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Link Details Metadata Box */}
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.4)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono), monospace',
                    marginBottom: '12px',
                  }}
                >
                  SYSTEM TELEMETRY
                </div>

                {[
                  { label: 'Category', value: typeConfig.label },
                  { label: 'Domain', value: cleanDomain || 'Local Note' },
                  { label: 'Saved At', value: timeAgo },
                  { label: 'Reading Estimate', value: readingMeta },
                  { label: 'AI Processed', value: item.aiProcessed ? 'Synthesized' : 'Raw' },
                  { label: 'Related Items', value: `${item.relatedIds.length} connected` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'rgba(255, 255, 255, 0.45)' }}>{label}</span>
                    <span
                      style={{
                        color: '#FFFFFF',
                        fontWeight: 500,
                        fontFamily: 'var(--font-mono), monospace',
                        fontSize: '11.5px',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons in Sidecar */}
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
                    height: '42px',
                    borderRadius: '12px',
                  }}
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
                    style={{
                      textDecoration: 'none',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
                      height: '42px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    <span>Open Original Source</span>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
