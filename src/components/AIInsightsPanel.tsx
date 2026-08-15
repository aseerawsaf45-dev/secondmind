'use client';

import { useMemo } from 'react';
import { Sparkles, Network, Brain, Layers, ArrowUpRight, Zap, FileText, Link as LinkIcon, File, Lightbulb, Compass } from 'lucide-react';
import type { MemoryItem } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';

interface AIInsightsPanelProps {
  items: MemoryItem[];
  collections: Collection[];
  onSelectItem: (item: MemoryItem) => void;
}

export default function AIInsightsPanel({ items, collections, onSelectItem }: AIInsightsPanelProps) {
  // 1. Dynamic Stats Computation
  const stats = useMemo(() => {
    const totalItems = items.length;
    
    // Compute total tags & tag clusters
    const allTags = items.flatMap(i => i.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    
    // Compute connections (items sharing at least 1 tag or domain)
    let connectionsCount = 0;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itemA = items[i];
        const itemB = items[j];
        const sharedTag = itemA.tags?.some(t => itemB.tags?.includes(t));
        const sharedDomain = itemA.sourceDomain && itemB.sourceDomain && itemA.sourceDomain === itemB.sourceDomain;
        if (sharedTag || sharedDomain) {
          connectionsCount++;
        }
      }
    }

    return {
      totalItems,
      connectionsCount,
      clustersCount: uniqueTags.length || collections.length || 1,
      uniqueTags,
    };
  }, [items, collections]);

  // 2. Synthesized Knowledge Clusters
  const tagClusters = useMemo(() => {
    const map: Record<string, MemoryItem[]> = {};
    items.forEach(item => {
      (item.tags || []).forEach(tag => {
        if (!map[tag]) map[tag] = [];
        map[tag].push(item);
      });
    });

    return Object.entries(map)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 4);
  }, [items]);

  // 3. AI Discoveries / Connections
  const discoveries = useMemo(() => {
    const list: Array<{ title: string; desc: string; items: MemoryItem[]; tag?: string }> = [];

    // Find top connected items
    tagClusters.forEach(([tag, tagItems]) => {
      if (tagItems.length >= 2) {
        list.push({
          title: `Synthesis in #${tag}`,
          desc: `Connected ${tagItems.length} related memories under #${tag}. Click any memory below to inspect.`,
          items: tagItems.slice(0, 3),
          tag,
        });
      }
    });

    // AI Processed highlights
    const aiProcessed = items.filter(i => i.aiProcessed || i.summary);
    if (aiProcessed.length > 0) {
      list.push({
        title: 'Recent Intelligence Syntheses',
        desc: `${aiProcessed.length} saved resources automatically summarized & structured by SecondMind AI.`,
        items: aiProcessed.slice(0, 3),
      });
    }

    return list;
  }, [items, tagClusters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Friendly Hero Banner */}
      <div
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.06) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Sparkles size={18} style={{ color: '#10B981' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
              AI Intelligence Hub
            </h2>
            <div style={{ fontSize: '12px', color: '#A7F3D0', fontWeight: 500 }}>
              Your SecondMind is active & synthesizing connections
            </div>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
          Here is your visual memory network: automatically grouped topics, cross-memory links, and instant executive summaries.
        </p>
      </div>

      {/* User-Friendly Live Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Total Saved Memories', value: stats.totalItems, subtext: 'In your second mind', icon: <Brain size={20} style={{ color: '#10B981' }} /> },
          { label: 'Smart Connections', value: stats.connectionsCount, subtext: 'Cross-linked topics', icon: <Network size={20} style={{ color: '#06B6D4' }} /> },
          { label: 'Topic Clusters', value: stats.clustersCount, subtext: 'Auto-organized categories', icon: <Layers size={20} style={{ color: '#34D399' }} /> },
        ].map(({ label, value, subtext, icon }) => (
          <div
            key={label}
            style={{
              padding: '18px',
              background: 'rgba(255, 255, 255, 0.035)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>{label}</span>
              {icon}
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {value}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>{subtext}</div>
          </div>
        ))}
      </div>

      {/* Interactive Insights & Clusters */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Compass size={14} style={{ color: '#10B981' }} />
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Interactive Discoveries & Memory Clusters
          </div>
        </div>

        {discoveries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {discoveries.map((disc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Zap size={15} style={{ color: '#10B981' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>{disc.title}</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.5 }}>{disc.desc}</p>
                </div>

                {/* Interactive Memory Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {disc.items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      style={{
                        padding: '12px 14px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <span style={{ color: '#34D399', fontSize: '14px' }}>
                          {item.type === 'link' ? <LinkIcon size={15} /> : item.type === 'note' ? <FileText size={15} /> : <File size={15} />}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </span>
                          {item.summary && (
                            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '480px' }}>
                              {item.summary}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight size={15} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '40px 20px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Lightbulb size={28} style={{ color: '#10B981' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>AI Memory Processing Ready</div>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', maxWidth: '340px', lineHeight: 1.6 }}>
              Save links or quick notes using the "+ Save to Memory" button to automatically generate smart knowledge clusters!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
