import Link from 'next/link';
import {
  Sparkles,
  Brain,
  Search,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Star,
  Play,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { TypewriterText, Counter, InteractiveSimulator, FAQSection, AuthenticatedAutoRedirect } from '@/components/landing-client';

const VERBS = ['Save', 'Remember', 'Understand', 'Search', 'Connect', 'Revisit'];



const BENEFITS = [
  {
    icon: <Zap size={22} />,
    color: '#06B6D4',
    glow: 'rgba(6,182,212,0.25)',
    title: 'Save in Under 2 Seconds',
    desc: 'Paste a URL, drop a file, or hit ⌘K. AI extracts, summarizes, and tags it — no folder-picking required.',
  },
  {
    icon: <Brain size={22} />,
    color: '#38BDF8',
    glow: 'rgba(56,189,248,0.25)',
    title: 'AI-Powered Organization',
    desc: 'Every save is automatically categorized, tagged, and linked to related items. Your knowledge graph builds itself.',
  },
  {
    icon: <Search size={22} />,
    color: '#06B6D4',
    glow: 'rgba(6,182,212,0.25)',
    title: 'Ask Anything',
    desc: 'Search in natural language or ask questions. Get cited answers from your personal knowledge base — not the whole web.',
  },
  {
    icon: <Globe size={22} />,
    color: '#E2E8F0',
    glow: 'rgba(226,232,240,0.15)',
    title: 'Any Format, Any Source',
    desc: 'Links, PDFs, tweets, YouTube videos, notes, images. One place for everything you want to remember.',
  },
  {
    icon: <Shield size={22} />,
    color: '#94A3B8',
    glow: 'rgba(148,163,184,0.15)',
    title: 'Private by Design',
    desc: 'Your memories stay yours. No training on your data. Guest mode stores everything locally — no account needed.',
  },
  {
    icon: <Sparkles size={22} />,
    color: '#38BDF8',
    glow: 'rgba(56,189,248,0.25)',
    title: 'AI Insights & Patterns',
    desc: 'Discover connections you never noticed. Get weekly digests and cross-domain insights across everything you\'ve saved.',
  },
];

export default function LandingPage() {

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>
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
              <img src="/icon.png" alt="SecondMind" style={{ width: 32, height: 32, borderRadius: 9, display: 'block' }} />
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
              <Zap size={13} />
              Guest Mode
              <ChevronRight size={13} />
            </Link>
          </div>
        </nav>
      </header>

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

        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            fontSize: '12px',
            color: '#38BDF8',
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
              background: 'linear-gradient(135deg, #67E8F9 0%, #38BDF8 50%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              minWidth: '320px',
              filter: 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.35))',
            }}
          >
            <TypewriterText words={VERBS} />
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
              background: 'linear-gradient(135deg, #06B6D4 0%, #0369A1 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
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
            <Play size={15} style={{ fill: '#38BDF8', color: '#38BDF8' }} />
            Explore Simulator
            <kbd
              style={{
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#67E8F9',
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
              <Star key={i} size={14} fill="#06B6D4" color="#06B6D4" />
            ))}
            <span style={{ marginLeft: '4px', fontWeight: 600, color: '#fff' }}>4.9/5</span>
            <span style={{ color: 'var(--text-muted)' }}>from early users</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} style={{ color: '#06B6D4' }} />
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
      <div style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <InteractiveSimulator />
      </div>

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
                background: 'linear-gradient(135deg, #FFFFFF 0%, #67E8F9 50%, #06B6D4 100%)',
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
                background: 'linear-gradient(135deg, #67E8F9 0%, #38BDF8 50%, #06B6D4 100%)',
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
                step: '01',
                color: '#06B6D4',
                title: 'Save anything',
                desc: 'Paste a link, upload a PDF, drop an image, or type a note. Supports 12+ formats.',
              },
              {
                step: '02',
                color: '#38BDF8',
                title: 'AI processes it',
                desc: 'AI reads, extracts key insights, generates a summary, and adds smart tags — automatically.',
              },
              {
                step: '03',
                color: '#06B6D4',
                title: 'Search & ask',
                desc: 'Hit ⌘K to search semantically or ask a question. Get answers from YOUR knowledge base.',
              },
              {
                step: '04',
                color: '#E2E8F0',
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
        @media (max-width: 640px) {
          .landing-step-arrow { display: none; }
        }
      `}</style>
    </div>
  );
}
