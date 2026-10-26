import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community — SecondMind',
  description: 'Share and discover memory packs and templates from the SecondMind community.',
};

export default function CommunityPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '0 24px' }}>
      {/* Nav */}
      <nav
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '24px 0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="SecondMind" style={{ width: 26, height: 26, borderRadius: 7 }} />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>SecondMind</span>
        </Link>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Back to home
        </Link>
      </nav>

      {/* Content */}
      <article
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '56px 0 100px',
          color: 'var(--text-secondary)',
          lineHeight: 1.75,
          fontSize: '15px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.03em',
            marginBottom: '12px',
          }}
        >
          Community
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '560px' }}>
          Discover curated memory packs, templates, and workflows shared by the SecondMind community.
        </p>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            {
              id: 'startup-stack',
              title: 'Startup Founder Pack',
              author: '@marcus_dev',
              authorName: 'Marcus Chen',
              description: 'Curated references, YC startup insights, and architecture decision logs for early-stage builders.',
              saves: 1240,
            },
            {
              id: 'frontend-architecture',
              title: 'Modern Web Architecture',
              author: '@elena_ai',
              authorName: 'Elena Rostova',
              description: 'Next.js 16 patterns, CSS Grid systems, and accessibility guidelines for high-performance apps.',
              saves: 895,
            },
            {
              id: 'cognitive-science',
              title: 'Cognitive Science & Memory',
              author: '@dr_sarah',
              authorName: 'Dr. Sarah Lindqvist',
              description: 'Peer-reviewed papers and notes on spaced repetition, active recall, and neuroplasticity.',
              saves: 530,
            },
          ].map(pack => (
            <div
              key={pack.id}
              className="hover-scale-physics"
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      margin: 0,
                      fontFamily: 'var(--font-heading)',
                      textWrap: 'balance',
                    }}
                  >
                    {pack.title}
                  </h3>
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: '11px',
                      color: '#38BDF8',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(6, 182, 212, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                    }}
                  >
                    {pack.saves} saves
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  by {pack.authorName} <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>({pack.author})</span>
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '20px',
                    lineHeight: 1.6,
                    textWrap: 'pretty',
                  }}
                >
                  {pack.description}
                </p>
              </div>

              <Link
                href={`/try?pack=${pack.id}`}
                style={{
                  background: 'rgba(6, 182, 212, 0.12)',
                  color: '#67E8F9',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
                className="button-press-physics"
              >
                <span>Import pack</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </article>

      <footer style={{ marginTop: '40px', fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        © Developed by Aseer Awsaf
      </footer>
    </div>
  );
}
