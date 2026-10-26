import Link from 'next/link';
import {
  Sparkles,
  Brain,
  Search,
  Zap,
  Shield,
  ArrowRight,
  Play,
  ChevronRight,
  Lock,
  Globe,
  Layers,
} from 'lucide-react';
import { InteractiveSimulator, FAQSection, AuthenticatedAutoRedirect } from '@/components/landing-client';
import { CollectionIcon, ContentTypeIcon, FlaticonIcon, FlaticonCapsule } from '@/components/icons/PremiumIcons';

export default function LandingPage() {

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden', position: 'relative' }} className="overflow-x-hidden w-full max-w-full">
      <AuthenticatedAutoRedirect />
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
            background: 'rgba(5, 5, 5, 0.78)',
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
              <img src="/icon.png" alt="SecondMind AI Second Brain Logo" width={32} height={32} style={{ width: 32, height: 32, borderRadius: 9, display: 'block' }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 9, height: 9, borderRadius: '50%', background: '#06B6D4', border: '2px solid #030307' }} />
            </div>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)',
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
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#38BDF8',
                letterSpacing: '0.04em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              className="hide-xs"
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#06B6D4' }} />
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
              { label: 'Collections', href: '#collections' },
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
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
                background: 'linear-gradient(135deg, #06B6D4 0%, #0369A1 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 18px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              className="landing-cta-primary"
            >
              <FlaticonIcon name="bolt" variant="bold" animation="pulse" size={13} color="#fff" />
              Guest Mode
              <ChevronRight size={13} />
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px 60px',
          position: 'relative',
        }}
      >
        {/* Subtle Cosmic Grid Behind Hero */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
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
            background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.22) 0%, rgba(3, 105, 161, 0.12) 40%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(50px)',
          }}
        />

        {/* Understated Status Badge with Animated Flaticon Brain */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
            borderRadius: '999px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 500,
            marginBottom: '28px',
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-mono)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <FlaticonIcon name="brain" variant="solid" animation="pulse" size={14} color="#06B6D4" />
          <span>Local-first personal memory workspace</span>
        </div>

        {/* Headline — High-Impact Sentence Case with Balance */}
        <h1
          style={{
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            fontFamily: 'var(--font-display)',
            marginBottom: '20px',
            maxWidth: '920px',
            position: 'relative',
            zIndex: 1,
            textWrap: 'balance',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.85) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The second brain that actually remembers for you.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            lineHeight: 1.6,
            marginBottom: '36px',
            position: 'relative',
            zIndex: 1,
            textWrap: 'pretty',
          }}
        >
          Save any link, article, tweet, or note in under two seconds. SecondMind extracts the core takeaways, connects related concepts, and answers questions directly from your private archive.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '44px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Link
            href="/try"
            id="hero-try-free-cta"
            style={{
              padding: '15px 30px',
              fontSize: '14.5px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #06B6D4 0%, #0369A1 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              boxShadow: '0 8px 28px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
            className="landing-cta-primary button-press-physics"
          >
            <FlaticonIcon name="bolt" variant="bold" animation="pulse" size={16} color="#fff" />
            Try Guest Mode
            <ArrowRight size={15} />
          </Link>
          <a
            href="#simulator"
            style={{
              padding: '15px 26px',
              fontSize: '14.5px',
              fontWeight: 500,
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
            className="landing-cta-secondary button-press-physics"
          >
            <FlaticonIcon name="sparkles" variant="solid" animation="sparkle" size={15} color="#67E8F9" />
            Explore Simulator
            <kbd
              style={{
                padding: '2px 7px',
                borderRadius: '5px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#67E8F9',
              }}
            >
              ⌘K
            </kbd>
          </a>
        </div>

        {/* Real Architectural Guarantees Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={13} style={{ color: '#06B6D4' }} />
            <span>Zero model training on your notes</span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} style={{ color: '#38BDF8' }} />
            <span>Sub-2s extraction latency</span>
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={13} style={{ color: '#06B6D4' }} />
            <span>Encrypted local storage with JSON export</span>
          </span>
        </div>
      </section>

      {/* ── INTERACTIVE LIVE SIMULATOR ─────────────────────────────────── */}
      <div style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <InteractiveSimulator />
      </div>

      {/* ── ARCHITECTURAL BENCHMARKS BAR ────────────────────────────────────── */}
      <section
        style={{
          padding: '36px 24px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(20px, 5vw, 64px)',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.012)',
        }}
      >
        {[
          { label: 'Local Cache Access', value: '0ms', subtext: 'via IndexedDB / localStorage' },
          { label: 'Extraction Latency', value: '<2s', subtext: 'automated markdown synthesis' },
          { label: 'Vector Dimensions', value: '1536', subtext: 'semantic embeddings' },
          { label: 'Data Portability', value: '100%', subtext: 'open JSON & Markdown export' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', minWidth: '150px' }}>
            <div
              className="tabular-nums"
              style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 800,
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: '12.5px', color: '#67E8F9', marginTop: '3px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {s.subtext}
            </div>
          </div>
        ))}
      </section>

      {/* ── CURATED COLLECTIONS SYSTEM SHOWCASE ─────────────────────────── */}
      <section
        id="collections"
        style={{
          padding: '100px 24px',
          maxWidth: '1160px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '4px 12px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Layers size={11} style={{ color: '#38BDF8' }} />
            AUTONOMOUS TAXONOMY · ZERO MANUAL FILING
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 50px)',
              fontWeight: 900,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
              marginBottom: '14px',
            }}
          >
            Intelligent collections with{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #67E8F9 0%, #38BDF8 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              upgraded vector icons
            </span>
          </h2>
          <p
            style={{
              fontSize: '15.5px',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            SecondMind reads and vectorizes every saved resource in under two seconds. Content routes automatically into specialized smart collections with zero manual folder management.
          </p>
        </div>

        {/* 6 Curated Collection Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            {
              name: 'AI & Machine Learning',
              color: '#06B6D4',
              count: 14,
              desc: 'Transformer architectures, LLM fine-tuning, RAG pipelines, and diffusion models.',
              sample: { title: 'Attention Is All You Need (arXiv:1706.03762)', type: 'pdf' },
              tags: ['Transformers', 'VectorSearch', 'Embeddings'],
            },
            {
              name: 'Software Engineering',
              color: '#38BDF8',
              count: 28,
              desc: 'Systems architecture, distributed consensus, Linux internals, and database scaling.',
              sample: { title: 'Linux Kernel Monolithic Architecture & VFS', type: 'link' },
              tags: ['SystemDesign', 'Postgres', 'Concurrency'],
            },
            {
              name: 'Startups & Business',
              color: '#10B981',
              count: 19,
              desc: 'Founder playbooks, unit economics, market strategy, and venture frameworks.',
              sample: { title: 'How to Do Great Work — Paul Graham', type: 'tweet' },
              tags: ['SaaS', 'FounderNotes', 'Bootstrapping'],
            },
            {
              name: 'UI/UX & Design',
              color: '#EC4899',
              count: 12,
              desc: 'Design systems, micro-interactions, spatial ergonomics, and typography theory.',
              sample: { title: 'Linear Design System Foundations & Precision', type: 'link' },
              tags: ['DesignSystem', 'Figma', 'MicroMotion'],
            },
            {
              name: 'Productivity & PKM',
              color: '#F59E0B',
              count: 23,
              desc: 'Personal knowledge management, Zettelkasten slip-boxes, and CODE workflows.',
              sample: { title: 'Building a Second Brain (Tiago Forte)', type: 'note' },
              tags: ['PARA', 'Zettelkasten', 'KnowledgeArch'],
            },
            {
              name: 'Research & Science',
              color: '#6366F1',
              count: 15,
              desc: 'Academic preprints, neurobiology, quantum error correction, and cognition models.',
              sample: { title: 'Mechanistic Interpretability in Deep Networks', type: 'pdf' },
              tags: ['CognitiveMaps', 'Preprints', 'ArXiv'],
            },
          ].map(col => (
            <div
              key={col.name}
              style={{
                borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.025)',
                border: `1px solid ${col.color}30`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
                backdropFilter: 'blur(16px)',
                boxShadow: `0 12px 30px rgba(0, 0, 0, 0.35), 0 0 20px ${col.color}10`,
                transition: 'all 0.2s ease',
              }}
              className="hover-scale-physics"
            >
              {/* Header: Vector Icon + Title + Count Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CollectionIcon name={col.name} color={col.color} size={18} badgeSize={38} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 750, color: '#FFFFFF', margin: 0 }}>
                      {col.name}
                    </h3>
                    <div style={{ fontSize: '11px', color: col.color, fontFamily: 'var(--font-mono)', fontWeight: 650, marginTop: '2px' }}>
                      Auto-clustered cluster
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '8px',
                    background: `${col.color}15`,
                    border: `1px solid ${col.color}35`,
                    color: col.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {col.count} items
                </span>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {col.desc}
              </p>

              {/* Sample Extracted Memory Pill */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.85)',
                }}
              >
                <ContentTypeIcon type={col.sample.type} size={13} color={col.color} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {col.sample.title}
                </span>
              </div>

              {/* Auto Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                {col.tags.map(t => (
                  <span
                    key={t}
                    style={{
                      fontSize: '10.5px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      background: 'rgba(255, 255, 255, 0.035)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
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
              color: '#67E8F9',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              padding: '4px 12px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <FlaticonIcon name="brain-circuit" variant="bold" animation="pulse" size={13} color="#38BDF8" />
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
                background: 'linear-gradient(135deg, #67E8F9 0%, #38BDF8 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              effortlessly compounded
            </span>
          </h2>
        </div>
        {/* Gapless Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '20px',
          }}
          className="landing-bento-grid"
        >
          {/* Card 1: 8 Columns - Autonomous Neural Ingestion */}
          <div
            style={{
              gridColumn: 'span 8',
              padding: '36px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="landing-benefit-card bento-card-8"
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #06B6D4, transparent)',
                opacity: 0.8,
              }}
            />
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#67E8F9',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px',
                  letterSpacing: '0.04em',
                }}
              >
                <FlaticonIcon name="bolt" variant="bold" animation="pulse" size={13} color="#06B6D4" />
                <span>Sub-2s extraction</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
                Instant capture and auto-synthesis
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', marginBottom: '24px' }}>
                Drop any URL, research paper, PDF, or tweet. AI automatically strips clutter, extracts key takeaways, and assigns multi-dimensional topic tags.
              </p>
            </div>

            {/* Visual Asset: Interactive Extraction Terminal */}
            <div
              style={{
                background: 'rgba(5, 5, 10, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '14px',
                padding: '16px 20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#67E8F9', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06B6D4', boxShadow: '0 0 8px #06B6D4' }} />
                  <span style={{ fontWeight: 650 }}>Extraction pipeline</span>
                </span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }} className="tabular-nums">1.48s latency</span>
              </div>

              <div style={{ color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={13} style={{ color: '#38BDF8', flexShrink: 0 }} />
                <span style={{ color: '#38BDF8', fontWeight: 600 }}>SOURCE:</span>
                <span>https://github.com/torvalds/linux</span>
              </div>

              {/* Destination Collection Auto-Routing Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '6px 10px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)' }}>AUTO-ROUTED TO:</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CollectionIcon name="Software Engineering" color="#38BDF8" size={12} badgeSize={20} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#38BDF8' }}>Software Engineering</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                  <ContentTypeIcon type="link" size={12} color="#38BDF8" />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Web Archive</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Kernel', 'C Architecture', 'Monolithic', 'Operating System'].map(t => (
                  <span
                    key={t}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      color: '#67E8F9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: 4 Columns - Natural Language ⌘K Question Engine */}
          <div
            style={{
              gridColumn: 'span 4',
              padding: '36px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="landing-benefit-card bento-card-4"
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
                opacity: 0.8,
              }}
            />
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px',
                  letterSpacing: '0.02em',
                }}
              >
                <FlaticonIcon name="search" variant="regular" animation="sparkle" size={13} color="#38BDF8" />
                <span>Semantic retrieval</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
                Ask anything with ⌘K
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Ask complex questions across your entire vault. Receive synthesized direct answers with cited sources.
              </p>
            </div>

            {/* Visual Asset: Query Radar Box */}
            <div
              style={{
                background: 'rgba(5, 5, 10, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                  SEMANTIC RETRIEVAL
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#06B6D4' }}>
                  <CollectionIcon name="AI & Machine Learning" color="#06B6D4" size={10} badgeSize={16} />
                  AI & ML
                </span>
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>
                “What did I save about transformer attention?”
              </div>
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '11.5px',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: '#67E8F9', fontWeight: 700 }}>Synthesized:</span> Multi-head self-attention computes query-key affinity weights in O(N²) complexity.
              </div>
            </div>
          </div>

          {/* Card 3: 4 Columns - Interactive 2D Knowledge Graph */}
          <div
            style={{
              gridColumn: 'span 4',
              padding: '36px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="landing-benefit-card bento-card-4"
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #06B6D4, transparent)',
                opacity: 0.8,
              }}
            />
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(6, 182, 212, 0.12)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#67E8F9',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px',
                  letterSpacing: '0.02em',
                }}
              >
                <FlaticonIcon name="network" variant="bold" animation="spin" size={13} color="#06B6D4" />
                <span>Knowledge graph</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
                Self-assembling graph
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Watch connections link automatically. Related concepts cluster by semantic proximity without folders.
              </p>
            </div>

            {/* Visual Asset: Interactive Mini Graph Constellation with Collection Icons */}
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(5, 5, 10, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '12px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: '8px',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CollectionIcon name="AI & Machine Learning" color="#06B6D4" size={12} badgeSize={24} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>LLMs</span>
              </div>
              <span style={{ width: '20px', height: '1px', background: 'linear-gradient(90deg, #06B6D4, #38BDF8)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CollectionIcon name="Software Engineering" color="#38BDF8" size={12} badgeSize={24} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>Systems</span>
              </div>
              <span style={{ width: '20px', height: '1px', background: 'linear-gradient(90deg, #38BDF8, #F59E0B)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CollectionIcon name="Productivity & PKM" color="#F59E0B" size={12} badgeSize={24} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>Memory</span>
              </div>
            </div>
          </div>

          {/* Card 4: 8 Columns - Zero-Training Privacy Vault & Offline Sync */}
          <div
            style={{
              gridColumn: 'span 8',
              padding: '36px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="landing-benefit-card bento-card-8"
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
                opacity: 0.8,
              }}
            />
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px',
                  letterSpacing: '0.02em',
                }}
              >
                <FlaticonIcon name="shield" variant="bold" animation="pulse" size={13} color="#38BDF8" />
                <span>Zero-training vault</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
                Offline-first reliability and open portability
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '620px', marginBottom: '24px' }}>
                Your data is never used to train public models. IndexedDB and PWA Service Worker caching keep your thoughts available offline, syncing seamlessly when reconnected.
              </p>
            </div>

            {/* Visual Asset: Vault Security Status */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'rgba(5, 5, 10, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ color: '#10B981', fontWeight: 700, marginBottom: '4px' }}>✔ Zero AI Training Guarantee</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Strict cryptographic privacy boundary</div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  background: 'rgba(5, 5, 10, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ color: '#38BDF8', fontWeight: 700, marginBottom: '4px' }}>✔ One-Click JSON / MD Export</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Full ownership with zero vendor lock-in</div>
              </div>
            </div>
          </div>
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
                  background: 'linear-gradient(135deg, #67E8F9 0%, #38BDF8 50%, #06B6D4 100%)',
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
                stage: 'Ingestion',
                icon: <FlaticonIcon name="bolt" variant="bold" animation="pulse" size={16} color="#06B6D4" />,
                color: '#06B6D4',
                title: 'Capture Anything',
                desc: 'Paste a link, upload a PDF, drop an image, or type a note. Supports 12+ web and file formats.',
              },
              {
                stage: 'Synthesis',
                icon: <FlaticonIcon name="brain" variant="solid" animation="pulse" size={16} color="#38BDF8" />,
                color: '#38BDF8',
                title: 'AI Processing',
                desc: 'AI reads, extracts key insights, generates a summary, and adds smart tags — automatically.',
              },
              {
                stage: 'Neural Search',
                icon: <FlaticonIcon name="search" variant="bold" animation="sparkle" size={16} color="#06B6D4" />,
                color: '#06B6D4',
                title: 'Ask in Natural Language',
                desc: 'Hit ⌘K to search semantically or ask questions. Get cited answers from YOUR personal vault.',
              },
              {
                stage: 'Compounding',
                icon: <FlaticonIcon name="sparkles" variant="solid" animation="sparkle" size={16} color="#67E8F9" />,
                color: '#67E8F9',
                title: 'Emergent Connections',
                desc: 'AI surfaces patterns and links across everything you\'ve saved. Your knowledge compounds effortlessly.',
              },
            ].map((s, i) => (
              <div
                key={s.stage}
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  position: 'relative',
                  backdropFilter: 'blur(12px)',
                }}
                className="hover-scale-physics"
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: s.color,
                    letterSpacing: '0.06em',
                    marginBottom: '16px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: `rgba(${parseInt(s.color.slice(1, 3), 16)},${parseInt(s.color.slice(3, 5), 16)},${parseInt(s.color.slice(5, 7), 16)},0.12)`,
                    border: `1px solid ${s.color}35`,
                  }}
                >
                  {s.icon}
                  <span>{s.stage.toUpperCase()}</span>
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
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.32) 0%, rgba(3,105,161,0.12) 45%, transparent 70%)',
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
            background: 'linear-gradient(135deg, #06B6D4 0%, #0369A1 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '14px',
            boxShadow: '0 8px 36px rgba(6,182,212,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
            transition: 'all 0.25s',
            position: 'relative',
            zIndex: 1,
          }}
          className="landing-cta-primary"
        >
          <FlaticonIcon name="rocket" variant="bold" animation="float" size={18} />
          Try it free, no signup
          <ArrowRight size={16} />
        </Link>
      </section>
      </main>

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
          <img src="/icon.png" alt="SecondMind AI Logo" width={24} height={24} style={{ width: 24, height: 24, borderRadius: 6, opacity: 0.7 }} />
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
        <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', margin: 0, fontWeight: 500 }}>
          © Developed by Aseer Awsaf
        </p>
      </footer>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .landing-nav-link:hover { color: #fff !important; }
        .landing-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(6,182,212,0.6), 0 0 24px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.3) !important; }
        .landing-cta-secondary:hover { background: rgba(255,255,255,0.1) !important; border-color: rgba(6,182,212,0.4) !important; transform: translateY(-2px); }
        .landing-benefit-card:hover { transform: translateY(-4px); border-color: rgba(6,182,212,0.35) !important; background: rgba(255,255,255,0.05) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(6,182,212,0.15) !important; }
        .landing-play-btn:hover { transform: scale(1.1); }
        .landing-footer-link:hover { color: rgba(255,255,255,0.7) !important; }
        @media (max-width: 900px) {
          .landing-bento-grid { grid-template-columns: 1fr !important; }
          .bento-card-8, .bento-card-4 { grid-column: span 12 !important; }
        }
        @media (max-width: 640px) {
          .landing-step-arrow { display: none; }
        }
      `}</style>
    </div>
  );
}
