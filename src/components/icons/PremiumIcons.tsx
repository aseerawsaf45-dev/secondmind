'use client';

import React from 'react';
import { FlaticonIcon, FlaticonCapsule, type FlaticonAnimation } from './FlaticonIcon';

export { FlaticonIcon, FlaticonCapsule };

/**
 * Safely parses any hex color into RGB components and hex string.
 * Prevents NaN CSS values and malformed styles.
 */
export function parseHexColor(inputColor?: string | null): { r: number; g: number; b: number; hex: string } {
  const fallback = { r: 6, g: 182, b: 212, hex: '#06B6D4' };
  if (!inputColor || typeof inputColor !== 'string') return fallback;
  const hex = inputColor.trim();
  if (!hex.startsWith('#')) return fallback;

  if (hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b, hex };
    }
  } else if (hex.length === 4) {
    const r = parseInt(hex[1] + hex[1], 16);
    const g = parseInt(hex[2] + hex[2], 16);
    const b = parseInt(hex[3] + hex[3], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b, hex: `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` };
    }
  }
  return fallback;
}

/**
 * Resolves the Flaticon icon name and matching animation for any collection or category name.
 * Uses exact regex matching to avoid common substring bugs.
 */
export function resolveCollectionFlaticon(name: string): { icon: string; animation: FlaticonAnimation } {
  const n = (name || '').toLowerCase().trim();

  // Vibe Coding & AI Coding Tools
  if (
    n.includes('vibe coding') ||
    n.includes('vibecoding') ||
    n.includes('cursor') ||
    n.includes('claude code') ||
    n.includes('windsurf') ||
    n.includes('bolt.new') ||
    n.includes('lovable') ||
    n.includes('v0')
  ) {
    return { icon: 'bolt', animation: 'pulse' };
  }

  // AI & Machine Learning
  if (
    /\b(ai|llm|gpt|ml|rag)\b/i.test(n) ||
    n.includes('machine learning') ||
    n.includes('artificial intelligence') ||
    n.includes('deep learning') ||
    n.includes('neural')
  ) {
    return { icon: 'brain-circuit', animation: 'pulse' };
  }

  // Web Development & Frontend
  if (
    n.includes('web dev') ||
    n.includes('frontend') ||
    n.includes('react') ||
    n.includes('next.js') ||
    n.includes('javascript') ||
    n.includes('typescript') ||
    n.includes('html') ||
    n.includes('css')
  ) {
    return { icon: 'globe', animation: 'float' };
  }

  // Software & Engineering / Coding
  if (
    n.includes('software') ||
    n.includes('engineering') ||
    n.includes('coding') ||
    n.includes('backend') ||
    n.includes('python') ||
    n.includes('rust') ||
    n.includes('golang') ||
    n.includes('architecture') ||
    n.includes('dev')
  ) {
    return { icon: 'terminal', animation: 'sparkle' };
  }

  // UI/UX & Design
  if (
    /\b(ui|ux)\b/i.test(n) ||
    n.includes('design') ||
    n.includes('visual') ||
    n.includes('figma') ||
    n.includes('product design') ||
    n.includes('creative') ||
    n.includes('art')
  ) {
    return { icon: 'palette', animation: 'pulse' };
  }

  // Health, Fitness & Wellness
  if (
    n.includes('health') ||
    n.includes('wellness') ||
    n.includes('fitness') ||
    n.includes('workout') ||
    n.includes('nutrition') ||
    n.includes('meditation') ||
    n.includes('sleep')
  ) {
    return { icon: 'heart', animation: 'pulse' };
  }

  // Startups, Founder & Business
  if (
    n.includes('startup') ||
    n.includes('business') ||
    n.includes('founder') ||
    n.includes('venture') ||
    n.includes('company') ||
    n.includes('marketing') ||
    n.includes('sales')
  ) {
    return { icon: 'briefcase', animation: 'float' };
  }

  // Finance, Money & Crypto
  if (
    n.includes('finance') ||
    n.includes('money') ||
    n.includes('crypto') ||
    n.includes('web3') ||
    n.includes('invest') ||
    n.includes('stock') ||
    n.includes('wealth')
  ) {
    return { icon: 'coins', animation: 'sparkle' };
  }

  // Science & Academic Research
  if (
    n.includes('science') ||
    n.includes('research') ||
    n.includes('physics') ||
    n.includes('biology') ||
    n.includes('paper') ||
    n.includes('academic') ||
    n.includes('study')
  ) {
    return { icon: 'physics', animation: 'spin' };
  }

  // Productivity, PKM & Tools
  if (
    n.includes('productivity') ||
    n.includes('pkm') ||
    n.includes('second brain') ||
    n.includes('workflow') ||
    n.includes('routine') ||
    n.includes('habits') ||
    n.includes('tools')
  ) {
    return { icon: 'bolt', animation: 'pulse' };
  }

  // Media, Reads & Essays
  if (
    n.includes('media') ||
    n.includes('read') ||
    n.includes('book') ||
    n.includes('essay') ||
    n.includes('article') ||
    n.includes('literature') ||
    n.includes('newsletter')
  ) {
    return { icon: 'book', animation: 'float' };
  }

  // Travel, Geography & Places
  if (
    n.includes('travel') ||
    n.includes('place') ||
    n.includes('tour') ||
    n.includes('trip') ||
    n.includes('vacation') ||
    n.includes('city') ||
    n.includes('explore')
  ) {
    return { icon: 'compass', animation: 'spin' };
  }

  // Learning & Education
  if (
    n.includes('learning') ||
    n.includes('education') ||
    n.includes('course') ||
    n.includes('tutorial') ||
    n.includes('lecture')
  ) {
    return { icon: 'education', animation: 'float' };
  }

  // Database & Data
  if (n.includes('database') || n.includes('data') || n.includes('sql') || n.includes('storage')) {
    return { icon: 'database', animation: 'sparkle' };
  }

  // Cloud & Infrastructure
  if (n.includes('cloud') || n.includes('devops') || n.includes('server') || n.includes('aws') || n.includes('docker')) {
    return { icon: 'cloud', animation: 'float' };
  }

  // Security & Privacy
  if (n.includes('security') || n.includes('privacy') || n.includes('auth') || n.includes('crypto')) {
    return { icon: 'shield', animation: 'pulse' };
  }

  // All Vault Items / Brain
  if (n.includes('all') || n.includes('everything') || n.includes('vault') || n.includes('inbox')) {
    return { icon: 'brain', animation: 'pulse' };
  }

  // Default collection icon
  return { icon: 'folder', animation: 'pulse' };
}

/**
 * Returns a premium, animated Flaticon icon element for any collection or category name.
 * Sourced directly from https://www.flaticon.com/icon-fonts-most-downloaded
 */
export function getCategoryIconElement(
  name: string,
  color?: string | null,
  size = 15,
  animate = true
): React.ReactNode {
  const { icon, animation } = resolveCollectionFlaticon(name);
  return (
    <FlaticonIcon
      name={icon}
      variant="bold"
      animation={animate ? animation : 'none'}
      size={size}
      color={color || '#38BDF8'}
    />
  );
}

/**
 * Premium Flaticon Animated Capsule for Collections in Sidebar, Modals, and Landing Page.
 * Encapsulates the Flaticon glyph in an embossed gradient badge with subtle ambient micro-animations.
 */
export function CollectionIcon({
  name,
  color,
  size = 14,
  badgeSize = 26,
  animate = true,
  className,
}: {
  name: string;
  color?: string | null;
  size?: number;
  badgeSize?: number;
  animate?: boolean;
  className?: string;
}) {
  const { icon, animation } = resolveCollectionFlaticon(name);

  return (
    <FlaticonCapsule
      name={icon}
      variant="bold"
      animation={animate ? animation : 'none'}
      size={size}
      badgeSize={badgeSize}
      color={color || '#06B6D4'}
      className={className}
    />
  );
}

/**
 * Premium Flaticon Animated Content Type Icon.
 */
export function ContentTypeIcon({
  type,
  size = 14,
  color,
  animate = true,
  className = '',
}: {
  type: string;
  size?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}) {
  const t = (type || 'link').toLowerCase();

  switch (t) {
    case 'note':
      return (
        <FlaticonIcon
          name="document"
          variant="bold"
          animation={animate ? 'float' : 'none'}
          size={size}
          color={color || '#06B6D4'}
          className={className}
        />
      );
    case 'video':
      return (
        <FlaticonIcon
          name="video"
          variant="bold"
          animation={animate ? 'pulse' : 'none'}
          size={size}
          color={color || '#F43F5E'}
          className={className}
        />
      );
    case 'tweet':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color || '#38BDF8'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flaticon-icon ${animate ? 'flaticon-float' : ''} ${className}`.trim()}
        >
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      );
    case 'pdf':
      return (
        <FlaticonIcon
          name="document"
          variant="bold"
          animation={animate ? 'pulse' : 'none'}
          size={size}
          color={color || '#F59E0B'}
          className={className}
        />
      );
    case 'link':
    default:
      return (
        <FlaticonIcon
          name="link"
          variant="bold"
          animation={animate ? 'float' : 'none'}
          size={size}
          color={color || '#38BDF8'}
          className={className}
        />
      );
  }
}

/**
 * Returns upgraded Flaticon animated vector icons for horizontal filter pills and dashboard navigation.
 */
export function getFilterIconElement(filterId: string, color?: string, size = 14, animate = true): React.ReactNode {
  const f = (filterId || '').toLowerCase();
  const c = color || 'currentColor';

  switch (f) {
    case 'all':
      return <FlaticonIcon name="brain" variant="solid" animation={animate ? 'pulse' : 'none'} size={size} color={c} />;
    case 'favorites':
      return <FlaticonIcon name="star" variant="solid" animation={animate ? 'sparkle' : 'none'} size={size} color={c || '#F59E0B'} />;
    case 'ai-insights':
      return <FlaticonIcon name="sparkles" variant="solid" animation={animate ? 'sparkle' : 'none'} size={size} color={c || '#06B6D4'} />;
    case 'graph':
      return <FlaticonIcon name="network" variant="bold" animation={animate ? 'spin' : 'none'} size={size} color={c || '#38BDF8'} />;
    case 'recent':
      return <FlaticonIcon name="clock" variant="bold" animation={animate ? 'float' : 'none'} size={size} color={c} />;
    case 'link':
      return <FlaticonIcon name="link" variant="bold" animation={animate ? 'float' : 'none'} size={size} color={c || '#38BDF8'} />;
    case 'video':
      return <FlaticonIcon name="video" variant="bold" animation={animate ? 'pulse' : 'none'} size={size} color={c || '#F43F5E'} />;
    case 'tweet':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={c || '#38BDF8'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flaticon-icon ${animate ? 'flaticon-float' : ''}`}
        >
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      );
    case 'note':
      return <FlaticonIcon name="document" variant="bold" animation={animate ? 'float' : 'none'} size={size} color={c || '#06B6D4'} />;
    case 'pdf':
      return <FlaticonIcon name="document" variant="bold" animation={animate ? 'pulse' : 'none'} size={size} color={c || '#F59E0B'} />;
    default:
      return <FlaticonIcon name="folder" variant="bold" animation={animate ? 'pulse' : 'none'} size={size} color={c} />;
  }
}

/**
 * Premium Capsule Badge for Memory Types
 */
export function TypeBadge({
  type,
  showLabel = true,
}: {
  type: string;
  showLabel?: boolean;
}) {
  const t = (type || 'link').toLowerCase();
  const config = {
    link: { label: 'Link', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
    note: { label: 'Note', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
    video: { label: 'Video', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)' },
    tweet: { label: 'Tweet', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
    pdf: { label: 'PDF', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  }[t] || { label: 'Link', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '6px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        fontSize: '11px',
        fontWeight: 600,
        color: config.color,
        fontFamily: 'var(--font-mono), monospace',
        letterSpacing: '0.02em',
      }}
    >
      <ContentTypeIcon type={t} size={12} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
