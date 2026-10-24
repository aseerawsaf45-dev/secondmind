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

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            {
              id: 'startup-stack',
              title: 'Startup Founder Pack',
              author: '@johndoe',
              description: 'A collection of essential resources, YC videos, and templates for early-stage founders.',
              downloads: 1205
            },
            {
              id: 'frontend-dev',
              title: 'Frontend Mastery',
              author: '@jane_smith',
              description: 'CSS tricks, React patterns, and accessibility guidelines to level up your UI skills.',
              downloads: 840
            },
            {
              id: 'neuroscience',
              title: 'Neuroscience 101',
              author: '@dr_brain',
              description: 'Key papers and summaries on neuroplasticity and cognitive behavioral therapy.',
              downloads: 432
            },
          ].map(pack => (
            <div key={pack.id} style={{
              padding: '24px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  margin: 0
                }}>
                  {pack.title}
                </h3>
                <span style={{ fontSize: '12px', color: '#66A4AC' }}>{pack.downloads} DLs</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                by {pack.author}
              </div>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}>
                {pack.description}
              </p>
              <button style={{
                background: 'rgba(102, 164, 172, 0.1)',
                color: '#66A4AC',
                border: '1px solid rgba(102, 164, 172, 0.3)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Import Pack
              </button>
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
