'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Brain,
  Search,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Check,
  Star,
  Play,
  ChevronRight,
  ChevronDown,
  Layers,
  ExternalLink,
  Lock,
  Database,
} from 'lucide-react';

// ─── Typewriter hook ───────────────────────────────────────────────────────────
const VERBS = ['Save', 'Remember', 'Understand', 'Search', 'Connect', 'Revisit'];
function useTypewriter(words: string[], speed = 80, pause = 1800) {
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

// ─── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
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

const BENEFITS = [
  {
    icon: <Zap size={22} />,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.25)',
    title: 'Save in Under 2 Seconds',
    desc: 'Paste a URL, drop a file, or hit ⌘K. AI extracts, summarizes, and tags it — no folder-picking required.',
  },
  {
    icon: <Brain size={22} />,
    color: '#10B981',
    glow: 'rgba(16,185,129,0.25)',
    title: 'AI-Powered Organization',
    desc: 'Every save is automatically categorized, tagged, and linked to related items. Your knowledge graph builds itself.',
  },
  {
    icon: <Search size={22} />,
    color: '#38BDF8',
    glow: 'rgba(56,189,248,0.3)',
    title: 'Ask Anything',
    desc: 'Search in natural language or ask questions. Get cited answers from your personal knowledge base — not the whole web.',
  },
  {
    icon: <Globe size={22} />,
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.25)',
    title: 'Any Format, Any Source',
    desc: 'Links, PDFs, tweets, YouTube videos, notes, images. One place for everything you want to remember.',
  },
  {
    icon: <Shield size={22} />,
    color: '#F43F5E',
    glow: 'rgba(244,63,94,0.25)',
    title: 'Private by Design',
    desc: 'Your memories stay yours. No training on your data. Guest mode stores everything locally — no account needed.',
  },
  {
    icon: <Sparkles size={22} />,
    color: '#06B6D4',
    glow: 'rgba(6,182,212,0.25)',
    title: 'AI Insights & Patterns',
    desc: 'Discover connections you never noticed. Get weekly digests and cross-domain insights across everything you\'ve saved.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'Perfect to explore SecondMind',
    cta: 'Start Free',
    href: '/signup',
    featured: false,
    features: [
      '100 saves per month',
      'AI summaries & tags',
      'Semantic search',
      '5 collections',
      'Local guest mode',
      'Browser extension',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/mo',
    desc: 'For serious knowledge workers',
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    featured: true,
    badge: 'Most Popular',
    features: [
      'Unlimited saves',
      'Advanced AI insights',
      'AI Q&A with citations',
      'Unlimited collections',
      'PDF & document processing',
      'Priority sync across devices',
      'Export to Notion, Obsidian',
      'API access',
    ],
  },
  {
    name: 'Team',
    price: '$19',
    period: '/seat/mo',
    desc: 'Shared knowledge for teams',
    cta: 'Contact Sales',
    href: 'mailto:hello@secondmind.ai',
    featured: false,
    features: [
      'Everything in Pro',
      'Shared collections & workspaces',
      'Team AI insights',
      'Admin controls & audit logs',
      'SSO & SAML',
      'Dedicated support',
    ],
  },
];

const TESTIMONIALS = [
  {
    text: '"I used to lose 30 minutes a day re-finding things I\'d read. SecondMind eliminated that entirely."',
    author: 'Priya S.',
    role: 'Product Lead at a SaaS startup',
    stars: 5,
  },
  {
    text: '"The AI Q&A is genuinely magical. I asked it to summarize everything I\'d saved about LLMs and got a cited answer in 3 seconds."',
    author: 'Marcus T.',
    role: 'ML Engineer',
    stars: 5,
  },
  {
    text: '"Guest mode let me try it without signing up. I was hooked in 10 minutes."',
    author: 'Aiko N.',
    role: 'UX Researcher',
    stars: 5,
  },
];

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

function InteractiveSimulator() {
  const [activeTab, setActiveTab] = useState<'capture' | 'qa' | 'graph'>('capture');

  // Capture demo data
  const capturePresets = [
    {
      label: 'arXiv Paper',
      url: 'https://arxiv.org/abs/1706.03762',
      title: 'Attention Is All You Need',
      summary: 'Introduces the Transformer architecture using multi-head self-attention mechanisms, eliminating recurrence and convolutions entirely.',
      tags: ['AI', 'Transformers', 'Deep Learning'],
      domain: 'arxiv.org',
      time: '1.2s',
      emoji: '📄',
      color: '#10B981',
    },
    {
      label: 'YouTube Tutorial',
      url: 'https://youtube.com/watch?v=kCc8FmEb1nY',
      title: 'Andrej Karpathy: Let\'s build GPT from scratch',
      summary: 'Builds a generative pre-trained transformer from scratch in PyTorch, explaining tokenization, multi-head attention, and autoregressive loss.',
      tags: ['Python', 'LLM', 'Tutorial'],
      domain: 'youtube.com',
      time: '1.8s',
      emoji: '🎬',
      color: '#EF4444',
    },
    {
      label: 'Knowledge System',
      url: 'https://buildingasecondbrain.com',
      title: 'Building a Second Brain (CODE Framework)',
      summary: 'Capture, Organize, Distill, Express. A proven methodology to transform information overload into creative productivity.',
      tags: ['Productivity', 'PKM', 'Mindset'],
      domain: 'buildingasecondbrain.com',
      time: '1.4s',
      emoji: '🧠',
      color: '#66A4AC',
    },
  ];
  const [selectedCaptureIdx, setSelectedCaptureIdx] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState<'fetching' | 'extracting' | 'ready'>('ready');

  const handleSelectPreset = (idx: number) => {
    if (idx === selectedCaptureIdx) return;
    setSelectedCaptureIdx(idx);
    setAnalyzing(true);
    setStage('fetching');
    setTimeout(() => setStage('extracting'), 500);
    setTimeout(() => {
      setStage('ready');
      setAnalyzing(false);
    }, 1100);
  };

  // QA demo data
  const qaPresets = [
    {
      q: 'How do transformers eliminate recurrence?',
      a: 'Transformers replace sequential RNN recurrence with multi-head self-attention. Instead of processing tokens one-by-one, attention calculates relationship weights across all positions in parallel, allowing massive scaling.',
      citations: ['Attention Is All You Need (arXiv)', 'Karpathy: GPT from Scratch'],
    },
    {
      q: 'What is the CODE framework for notes?',
      a: 'CODE stands for Capture (keep what resonates), Organize (by actionability using PARA), Distill (find the essence with progressive summarization), and Express (share your work).',
      citations: ['Building a Second Brain', 'Tiago Forte Essays'],
    },
    {
      q: 'What are the steps of the Feynman Technique?',
      a: '1. Choose a concept you want to learn. 2. Teach it to a 12-year-old in plain language. 3. Identify gaps in your explanation and revisit source material. 4. Simplify, clarify, and create analogies.',
      citations: ['Feynman Technique (fs.blog)', 'Spaced Repetition Synthesis'],
    },
  ];
  const [selectedQaIdx, setSelectedQaIdx] = useState(0);

  const activeCapture = capturePresets[selectedCaptureIdx];
  const activeQa = qaPresets[selectedQaIdx];

  return (
    <section id="simulator" style={{ padding: '20px 24px 80px', maxWidth: '1080px', margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(139, 92, 246, 0.28)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.85), 0 0 80px -20px rgba(99, 102, 241, 0.28), inset 0 1px 0 rgba(255,255,255,0.14)',
          background: 'rgba(10, 12, 26, 0.88)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        }}
      >
        {/* Top Window Bar */}
        <div
          style={{
            padding: '16px 22px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Window dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#EF4444', opacity: 0.85 }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#F59E0B', opacity: 0.85 }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#10B981', opacity: 0.85 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              SecondMind Neural Engine v2.4
            </span>
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.45)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              gap: '4px',
            }}
          >
            {[
              { id: 'capture' as const, label: '⚡ 2s Capture', icon: <Zap size={13} /> },
              { id: 'qa' as const, label: '🧠 Neural Q&A', icon: <Search size={13} /> },
              { id: 'graph' as const, label: '🕸️ Knowledge Graph', icon: <Layers size={13} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.85), rgba(139, 92, 246, 0.85))' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab.id ? '0 0 20px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Instant Capture Simulator */}
        {activeTab === 'capture' && (
          <div style={{ padding: '32px 28px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
                  Paste any URL. AI reads, distills, and tags in &lt;2s.
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Select an example below to simulate live neural extraction:
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {capturePresets.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => handleSelectPreset(i)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: selectedCaptureIdx === i ? 700 : 500,
                      background: selectedCaptureIdx === i ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.04)',
                      border: selectedCaptureIdx === i ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(255,255,255,0.08)',
                      color: selectedCaptureIdx === i ? '#C4B5FD' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: selectedCaptureIdx === i ? '0 0 16px rgba(99, 102, 241, 0.3)' : 'none',
                    }}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated browser bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 18px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
            >
              <Zap size={16} style={{ color: '#10B981', flexShrink: 0 }} />
              <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#38BDF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeCapture.url}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#34D399', background: 'rgba(16, 185, 129, 0.12)', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.35)', fontFamily: 'var(--font-mono)' }}>
                <span>⚡ Extracted in {activeCapture.time}</span>
              </div>
            </div>

            {/* Extraction stage indicator */}
            {analyzing ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <Sparkles size={28} style={{ color: '#A78BFA', animation: 'spin 1.2s linear infinite' }} />
                <div style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>
                  {stage === 'fetching' ? '🌐 Scraping clean text & metadata...' : '🧠 Synthesizing key insights & tags...'}
                </div>
              </div>
            ) : (
              <div
                className="animate-fade-in"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{activeCapture.emoji}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {activeCapture.title}
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{activeCapture.domain}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, marginBottom: '16px' }}>
                  {activeCapture.summary}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activeCapture.tags.map(t => (
                      <span
                        key={t}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.35)',
                          color: '#C4B5FD',
                          fontSize: '11px',
                          fontWeight: 600,
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
                      fontSize: '13px',
                      color: '#34D399',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Try saving in live app <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Semantic Q&A Simulator */}
        {activeTab === 'qa' && (
          <div style={{ padding: '32px 28px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
                Ask questions. Get cited answers from YOUR saved memories.
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Not the whole web — just the research and articles you actually trust.
              </p>
            </div>

            {/* Sample questions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {qaPresets.map((p, i) => (
                <button
                  key={p.q}
                  onClick={() => setSelectedQaIdx(i)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: selectedQaIdx === i ? 600 : 400,
                    background: selectedQaIdx === i ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                    border: selectedQaIdx === i ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: selectedQaIdx === i ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  💬 {p.q}
                </button>
              ))}
            </div>

            {/* Answer Box */}
            <div
              className="animate-fade-in"
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={16} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  SecondMind AI Neural Synthesis
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.7, marginBottom: '16px' }}>
                {activeQa.a}
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Citations from your memory:</span>
                {activeQa.citations.map(c => (
                  <span
                    key={c}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      fontSize: '11px',
                      color: '#38BDF8',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    📎 {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Knowledge Graph Simulator */}
        {activeTab === 'graph' && (
          <div style={{ padding: '32px 28px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
                Automated Knowledge Graph Connections
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Every save links to related topics and concepts automatically.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
              }}
            >
              {[
                { title: 'Transformers & Attention', count: '4 linked memories', color: '#10B981', icon: '⚡' },
                { title: 'Personal Knowledge (PKM)', count: '6 linked memories', color: '#38BDF8', icon: '🧠' },
                { title: 'Mental Models & Frameworks', count: '3 linked memories', color: '#F59E0B', icon: '💡' },
                { title: 'Python & LLM Fine-Tuning', count: '5 linked memories', color: '#A78BFA', icon: '🐍' },
              ].map(n => (
                <div
                  key={n.title}
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${n.color}45`,
                    boxShadow: `0 0 24px ${n.color}18`,
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '8px' }}>{n.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{n.count}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link
                href="/try"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Explore all connections in Guest Mode <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FAQSection() {
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
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: '#C4B5FD',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '4px 12px',
            borderRadius: '999px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Frequently Asked Questions
        </div>
        <h2
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
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
                border: isOpen ? '1px solid rgba(139, 92, 246, 0.45)' : '1px solid rgba(255,255,255,0.07)',
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
                    color: isOpen ? '#C4B5FD' : 'var(--text-muted)',
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

export default function LandingPage() {
  const verb = useTypewriter(VERBS);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayDemo = () => {
    setDemoPlaying(true);
    videoRef.current?.play();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>
      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      {/* ── FLOATING CAPSULE NAV ────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: '16px',
          zIndex: 100,
          padding: '0 20px',
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <nav
          style={{
            height: '62px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 22px',
            borderRadius: '999px',
            background: 'rgba(10, 11, 24, 0.78)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="SecondMind" style={{ width: 32, height: 32, borderRadius: 9, display: 'block' }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 9, height: 9, borderRadius: '50%', background: '#10B981', border: '2px solid #030307' }} />
            </div>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #C4B5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'var(--font-display)',
              }}
            >
              SecondMind
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: '#C4B5FD',
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              className="hide-xs"
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
              v2.4
            </span>
          </Link>

          {/* Quick Nav Links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
            className="hide-xs"
          >
            {[
              { label: 'Simulator', href: '#simulator' },
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                className="landing-nav-link"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/login"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                borderRadius: '999px',
                transition: 'all 0.2s',
              }}
              className="landing-nav-link"
            >
              Sign in
            </Link>
            <Link
              href="/try"
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              className="landing-cta-primary"
            >
              <Zap size={13} />
              Try it free
              <ChevronRight size={13} />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 24px 80px',
          position: 'relative',
        }}
      >
        {/* Subtle Cosmic Grid Behind Hero */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.14) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 65% 55% at 50% 40%, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 40%, black 30%, transparent 80%)',
            pointerEvents: 'none',
          }}
        />

        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '420px',
            background:
              'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.28) 0%, rgba(6, 182, 212, 0.12) 40%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(50px)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            fontSize: '12px',
            color: '#C4B5FD',
            fontWeight: 700,
            marginBottom: '32px',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-mono)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Sparkles size={13} style={{ color: '#38BDF8' }} />
          SECOND BRAIN ARCHITECTURE · AI 2.4 LIVE
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(44px, 7.5vw, 88px)',
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: '-0.04em',
            fontFamily: 'var(--font-display)',
            marginBottom: '16px',
            maxWidth: '960px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.85) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The AI that helps you
          </span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #C4B5FD 0%, #818CF8 35%, #38BDF8 70%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              minWidth: '320px',
              filter: 'drop-shadow(0 0 25px rgba(99, 102, 241, 0.35))',
            }}
          >
            {verb}
            <span style={{ opacity: 0.6, animation: 'blink 1s step-end infinite' }}>|</span>
          </span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            everything.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            lineHeight: 1.65,
            marginBottom: '40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Paste any link, paper, or video. AI extracts key takeaways and auto-tags in under 2 seconds.
          Ask anything and get cited answers from your own trusted memory.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '48px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Link
            href="/try"
            id="hero-try-free-cta"
            style={{
              padding: '16px 32px',
              fontSize: '15px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.25s',
            }}
            className="landing-cta-primary"
          >
            <Zap size={17} />
            Try it free — no signup
            <ArrowRight size={16} />
          </Link>
          <a
            href="#simulator"
            style={{
              padding: '16px 28px',
              fontSize: '15px',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.25s',
            }}
            className="landing-cta-secondary"
          >
            <Play size={15} style={{ fill: '#C4B5FD', color: '#C4B5FD' }} />
            Explore Simulator
            <kbd
              style={{
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#C4B5FD',
              }}
            >
              ⌘K
            </kbd>
          </a>
        </div>

        {/* Trust Badges Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
            ))}
            <span style={{ marginLeft: '4px', fontWeight: 600, color: '#fff' }}>4.9/5</span>
            <span style={{ color: 'var(--text-muted)' }}>from early users</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} style={{ color: '#10B981' }} />
            <span>&lt;2s Neural Extraction</span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={13} style={{ color: '#38BDF8' }} />
            <span>100% Private & Local</span>
          </span>
        </div>
      </section>

      {/* ── INTERACTIVE LIVE SIMULATOR ─────────────────────────────────── */}
      <InteractiveSimulator />

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '44px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(24px, 6vw, 80px)',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.015)',
        }}
      >
        {[
          { label: 'Memories saved', value: 180000, suffix: '+' },
          { label: 'Time saved / user', value: 4, suffix: 'h/wk' },
          { label: 'AI accuracy', value: 98, suffix: '%' },
          { label: 'Supported formats', value: 12, suffix: '' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #C4B5FD 50%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'var(--font-display)',
              }}
            >
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── BENEFITS / BENTO ARCHITECTURE ─────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: '1140px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: '#A78BFA',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '4px 12px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={11} style={{ color: '#38BDF8' }} />
            WHY SECONDMIND · SYSTEM ARCHITECTURE
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
            }}
          >
            Your knowledge,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #C4B5FD 0%, #818CF8 50%, #38BDF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              effortlessly compounded
            </span>
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {BENEFITS.map(b => (
            <div
              key={b.title}
              style={{
                padding: '28px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.25s',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="landing-benefit-card"
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, ${b.color}, transparent)`,
                  opacity: 0.6,
                }}
              />
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `rgba(${parseInt(b.color.slice(1, 3), 16)},${parseInt(b.color.slice(3, 5), 16)},${parseInt(b.color.slice(5, 7), 16)},0.12)`,
                  border: `1px solid ${b.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: b.color,
                  marginBottom: '16px',
                  boxShadow: `0 0 20px ${b.glow}`,
                }}
              >
                {b.icon}
              </div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {b.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '100px 24px',
          background: 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
              }}
            >
              From scattered tabs to an{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #38BDF8 0%, #A78BFA 50%, #10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                answerable brain
              </span>
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                step: '01',
                color: '#F59E0B',
                title: 'Save anything',
                desc: 'Paste a link, upload a PDF, drop an image, or type a note. Supports 12+ formats.',
              },
              {
                step: '02',
                color: '#10B981',
                title: 'AI processes it',
                desc: 'AI reads, extracts key insights, generates a summary, and adds smart tags — automatically.',
              },
              {
                step: '03',
                color: '#38BDF8',
                title: 'Search & ask',
                desc: 'Hit ⌘K to search semantically or ask a question. Get answers from YOUR knowledge base.',
              },
              {
                step: '04',
                color: '#A78BFA',
                title: 'Discover connections',
                desc: 'AI surfaces patterns and links across everything you\'ve saved. Your knowledge compounds.',
              },
            ].map((s, i) => (
              <div
                key={s.step}
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: s.color,
                    letterSpacing: '0.1em',
                    marginBottom: '12px',
                    opacity: 0.8,
                  }}
                >
                  STEP {s.step}
                </div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {s.desc}
                </p>
                {i < 3 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '-13px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.15)',
                      fontSize: '20px',
                      zIndex: 1,
                    }}
                    className="landing-step-arrow"
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            Loved by knowledge workers
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {TESTIMONIALS.map(t => (
            <div
              key={t.author}
              style={{
                padding: '28px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', gap: '3px', marginBottom: '16px' }}>
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.65,
                  marginBottom: '20px',
                  fontStyle: 'italic',
                }}
              >
                {t.text}
              </p>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{t.author}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: '100px 24px',
          background: 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                marginBottom: '12px',
              }}
            >
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
              Start free. Upgrade when you need more.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {PLANS.map(plan => (
              <div
                key={plan.name}
                style={{
                  padding: '32px',
                  borderRadius: '24px',
                  background: plan.featured
                    ? 'linear-gradient(145deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.1) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  border: plan.featured
                    ? '1px solid rgba(139,92,246,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.featured ? '0 20px 60px -15px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
                  position: 'relative',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '4px 16px',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                    {plan.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '40px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>{plan.desc}</p>
                <Link
                  href={plan.href}
                  style={{
                    display: 'block',
                    padding: '13px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    marginBottom: '24px',
                    background: plan.featured
                      ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                      : 'rgba(255,255,255,0.07)',
                    color: '#fff',
                    border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: plan.featured ? '0 4px 18px rgba(99,102,241,0.4)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {plan.cta}
                </Link>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Check size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ───────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '120px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '350px',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.32) 0%, rgba(139,92,246,0.12) 45%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(60px)',
          }}
        />
        <h2
          style={{
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            fontWeight: 900,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.035em',
            marginBottom: '16px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Ready to remember everything?
        </h2>
        <p
          style={{
            fontSize: '17px',
            color: 'var(--text-secondary)',
            marginBottom: '44px',
            maxWidth: '520px',
            margin: '0 auto 44px',
            lineHeight: 1.65,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Start for free. No credit card. No signup required to try.
          Your second brain is one click away.
        </p>
        <Link
          href="/try"
          id="footer-try-free-cta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 36px',
            fontSize: '16px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '14px',
            boxShadow: '0 8px 36px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
            transition: 'all 0.25s',
            position: 'relative',
            zIndex: 1,
          }}
          className="landing-cta-primary"
        >
          <Zap size={18} />
          Try it free, no signup
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="SecondMind" style={{ width: 24, height: 24, borderRadius: 6, opacity: 0.7 }} />
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>SecondMind</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Sign in', href: '/login' },
            { label: 'Sign up', href: '/signup' },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              className="landing-footer-link"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          © {new Date().getFullYear()} SecondMind. Built for people who never stop learning.
        </p>
      </footer>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .landing-nav-link:hover { color: #fff !important; }
        .landing-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(99,102,241,0.6), 0 0 24px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.3) !important; }
        .landing-cta-secondary:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(139,92,246,0.4) !important; transform: translateY(-2px); }
        .landing-benefit-card:hover { transform: translateY(-4px); border-color: rgba(139,92,246,0.35) !important; background: rgba(255,255,255,0.05) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.15) !important; }
        .landing-play-btn:hover { transform: scale(1.1); }
        .landing-footer-link:hover { color: rgba(255,255,255,0.7) !important; }
        @media (max-width: 640px) {
          .landing-step-arrow { display: none; }
        }
      `}</style>
    </div>
  );
}
