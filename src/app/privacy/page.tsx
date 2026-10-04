import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SecondMind',
  description: 'Learn how SecondMind collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '560px' }}>
          SecondMind is built on the principle that your knowledge is yours. This policy explains exactly
          what data we collect, why, and what we will never do with it.
        </p>

        {[
          {
            id: '1-information-we-collect',
            title: '1. Information We Collect',
            body: (
              <>
                <p>We collect the following categories of data:</p>
                <ul>
                  <li>
                    <strong>Account information</strong> — email address, name, and authentication tokens
                    provided through Clerk when you create an account.
                  </li>
                  <li>
                    <strong>Content you save</strong> — URLs, titles, AI-generated summaries, tags,
                    notes, and uploaded files you explicitly save to SecondMind.
                  </li>
                  <li>
                    <strong>Usage data</strong> — page views, feature interactions, and error logs
                    collected via privacy-respecting analytics (no cross-site tracking).
                  </li>
                  <li>
                    <strong>Guest data</strong> — in guest mode, all data is stored exclusively in your
                    browser's local storage. Nothing is transmitted to our servers unless you create an
                    account and migrate.
                  </li>
                </ul>
              </>
            ),
          },
          {
            id: '2-how-we-use-your-data',
            title: '2. How We Use Your Data',
            body: (
              <>
                <p>We use your data to:</p>
                <ul>
                  <li>Provide and improve the SecondMind service</li>
                  <li>Generate AI summaries, tags, and insights from content you save</li>
                  <li>Enable search and Q&A against your personal knowledge base</li>
                  <li>Send transactional emails (e.g., password reset, billing)</li>
                  <li>Detect and prevent abuse</li>
                </ul>
                <p style={{ marginTop: '16px' }}>
                  <strong>We do not</strong> use your saved content to train AI models, sell your data to
                  third parties, or serve behavioral advertising.
                </p>
              </>
            ),
          },
          {
            id: '3-data-sharing',
            title: '3. Data Sharing',
            body: (
              <p>
                We share data only with the sub-processors required to run the service (Clerk for authentication,
                Neon for database hosting, and Vercel for infrastructure). All sub-processors are bound by
                data processing agreements. We do not sell, rent, or share your personal data with any
                third party for marketing purposes.
              </p>
            ),
          },
          {
            id: '4-ai-processing',
            title: '4. AI Processing',
            body: (
              <p>
                SecondMind uses AI models to summarize and tag the content you save. These requests are
                processed server-side and are not stored by the AI provider beyond the time required to
                generate a response. Your content is never used to fine-tune or retrain external models.
              </p>
            ),
          },
          {
            id: '5-your-rights',
            title: '5. Your Rights',
            body: (
              <>
                <p>Depending on your location, you may have the right to:</p>
                <ul>
                  <li>Access and download a copy of your data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and all associated data (available directly in Settings)</li>
                  <li>Object to certain processing</li>
                  <li>Data portability (JSON export available in the dashboard)</li>
                </ul>
                <p style={{ marginTop: '16px' }}>
                  To exercise your rights, use the Settings panel in the app or email us at{' '}
                  <a href="mailto:privacy@secondmind.ai" style={{ color: '#66A4AC' }}>
                    privacy@secondmind.ai
                  </a>
                  .
                </p>
              </>
            ),
          },
          {
            id: '6-data-retention',
            title: '6. Data Retention',
            body: (
              <p>
                We retain your data for as long as your account is active. When you delete your account,
                all associated data is permanently deleted within 30 days. Guest data is stored only in
                your browser and is cleared when you clear browser storage or log out.
              </p>
            ),
          },
          {
            id: '7-cookies',
            title: '7. Cookies',
            body: (
              <p>
                We use a single first-party cookie (<code>guest_mode</code>) to maintain your guest session.
                Authentication state is managed by Clerk using secure, HttpOnly tokens. We do not use
                third-party tracking cookies.
              </p>
            ),
          },
          {
            id: '8-security',
            title: '8. Security',
            body: (
              <p>
                Data is encrypted at rest and in transit (TLS 1.3). We use industry-standard security
                practices, including automatic database backups, access controls, and regular dependency
                auditing. No system is 100% secure; if you discover a vulnerability, please report it to{' '}
                <a href="mailto:security@secondmind.ai" style={{ color: '#66A4AC' }}>
                  security@secondmind.ai
                </a>
                .
              </p>
            ),
          },
          {
            id: '9-changes',
            title: '9. Changes to This Policy',
            body: (
              <p>
                We will notify you of material changes via email or an in-app notice at least 14 days
                before they take effect. Continued use after the effective date constitutes acceptance of
                the updated policy.
              </p>
            ),
          },
          {
            id: '10-contact',
            title: '10. Contact',
            body: (
              <p>
                Questions or concerns? Email{' '}
                <a href="mailto:privacy@secondmind.ai" style={{ color: '#66A4AC' }}>
                  privacy@secondmind.ai
                </a>
                . We aim to respond within 5 business days.
              </p>
            ),
          },
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

        <div
          style={{
            marginTop: '56px',
            padding: '24px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Also see
          </p>
          <Link
            href="/terms"
            style={{
              fontSize: '14px',
              color: '#66A4AC',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Terms of Service →
          </Link>
        </div>
      </article>

      <style>{`
        article ul { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
        article ul li { color: var(--text-secondary); }
        article strong { color: rgba(255,255,255,0.9); }
        article code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #66A4AC; }
      `}</style>
    </div>
  );
}
