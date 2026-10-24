import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Templates & Use Cases — SecondMind',
  description: 'Pre-built workflows for meeting notes, research, and journaling.',
};

export default function TemplatesPage() {
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
          Templates & Use Cases
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '560px' }}>
          Kickstart your personal knowledge base with these pre-built structures and workflows.
        </p>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            {
              id: 'meeting-notes',
              title: 'Meeting Notes',
              description: 'A structured template for capturing attendees, agenda, action items, and key takeaways.',
              action: 'Use Template'
            },
            {
              id: 'research',
              title: 'Research Hub',
              description: 'Organize sources, quotes, hypotheses, and conclusions in one interconnected place.',
              action: 'Use Template'
            },
            {
              id: 'journaling',
              title: 'Daily Journaling',
              description: 'Reflect on your day, track habits, and log fleeting thoughts with a low-friction template.',
              action: 'Use Template'
            },
            {
              id: 'project-planning',
              title: 'Project Planning',
              description: 'Map out milestones, dependencies, and resources for your next big idea.',
              action: 'Use Template'
            }
          ].map(template => (
            <div key={template.id} style={{
              padding: '24px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#FFFFFF',
                marginBottom: '8px'
              }}>
                {template.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}>
                {template.description}
              </p>
              <button style={{
                background: '#66A4AC',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                {template.action}
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
