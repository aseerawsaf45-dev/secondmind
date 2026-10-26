'use client';

import React from 'react';
import { parseHexColor } from './PremiumIcons';

export type FlaticonAnimation = 'pulse' | 'float' | 'sparkle' | 'spin' | 'glow' | 'hover' | 'none';
export type FlaticonVariant = 'bold' | 'solid' | 'regular';

export interface FlaticonIconProps {
  name: string;
  variant?: FlaticonVariant;
  animation?: FlaticonAnimation;
  size?: number;
  color?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Normalizes an icon name to the corresponding Flaticon UIcons class.
 * Source: https://www.flaticon.com/icon-fonts-most-downloaded
 */
export function getFlaticonClass(name: string, variant: FlaticonVariant = 'bold'): string {
  const prefix = variant === 'solid' ? 'fi-sr-' : variant === 'regular' ? 'fi-rr-' : 'fi-br-';
  const raw = (name || '').toLowerCase().trim();

  // Known Flaticon glyph mapping table from @flaticon/flaticon-uicons
  const mapping: Record<string, string> = {
    brain: 'brain',
    'brain-circuit': 'brain-circuit',
    ai: 'brain-circuit',
    chip: 'chip',
    cpu: 'chip',
    sparkles: 'sparkles',
    magic: 'magic-wand',
    rocket: 'rocket-lunch',
    bolt: 'bolt',
    zap: 'bolt',
    lightning: 'bolt',
    shield: 'shield-check',
    'shield-check': 'shield-check',
    security: 'shield-check',
    search: 'search',
    folder: 'folder',
    terminal: 'terminal',
    code: 'code-branch',
    globe: 'globe',
    web: 'globe',
    palette: 'palette',
    design: 'palette',
    briefcase: 'briefcase',
    business: 'briefcase',
    startup: 'rocket-lunch',
    atom: 'physics',
    science: 'physics',
    physics: 'physics',
    flask: 'flask',
    research: 'flask',
    microscope: 'microscope',
    heart: 'heart',
    health: 'heart',
    fitness: 'heart',
    book: 'book-alt',
    reading: 'book-alt',
    library: 'book-alt',
    compass: 'compass-alt',
    travel: 'compass-alt',
    star: 'star',
    favorite: 'star',
    link: 'link-alt',
    url: 'link-alt',
    video: 'video-camera-alt',
    movie: 'video-camera-alt',
    film: 'video-camera-alt',
    document: 'document',
    note: 'document',
    pdf: 'document',
    text: 'document',
    network: 'chart-network',
    graph: 'chart-network',
    database: 'database',
    coins: 'coins',
    finance: 'coins',
    crypto: 'coins',
    money: 'coins',
    user: 'user',
    settings: 'settings',
    lock: 'lock',
    check: 'check-circle',
    clock: 'clock',
    cloud: 'cloud',
    education: 'graduation-cap',
    learning: 'graduation-cap',
  };

  const resolved = mapping[raw] || raw;
  return `${prefix}${resolved}`;
}

/**
 * Returns the CSS animation class corresponding to the animation type.
 */
export function getAnimationClass(anim: FlaticonAnimation): string {
  switch (anim) {
    case 'pulse':
      return 'flaticon-pulse';
    case 'float':
      return 'flaticon-float';
    case 'spin':
      return 'flaticon-spin-slow';
    case 'sparkle':
      return 'flaticon-sparkle';
    case 'glow':
      return 'flaticon-glow';
    case 'hover':
      return 'flaticon-hover-scale';
    case 'none':
    default:
      return '';
  }
}

/**
 * Premium Flaticon Icon from https://www.flaticon.com/icon-fonts-most-downloaded
 * Renders with animated CSS micro-interactions and high-definition font glyphs.
 */
export function FlaticonIcon({
  name,
  variant = 'bold',
  animation = 'none',
  size = 16,
  color,
  className = '',
  style = {},
}: FlaticonIconProps) {
  const iconClass = getFlaticonClass(name, variant);
  const animClass = getAnimationClass(animation);

  return (
    <i
      className={`flaticon-icon ${iconClass} ${animClass} ${className}`.trim()}
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        color: color || 'currentColor',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Premium Flaticon Animated Capsule
 * Encapsulates the Flaticon icon in a glowing, luxury rounded container with specular highlights.
 */
export function FlaticonCapsule({
  name,
  variant = 'bold',
  animation = 'pulse',
  size = 15,
  badgeSize = 28,
  color = '#06B6D4',
  className = '',
  glow = true,
}: {
  name: string;
  variant?: FlaticonVariant;
  animation?: FlaticonAnimation;
  size?: number;
  badgeSize?: number;
  color?: string | null;
  className?: string;
  glow?: boolean;
}) {
  const parsed = parseHexColor(color);
  const rgb = `${parsed.r}, ${parsed.g}, ${parsed.b}`;

  return (
    <div
      className={`flaticon-capsule ${className}`.trim()}
      style={{
        width: `${badgeSize}px`,
        height: `${badgeSize}px`,
        borderRadius: `${Math.round(badgeSize * 0.32)}px`,
        background: `linear-gradient(135deg, rgba(${rgb}, 0.22) 0%, rgba(${rgb}, 0.08) 100%)`,
        border: `1px solid rgba(${rgb}, 0.38)`,
        boxShadow: glow
          ? `0 3px 12px rgba(${rgb}, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.25)`
          : 'none',
      }}
    >
      <FlaticonIcon
        name={name}
        variant={variant}
        animation={animation}
        size={size}
        color={parsed.hex}
      />
    </div>
  );
}
