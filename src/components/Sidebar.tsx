'use client';

import { useState, useEffect, useMemo } from 'react';
import NextLink from 'next/link';
import {
  Search,
  Plus,
  Star,
  Sparkles,
  Hash,
  ChevronRight,
  LayoutGrid,
  Settings,
  Zap,
  Link as LinkIcon,
  FileText,
  File,
  MessageSquare,
  Video,
  FolderKanban,
  X,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  HardDrive,
  CheckCircle2,
  Tag as TagIcon,
  ArrowUpDown,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { Collection } from '@/lib/db-collections';
import type { MemoryItem } from '@/lib/data';
import { UserButton, useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_PRESET_TAGS = ['AI', 'Design', 'Business', 'Research', 'Productivity', 'Philosophy'];

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSearchOpen: () => void;
  onCaptureOpen: () => void;
  onCreateCollectionOpen: () => void;
  onSettingsOpen: () => void;
  onDeleteCollection: (collectionId: string) => void;
  itemCounts: Record<string, number>;
  collections: Collection[];
  items?: MemoryItem[];
  user?: any;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  activeFilter,
  onFilterChange,
  onSearchOpen,
  onCaptureOpen,
  onCreateCollectionOpen,
  onSettingsOpen,
  onDeleteCollection,
  itemCounts,
  collections,
  items,
  user,
  isOpen,
  onClose,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandCollections, setExpandCollections] = useState(true);
  const [expandByType, setExpandByType] = useState(true);
  const [expandTags, setExpandTags] = useState(true);
  const [tagSortBy, setTagSortBy] = useState<'count' | 'name'>('count');
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Dynamically compute all unique tags from items + fallback preset tags
  const tagCountsMap = useMemo(() => {
    const counts: Record<string, number> = {};

    // Seed preset tags with 0 count initial state
    DEFAULT_PRESET_TAGS.forEach(t => {
      counts[t] = 0;
    });

    if (items && items.length > 0) {
      items.forEach(item => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach(tag => {
            const clean = tag.trim();
            if (clean) {
              counts[clean] = (counts[clean] || 0) + 1;
            }
          });
        }
      });
    }

    return counts;
  }, [items]);

  const sortedTags = useMemo(() => {
    let list = Object.entries(tagCountsMap).map(([tag, count]) => ({ tag, count }));

    if (tagSearchQuery.trim()) {
      const q = tagSearchQuery.toLowerCase();
      list = list.filter(item => item.tag.toLowerCase().includes(q));
    }

    if (tagSortBy === 'count') {
      list.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    } else {
      list.sort((a, b) => a.tag.localeCompare(b.tag));
    }

    return list;
  }, [tagCountsMap, tagSortBy, tagSearchQuery]);
  const [hoveredCollectionId, setHoveredCollectionId] = useState<string | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize and persist collapsed state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('secondmind_sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch (_) {}
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('secondmind_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Global hotkey: Cmd/Ctrl + B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isGuest = user?.id === 'guest' || !user?.id;
  const { signOut } = useClerk();
  const totalItems = itemCounts.all || 0;
  const maxGuestItems = 25;
  const usedPercent = Math.min(100, Math.round((totalItems / maxGuestItems) * 100));

  const navItems = [
    { id: 'all', label: 'All Memory', icon: <LayoutGrid size={18} />, count: itemCounts.all, shortcut: '1' },
    { id: 'favorites', label: 'Favorites', icon: <Star size={18} />, count: itemCounts.favorites, shortcut: '2' },
    { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles size={18} />, count: null, isAi: true, shortcut: '3' },
    { id: 'recent', label: 'Recently Added', icon: <Zap size={18} />, count: null, shortcut: '4' },
  ];

  const typeItems = [
    { id: 'link', label: 'Links', icon: <LinkIcon size={16} />, count: itemCounts.link },
    { id: 'note', label: 'Notes', icon: <FileText size={16} />, count: itemCounts.note },
    { id: 'pdf', label: 'PDFs', icon: <File size={16} />, count: itemCounts.pdf },
    { id: 'tweet', label: 'Tweets', icon: <MessageSquare size={16} />, count: itemCounts.tweet },
    { id: 'video', label: 'Videos', icon: <Video size={16} />, count: itemCounts.video },
  ];

  return (
    <motion.aside
      initial={false}
      animate={isMobile ? { width: 'auto' } : { width: isCollapsed ? 76 : 280 }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}
      style={{
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: isCollapsed && !isMobile ? '20px 10px' : '20px 16px',
        paddingBottom: isMobile ? 'calc(90px + env(safe-area-inset-bottom, 0px))' : '20px',
        gap: '20px',
        background: 'linear-gradient(180deg, rgba(14, 15, 27, 0.94) 0%, rgba(7, 8, 17, 0.98) 100%)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        position: isMobile ? undefined : 'relative',
        zIndex: 25,
      }}
    >
      {/* AMBIENT BACKGROUND GLOW ORBS (Electric Violet & Cyan) */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          left: isCollapsed ? '-60px' : '-20px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.22) 0%, transparent 55%)',
          pointerEvents: 'none',
          zIndex: -1,
          transition: 'left 0.3s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '-50px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.14) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* BRAND HEADER & COLLAPSE TOGGLE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', minHeight: '42px' }}>
          <NextLink
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            title="Load Hero Landing Page"
          >
            {/* Luminous Logo Container */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '13px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(220, 225, 250, 0.85) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <img
                src="/logo.png"
                alt="SecondMind Logo"
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#08080D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a3 3 0 1 0-6 0"/></svg>`;
                  }
                }}
              />
            </motion.div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1
                    style={{
                      fontSize: '17px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                      fontFamily: 'var(--font-outfit), sans-serif',
                    }}
                  >
                    SecondMind
                  </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#06B6D4',
                      boxShadow: '0 0 8px #06B6D4',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.42)',
                      letterSpacing: '0.14em',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    AI MEMORY BANK
                  </span>
                </div>
              </motion.div>
            )}
          </NextLink>

          {/* Desktop Collapse & Mobile Close Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {!isCollapsed && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleCollapsed}
                className="hide-xs"
                title="Collapse sidebar (⌘B)"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'rgba(255, 255, 255, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                }}
              >
                <PanelLeftClose size={16} />
              </motion.button>
            )}

            {onClose && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="mobile-menu-btn"
                title="Close sidebar"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </motion.button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="btn btn-ghost btn-icon mobile-menu-btn"
                style={{ padding: '6px', color: 'rgba(255,255,255,0.6)' }}
                title="Close sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH BAR / SEARCH ICON BUTTON */}
        {isCollapsed ? (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.08, borderColor: 'rgba(99, 102, 241, 0.5)', backgroundColor: 'rgba(99, 102, 241, 0.12)' }}
              whileTap={{ scale: 0.94 }}
              onClick={onSearchOpen}
              onMouseEnter={() => setHoveredTooltip('Search (⌘K)')}
              onMouseLeave={() => setHoveredTooltip(null)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.045)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 180ms ease',
              }}
            >
              <Search size={18} />
            </motion.button>
            <AnimatePresence>
              {hoveredTooltip === 'Search (⌘K)' && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  style={{
                    position: 'absolute',
                    left: '56px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0F111E',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Search</span>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>⌘K</kbd>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            whileHover={{ borderColor: 'rgba(99, 102, 241, 0.45)', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
            whileTap={{ scale: 0.99 }}
            onClick={onSearchOpen}
            style={{
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 'inset 0 1px rgba(255, 255, 255, 0.04)',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 200ms ease-out',
            }}
          >
            <Search size={16} style={{ color: 'rgba(255, 255, 255, 0.45)' }} />
            <span style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.4)', flex: 1 }}>Search memory...</span>
            <kbd
              style={{
                padding: '2px 6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              ⌘K
            </kbd>
          </motion.div>
        )}

        {/* PRIMARY CTA: SAVE TO MEMORY */}
        {isCollapsed ? (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.6)' }}
              whileTap={{ scale: 0.94 }}
              onClick={onCaptureOpen}
              onMouseEnter={() => setHoveredTooltip('Save to Memory (C)')}
              onMouseLeave={() => setHoveredTooltip(null)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 180ms ease',
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
            </motion.button>
            <AnimatePresence>
              {hoveredTooltip === 'Save to Memory (C)' && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  style={{
                    position: 'absolute',
                    left: '56px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0F111E',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Save to Memory</span>
                  <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>C</kbd>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            whileHover={{
              translateY: -1.5,
              boxShadow: '0 12px 36px rgba(99, 102, 241, 0.45)',
              filter: 'brightness(1.06)',
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onCaptureOpen}
            style={{
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: '0 6px 24px rgba(99, 102, 241, 0.35)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 200ms ease-out',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>Save to Memory</span>
            <span
              style={{
                marginLeft: 'auto',
                marginRight: '6px',
                padding: '1px 5px',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '5px',
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              C
            </span>
          </motion.button>
        )}
      </div>

      {/* PRIMARY NAVIGATION ITEMS */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ id, label, icon, count, isAi, shortcut }) => {
          const isActive = activeFilter === id;
          return (
            <div key={id} style={{ position: 'relative', display: 'flex', justifyContent: isCollapsed ? 'center' : 'stretch' }}>
              <motion.button
                whileHover={{
                  x: isCollapsed ? 0 : 3,
                  backgroundColor: isActive ? undefined : 'rgba(255, 255, 255, 0.05)',
                  scale: isCollapsed ? 1.08 : 1,
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onFilterChange(id)}
                onMouseEnter={() => isCollapsed && setHoveredTooltip(id)}
                onMouseLeave={() => isCollapsed && setHoveredTooltip(null)}
                style={{
                  position: 'relative',
                  height: isCollapsed ? '42px' : '40px',
                  width: isCollapsed ? '42px' : '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '12px',
                  padding: isCollapsed ? '0' : '0 12px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.22), rgba(6, 182, 212, 0.08))'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                  cursor: 'pointer',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  textAlign: 'left',
                  boxShadow: isActive ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 14px rgba(99, 102, 241, 0.15)' : 'none',
                  transition: 'all 160ms ease-out',
                }}
              >
                {/* Glowing Active Indicator Strip (Expanded mode) */}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={{
                      position: 'absolute',
                      left: 0,
                      width: '3.5px',
                      height: '22px',
                      borderRadius: '0 4px 4px 0',
                      background: 'linear-gradient(180deg, #818CF8, #6366F1)',
                      boxShadow: '0 0 12px #6366F1',
                    }}
                  />
                )}

                {/* Glowing Dot (Collapsed mode) */}
                {isActive && isCollapsed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#818CF8',
                      boxShadow: '0 0 8px #6366F1',
                    }}
                  />
                )}

                <span
                  style={{
                    color: isActive ? '#A5B4FC' : isAi ? '#06B6D4' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </span>

                {!isCollapsed && <span style={{ flex: 1, letterSpacing: '-0.01em' }}>{label}</span>}

                {!isCollapsed && count !== null && count !== undefined && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      background: isActive ? 'rgba(99, 102, 241, 0.32)' : 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: isActive ? '#E0E7FF' : count === 0 ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.65)',
                      fontFamily: 'var(--font-mono), monospace',
                    }}
                  >
                    {count}
                  </span>
                )}
              </motion.button>

              {/* Floating Tooltip in Collapsed Rail */}
              <AnimatePresence>
                {isCollapsed && hoveredTooltip === id && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    style={{
                      position: 'absolute',
                      left: '56px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#0F111E',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      zIndex: 100,
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{label}</span>
                    {count !== null && count !== undefined && (
                      <span style={{ color: '#818CF8', fontSize: '11px', fontFamily: 'var(--font-mono), monospace' }}>{count}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* COLLECTIONS SECTION */}
      {!isCollapsed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => setExpandCollections(!expandCollections)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.42)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              <ChevronRight
                size={12}
                style={{
                  transition: 'transform 200ms ease',
                  transform: expandCollections ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
              <FolderKanban size={13} style={{ color: '#818CF8', flexShrink: 0 }} />
              COLLECTIONS
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90, color: '#818CF8' }}
              whileTap={{ scale: 0.9 }}
              title="Create collection"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px',
                transition: 'color 160ms ease',
              }}
              onClick={onCreateCollectionOpen}
            >
              <Plus size={14} />
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
            {expandCollections && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}
              >
                {collections.map(collection => {
                  const isActive = activeFilter === `collection:${collection.id}`;
                  const isHovered = hoveredCollectionId === collection.id;
                  return (
                    <div
                      key={collection.id}
                      style={{ position: 'relative' }}
                      onMouseEnter={() => setHoveredCollectionId(collection.id)}
                      onMouseLeave={() => setHoveredCollectionId(null)}
                    >
                      <motion.button
                        whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.045)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onFilterChange(`collection:${collection.id}`)}
                        style={{
                          height: '36px',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '0 12px',
                          paddingRight: isHovered ? '36px' : '12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                          color: isActive ? '#C7D2FE' : 'rgba(255, 255, 255, 0.65)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 450,
                          textAlign: 'left',
                          transition: 'all 150ms ease-out',
                        }}
                      >
                        <span style={{ fontSize: '14px', lineHeight: 1 }}>{collection.emoji}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {collection.name}
                        </span>
                        {collection.isSmart && <Sparkles size={11} style={{ color: '#06B6D4', flexShrink: 0 }} />}
                      </motion.button>

                      {/* Delete button */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.12 }}
                            onClick={e => {
                              e.stopPropagation();
                              onDeleteCollection(collection.id);
                            }}
                            title="Delete collection"
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: 'rgba(239, 68, 68, 0.8)',
                              borderRadius: '5px',
                              width: '22px',
                              height: '22px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                              e.currentTarget.style.color = '#EF4444';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                              e.currentTarget.style.color = 'rgba(239, 68, 68, 0.8)';
                            }}
                          >
                            <Trash2 size={11} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {collections.length === 0 && (
                  <div style={{ padding: '6px 12px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)', fontStyle: 'italic' }}>
                    No collections yet
                  </div>
                )}
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Collapsed Collections Quick Access */
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleCollapsed}
            onMouseEnter={() => setHoveredTooltip('Collections')}
            onMouseLeave={() => setHoveredTooltip(null)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'rgba(255, 255, 255, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <FolderKanban size={18} />
          </motion.button>
          <AnimatePresence>
            {hoveredTooltip === 'Collections' && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                style={{
                  position: 'absolute',
                  left: '56px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#0F111E',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none',
                }}
              >
                Collections ({collections.length})
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* BY TYPE SECTION */}
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ padding: '0 6px' }}>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => setExpandByType(!expandByType)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.42)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              <ChevronRight
                size={12}
                style={{
                  transition: 'transform 200ms ease',
                  transform: expandByType ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
              BY TYPE
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
            {expandByType && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}
              >
                {typeItems.map(({ id, label, icon, count }) => {
                  const isActive = activeFilter === id;
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.045)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFilterChange(id)}
                      style={{
                        height: '36px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                        color: isActive ? '#C7D2FE' : 'rgba(255, 255, 255, 0.65)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 450,
                        textAlign: 'left',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      <span style={{ color: isActive ? '#818CF8' : 'inherit' }}>{icon}</span>
                      <span style={{ flex: 1 }}>{label}</span>
                      {count !== undefined && count > 0 && (
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.38)', fontFamily: 'var(--font-mono), monospace' }}>{count}</span>
                      )}
                    </motion.button>
                  );
                })}
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* SORT BY CATEGORY / TAGS SECTION */}
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => setExpandTags(!expandTags)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.42)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              <ChevronRight
                size={12}
                style={{
                  transition: 'transform 200ms ease',
                  transform: expandTags ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
              <TagIcon size={12} style={{ color: '#06B6D4', flexShrink: 0 }} />
              TAGS & TOPICS
            </motion.button>

            {/* Sort Order Switcher (Count vs A-Z) */}
            {expandTags && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '6px',
                  padding: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setTagSortBy('count')}
                  title="Sort by item count (Popular)"
                  style={{
                    border: 'none',
                    background: tagSortBy === 'count' ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
                    color: tagSortBy === 'count' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono), monospace',
                    transition: 'all 120ms ease',
                  }}
                >
                  Popular
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setTagSortBy('name')}
                  title="Sort alphabetically (A-Z)"
                  style={{
                    border: 'none',
                    background: tagSortBy === 'name' ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
                    color: tagSortBy === 'name' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono), monospace',
                    transition: 'all 120ms ease',
                  }}
                >
                  A-Z
                </motion.button>
              </div>
            )}
          </div>

          <AnimatePresence initial={false}>
            {expandTags && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}
              >
                {/* Search filter for tags if tag list is large */}
                {sortedTags.length > 5 && (
                  <div style={{ padding: '0 4px', marginBottom: '2px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                      }}
                    >
                      <Search size={11} style={{ color: 'rgba(255, 255, 255, 0.35)' }} />
                      <input
                        type="text"
                        placeholder="Filter tags..."
                        value={tagSearchQuery}
                        onChange={e => setTagSearchQuery(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          width: '100%',
                        }}
                      />
                      {tagSearchQuery && (
                        <button
                          onClick={() => setTagSearchQuery('')}
                          style={{ border: 'none', background: 'transparent', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tag Pills Grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '0 4px' }}>
                  {sortedTags.map(({ tag, count }) => {
                    const isActive = activeFilter === `tag:${tag}`;
                    return (
                      <motion.button
                        key={tag}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.18)', borderColor: 'rgba(99, 102, 241, 0.45)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onFilterChange(`tag:${tag}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 9px',
                          borderRadius: '999px',
                          border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                          background: isActive
                            ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.28), rgba(6, 182, 212, 0.12))'
                            : 'rgba(255, 255, 255, 0.035)',
                          color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: isActive ? 600 : 500,
                          transition: 'all 150ms ease-out',
                          boxShadow: isActive ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none',
                        }}
                      >
                        <Hash size={10} style={{ color: isActive ? '#A5B4FC' : 'rgba(255, 255, 255, 0.4)' }} />
                        <span>{tag}</span>
                        {count > 0 && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '999px',
                              background: isActive ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                              color: isActive ? '#E0E7FF' : 'rgba(255, 255, 255, 0.45)',
                              fontFamily: 'var(--font-mono), monospace',
                              marginLeft: '2px',
                            }}
                          >
                            {count}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}

                  {sortedTags.length === 0 && (
                    <div style={{ padding: '6px 8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)', fontStyle: 'italic' }}>
                      No matching tags found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* FOOTER & PROFILE SECTION */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Memory Capacity Telemetry (Only when expanded) */}
        {!isCollapsed && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={12} style={{ color: '#06B6D4' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
                  {isGuest ? 'Local Sandbox' : 'Cloud Sync'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 6px #10B981',
                  }}
                />
                <span style={{ fontSize: '10px', color: '#34D399', fontWeight: 600 }}>Active</span>
              </div>
            </div>

            {/* Storage Progress Bar */}
            {isGuest ? (
              <>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${usedPercent}%`,
                      height: '100%',
                      background: usedPercent > 80 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' : 'linear-gradient(90deg, #6366F1, #06B6D4)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  <span>{totalItems} / {maxGuestItems} saved</span>
                  <span>{usedPercent}% capacity</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.45)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={11} style={{ color: '#10B981' }} />
                <span>Encrypted & Backed up</span>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS BUTTON */}
        {isCollapsed ? (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              whileTap={{ scale: 0.94 }}
              onClick={onSettingsOpen}
              onMouseEnter={() => setHoveredTooltip('Settings')}
              onMouseLeave={() => setHoveredTooltip(null)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Settings size={18} />
            </motion.button>
            <AnimatePresence>
              {hoveredTooltip === 'Settings' && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  style={{
                    position: 'absolute',
                    left: '56px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#0F111E',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    pointerEvents: 'none',
                  }}
                >
                  Settings
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.045)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onSettingsOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 150ms ease-out',
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </motion.button>
        )}

        {/* USER CARD */}
        {isCollapsed ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10 rounded-xl border border-[rgba(255,255,255,0.18)] shadow-md',
                },
              }}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 rounded-xl border border-[rgba(255,255,255,0.18)]',
                },
              }}
            />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '-0.01em',
                }}
              >
                {user?.fullName || user?.email || (isGuest ? 'Guest Explorer' : 'Julian Scientist')}
              </div>
              <div
                style={{
                  fontSize: '9.5px',
                  color: isGuest ? '#F59E0B' : '#06B6D4',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-mono), monospace',
                  marginTop: '1px',
                }}
              >
                {isGuest ? 'FREE GUEST PREVIEW' : 'PRO MEMBER'}
              </div>
            </div>

            {/* Expand / Rail Mode Quick Toggle in Footer */}
            <motion.button
              whileHover={{ scale: 1.15, color: '#818CF8' }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCollapsed}
              className="hide-xs"
              title="Collapse to icon rail"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.35)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PanelLeftClose size={14} />
            </motion.button>
          </div>
        )}

        {/* 3 Quick Mode Actions in Sidebar Footer (Only when expanded) */}
        {!isCollapsed && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '4px',
              marginTop: '4px',
              padding: '3px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* 1. Sign In */}
            <button
              onClick={() => { window.location.href = '/login'; }}
              title="Sign in with Google or Email"
              style={{
                padding: '5px 4px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.12s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.color = '#A5B4FC'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
            >
              <LogIn size={12} />
              <span>Sign In</span>
            </button>

            {/* 2. Guest Login */}
            <button
              onClick={() => {
                document.cookie = 'guest_mode=true; path=/; max-age=31536000; SameSite=Lax';
                document.cookie = 'guest_seed_demo=true; path=/; max-age=600; SameSite=Lax';
                window.location.href = '/app';
              }}
              title="Switch to Guest Mode (Local Storage)"
              style={{
                padding: '5px 4px',
                borderRadius: '6px',
                border: 'none',
                background: isGuest ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: isGuest ? '#34D399' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.12s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'; e.currentTarget.style.color = '#34D399'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = isGuest ? 'rgba(16, 185, 129, 0.2)' : 'transparent'; e.currentTarget.style.color = isGuest ? '#34D399' : 'rgba(255, 255, 255, 0.7)'; }}
            >
              <UserCheck size={12} />
              <span>Guest</span>
            </button>

            {/* 3. Sign Out */}
            <button
              onClick={async () => {
                document.cookie = 'guest_mode=; path=/; max-age=0';
                document.cookie = 'guest_seed_demo=; path=/; max-age=0';
                if (isGuest) {
                  window.location.href = '/login';
                } else {
                  await signOut({ redirectUrl: '/login' });
                }
              }}
              title="Sign out of current session"
              style={{
                padding: '5px 4px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#F87171',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.12s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Developer Credit Footer */}
        {!isCollapsed && (
          <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.35)', textAlign: 'center', marginTop: '2px', fontWeight: 500 }}>
            © Developed by Aseer Awsaf
          </div>
        )}
      </div>
      </div>
    </motion.aside>
  );
}
