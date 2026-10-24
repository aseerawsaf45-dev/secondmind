import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Public Roadmap — SecondMind',
  description: 'See what we are building next for SecondMind.',
};

export default function RoadmapPage() {
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
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Last updated: October 2026
        </p>
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
          Public Roadmap
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '560px' }}>
          We build in public. Here is a look at what we are currently working on and what we have planned for the future of SecondMind.
        </p>

        {[
          {
            id: 'now',
            title: 'Q4 2026 - Now',
            body: (
              <ul>
                <li><strong>Templates & Use Cases:</strong> Pre-built workflows for meeting notes, research, and journaling.</li>
                <li><strong>Public Roadmap:</strong> This page right here! Sharing our plans to build trust.</li>
                <li><strong>Enhanced Mobile Experience:</strong> Ensuring the app feels native and fast on all devices.</li>
              </ul>
            ),
          },
          {
            id: 'next',
            title: 'Q1 2027 - Next',
            body: (
              <ul>
                <li><strong>Semantic Search:</strong> Go beyond keyword search to understand query intent and context.</li>
                <li><strong>Proactive AI Suggestions:</strong> Surface related notes or forgotten ideas while you write or browse.</li>
                <li><strong>Mobile Share Sheet Integration:</strong> Save directly from other apps on your iOS or Android device.</li>
              </ul>
            ),
          },
          {
            id: 'later',
            title: 'Q2 2027 - Later',
            body: (
              <ul>
                <li><strong>End-to-End Encryption (E2EE):</strong> True zero-knowledge encryption for your most sensitive notes.</li>
                <li><strong>Advanced Organization:</strong> Flexible structures like bidirectional links (Roam/Obsidian style) and a visual graph view.</li>
                <li><strong>Community Features:</strong> Allow users to share "memory packs" or templates with privacy controls.</li>
              </ul>
            ),
          }
        ].map(section => (
          <section key={section.id} id={section.id} style={{ marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#FFFFFF',
                fontFamily: 'var(--font-heading)',
                marginBottom: '16px',
              }}
            >
              {section.title}
            </h2>
            <div
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
              }}
            >
              {section.body}
            </div>
          </section>
        ))}
      </article>

      <footer style={{ marginTop: '40px', fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
        © Developed by Aseer Awsaf
      </footer>

      <style>{`
        article ul { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
        article ul li { color: var(--text-secondary); }
        article strong { color: rgba(255,255,255,0.9); }
      `}</style>
    </div>
  );
}
