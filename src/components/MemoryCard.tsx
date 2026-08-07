'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, ExternalLink, MoreHorizontal, Star, Trash2, FolderPlus, Sparkles, ChevronRight, Check, Edit2 } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import { TAG_COLORS } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';
import { formatDistanceToNow } from 'date-fns';
import { getYouTubeThumbnailUrl } from '@/lib/youtube';

interface MemoryCardProps {
  item: MemoryItem;
  collections: Collection[];
  itemCollections?: string[];
  onClick: () => void;
  onFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCollection: (collectionId: string) => void;
  onRemoveFromCollection?: (collectionId: string) => void;
}

const TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  link: { emoji: '🔗', label: 'Link', color: '#003a44' },
  note: { emoji: '📝', label: 'Note', color: '#10B981' },
  image: { emoji: '🖼️', label: 'Image', color: '#66a4ac' },
  pdf: { emoji: '📄', label: 'PDF', color: '#F59E0B' },
  tweet: { emoji: '𝕏', label: 'Tweet', color: '#06565b' },
  video: { emoji: '🎬', label: 'Video', color: '#EF4444' },
};

const GRADIENT_BACKGROUNDS = [
  'linear-gradient(135deg, rgba(6, 86, 91,0.15) 0%, rgba(0, 58, 68,0.08) 100%)',
  'linear-gradient(135deg, rgba(102, 164, 172,0.12) 0%, rgba(6, 86, 91,0.08) 100%)',
  'linear-gradient(135deg, rgba(0, 58, 68,0.15) 0%, rgba(16,185,129,0.08) 100%)',
  'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.06) 100%)',
  'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
];

import { ParticleCard } from './MagicBento';

export default function MemoryCard({ item, collections, itemCollections = [], onClick, onFavorite, onEdit, onDelete, onAddToCollection, onRemoveFromCollection }: MemoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCollectionSubmenu, setShowCollectionSubmenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.link;
  const bgGradient = GRADIENT_BACKGROUNDS[
    item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENT_BACKGROUNDS.length
  ];
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, left: rect.right - 180 });
    }
    setShowMenu(!showMenu);
    setShowCollectionSubmenu(false);
  };

  // Close menu on scroll or resize
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [showMenu]);

  return (
    <div
      className="masonry-item"
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <ParticleCard
        glowColor="102, 164, 172"
        particleCount={8}
        enableTilt={true}
        enableMagnetism={false}
        clickEffect={true}
        className="magic-bento-card--border-glow"
        style={{ borderRadius: '16px' }}
      >
        <div
          onClick={onClick}
          className="glass-card"
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
        {/* Card Gradient Header */}
        <div style={{
          background: bgGradient,
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Type + Actions row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: '11px' }}>{typeConfig.emoji}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', color: typeConfig.color, textTransform: 'uppercase' }}>
                {typeConfig.label}
              </span>
            </div>

            {/* Actions (visible on hover) */}
            <div style={{
              display: 'flex',
              gap: '4px',
              opacity: isHovered ? 1 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0),
              transition: 'opacity 0.2s',
            }} onClick={e => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                  color: item.isFavorite ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                }}
              >
                <Star size={12} fill={item.isFavorite ? '#F59E0B' : 'none'} />
              </button>
              <button
                ref={menuBtnRef}
                onClick={openMenu}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <MoreHorizontal size={12} />
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          {(() => {
            const displayThumbnail = item.thumbnailUrl || (item.url ? getYouTubeThumbnailUrl(item.url) : null);
            if (!displayThumbnail) return null;
            return (
              <div style={{
                width: '100%',
                height: '140px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '12px',
                background: 'var(--bg-card)',
                position: 'relative'
              }}>
                <img 
                  src={displayThumbnail} 
                  alt="preview" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1.0)',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            );
          })()}

          {/* Title */}
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.title}
          </h3>
        </div>

        {/* Card Body */}
        <div style={{ padding: '14px 16px' }}>
          {/* AI Summary */}
          <p style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            {item.summary}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
            {item.tags.map(tag => {
              const color = TAG_COLORS[tag] || '#6B7280';
              return (
                <span key={tag} className="tag-pill" style={{
                  background: `${color}18`,
                  color: color,
                  borderColor: `${color}30`,
                }}>
                  {tag}
                </span>
              );
            })}
            {item.aiProcessed && (
              <span className="ai-badge">
                <Sparkles size={8} />
                AI
              </span>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {item.sourceDomain && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ExternalLink size={9} />
                  {item.sourceDomain}
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo}</span>
          </div>
        </div>

        {/* Favorite indicator */}
        {item.isFavorite && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#F59E0B',
            boxShadow: '0 0 6px #F59E0B',
          }} />
        )}
      </div>
      </ParticleCard>

      {/* Context Menu — rendered via Portal to escape masonry column clipping */}
      {showMenu && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: '10px',
            padding: '6px',
            zIndex: 9999,
            minWidth: '180px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.15s ease',
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { icon: <Edit2 size={13} />, label: 'Edit', action: onEdit },
            { icon: <Star size={13} />, label: item.isFavorite ? 'Unfavorite' : 'Favorite', action: onFavorite },
            { 
              icon: <FolderPlus size={13} />, 
              label: 'Add to collection', 
              action: () => setShowCollectionSubmenu(!showCollectionSubmenu),
              submenu: true 
            },
            { icon: <ExternalLink size={13} />, label: 'Open original', action: () => item.url && window.open(item.url, '_blank') },
            { icon: <Trash2 size={13} />, label: 'Delete', action: () => onDelete(), danger: true },
          ].map(({ icon, label, action, danger, submenu }) => (
            <div key={label} style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); action(); if (!submenu) setShowMenu(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  color: danger ? '#EF4444' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.1)' : 'var(--bg-card-hover)';
                  e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-primary)';
                  if (label === 'Add to collection') setShowCollectionSubmenu(true);
                  else setShowCollectionSubmenu(false);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-secondary)';
                }}
              >
                {icon}
                <span style={{ flex: 1 }}>{label}</span>
                {submenu && <ChevronRight size={10} style={{ opacity: 0.5 }} />}
              </button>

              {submenu && showCollectionSubmenu && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: '100%',
                  marginRight: '8px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '10px',
                  padding: '6px',
                  minWidth: '140px',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
                }}>
                  {collections.length === 0 ? (
                    <div style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No spaces created
                    </div>
                  ) : (
                    collections.map(c => {
                      const isMember = itemCollections.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMember) {
                              onRemoveFromCollection?.(c.id);
                            } else {
                              onAddToCollection(c.id);
                            }
                            setShowMenu(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isMember ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: isMember ? '#A7F3D0' : 'var(--text-secondary)',
                            textAlign: 'left'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isMember ? 'rgba(16, 185, 129, 0.25)' : 'var(--bg-card-hover)';
                            e.currentTarget.style.color = isMember ? '#A7F3D0' : 'var(--text-primary)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = isMember ? 'rgba(16, 185, 129, 0.15)' : 'transparent';
                            e.currentTarget.style.color = isMember ? '#A7F3D0' : 'var(--text-secondary)';
                          }}
                        >
                          <span>{c.emoji}</span>
                          <span style={{ flex: 1 }}>{c.name}</span>
                          {isMember && <Check size={12} style={{ color: '#10B981' }} />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
