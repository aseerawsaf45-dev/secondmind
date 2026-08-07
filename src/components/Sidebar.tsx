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
  History,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  File,
  MessageSquare,
  Video,
} from 'lucide-react';
import { Collection } from '@/lib/db-collections';
import { TAG_COLORS } from '@/lib/data';
import { UserButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

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

  return (
    <aside
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
        padding: '24px 20px',
        gap: '24px',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        overflowY: 'auto',
        zIndex: 20,
      }}
    >
      {/* Ambient background glow gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: -1,
          background:
            'radial-gradient(circle at 15% 10%, rgba(124, 58, 237, 0.15) 0%, transparent 40%), radial-gradient(circle at 85% 90%, rgba(76, 215, 246, 0.1) 0%, transparent 40%)',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="group cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(210,187,255,0.4)' }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 0 15px rgba(210, 187, 255, 0.2)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            <img src="/logo.png" alt="SecondMind Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-heading)',
                lineHeight: 1.2,
              }}
            >
              SecondMind
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(204, 195, 216, 0.6)', letterSpacing: '0.08em' }}>
                AI MEMORY
              </span>
              <kbd
                style={{
                  fontSize: '9px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  color: 'rgba(232, 223, 238, 0.8)',
                }}
              >
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Search Input Button */}
        <motion.div
          whileHover={{ scale: 1.01, borderColor: 'rgba(124, 58, 237, 0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onSearchOpen}
          style={{
            position: 'relative',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Search size={16} style={{ color: 'rgba(204, 195, 216, 0.5)' }} />
          <span style={{ fontSize: '14px', color: 'rgba(232, 223, 238, 0.4)', flex: 1 }}>Search memory...</span>
        </motion.div>

        {/* Action Button: Save to Memory */}
        <motion.button
          whileHover={{ scale: 1.02, translateY: -2, boxShadow: '0 12px 24px -4px rgba(124, 58, 237, 0.6)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onCaptureOpen}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={18} />
          Save to Memory
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[
          { id: 'all', label: 'All Memory', icon: <LayoutGrid size={18} />, count: itemCounts.all },
          { id: 'favorites', label: 'Favorites', icon: <Star size={18} />, count: itemCounts.favorites },
          { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles size={18} />, count: null },
          { id: 'recent', label: 'Recently Added', icon: <Zap size={18} />, count: null },
        ].map(({ id, label, icon, count }) => {
          const isActive = activeFilter === id;
          return (
            <motion.button
              key={id}
              whileHover={{ x: 4, background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(204, 195, 216, 0.8)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ color: isActive ? '#D2BBFF' : 'inherit' }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count !== null && count !== undefined && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(124, 58, 237, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#D2BBFF' : 'rgba(204, 195, 216, 0.6)',
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Smart Collections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setExpandCollections(!expandCollections)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              color: 'rgba(204, 195, 216, 0.4)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            <ChevronRight
              size={12}
              style={{
                transition: 'transform 0.2s ease',
                transform: expandCollections ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
            COLLECTIONS
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            title="Create collection"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'rgba(204, 195, 216, 0.6)',
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

        {expandCollections && (
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {collections.map(collection => {
              const isActive = activeFilter === `collection:${collection.id}`;
              return (
                <motion.button
                  key={collection.id}
                  whileHover={{ x: 4, color: '#FFFFFF' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onFilterChange(`collection:${collection.id}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                    color: isActive ? '#D2BBFF' : 'rgba(204, 195, 216, 0.7)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{collection.emoji}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {collection.name}
                  </span>
                  {collection.isSmart && <Sparkles size={11} style={{ color: '#4CD7F6', flexShrink: 0 }} />}
                </motion.button>
              );
            })}
            {collections.length === 0 && (
              <div style={{ padding: '6px 14px', fontSize: '12px', color: 'rgba(204, 195, 216, 0.4)', fontStyle: 'italic' }}>
                No collections yet
              </div>
            )}
          </nav>
        )}
      </div>

      {/* BY TYPE Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(204, 195, 216, 0.4)',
            padding: '0 4px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          BY TYPE
        </h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                whileHover={{ x: 4, color: '#FFFFFF' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFilterChange(id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                  color: isActive ? '#D2BBFF' : 'rgba(204, 195, 216, 0.7)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ color: isActive ? '#D2BBFF' : 'inherit' }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {count !== undefined && count > 0 && (
                  <span style={{ fontSize: '11px', color: 'rgba(204, 195, 216, 0.4)' }}>{count}</span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* TOP TAGS Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'rgba(204, 195, 216, 0.4)',
            padding: '0 4px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          TOP TAGS
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {TOP_TAGS.map(tag => {
            const color = TAG_COLORS[tag] || '#6B7280';
            const isActive = activeFilter === `tag:${tag}`;
            return (
              <motion.button
                key={tag}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFilterChange(`tag:${tag}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: `1px solid ${isActive ? color + '60' : 'rgba(255, 255, 255, 0.08)'}`,
                  background: isActive ? `${color}30` : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? color : 'rgba(204, 195, 216, 0.7)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 2px 10px ${color}40` : 'none',
                }}
              >
                <Hash size={10} />
                {tag}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer / Profile */}
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
            whileHover={{ x: 4, color: '#FFFFFF' }}
            onClick={onSettingsOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'rgba(204, 195, 216, 0.7)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </motion.button>
          <motion.button
            whileHover={{ x: 4, color: '#FFFFFF' }}
            onClick={onSettingsOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'rgba(204, 195, 216, 0.7)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <HelpCircle size={16} />
            <span>Support</span>
          </motion.button>
        </div>

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 rounded-xl border border-[rgba(255,255,255,0.2)]',
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
            <div style={{ fontSize: '10px', color: 'rgba(204, 195, 216, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pro Member
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
