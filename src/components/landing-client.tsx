'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Sparkles,
  Search,
  Zap,
  ArrowRight,
  ChevronDown,
  Layers,
  Clock,
  ExternalLink,
  Bot,
  LayoutGrid,
  Send,
  Loader2,
  FolderKanban,
  CheckCircle2,
  Globe,
  Copy,
} from 'lucide-react';
import { CollectionIcon, ContentTypeIcon, TypeBadge, FlaticonIcon } from '@/components/icons/PremiumIcons';

// ─── Direct auto-redirection for authenticated users ────────────────────────────
export function AuthenticatedAutoRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/app');
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
}

// ─── Typewriter hook & Component ───────────────────────────────────────────────
export function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    const delay = deleting ? speed / 2 : charIdx === word.length ? pause : speed;
    const timer = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setDisplay(word.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(word.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setWordIdx(i => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

export function TypewriterText({ words }: { words: string[] }) {
  const display = useTypewriter(words);
  return <>{display}</>;
}

// ─── Animated counter ──────────────────────────────────────────────────────────
export function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const step = () => {
            start += Math.ceil(to / 60);
            if (start >= to) { setVal(to); return; }
            setVal(start);
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const FAQS = [
  {
    q: 'How does Guest Mode work without an account?',
    a: 'You can test SecondMind immediately with zero friction. We seed sample memories or let you save new ones instantly. Everything is stored locally in your browser with zero tracking. When you decide to create a free account, a single click migrates all your memories to your permanent cloud account.',
  },
  {
    q: 'Is my data used to train AI models?',
    a: 'Never. SecondMind enforces strict zero-training data boundaries. Your saved URLs, research notes, and personal summaries are solely used to generate answers and insights for your personal workspace.',
  },
  {
    q: 'How fast is saving content?',
    a: 'Under 2 seconds. When you paste a URL or press ⌘V anywhere in the app, SecondMind automatically strips clutter, extracts clean markdown, generates concise key takeaways, and assigns relevant tags without requiring manual filing.',
  },
  {
    q: 'Can I export my data anytime?',
    a: 'Yes! You can export your entire knowledge base as structured JSON at any time with a single click. We never lock your thoughts into our platform.',
  },
  {
    q: 'How does the AI search and question answering work?',
    a: 'Instead of searching through keywords alone, SecondMind uses neural semantic embeddings. When you ask a question like "What did I save about transformer attention?", it retrieves relevant passages across all your links and notes and synthesizes a direct answer with citations.',
  },
  {
    q: 'Can I use keyboard shortcuts?',
    a: 'Yes, SecondMind is built for speed: press ⌘K or Ctrl+K to search and ask questions, ⌘N to create a memory, ⌘V to paste-capture from clipboard anywhere, and ? to see all shortcuts.',
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" style={{ padding: '100px 24px', maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: '#67E8F9',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            padding: '4px 12px',
            borderRadius: '999px',
            letterSpacing: '0.04em',
            marginBottom: '14px',
          }}
        >
          <span>Frequently asked questions</span>
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textWrap: 'balance',
          }}
        >
          Everything you need to know
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={faq.q}
              style={{
                borderRadius: '16px',
                background: isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: isOpen ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isOpen ? '0 12px 30px rgba(0,0,0,0.3), 0 0 20px rgba(99,102,241,0.15)' : 'none',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  style={{
                    color: isOpen ? '#67E8F9' : 'var(--text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                />
              </button>
              {isOpen && (
                <div style={{ padding: '0 24px 20px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65 }}>
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function InteractiveSimulator() {
  const [activeTab, setActiveTab] = useState<'capture' | 'qa' | 'graph'>('capture');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');

  const SIMULATOR_COLLECTIONS = [
    { id: 'all', name: 'All Vault Items', color: '#38BDF8', count: 18 },
    { id: 'c-ai', name: 'AI & Machine Learning', color: '#06B6D4', count: 5 },
    { id: 'c-eng', name: 'Software Engineering', color: '#38BDF8', count: 4 },
    { id: 'c-startup', name: 'Startups & Business', color: '#F59E0B', count: 3 },
    { id: 'c-design', name: 'UI/UX & Design', color: '#EC4899', count: 2 },
    { id: 'c-pkm', name: 'Productivity & PKM', color: '#34D399', count: 4 },
  ];

  const CAPTURE_PRESETS = [
    {
      label: 'arXiv Paper',
      type: 'pdf',
      url: 'https://arxiv.org/abs/1706.03762',
      title: 'Attention Is All You Need',
      summary: 'Introduces Transformer self-attention architecture, eliminating recurrence and convolutions while establishing the foundation for modern LLMs.',
      collection: 'AI & Machine Learning',
      collectionId: 'c-ai',
      collectionColor: '#06B6D4',
      tags: ['AI', 'Transformers', 'Deep Learning'],
      domain: 'arxiv.org',
      time: '1.2s',
      readTime: '12m read',
    },
    {
      label: 'YouTube Lecture',
      type: 'video',
      url: 'https://youtube.com/watch?v=kCc8FmEb1nY',
      title: "Andrej Karpathy: Let's build GPT from scratch",
      summary: 'Step-by-step implementation of GPT architecture in PyTorch covering byte-pair encoding, multi-head causal self-attention, and training loops.',
      collection: 'Software Engineering',
      collectionId: 'c-eng',
      collectionColor: '#38BDF8',
      tags: ['Python', 'LLM', 'PyTorch'],
      domain: 'youtube.com',
      time: '1.6s',
      readTime: '1h 56m video',
    },
    {
      label: 'X / Twitter Post',
      type: 'tweet',
      url: 'https://x.com/paulg/status/1748291038102',
      title: 'Paul Graham: How to Do Great Work',
      summary: 'If you want to do great work, look for things that seem like play to you but look like work to others. Consistency compounds into breakthroughs.',
      collection: 'Startups & Business',
      collectionId: 'c-startup',
      collectionColor: '#F59E0B',
      tags: ['Startups', 'Career', 'Philosophy'],
      domain: 'x.com',
      time: '0.9s',
      readTime: '3m read',
    },
    {
      label: 'Design System',
      type: 'link',
      url: 'https://linear.app/design',
      title: 'Linear Design Principles: Craft and Kinetic Motion',
      summary: 'Explores dark-mode depth, keyboard-first navigation, and micro-interactions that elevate software into an extension of the human hand.',
      collection: 'UI/UX & Design',
      collectionId: 'c-design',
      collectionColor: '#EC4899',
      tags: ['Design', 'UI/UX', 'Interaction'],
      domain: 'linear.app',
      time: '1.1s',
      readTime: '5m read',
    },
    {
      label: 'PKM Framework',
      type: 'note',
      url: 'https://buildingasecondbrain.com/code',
      title: 'The CODE Framework: Capture, Organize, Distill, Express',
      summary: 'Capture what resonates. Organize by actionability into Projects and Areas. Distill the essence into bold takeaways. Express through creation.',
      collection: 'Productivity & PKM',
      collectionId: 'c-pkm',
      collectionColor: '#34D399',
      tags: ['Productivity', 'PKM', 'NoteTaking'],
      domain: 'buildingasecondbrain.com',
      time: '1.4s',
      readTime: '8m read',
    },
  ];

  // Capture State
  const [inputUrl, setInputUrl] = useState(CAPTURE_PRESETS[0].url);
  const [currentResult, setCurrentResult] = useState(CAPTURE_PRESETS[0]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState(0);

  const extractionStages = [
    'Connecting to source & stripping ads...',
    'Extracting clean text & document structure...',
    'Synthesizing AI summary & generating topic tags...',
    'Auto-routing into intelligent collection...',
  ];

  const handleRunExtract = (overrideUrl?: string) => {
    const target = (overrideUrl || inputUrl).trim();
    if (!target) return;
    setIsExtracting(true);
    setExtractionStage(0);

    const t1 = setTimeout(() => setExtractionStage(1), 300);
    const t2 = setTimeout(() => setExtractionStage(2), 650);
    const t3 = setTimeout(() => setExtractionStage(3), 1000);
    const t4 = setTimeout(() => {
      // Find preset or dynamically synthesize
      const preset = CAPTURE_PRESETS.find(p => p.url.toLowerCase() === target.toLowerCase());
      if (preset) {
        setCurrentResult(preset);
      } else {
        let type = 'link';
        let collection = 'Software Engineering';
        let collectionId = 'c-eng';
        let collectionColor = '#38BDF8';
        let domain = 'web.dev';
        try {
          const u = new URL(target.startsWith('http') ? target : `https://${target}`);
          domain = u.hostname.replace(/^www\./, '');
        } catch {}

        if (target.includes('youtube.com') || target.includes('youtu.be')) {
          type = 'video';
          collection = 'Software Engineering';
          collectionColor = '#38BDF8';
        } else if (target.includes('twitter.com') || target.includes('x.com')) {
          type = 'tweet';
          collection = 'Startups & Business';
          collectionColor = '#F59E0B';
        } else if (target.includes('arxiv') || target.endsWith('.pdf')) {
          type = 'pdf';
          collection = 'AI & Machine Learning';
          collectionColor = '#06B6D4';
        } else if (target.includes('design') || target.includes('figma') || target.includes('dribbble')) {
          type = 'link';
          collection = 'UI/UX & Design';
          collectionColor = '#EC4899';
        } else if (target.includes('notion') || target.includes('substack')) {
          type = 'note';
          collection = 'Productivity & PKM';
          collectionColor = '#34D399';
        }

        setCurrentResult({
          label: 'Live Web Resource',
          type,
          url: target.startsWith('http') ? target : `https://${target}`,
          title: `Synthesized Memory: ${domain.charAt(0).toUpperCase() + domain.slice(1)} Article`,
          summary: `Extracted core takeaways and high-signal concepts from ${domain}. Noise removed and auto-linked into your semantic SecondMind graph.`,
          collection,
          collectionId,
          collectionColor,
          tags: [domain.split('.')[0] || 'Web', 'Reference', 'Synthesis'],
          domain,
          time: '1.3s',
          readTime: '4m read',
        });
      }
      setIsExtracting(false);
    }, 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  // QA Demo State
  const QA_PRESETS = [
    {
      q: 'How do transformers eliminate recurrence in neural networks?',
      a: 'Transformers completely replace sequential RNN recurrence with multi-head self-attention mechanisms. Instead of processing tokens step-by-step, self-attention computes query-key matrix dot-products across all token positions simultaneously in O(1) sequential operations, allowing massive parallel GPU scaling.',
      collection: 'AI & Machine Learning',
      collectionColor: '#06B6D4',
      type: 'pdf',
      citations: ['Attention Is All You Need (arXiv)', 'Karpathy: GPT from Scratch'],
    },
    {
      q: 'What is the CODE framework and how does it prevent information overload?',
      a: 'The CODE framework stands for Capture (keep only high-resonance ideas), Organize (by immediate actionability using PARA), Distill (progressive summarization to highlight the bold essence), and Express (turn gathered notes into tangible output).',
      collection: 'Productivity & PKM',
      collectionColor: '#34D399',
      type: 'note',
      citations: ['Building a Second Brain', 'Tiago Forte Essays'],
    },
    {
      q: 'What does Paul Graham recommend for doing impactful work?',
      a: 'Find projects that look like exhausting work to others, but feel like play to you. Maintain obsessive curiosity, work on personal projects without asking for permission, and cultivate taste by studying the greatest masters in your domain.',
      collection: 'Startups & Business',
      collectionColor: '#F59E0B',
      type: 'tweet',
      citations: ['How to Do Great Work (Paul Graham)', 'Founder Stories Archive'],
    },
  ];

  const [qaInput, setQaInput] = useState(QA_PRESETS[0].q);
  const [activeQa, setActiveQa] = useState(QA_PRESETS[0]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = (queryText?: string) => {
    const q = (queryText || qaInput).trim();
    if (!q) return;
    setIsAsking(true);
    setTimeout(() => {
      const match = QA_PRESETS.find(item => item.q.toLowerCase() === q.toLowerCase());
      if (match) {
        setActiveQa(match);
      } else {
        setActiveQa({
          q,
          a: `Based on your indexed vault items, this concept cross-references memories in both Software Engineering and Cognitive Models. SecondMind identified 3 related links and synthesizes a direct answer citing your verified archive.`,
          collection: 'AI & Machine Learning',
          collectionColor: '#06B6D4',
          type: 'link',
          citations: ['Personal Knowledge Graph Node #18', 'Verified Web Archive'],
        });
      }
      setIsAsking(false);
    }, 700);
  };

  // Filtered Items for collection sidebar
  const visibleItems = selectedCollectionId === 'all'
    ? CAPTURE_PRESETS
    : CAPTURE_PRESETS.filter(p => p.collectionId === selectedCollectionId);

  return (
    <section id="simulator" style={{ padding: '20px 20px 80px', maxWidth: '1120px', margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 32px 90px -20px rgba(0,0,0,0.9), 0 0 70px -15px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255,255,255,0.12)',
          background: 'rgba(8, 9, 14, 0.94)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        }}
      >
        {/* Top Window Bar */}
        <div
          style={{
            padding: '14px 22px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(6,182,212,0.03) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Window dots & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', opacity: 0.8 }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', opacity: 0.8 }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', opacity: 0.8 }} />
            </div>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#06B6D4', boxShadow: '0 0 10px #06B6D4' }} />
              <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', fontWeight: 650, fontFamily: 'var(--font-mono)' }}>
                SecondMind Live Workspace Simulator
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.5)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              gap: '4px',
            }}
          >
            {[
              { id: 'capture' as const, label: 'Instant Ingestion', icon: <FlaticonIcon name="bolt" variant="bold" animation="pulse" size={13} color="#06B6D4" /> },
              { id: 'qa' as const, label: '⌘K Semantic Search', icon: <FlaticonIcon name="search" variant="bold" animation="sparkle" size={13} color="#38BDF8" /> },
              { id: 'graph' as const, label: 'Collections & Graph', icon: <FlaticonIcon name="network" variant="bold" animation="spin" size={13} color="#67E8F9" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid transparent',
                  background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.22) 0%, rgba(56, 189, 248, 0.1) 100%)' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  fontSize: '12px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Simulated Layout: Sidebar + Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', minHeight: '440px' }} className="sim-layout">
          {/* Simulated Sidebar with Upgraded Collection Icons */}
          <div
            style={{
              background: 'rgba(5, 6, 10, 0.7)',
              borderRight: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '18px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            className="sim-sidebar"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                SMART COLLECTIONS
              </span>
              <span style={{ fontSize: '10px', color: '#67E8F9', background: 'rgba(6, 182, 212, 0.15)', padding: '1px 6px', borderRadius: '8px' }}>
                LIVE
              </span>
            </div>

            {/* Collection Nav Buttons with Upgraded Vector CollectionIcon */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {SIMULATOR_COLLECTIONS.map(col => {
                const isActive = selectedCollectionId === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      setSelectedCollectionId(col.id);
                      if (col.id !== 'all') {
                        const matching = CAPTURE_PRESETS.find(p => p.collectionId === col.id);
                        if (matching) {
                          setInputUrl(matching.url);
                          setCurrentResult(matching);
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
                      background: isActive ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.18) 0%, rgba(56, 189, 248, 0.08) 100%)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: isActive ? 650 : 500,
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <CollectionIcon name={col.name} color={col.color} size={13} badgeSize={24} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.name}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        color: isActive ? '#67E8F9' : 'rgba(255, 255, 255, 0.4)',
                        fontFamily: 'var(--font-mono)',
                        background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        padding: '1px 5px',
                        borderRadius: '6px',
                      }}
                    >
                      {col.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Content Types */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
              <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: '8px', padding: '0 6px', fontFamily: 'var(--font-mono)' }}>
                CONTENT TYPES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 4px' }}>
                {['link', 'video', 'pdf', 'tweet', 'note'].map(t => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 7px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: '10.5px',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    <ContentTypeIcon type={t} size={11} />
                    <span style={{ textTransform: 'capitalize' }}>{t}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Simulator Workspace */}
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* TAB 1: INSTANT CAPTURE SIMULATOR */}
            {activeTab === 'capture' && (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      Interactive URL Extractor & Smart Auto-Tagging
                    </h3>
                    <span style={{ fontSize: '11px', color: '#34D399', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '999px', fontFamily: 'var(--font-mono)' }}>
                      ✔ Full Working Simulator
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                    Type or paste any link below or click a sample format to test the extraction and auto-collection assignment:
                  </p>
                </div>

                {/* Live Working URL Input Bar */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleRunExtract();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px 6px 14px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <FlaticonIcon name="globe" variant="bold" animation="float" size={16} color="#06B6D4" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="Enter or paste any link (e.g. https://github.com/torvalds/linux)..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isExtracting}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isExtracting ? 'rgba(6, 182, 212, 0.3)' : 'linear-gradient(135deg, #06B6D4 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isExtracting ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
                      flexShrink: 0,
                    }}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <FlaticonIcon name="bolt" variant="bold" animation="pulse" size={13} color="#FFFFFF" />
                        <span>Extract & Save</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Instant Presets Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>TRY EXAMPLES:</span>
                  {CAPTURE_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setInputUrl(p.url);
                        handleRunExtract(p.url);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: inputUrl === p.url ? 600 : 450,
                        background: inputUrl === p.url ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                        border: inputUrl === p.url ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                        color: inputUrl === p.url ? '#67E8F9' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ContentTypeIcon type={p.type} size={11} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Extraction Stage or Live Result Card */}
                {isExtracting ? (
                  <div
                    style={{
                      padding: '36px 20px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px dashed rgba(6, 182, 212, 0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                    }}
                  >
                    <FlaticonIcon name="sparkles" variant="solid" animation="spin" size={24} color="#06B6D4" />
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#FFFFFF' }}>
                      {extractionStages[extractionStage]}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[0, 1, 2, 3].map(st => (
                        <span
                          key={st}
                          style={{
                            width: '28px',
                            height: '4px',
                            borderRadius: '2px',
                            background: st <= extractionStage ? '#06B6D4' : 'rgba(255,255,255,0.1)',
                            transition: 'background 0.3s ease',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '20px 22px',
                      borderRadius: '16px',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      boxShadow: '0 16px 36px rgba(0,0,0,0.4), 0 0 24px rgba(6, 182, 212, 0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Header: Content Type + Collection Capsule + Reading Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Upgraded Vector Content Type Badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: 'rgba(6, 182, 212, 0.12)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: '#38BDF8',
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                          }}
                        >
                          <ContentTypeIcon type={currentResult.type} size={11} />
                          <span>{currentResult.type}</span>
                        </div>

                        {/* Upgraded Vector Collection Capsule */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 9px',
                            borderRadius: '8px',
                            background: `${currentResult.collectionColor}18`,
                            border: `1px solid ${currentResult.collectionColor}35`,
                            fontSize: '11px',
                            fontWeight: 650,
                            color: currentResult.collectionColor,
                          }}
                        >
                          <CollectionIcon name={currentResult.collection} color={currentResult.collectionColor} size={11} badgeSize={18} />
                          <span>{currentResult.collection}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>
                        <span>{currentResult.domain}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FlaticonIcon name="clock" variant="bold" animation="pulse" size={11} color="rgba(255,255,255,0.6)" /> {currentResult.readTime}
                        </span>
                        <span>•</span>
                        <span style={{ color: '#34D399' }}>Indexed in {currentResult.time}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 style={{ fontSize: '16.5px', fontWeight: 750, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {currentResult.title}
                    </h4>

                    {/* Summary */}
                    <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
                      {currentResult.summary}
                    </p>

                    {/* Tags + Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {currentResult.tags.map(t => (
                          <span
                            key={t}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '5px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              color: '#67E8F9',
                              fontSize: '11px',
                              fontWeight: 500,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <Link
                        href="/try"
                        style={{
                          fontSize: '12.5px',
                          color: '#38BDF8',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none',
                        }}
                      >
                        <span>Open in Guest Mode</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: ⌘K SEMANTIC SEARCH SIMULATOR */}
            {activeTab === 'qa' && (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      Ask Anything Across Your Second Brain
                    </h3>
                    <span style={{ fontSize: '11px', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2px 8px', borderRadius: '999px', fontFamily: 'var(--font-mono)' }}>
                      ⌘K Neural Q&A
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                    Type a question or pick an example to see real-time vector synthesis with verified source citations:
                  </p>
                </div>

                {/* Working Question Input Bar */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleAsk();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px 6px 14px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  <FlaticonIcon name="search" variant="bold" animation="sparkle" size={16} color="#06B6D4" />
                  <input
                    type="text"
                    value={qaInput}
                    onChange={e => setQaInput(e.target.value)}
                    placeholder="Ask any question across your memories..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isAsking}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isAsking ? 'rgba(6, 182, 212, 0.3)' : 'linear-gradient(135deg, #06B6D4 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isAsking ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    {isAsking ? <Loader2 size={13} className="animate-spin" /> : <FlaticonIcon name="rocket" variant="bold" animation="float" size={13} color="#FFFFFF" />}
                    <span>Ask AI</span>
                  </button>
                </form>

                {/* Question Suggestion Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {QA_PRESETS.map((p, i) => (
                    <button
                      key={p.q}
                      onClick={() => {
                        setQaInput(p.q);
                        handleAsk(p.q);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: qaInput === p.q ? 600 : 450,
                        background: qaInput === p.q ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.035)',
                        border: qaInput === p.q ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                        color: qaInput === p.q ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p.q}
                    </button>
                  ))}
                </div>

                {/* Synthesized Answer Box with Source Collections */}
                <div
                  style={{
                    padding: '20px 22px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(6, 182, 212, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <FlaticonIcon name="brain" variant="solid" animation="pulse" size={15} color="#06B6D4" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#06B6D4', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
                        SYNTHESIZED MEMORY ANSWER
                      </span>
                    </div>

                    {/* Cited Collection Capsule */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: `${activeQa.collectionColor}18`,
                        border: `1px solid ${activeQa.collectionColor}35`,
                        fontSize: '11px',
                        fontWeight: 650,
                        color: activeQa.collectionColor,
                      }}
                    >
                      <CollectionIcon name={activeQa.collection} color={activeQa.collectionColor} size={11} badgeSize={16} />
                      <span>{activeQa.collection}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.7, margin: 0 }}>
                    {activeQa.a}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>
                      VERIFIED VAULT SOURCES:
                    </span>
                    {activeQa.citations.map(c => (
                      <span
                        key={c}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          fontSize: '11px',
                          color: '#38BDF8',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ContentTypeIcon type={activeQa.type} size={11} />
                        <span>{c}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: COLLECTIONS & TOPOLOGY GRAPH */}
            {activeTab === 'graph' && (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      Automated Collections & Cross-Memory Topology
                    </h3>
                    <span style={{ fontSize: '11px', color: '#67E8F9', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '2px 8px', borderRadius: '999px', fontFamily: 'var(--font-mono)' }}>
                      Vector Proximity
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                    SecondMind automatically clusters memories into smart collections with dedicated vector icons without requiring manual folders:
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {SIMULATOR_COLLECTIONS.filter(c => c.id !== 'all').map(col => (
                    <div
                      key={col.id}
                      onClick={() => {
                        setSelectedCollectionId(col.id);
                        setActiveTab('capture');
                        const matching = CAPTURE_PRESETS.find(p => p.collectionId === col.id);
                        if (matching) {
                          setInputUrl(matching.url);
                          setCurrentResult(matching);
                        }
                      }}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${col.color}35`,
                        boxShadow: `0 8px 24px ${col.color}10`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      className="hover-scale-physics"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CollectionIcon name={col.name} color={col.color} size={18} badgeSize={38} />
                        <span style={{ fontSize: '11px', color: col.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {col.count} memories
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                          {col.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>
                          Click to explore in simulator →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <Link
                    href="/try"
                    style={{
                      padding: '12px 24px',
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #06B6D4 0%, #0369A1 100%)',
                      color: '#fff',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)',
                    }}
                    className="button-press-physics"
                  >
                    <FlaticonIcon name="rocket" variant="bold" animation="float" size={14} color="#FFFFFF" />
                    Open Live Interactive Vault in Guest Mode <ArrowRight size={14} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .sim-layout { grid-template-columns: 1fr !important; }
          .sim-sidebar { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        }
      `}</style>
    </section>
  );
}
