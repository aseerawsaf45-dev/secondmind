'use client';

import { useState } from 'react';
import {
  Brain,
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
import type { Collection } from '@/lib/data';
import { MOCK_COLLECTIONS, TAG_COLORS } from '@/lib/data';
import { signout } from '@/app/login/actions';

const TOP_TAGS = ['AI', 'Design', 'Business', 'Research', 'Productivity', 'Philosophy'];

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSearchOpen: () => void;
  onCaptureOpen: () => void;
  onSettingsOpen: () => void;
  itemCounts: Record<string, number>;
  user?: any;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeFilter, onFilterChange, onSearchOpen, onCaptureOpen, onSettingsOpen, itemCounts, user, isOpen, onClose }: SidebarProps) {
  const [expandCollections, setExpandCollections] = useState(true);

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`} style={{
      width: '260px',
      flexShrink: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
          }}>
            <Brain size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              SecondMind
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>AI MEMORY</div>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={onSearchOpen}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            marginBottom: '4px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--violet)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
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
        </button>

        {/* Add button */}
        <button
          onClick={onCaptureOpen}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '4px', marginTop: '8px' }}
        >
          <Plus size={15} />
          Save to Memory
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', scrollbarWidth: 'none' }}>
        {/* Main nav */}
        <div style={{ marginBottom: '20px' }}>
          {[
            { id: 'all', label: 'All Memory', icon: <LayoutGrid size={14} />, count: itemCounts.all },
            { id: 'favorites', label: 'Favorites', icon: <Star size={14} />, count: itemCounts.favorites },
            { id: 'ai-insights', label: 'AI Insights', icon: <Sparkles size={14} />, count: 3 },
            { id: 'recent', label: 'Recently Added', icon: <Zap size={14} />, count: null },
          ].map(({ id, label, icon, count }) => (
            <button
              key={id}
              onClick={() => onFilterChange(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeFilter === id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: activeFilter === id ? 'var(--violet-bright)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeFilter === id ? 600 : 400,
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                textAlign: 'left',
                marginBottom: '2px',
              }}
              onMouseEnter={e => {
                if (activeFilter !== id) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (activeFilter !== id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ opacity: 0.8 }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count !== null && count !== undefined && (
                <span style={{
                  padding: '1px 7px',
                  borderRadius: '999px',
                  background: activeFilter === id ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: activeFilter === id ? 'var(--violet-bright)' : 'var(--text-muted)',
                }}>
                  {count}
                </span>
              )}
            </button>
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
            <button
              key={id}
              onClick={() => onFilterChange(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeFilter === id ? 'rgba(124,58,237,0.12)' : 'transparent',
                color: activeFilter === id ? 'var(--violet-bright)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                textAlign: 'left',
                marginBottom: '1px',
              }}
              onMouseEnter={e => {
                if (activeFilter !== id) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={e => {
                if (activeFilter !== id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span style={{ fontSize: '13px' }}>{emoji}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count !== undefined && count > 0 && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Collections */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setExpandCollections(!expandCollections)}
            style={{
              width: '100%',
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
          </button>

          {expandCollections && MOCK_COLLECTIONS.map(collection => (
            <button
              key={collection.id}
              onClick={() => onFilterChange(`collection:${collection.id}`)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeFilter === `collection:${collection.id}` ? 'rgba(124,58,237,0.12)' : 'transparent',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                textAlign: 'left',
                marginBottom: '1px',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = activeFilter === `collection:${collection.id}` ? 'rgba(124,58,237,0.12)' : 'transparent';
              }}
            >
              <span style={{ fontSize: '14px' }}>{collection.emoji}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {collection.name}
              </span>
              {collection.isSmart && (
                <Sparkles size={9} style={{ color: 'var(--violet-bright)', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div>
          <div style={{ padding: '4px 12px 10px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Top Tags
          </div>
          <div style={{ padding: '0 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TOP_TAGS.map(tag => {
              const color = TAG_COLORS[tag] || '#6B7280';
              const isActive = activeFilter === `tag:${tag}`;
              return (
                <button
                  key={tag}
                  onClick={() => onFilterChange(`tag:${tag}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${isActive ? color + '60' : 'var(--border)'}`,
                    background: isActive ? `${color}20` : 'transparent',
                    color: isActive ? color : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  <Hash size={9} />
                  {tag}
                </button>
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
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700,
            color: 'white',
          }}>
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
              {user?.email || 'User'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pro Plan</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <form action={signout}>
            <button title="Sign Out" className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px', borderRadius: '7px', padding: '4px' }}>
              <Zap size={13} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </form>
          <button onClick={onSettingsOpen} className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px', borderRadius: '7px', padding: '4px' }}>
            <Settings size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
