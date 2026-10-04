'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ExternalLink,
  MoreHorizontal,
  Star,
  Trash2,
  FolderPlus,
  Sparkles,
  ChevronRight,
  Check,
  Edit2,
  Copy,
  Clock,
  ArrowUpRight,
  Globe,
  Film,
  FileText,
  Bookmark,
} from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import { TAG_COLORS } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';
import { formatDistanceToNow } from 'date-fns';
import { getYouTubeThumbnailUrl, extractYouTubeVideoId } from '@/lib/youtube';
import { motion, AnimatePresence } from 'framer-motion';

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

const TYPE_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  link: { emoji: '🔗', label: 'Link', color: '#818CF8', bg: 'rgba(99, 102, 241, 0.12)' },
  note: { emoji: '📝', label: 'Note', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  image: { emoji: '🖼️', label: 'Image', color: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)' },
  pdf: { emoji: '📄', label: 'PDF', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)' },
  tweet: { emoji: '𝕏', label: 'Tweet', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  video: { emoji: '🎬', label: 'Video', color: '#F87171', bg: 'rgba(248, 113, 113, 0.12)' },
};

export default function MemoryCard({
  item,
  collections,
  itemCollections = [],
  onClick,
  onFavorite,
  onEdit,
  onDelete,
  onAddToCollection,
  onRemoveFromCollection,
}: MemoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCollectionSubmenu, setShowCollectionSubmenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.link;

  // Estimated reading time or media badge
  const readingMeta = useMemo(() => {
    if (item.type === 'video' || (item.url && extractYouTubeVideoId(item.url))) {
      return { icon: <Film size={11} />, text: 'Video' };
    }
    if (item.type === 'pdf') {
      return { icon: <FileText size={11} />, text: 'Document' };
    }
    const words = (item.content || '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return { icon: <Clock size={11} />, text: `${minutes}m read` };
  }, [item.type, item.url, item.content]);

  // Relative timestamp with fallback
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
    } catch (_) {
      return 'Recently';
    }
  }, [item.createdAt]);

  // Clean domain display
  const cleanDomain = useMemo(() => {
    if (item.sourceDomain) return item.sourceDomain.replace(/^www\./, '');
    if (item.url) {
      try {
        return new URL(item.url).hostname.replace(/^www\./, '');
      } catch (_) {}
    }
    return null;
  }, [item.sourceDomain, item.url]);

  // Primary thumbnail calculation
  const primaryThumbnail = useMemo(() => {
    if (item.thumbnailUrl && !imgFailed) return item.thumbnailUrl;
    if (item.url) {
      const ytThumb = getYouTubeThumbnailUrl(item.url);
      if (ytThumb) return ytThumb;
    }
    return null;
  }, [item.thumbnailUrl, item.url, imgFailed]);

  // Copy link handler
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToCopy = item.url || window.location.href;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      const menuWidth = 190;
      const left = Math.min(window.innerWidth - menuWidth - 16, Math.max(16, rect.right - menuWidth));
      setMenuPos({ top: rect.bottom + 6, left });
    }
    setShowMenu(prev => !prev);
    setShowCollectionSubmenu(false);
  };

  // Close context menu on scroll or outside click
  useEffect(() => {
    if (!showMenu) return;
    const close = () => {
      setShowMenu(false);
      setShowCollectionSubmenu(false);
    };
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
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
        setShowCollectionSubmenu(false);
      }}
    >
      <div
        onClick={onClick}
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(180deg, rgba(20, 22, 38, 0.75) 0%, rgba(10, 11, 20, 0.85) 100%)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          border: isHovered ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isHovered
            ? '0 20px 48px -12px rgba(0, 0, 0, 0.8), 0 0 28px rgba(99, 102, 241, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
            : '0 8px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isHovered ? 'translateY(-2.5px)' : 'translateY(0)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Subtle Ambient Gradient Corner Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '140px',
            height: '140px',
            background: isHovered
              ? 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.18) 0%, transparent 70%)'
              : 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            transition: 'background 0.3s ease',
          }}
        />

        {/* THUMBNAIL / PREVIEW HERO */}
        {primaryThumbnail ? (
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              position: 'relative',
              overflow: 'hidden',
              background: '#090A12',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            {/* Shimmer skeleton before image decodes */}
            {!imgLoaded && !imgFailed && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.8s infinite',
                }}
              />
            )}

            <img
              src={primaryThumbnail}
              alt={item.title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imgLoaded ? 1 : 0,
                transform: isHovered ? 'scale(1.04)' : 'scale(1.0)',
                transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
              }}
            />

            {/* Bottom Scrim Vignette for High Contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(7, 8, 15, 0.2) 0%, transparent 40%, rgba(7, 8, 15, 0.75) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Reading Time / Video Duration Pill on Thumbnail */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(7, 8, 15, 0.78)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '10.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono), monospace',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              {readingMeta.icon}
              <span>{readingMeta.text}</span>
            </div>
          </div>
        ) : (
          /* Generative High-End Fallback Header for Links Without Images */
          <div
            style={{
              padding: '16px 16px 14px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Domain Favicon + Clean Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
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
                  <Globe size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                )}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.75)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '-0.01em',
                }}
              >
                {cleanDomain || typeConfig.label}
              </span>
            </div>

            {/* Reading meta on fallback */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '5px',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '10.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {readingMeta.icon}
              <span>{readingMeta.text}</span>
            </div>
          </div>
        )}

        {/* FLOATING ACTION CAPSULE (Revealed on Hover) */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(10, 11, 20, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '9px',
            padding: '3px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            opacity: isHovered || showMenu ? 1 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0),
            transform: isHovered || showMenu ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity 180ms ease, transform 180ms ease',
            zIndex: 10,
          }}
        >
          {/* Quick Copy Link */}
          {item.url && (
            <button
              onClick={handleCopyLink}
              title={copied ? 'Link copied!' : 'Copy link'}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                border: 'none',
                background: copied ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: copied ? '#34D399' : 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 140ms ease',
              }}
              onMouseEnter={e => {
                if (!copied) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={e => {
                if (!copied) e.currentTarget.style.background = 'transparent';
              }}
            >
              {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
            </button>
          )}

          {/* Quick Favorite Star */}
          <button
            onClick={e => {
              e.stopPropagation();
              onFavorite();
            }}
            title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              border: 'none',
              background: item.isFavorite ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: item.isFavorite ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
            onMouseEnter={e => {
              if (!item.isFavorite) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={e => {
              if (!item.isFavorite) e.currentTarget.style.background = 'transparent';
            }}
          >
            <Star size={13} fill={item.isFavorite ? '#F59E0B' : 'none'} strokeWidth={item.isFavorite ? 1.5 : 2} />
          </button>

          {/* Open Original */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open original website"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                border: 'none',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 140ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              <ExternalLink size={13} />
            </a>
          )}

          {/* More Options Dropdown Toggle */}
          <button
            ref={menuBtnRef}
            onClick={openMenu}
            title="More actions"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              border: 'none',
              background: showMenu ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: 'rgba(255, 255, 255, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
            onMouseEnter={e => {
              if (!showMenu) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={e => {
              if (!showMenu) e.currentTarget.style.background = 'transparent';
            }}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* CARD CONTENT BODY */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Domain Favicon + Type Tag (When thumbnail is present) */}
          {primaryThumbnail && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                {cleanDomain ? (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`}
                    alt=""
                    width={14}
                    height={14}
                    style={{ borderRadius: '3px', opacity: 0.9 }}
                    onError={e => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe size={13} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                )}
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.65)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cleanDomain || typeConfig.label}
                </span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: typeConfig.bg,
                  border: `1px solid ${typeConfig.color}25`,
                  color: typeConfig.color,
                  fontSize: '9.5px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                <span>{typeConfig.emoji}</span>
                <span>{typeConfig.label}</span>
              </div>
            </div>
          )}

          {/* Title with Smooth Hover Tint */}
          <h3
            style={{
              fontSize: '14.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-heading), sans-serif',
              letterSpacing: '-0.02em',
              color: isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.94)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
              transition: 'color 160ms ease',
            }}
          >
            {item.title}
          </h3>

          {/* AI Executive Summary / Key Takeaway */}
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.65)',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
            }}
          >
            {item.summary}
          </p>

          {/* TAGS & COLLECTIONS PILLS */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
            {item.tags.slice(0, 3).map(tag => {
              const color = TAG_COLORS[tag] || '#818CF8';
              return (
                <span
                  key={tag}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: `${color}14`,
                    color: color,
                    border: `1px solid ${color}28`,
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  #{tag}
                </span>
              );
            })}

            {item.tags.length > 3 && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.35)',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                +{item.tags.length - 3}
              </span>
            )}

            {item.aiProcessed && (
              <span
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: '#A5B4FC',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono), monospace',
                  letterSpacing: '0.06em',
                }}
              >
                <Sparkles size={9} style={{ color: '#06B6D4' }} />
                AI ENRICHED
              </span>
            )}
          </div>

          {/* FOOTER BAR: Timestamp + Interactive Action Indicator */}
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.42)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '10.5px' }}>{timeAgo}</span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isHovered ? '#818CF8' : 'rgba(255, 255, 255, 0.45)',
                fontWeight: 600,
                fontSize: '11px',
                transition: 'color 160ms ease',
              }}
            >
              <span>Explore</span>
              <ArrowUpRight
                size={12}
                style={{
                  transform: isHovered ? 'translate(2px, -2px)' : 'translate(0, 0)',
                  transition: 'transform 200ms ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Favorite Top Dot Badge */}
        {item.isFavorite && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#F59E0B',
              boxShadow: '0 0 10px #F59E0B',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* PORTAL CONTEXT MENU (Escapes All Clipping Containers) */}
      {showMenu &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              background: 'rgba(15, 17, 30, 0.96)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '6px',
              zIndex: 99999,
              minWidth: '190px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              animation: 'fadeIn 0.15s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {[
              { icon: <Edit2 size={13} />, label: 'Edit Memory', action: onEdit },
              {
                icon: <Star size={13} />,
                label: item.isFavorite ? 'Remove Favorite' : 'Mark Favorite',
                action: onFavorite,
              },
              {
                icon: <Copy size={13} />,
                label: 'Copy URL',
                action: () => {
                  if (item.url) navigator.clipboard.writeText(item.url);
                },
              },
              {
                icon: <FolderPlus size={13} />,
                label: 'Add to Collection',
                action: () => setShowCollectionSubmenu(prev => !prev),
                submenu: true,
              },
              {
                icon: <ExternalLink size={13} />,
                label: 'Open Source',
                action: () => item.url && window.open(item.url, '_blank'),
              },
              { icon: <Trash2 size={13} />, label: 'Delete', action: () => onDelete(), danger: true },
            ].map(({ icon, label, action, danger, submenu }) => (
              <div key={label} style={{ position: 'relative' }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    action();
                    if (!submenu) setShowMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    color: danger ? '#EF4444' : 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.14s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = danger
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = danger ? '#EF4444' : '#FFFFFF';
                    if (label === 'Add to Collection') setShowCollectionSubmenu(true);
                    else setShowCollectionSubmenu(false);
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = danger ? '#EF4444' : 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  <span style={{ color: danger ? '#EF4444' : 'rgba(255, 255, 255, 0.6)' }}>{icon}</span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {submenu && <ChevronRight size={11} style={{ opacity: 0.5 }} />}
                </button>

                {/* Submenu for Collections */}
                {submenu && showCollectionSubmenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: '100%',
                      marginRight: '8px',
                      background: 'rgba(15, 17, 30, 0.96)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      padding: '6px',
                      minWidth: '160px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                    }}
                  >
                    {collections.length === 0 ? (
                      <div
                        style={{
                          padding: '8px 10px',
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.4)',
                          fontStyle: 'italic',
                        }}
                      >
                        No collections
                      </div>
                    ) : (
                      collections.map(c => {
                        const isMember = itemCollections.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={e => {
                              e.stopPropagation();
                              if (isMember) {
                                onRemoveFromCollection?.(c.id);
                              } else {
                                onAddToCollection(c.id);
                              }
                              setShowMenu(false);
                              setShowCollectionSubmenu(false);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 10px',
                              borderRadius: '7px',
                              border: 'none',
                              background: isMember ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: isMember ? '#C7D2FE' : 'rgba(255, 255, 255, 0.75)',
                              textAlign: 'left',
                              transition: 'all 0.14s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = isMember
                                ? 'rgba(99, 102, 241, 0.28)'
                                : 'rgba(255, 255, 255, 0.08)';
                              e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = isMember
                                ? 'rgba(99, 102, 241, 0.18)'
                                : 'transparent';
                              e.currentTarget.style.color = isMember ? '#C7D2FE' : 'rgba(255, 255, 255, 0.75)';
                            }}
                          >
                            <span>{c.emoji}</span>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.name}
                            </span>
                            {isMember && <Check size={12} style={{ color: '#818CF8' }} />}
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
