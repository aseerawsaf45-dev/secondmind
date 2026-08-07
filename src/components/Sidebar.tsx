'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Star,
  Sparkles,
  Hash,
  ChevronRight,
  LayoutGrid,
  Settings,
  HelpCircle,
  Zap,
  Link as LinkIcon,
  FileText,
  File,
  MessageSquare,
  Video,
  FolderKanban,
} from 'lucide-react';
import { Collection } from '@/lib/db-collections';
import { TAG_COLORS } from '@/lib/data';
import { UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

const TOP_TAGS = ['AI', 'Design', 'Business', 'Research', 'Productivity', 'Philosophy'];

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSearchOpen: () => void;
  onCaptureOpen: () => void;
  onCreateCollectionOpen: () => void;
  onSettingsOpen: () => void;
  itemCounts: Record<string, number>;
  collections: Collection[];
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
  itemCounts,
  collections,
  user,
  isOpen,
  onClose,
}: SidebarProps) {
  const [expandCollections, setExpandCollections] = useState(true);
  const [expandByType, setExpandByType] = useState(true);
  const [expandTags, setExpandTags] = useState(false);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}
      style={{
        width: '280px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        gap: '22px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.018) 100%)',
        backgroundColor: '#08080D',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        zIndex: 20,
      }}
    >
      {/* 16. AMBIENT BACKGROUND GLOW (Emerald & Cyan) */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          left: '-40px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 20% 10%, rgba(16, 185, 129, 0.15) 0%, transparent 45%)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 45%)',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* 3 & 4. BRAND HEADER WITH BREATHING LOGO HIGHLIGHT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Translucent White Logo Icon Container */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '13px',
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="SecondMind Logo"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
              onError={(e) => {
                // If logo.png fails to load, render dark SVG icon
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#08080D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a3 3 0 1 0-6 0"/></svg>`;
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              SecondMind
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.38)', letterSpacing: '0.12em' }}>
                AI MEMORY
              </span>
            </div>
          </div>
        </div>

        {/* 5. SEARCH BAR */}
        <motion.div
          whileHover={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}
          whileTap={{ scale: 0.99 }}
          onClick={onSearchOpen}
          style={{
            height: '44px',
            borderRadius: '13px',
            background: 'rgba(255, 255, 255, 0.045)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px rgba(255, 255, 255, 0.04)',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 200ms ease-out',
          }}
        >
          <Search size={18} style={{ color: 'rgba(255, 255, 255, 0.45)' }} />
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', flex: 1 }}>Search memory...</span>
          <kbd
            style={{
              padding: '2px 6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            ⌘K
          </kbd>
        </motion.div>

        {/* 6. SAVE TO MEMORY PRIMARY CTA BUTTON (Neon Emerald Gradient) */}
        <motion.button
          whileHover={{ translateY: -1, boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onCaptureOpen}
          style={{
            height: '45px',
            borderRadius: '13px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 180ms ease-out',
          }}
        >
          <Plus size={18} />
          Save to Memory
        </motion.button>
      </div>

      {/* 7, 8, 9 & 10. PRIMARY NAVIGATION */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {[
          { id: 'all', label: 'All Memory', icon: <LayoutGrid size={18} />, count: itemCounts.all },
          { id: 'favorites', label: 'Favorites', icon: <Star size={18} />, count: itemCounts.favorites },
          { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles size={18} />, count: null, isAi: true },
          { id: 'recent', label: 'Recently Added', icon: <Zap size={18} />, count: null },
        ].map(({ id, label, icon, count, isAi }) => {
          const isActive = activeFilter === id;
          return (
            <motion.button
              key={id}
              whileHover={{ x: 2, backgroundColor: isActive ? undefined : 'rgba(255, 255, 255, 0.045)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange(id)}
              style={{
                position: 'relative',
                height: '42px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 14px',
                borderRadius: '10px',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.08))'
                  : 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                boxShadow: isActive ? 'inset 0 1px rgba(255, 255, 255, 0.04)' : 'none',
                transition: 'all 150ms ease-out',
              }}
            >
              {/* Active Left Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: '3px',
                    height: '20px',
                    borderRadius: '999px',
                    background: 'linear-gradient(180deg, #34D399, #10B981)',
                  }}
                />
              )}

              <span style={{ color: isActive ? '#34D399' : isAi ? '#06B6D4' : 'inherit' }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>

              {/* Badges / Counters */}
              {count !== null && count !== undefined && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(16, 185, 129, 0.30)' : 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#A7F3D0' : count === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* 11 & 12. COLLECTIONS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.38)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <ChevronRight
              size={12}
              style={{
                transition: 'transform 200ms ease',
                transform: expandCollections ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
            <FolderKanban size={13} style={{ color: '#10B981', flexShrink: 0 }} />
            COLLECTIONS
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            title="Create collection"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}
            >
              {collections.map(collection => {
                const isActive = activeFilter === `collection:${collection.id}`;
                return (
                  <motion.button
                    key={collection.id}
                    whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onFilterChange(`collection:${collection.id}`)}
                    style={{
                      height: '38px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: isActive ? '#A7F3D0' : 'rgba(255, 255, 255, 0.65)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'left',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{collection.emoji}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {collection.name}
                    </span>
                    {collection.isSmart && <Sparkles size={11} style={{ color: '#10B981', flexShrink: 0 }} />}
                  </motion.button>
                );
              })}
              {collections.length === 0 && (
                <div style={{ padding: '6px 14px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)', fontStyle: 'italic' }}>
                  No collections yet
                </div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* 13. BY TYPE SECTION (Collapsible) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '0 6px' }}>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setExpandByType(!expandByType)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.38)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
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
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflow: 'hidden' }}
            >
              {[
                { id: 'link', label: 'Links', icon: <LinkIcon size={16} />, count: itemCounts.link },
                { id: 'note', label: 'Notes', icon: <FileText size={16} />, count: itemCounts.note },
                { id: 'pdf', label: 'PDFs', icon: <File size={16} />, count: itemCounts.pdf },
                { id: 'tweet', label: 'Tweets', icon: <MessageSquare size={16} />, count: itemCounts.tweet },
                { id: 'video', label: 'Videos', icon: <Video size={16} />, count: itemCounts.video },
              ].map(({ id, label, icon, count }) => {
                const isActive = activeFilter === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onFilterChange(id)}
                    style={{
                      height: '38px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: isActive ? '#A7F3D0' : 'rgba(255, 255, 255, 0.65)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'left',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    <span style={{ color: isActive ? '#34D399' : 'inherit' }}>{icon}</span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {count !== undefined && count > 0 && (
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)' }}>{count}</span>
                    )}
                  </motion.button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* 14. TOP TAGS SECTION WITH COLLAPSIBLE TOGGLE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setExpandTags(!expandTags)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.38)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <ChevronRight
              size={12}
              style={{
                transition: 'transform 200ms ease',
                transform: expandTags ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
            TOP TAGS
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {expandTags && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 4px', overflow: 'hidden' }}
            >
              {TOP_TAGS.map(tag => {
                const isActive = activeFilter === `tag:${tag}`;
                return (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: 'rgba(255,255,255,0.9)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onFilterChange(`tag:${tag}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '999px',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                      background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.035)',
                      color: isActive ? '#A7F3D0' : 'rgba(255, 255, 255, 0.60)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 500,
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    <Hash size={10} />
                    {tag}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER & PROFILE */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <motion.button
            whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
            onClick={onSettingsOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 150ms ease-out',
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </motion.button>
        </div>

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 rounded-xl border border-[rgba(255,255,255,0.15)]',
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
              }}
            >
              {user?.fullName || user?.email || 'Julian Scientist'}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pro Member
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
