/**
 * Default Category Collections
 *
 * Shared between client (CaptureModal preview) and server (db-collections actions).
 * This file must NOT have 'use server' — it must be importable by both sides.
 */

export interface CategoryCollectionDef {
  name: string;
  emoji: string;
  color: string;
  /** Tags that cause an item to be added to this collection automatically */
  matchTags: string[];
}

export const DEFAULT_CATEGORY_COLLECTIONS: CategoryCollectionDef[] = [
  {
    name: 'UI/UX',
    emoji: '🎨',
    color: '#EC4899',
    matchTags: [
      'UI/UX Design', 'Design Systems', 'Figma', 'Typography',
      'Accessibility & a11y', 'Design & Visuals', 'Design',
      'User Experience', 'User Interface', 'Wireframe',
    ],
  },
  {
    name: 'Web Development',
    emoji: '🌐',
    color: '#059669',
    matchTags: [
      'Web Development', 'Next.js', 'React', 'Vue.js', 'Node.js',
      'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS',
      'Frontend', 'Backend', 'Fullstack',
    ],
  },
  {
    name: 'Coding',
    emoji: '💻',
    color: '#6366F1',
    matchTags: [
      'Python', 'Rust', 'Go (Golang)', 'TypeScript', 'JavaScript',
      'Databases & SQL', 'PostgreSQL', 'Software Architecture',
      'Cloud & DevOps', 'Open Source', 'Cybersecurity',
      'Machine Learning', 'AI Agents', 'Programming',
    ],
  },
  {
    name: 'Design',
    emoji: '✏️',
    color: '#66a4ac',
    matchTags: [
      'Design', 'Design & Visuals', 'Design Systems', 'UI/UX Design',
      'Typography', 'Figma', 'Graphic Design', 'Illustration',
      'Branding', 'Visual Design', 'Color', 'Layout',
    ],
  },
];
