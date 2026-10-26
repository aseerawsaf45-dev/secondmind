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

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {[
            {
              id: 'meeting-notes',
              title: 'Meeting Notes & Decisions',
              category: 'Collaboration',
              description: 'A structured layout for capturing participants, agenda topics, decision rationale, and follow-up items.',
              action: 'Use template'
            },
            {
              id: 'research',
              title: 'Research & Literature Synthesis',
              category: 'Academic',
              description: 'Organize sources, direct citations, hypotheses, and analytical takeaways in one interconnected workspace.',
              action: 'Use template'
            },
            {
              id: 'journaling',
              title: 'Daily Reflection & Habit Log',
              category: 'Personal',
              description: 'Reflect on daily progress, monitor key cognitive habits, and capture fleeting thoughts with minimal friction.',
              action: 'Use template'
            },
            {
              id: 'project-planning',
              title: 'Technical Project Spec',
              category: 'Engineering',
              description: 'Map out architecture milestones, technical dependencies, and system constraints for your next build.',
              action: 'Use template'
            }
          ].map(template => (
            <div
              key={template.id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#67E8F9',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {template.category}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-heading)',
                    textWrap: 'balance',
                  }}
                >
                  {template.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '20px',
                    lineHeight: 1.6,
                    textWrap: 'pretty',
                  }}
                >
                  {template.description}
                </p>
              </div>

              <Link
                href={`/try?template=${template.id}`}
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
                <span>{template.action}</span>
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
