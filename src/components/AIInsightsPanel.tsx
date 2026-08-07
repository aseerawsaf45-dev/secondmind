'use client';

import { Sparkles, TrendingUp, Network, Bell, ArrowRight, Brain } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';

interface AIInsightsPanelProps {
  onSelectItem: (item: MemoryItem) => void;
}

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
            background: 'linear-gradient(135deg, rgba(6, 86, 91,0.3), rgba(0, 58, 68,0.2))',
            border: '1px solid rgba(6, 86, 91,0.4)',
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
          { label: 'Items saved', value: '—', icon: '🧠', color: '#06565b' },
          { label: 'Connections', value: '—', icon: '🔗', color: '#003a44' },
          { label: 'Clusters', value: '—', icon: '✨', color: '#66a4ac' },
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
        
        <div style={{ 
          padding: '40px 20px', 
          background: 'var(--bg-card)', 
          border: '1px dashed var(--border-strong)', 
          borderRadius: '16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse-glow 2s infinite'
          }}>
            <Sparkles size={18} style={{ color: 'var(--violet-bright)' }} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>AI is Analyzing Your Memory</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.6 }}>
            Patterns and connections will appear here automatically as you save more items and our AI continues to process your mind.
          </p>
        </div>
      </div>

      {/* Weekly digest */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(6, 86, 91,0.12), rgba(0, 58, 68,0.06))',
        border: '1px solid rgba(6, 86, 91,0.2)',
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
