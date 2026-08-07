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
  List,
  Settings,
  Bell,
  Zap,
} from 'lucide-react';
import { Collection } from '@/lib/db-collections';
import { TAG_COLORS } from '@/lib/data';
import { UserButton, useClerk } from '@clerk/nextjs';

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

import { motion } from 'framer-motion';

export default function Sidebar({ activeFilter, onFilterChange, onSearchOpen, onCaptureOpen, onCreateCollectionOpen, onSettingsOpen, itemCounts, collections, user, isOpen, onClose }: SidebarProps) {
  const [expandCollections, setExpandCollections] = useState(true);

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`} style={{
      width: '270px',
      flexShrink: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(8, 10, 16, 0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-50px',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(102,164,172,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Logo */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(6, 86, 91,0.4)',
            overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="SecondMind Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SecondMind
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>AI MEMORY</div>
          </div>
        </div>

        {/* Search button */}
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSearchOpen}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s, background 0.2s',
            marginBottom: '4px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(102, 164, 172, 0.4)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Search size={14} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search memory...</span>
          <kbd style={{
            padding: '1px 6px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontSize: '10px',
          }}>⌘K</kbd>
        </motion.button>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCaptureOpen}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '4px', marginTop: '8px', boxShadow: '0 4px 20px rgba(6, 86, 91, 0.4)' }}
        >
          <Plus size={15} />
          Save to Memory
        </motion.button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', scrollbarWidth: 'none' }}>
        {/* Main nav */}
        <div style={{ marginBottom: '20px' }}>
          {[
            { id: 'all', label: 'All Memory', icon: <LayoutGrid size={14} />, count: itemCounts.all },
            { id: 'favorites', label: 'Favorites', icon: <Star size={14} />, count: itemCounts.favorites },
            { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles size={14} />, count: null },
            { id: 'recent', label: 'Recently Added', icon: <Zap size={14} />, count: null },
          ].map(({ id, label, icon, count }) => (
            <motion.button
              key={id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeFilter === id ? 'rgba(6, 86, 91, 0.25)' : 'transparent',
                color: activeFilter === id ? 'var(--violet-bright)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeFilter === id ? 600 : 400,
                fontFamily: 'inherit',
                transition: 'background 0.2s, color 0.2s',
                boxShadow: activeFilter === id ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(6,86,91,0.2)' : 'none',
              }}
            >
              <span style={{ opacity: 0.8 }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count !== null && count !== undefined && (
                <span style={{
                  padding: '1px 7px',
                  borderRadius: '999px',
                  background: activeFilter === id ? 'rgba(6, 86, 91,0.3)' : 'rgba(255,255,255,0.06)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: activeFilter === id ? 'var(--violet-bright)' : 'var(--text-muted)',
                }}>
                  {count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Type filters */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ padding: '4px 12px 8px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            By Type
          </div>
          {[
            { id: 'link', label: 'Links', emoji: '🔗', count: itemCounts.link },
            { id: 'note', label: 'Notes', emoji: '📝', count: itemCounts.note },
            { id: 'pdf', label: 'PDFs', emoji: '📄', count: itemCounts.pdf },
            { id: 'tweet', label: 'Tweets', emoji: '𝕏', count: itemCounts.tweet },
            { id: 'video', label: 'Videos', emoji: '🎬', count: itemCounts.video },
          ].map(({ id, label, emoji, count }) => (
            <motion.button
              key={id}
              whileHover={{ x: 4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeFilter === id ? 'rgba(6, 86, 91, 0.2)' : 'transparent',
                color: activeFilter === id ? 'var(--violet-bright)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'inherit',
                transition: 'background 0.2s, color 0.2s',
                textAlign: 'left',
                marginBottom: '1px',
                boxShadow: activeFilter === id ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <span style={{ fontSize: '13px' }}>{emoji}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count !== undefined && count > 0 && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)'
                }}>{count}</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Smart Collections */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '12px' }}>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={() => setExpandCollections(!expandCollections)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px 8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: 'var(--text-muted)',
              }}
            >
              <ChevronRight
                size={12}
                style={{
                  transition: 'transform 0.2s',
                  transform: expandCollections ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Smart Collections
              </span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              title="Create new Space" 
              className="btn btn-ghost btn-icon" 
              style={{ width: '20px', height: '20px', padding: 0 }}
              onClick={onCreateCollectionOpen}
            >
              <Plus size={10} />
            </motion.button>
          </div>

          {expandCollections && collections.map(collection => (
            <motion.button
              key={collection.id}
              whileHover={{ x: 4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange(`collection:${collection.id}`)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeFilter === `collection:${collection.id}` ? 'rgba(6, 86, 91, 0.2)' : 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'inherit',
                transition: 'background 0.2s',
                textAlign: 'left',
                marginBottom: '1px',
                color: 'var(--text-secondary)',
                boxShadow: activeFilter === `collection:${collection.id}` ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <span style={{ fontSize: '14px' }}>{collection.emoji}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {collection.name}
              </span>
              {collection.isSmart && (
                <Sparkles size={9} style={{ color: 'var(--violet-bright)', flexShrink: 0 }} />
              )}
            </motion.button>
          ))}

          {expandCollections && collections.length === 0 && (
            <div style={{ padding: '8px 24px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No spaces yet
            </div>
          )}
        </div>

        {/* Top Tags */}
        <div>
          <div style={{ padding: '4px 12px 10px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Top Tags
          </div>
          <div style={{ padding: '0 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TOP_TAGS.map(tag => {
              const color = TAG_COLORS[tag] || '#6B7280';
              const isActive = activeFilter === `tag:${tag}`;
              return (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onFilterChange(`tag:${tag}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${isActive ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive ? `${color}25` : 'rgba(255,255,255,0.03)',
                    color: isActive ? color : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s, background 0.2s',
                    boxShadow: isActive ? `0 2px 8px ${color}30` : 'none',
                  }}
                >
                  <Hash size={9} />
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-full border border-[rgba(255,255,255,0.2)]',
              }
            }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
              {user?.email || user?.fullName || 'User'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pro Plan</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={onSettingsOpen} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px', borderRadius: '7px', padding: '4px' }}>
            <Settings size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
