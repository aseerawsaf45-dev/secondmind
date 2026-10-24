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
} from 'lucide-react';

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
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: '#67E8F9',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
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
      color: '#06B6D4',
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
          border: '1px solid rgba(6, 182, 212, 0.28)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.85), 0 0 80px -20px rgba(6, 182, 212, 0.28), inset 0 1px 0 rgba(255,255,255,0.14)',
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
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#06B6D4', opacity: 0.85 }} />
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
                  background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.85), rgba(6, 182, 212, 0.85))' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: activeTab === tab.id ? '0 0 20px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
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
                      background: selectedCaptureIdx === i ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255,255,255,0.04)',
                      border: selectedCaptureIdx === i ? '1px solid rgba(6, 182, 212, 0.6)' : '1px solid rgba(255,255,255,0.08)',
                      color: selectedCaptureIdx === i ? '#67E8F9' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: selectedCaptureIdx === i ? '0 0 16px rgba(6, 182, 212, 0.3)' : 'none',
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
              <Zap size={16} style={{ color: '#06B6D4', flexShrink: 0 }} />
              <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#38BDF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeCapture.url}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#34D399', background: 'rgba(6, 182, 212, 0.12)', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(6, 182, 212, 0.35)', fontFamily: 'var(--font-mono)' }}>
                <span>⚡ Extracted in {activeCapture.time}</span>
              </div>
            </div>

            {/* Extraction stage indicator */}
            {analyzing ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <Sparkles size={28} style={{ color: '#38BDF8', animation: 'spin 1.2s linear infinite' }} />
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
                  border: '1px solid rgba(6, 182, 212, 0.35)',
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
                          background: 'rgba(6, 182, 212, 0.15)',
                          border: '1px solid rgba(6, 182, 212, 0.35)',
                          color: '#67E8F9',
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
                    background: selectedQaIdx === i ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255,255,255,0.03)',
                    border: selectedQaIdx === i ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255,255,255,0.08)',
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
                border: '1px solid rgba(6, 182, 212, 0.35)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={16} style={{ color: '#06B6D4' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#06B6D4', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
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
                      background: 'rgba(6, 182, 212, 0.12)',
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
                { title: 'Transformers & Attention', count: '4 linked memories', color: '#06B6D4', icon: '⚡' },
                { title: 'Personal Knowledge (PKM)', count: '6 linked memories', color: '#38BDF8', icon: '🧠' },
                { title: 'Mental Models & Frameworks', count: '3 linked memories', color: '#F59E0B', icon: '💡' },
                { title: 'Python & LLM Fine-Tuning', count: '5 linked memories', color: '#38BDF8', icon: '🐍' },
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
