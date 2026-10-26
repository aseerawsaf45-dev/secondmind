import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Code, BookOpen, GraduationCap, PenTool, Sparkles, ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';

interface PersonaData {
  title: string;
  metaTitle: string;
  metaDesc: string;
  badge: string;
  headline: string;
  subheadline: string;
  icon: string;
  keyBenefits: { title: string; desc: string }[];
  useCases: string[];
  sampleQueries: string[];
}

const PERSONAS: Record<string, PersonaData> = {
  developers: {
    title: 'Developers & Software Engineers',
    metaTitle: 'SecondMind for Developers — AI Second Brain for Code & Docs',
    metaDesc: 'Never lose a stack overflow fix, API doc, or GitHub repo again. Semantic ⌘K search, automatic code tagging, and instant knowledge capture.',
    badge: 'Engineered for Builders',
    headline: 'The AI Second Brain for Software Engineers',
    subheadline: 'Capture GitHub repos, tech documentation, StackOverflow threads, and code architecture notes in under 2 seconds. Ask questions in natural language and get cited technical answers.',
    icon: 'code',
    keyBenefits: [
      {
        title: 'Instant ⌘K Semantic Code Search',
        desc: 'Search by concept rather than exact syntax. Ask "how did I configure nginx reverse proxy?" and get your exact saved snippet with the source URL.',
      },
      {
        title: 'Zero-Friction Dev Bookmarking',
        desc: 'Paste GitHub links, documentation pages, or terminal outputs. SecondMind strips clutter and categorizes tags automatically.',
      },
      {
        title: 'Offline-First Desktop & Mobile',
        desc: 'Work on planes, trains, or offline hackathons with local caching and seamless background sync.',
      },
    ],
    useCases: [
      'Save esoteric bug fixes & error resolutions',
      'Bookmark cutting-edge open-source repositories',
      'Archive API documentation and SDK guides',
      'Track architecture decisions and RFC drafts',
    ],
    sampleQueries: [
      '“What was the Docker multi-stage build command for Node?”',
      '“Where is the React 19 server actions tutorial I saved last week?”',
      '“Show all PostgreSQL indexing tips.”',
    ],
  },
  researchers: {
    title: 'Researchers & Academics',
    metaTitle: 'SecondMind for Researchers — AI Knowledge Base & Paper Synthesis',
    metaDesc: 'Organize research papers, arXiv citations, whitepapers, and literature reviews with AI-powered synthesis and bidirectional knowledge graphs.',
    badge: 'Built for Deep Inquiry',
    headline: 'Synthesize your research and literature review',
    subheadline: 'Aggregate arXiv papers, academic essays, clinical trials, and conference notes into an interconnected knowledge base. Discover hidden connections across disciplines.',
    icon: 'book',
    keyBenefits: [
      {
        title: 'Cross-Domain Knowledge Synthesis',
        desc: 'SecondMind clusters related papers automatically and reveals thematic overlap between disparate domains of research.',
      },
      {
        title: 'Citations & Key Takeaways',
        desc: 'Extract executive summaries, core methodologies, and statistical findings in seconds.',
      },
      {
        title: 'Bidirectional Knowledge Graph',
        desc: 'Visualize how your hypotheses, papers, and findings interconnect in an interactive 2D physics graph.',
      },
    ],
    useCases: [
      'Synthesize literature reviews and meta-analyses',
      'Archive arXiv and IEEE research papers with AI briefs',
      'Collect citations and peer-reviewed studies',
      'Map interdisciplinary research themes',
    ],
    sampleQueries: [
      '“Summarize the methodology of the sparse attention paper.”',
      '“What are the conflicting findings on sleep architecture?”',
      '“Find all papers mentioning contrastive learning.”',
    ],
  },
  students: {
    title: 'Students & Lifelong Learners',
    metaTitle: 'SecondMind for Students — Smart Study Notes & Lecture Memory',
    metaDesc: 'The ultimate AI study companion. Turn lecture videos, articles, and textbooks into bite-sized summaries, flash insights, and searchable notes.',
    badge: 'Study Smarter, Not Harder',
    headline: 'Turn Information Overload into Exam Mastery',
    subheadline: 'Save educational YouTube lectures, study guides, and course articles. SecondMind generates concise summaries, key takeaways, and flash-searchable cards.',
    icon: 'grad',
    keyBenefits: [
      {
        title: 'YouTube Lecture Breakdown',
        desc: 'Paste any educational YouTube URL to get automated video notes, key concepts, and indexed timestamps.',
      },
      {
        title: 'Exam-Ready Semantic Retrieval',
        desc: 'Ask your personal study bot questions right before finals and review the exact concepts you saved.',
      },
      {
        title: '100% Free Guest Mode',
        desc: 'Start taking notes immediately with zero login friction. Stored securely on your device.',
      },
    ],
    useCases: [
      'Break down 1-hour university lectures into 3-minute briefs',
      'Build a unified course notebook across semesters',
      'Save educational threads, articles, and book excerpts',
      'Cram effectively with question-answer study recall',
    ],
    sampleQueries: [
      '“Explain Keynesian vs Austrian economics from my notes.”',
      '“What were the 3 stages of cellular respiration?”',
      '“Show all organic chemistry reaction mechanisms.”',
    ],
  },
  creators: {
    title: 'Creators, Writers & Digital Thinkers',
    metaTitle: 'SecondMind for Creators — Endless Inspiration & Idea Synthesis',
    metaDesc: 'Capture creative sparks, viral threads, essays, and visual references. SecondMind connects your thoughts into compelling finished work.',
    badge: 'Fuel Your Creative Flow',
    headline: 'Your Infinite Vault for Ideas, Hooks & Stories',
    subheadline: 'Never lose a creative spark again. Capture viral X/Twitter threads, design inspirations, podcast insights, and book quotes in a frictionless creative space.',
    icon: 'pen',
    keyBenefits: [
      {
        title: 'Capture at the Speed of Thought',
        desc: 'Hit ⌘V to drop links, quotes, or voice notes. SecondMind classifies your content so you can focus on making.',
      },
      {
        title: 'Eliminate Writer’s Block',
        desc: 'Ask your SecondMind: "What hooks did I save about storytelling?" and receive immediate, cited inspiration from your own past discoveries.',
      },
      {
        title: 'Smart Inspiration Clusters',
        desc: 'Group ideas into collections for scripts, newsletters, novels, or video essays without tedious manual filing.',
      },
    ],
    useCases: [
      'Collect viral hooks, angles, and content formats',
      'Archive newsletter inspiration and thought-leader essays',
      'Build an idea backlog for blogs, podcasts, and videos',
      'Organize design palettes, typography, and mood boards',
    ],
    sampleQueries: [
      '“Show me all copywriting frameworks I saved.”',
      '“What examples of narrative non-fiction do I have?”',
      '“Find hooks about audience building.”',
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PERSONAS).map(persona => ({ persona }));
}

export async function generateMetadata({ params }: { params: Promise<{ persona: string }> }): Promise<Metadata> {
  const { persona } = await params;
  const data = PERSONAS[persona];
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDesc,
    alternates: {
      canonical: `https://secondmind-aa.vercel.app/for/${persona}`,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDesc,
      type: 'website',
      url: `https://secondmind-aa.vercel.app/for/${persona}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDesc,
      images: ['/og-image.png'],
    },
  };
}

export default async function PersonaPage({ params }: { params: Promise<{ persona: string }> }) {
  const { persona } = await params;
  const data = PERSONAS[persona];

  if (!data) {
    notFound();
  }

  const getIcon = () => {
    switch (data.icon) {
      case 'code':
        return <Code size={28} className="text-cyan-400" />;
      case 'book':
        return <BookOpen size={28} className="text-sky-400" />;
      case 'grad':
        return <GraduationCap size={28} className="text-emerald-400" />;
      case 'pen':
        return <PenTool size={28} className="text-violet-400" />;
      default:
        return <Sparkles size={28} className="text-cyan-400" />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: '#fff', paddingBottom: '80px' }}>
      {/* ── HEADER NAVIGATION ──────────────────────────────────────────────── */}
      <header style={{ padding: '20px 24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="SecondMind AI Logo" width={32} height={32} style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>SecondMind</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/templates" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            Templates
          </Link>
          <Link href="/roadmap" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            Roadmap
          </Link>
          <Link
            href="/try"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Try Free
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1000px', margin: '60px auto 0', padding: '0 24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: '#67E8F9',
            marginBottom: '24px',
            letterSpacing: '0.05em',
          }}
        >
          {getIcon()}
          <span>{data.badge.toUpperCase()}</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {data.headline}
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '750px',
            margin: '0 auto 36px',
          }}
        >
          {data.subheadline}
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          <Link
            href="/try"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)',
            }}
          >
            Start in Guest Mode — Free
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create Permanent Account
          </Link>
        </div>

        {/* ── KEY BENEFITS GRID ─────────────────────────────────────────────── */}
        <section style={{ textAlign: 'left', marginTop: '80px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            Why {data.title} Choose SecondMind
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {data.keyBenefits.map((benefit, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '28px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={20} className="text-cyan-400" />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{benefit.title}</h3>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── USE CASES & NATURAL LANGUAGE QUERIES ──────────────────────────── */}
        <section
          style={{
            marginTop: '80px',
            background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            borderRadius: '24px',
            padding: '40px 32px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} className="text-cyan-400" />
                Tailored Workflows
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.useCases.map((uc, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <span style={{ color: '#06B6D4', fontWeight: 'bold' }}>•</span>
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} className="text-sky-400" />
                What You Can Ask
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.sampleQueries.map((query, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontFamily: 'var(--font-mono)',
                      color: '#E2E8F0',
                    }}
                  >
                    {query}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER CALL TO ACTION ─────────────────────────────────────────── */}
        <section style={{ marginTop: '80px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
            Ready to upgrade how you think?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '28px' }}>
            Join thousands of {data.title.toLowerCase()} building their personal AI memory bank.
          </p>
          <Link
            href="/try"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 30px -5px rgba(6, 182, 212, 0.4)',
            }}
          >
            Launch SecondMind Now — Free
            <ArrowRight size={16} />
          </Link>
          <div style={{ marginTop: '14px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Shield size={13} />
            <span>Zero-training guarantee • Private by default • Export anytime</span>
          </div>
        </section>
      </main>
    </div>
  );
}
