'use client';

import React, { useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MemoryItem } from '@/lib/data';

// Dynamically import to prevent SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface GraphViewProps {
  items: MemoryItem[];
  onSelectItem: (item: MemoryItem) => void;
}

const TYPE_CONFIG: Record<string, string> = {
  link: '#38BDF8',
  note: '#06B6D4',
  video: '#F87171',
  tweet: '#38BDF8',
  pdf: '#FBBF24',
};

export default function GraphView({ items, onSelectItem }: GraphViewProps) {
  
  const graphData = useMemo(() => {
    const nodes = items.map(item => ({
      id: item.id,
      name: item.title,
      type: item.type,
      val: 2, // Size of node
      color: TYPE_CONFIG[item.type] || '#38BDF8',
      item
    }));

    const links: { source: string, target: string, value: number, color?: string }[] = [];
    
    // Connect items
    for (let i = 0; i < items.length; i++) {
      const itemA = items[i];
      
      // Explicit AI/related links
      if (itemA.relatedIds) {
        itemA.relatedIds.forEach(targetId => {
          if (items.find(t => t.id === targetId)) {
            links.push({
              source: itemA.id,
              target: targetId,
              value: 2,
              color: 'rgba(255,255,255,0.2)'
            });
          }
        });
      }

      // Tag-based links (implicit connections)
      for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const itemB = items[j];
        
        // 1. Bidirectional Text Link Check (itemA links to itemB via [[Title]])
        const linksToB = 
          (itemA.content && itemA.content.includes(`[[${itemB.title}]]`)) || 
          (itemA.summary && itemA.summary.includes(`[[${itemB.title}]]`));
          
        if (linksToB) {
          links.push({
            source: itemA.id,
            target: itemB.id,
            value: 3, // Strong connection
            color: 'rgba(129, 140, 248, 0.8)' // Bright violet for explicit bidirectional links
          });
        }
        
        // 2. Shared tags (only calculate once per pair, i < j)
        if (j > i) {
          const sharedTags = itemA.tags.filter(t => itemB.tags.includes(t));
          if (sharedTags.length > 0) {
            links.push({
              source: itemA.id,
              target: itemB.id,
              value: sharedTags.length * 0.5,
              color: 'rgba(6, 182, 212, 0.15)' // Faint violet for tag connections
            });
          }
        }
      }
    }

    return { nodes, links };
  }, [items]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    if (node?.item) {
      onSelectItem(node.item);
    }
  }, [onSelectItem]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        linkColor="color"
        linkWidth={link => link.value}
        nodeRelSize={6}
        onNodeClick={handleNodeClick}
        backgroundColor="#090a13"
      />
    </div>
  );
}
