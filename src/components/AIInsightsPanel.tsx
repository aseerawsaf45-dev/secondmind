'use client';

import { Sparkles, TrendingUp, Network, Bell, ArrowRight, Brain } from 'lucide-react';
import { MOCK_INSIGHTS, MOCK_ITEMS } from '@/lib/data';
import type { MemoryItem } from '@/lib/data';

interface AIInsightsPanelProps {
  onSelectItem: (item: MemoryItem) => void;
}

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  connection: <Network size={13} />,
  cluster: <Brain size={13} />,
  suggestion: <Bell size={13} />,
};

const INSIGHT_COLORS: Record<string, string> = {
  connection: '#7C3AED',
  cluster: '#06B6D4',
  suggestion: '#F59E0B',
};

export default function AIInsightsPanel({ onSelectItem }: AIInsightsPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))',
            border: '1px solid rgba(124,58,237,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={14} style={{ color: 'var(--violet-bright)' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>AI Insights</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Patterns and connections discovered across your memory
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Items saved', value: '12', icon: '🧠', color: '#7C3AED' },
          { label: 'Connections', value: '18', icon: '🔗', color: '#06B6D4' },
          { label: 'Clusters', value: '6', icon: '✨', color: '#EC4899' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{
            padding: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color, marginBottom: '2px' }}>{value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Discoveries this week
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {MOCK_INSIGHTS.map(insight => {
            const color = INSIGHT_COLORS[insight.type];
            const relatedItems = MOCK_ITEMS.filter(i => insight.itemIds.includes(i.id));
            return (
              <div key={insight.id} style={{
                padding: '16px',
                background: 'var(--bg-card)',
                border: `1px solid ${color}25`,
                borderLeft: `3px solid ${color}`,
                borderRadius: '12px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-card)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    background: `${color}20`,
                    border: `1px solid ${color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color,
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    {INSIGHT_ICONS[insight.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.4 }}>
                      {insight.title}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
                      {insight.description}
                    </p>

                    {/* Related items preview */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {relatedItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => onSelectItem(item)}
                          style={{
                            padding: '3px 10px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: '999px',
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            maxWidth: '160px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title.slice(0, 25)}...
                          </span>
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        height: '4px',
                        flex: 1,
                        background: 'var(--bg-elevated)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${insight.confidence * 100}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}80)`,
                          borderRadius: '999px',
                        }} />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly digest */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.06))',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <TrendingUp size={14} style={{ color: 'var(--violet-bright)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Weekly AI Digest</span>
          <span style={{
            padding: '1px 8px',
            background: 'var(--violet)',
            borderRadius: '999px',
            fontSize: '10px',
            color: 'white',
            fontWeight: 600,
          }}>PRO</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '14px' }}>
          Get a personalized synthesis of everything you saved this week — patterns, key takeaways, and action items.
        </p>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: 'var(--violet)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--violet-bright)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; }}
        >
          Upgrade to Pro
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
