'use client';

import { useState } from 'react';
import { Heart, ExternalLink, MoreHorizontal, Star, Trash2, FolderPlus, Sparkles, ChevronRight, Check, Edit2 } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import { TAG_COLORS } from '@/lib/data';
import type { Collection } from '@/lib/supabase-collections';
import { formatDistanceToNow } from 'date-fns';

interface MemoryCardProps {
  item: MemoryItem;
  collections: Collection[];
  onClick: () => void;
  onFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCollection: (collectionId: string) => void;
}

const TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  link: { emoji: '🔗', label: 'Link', color: '#06B6D4' },
  note: { emoji: '📝', label: 'Note', color: '#10B981' },
  image: { emoji: '🖼️', label: 'Image', color: '#EC4899' },
  pdf: { emoji: '📄', label: 'PDF', color: '#F59E0B' },
  tweet: { emoji: '𝕏', label: 'Tweet', color: '#7C3AED' },
  video: { emoji: '🎬', label: 'Video', color: '#EF4444' },
};

const GRADIENT_BACKGROUNDS = [
  'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)',
  'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(124,58,237,0.08) 100%)',
  'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(16,185,129,0.08) 100%)',
  'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.06) 100%)',
  'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
];

export default function MemoryCard({ item, collections, onClick, onFavorite, onEdit, onDelete, onAddToCollection }: MemoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.link;
  const bgGradient = GRADIENT_BACKGROUNDS[
    item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENT_BACKGROUNDS.length
  ];
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <div
      className="masonry-item"
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <div
        onClick={onClick}
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${isHovered ? 'var(--border-strong)' : 'var(--border)'}`,
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: isHovered
            ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 2px 8px rgba(0,0,0,0.2)',
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
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
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
          {item.thumbnailUrl && (
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
                src={item.thumbnailUrl} 
                alt="preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
          )}

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

      {/* Context Menu */}
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: '8px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: '10px',
            padding: '6px',
            zIndex: 50,
            minWidth: '160px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
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
                    collections.map(c => (
                      <button
                        key={c.id}
                        onClick={(e) => { e.stopPropagation(); onAddToCollection(c.id); setShowMenu(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          textAlign: 'left'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <span>{c.emoji}</span>
                        {c.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
