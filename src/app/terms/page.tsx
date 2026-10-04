import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — SecondMind',
  description: 'Read the SecondMind Terms of Service governing your use of the platform.',
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '560px' }}>
          Please read these Terms carefully before using SecondMind. By accessing or using the service,
          you agree to be bound by these Terms.
        </p>

        {[
          {
            id: '1-acceptance',
            title: '1. Acceptance of Terms',
            body: (
              <p>
                By creating an account or using SecondMind in any form (including guest mode), you agree
                to these Terms of Service and our{' '}
                <Link href="/privacy" style={{ color: '#66A4AC' }}>
                  Privacy Policy
                </Link>
                . If you do not agree, do not use the service. These Terms constitute a legally binding
                agreement between you and SecondMind.
              </p>
            ),
          },
          {
            id: '2-description',
            title: '2. Description of Service',
            body: (
              <p>
                SecondMind is an AI-powered personal knowledge management platform that enables users to
                save, organize, and retrieve information from the web, documents, and other sources.
                Features may change as the product evolves. We will notify you of material changes.
              </p>
            ),
          },
          {
            id: '3-eligibility',
            title: '3. Eligibility',
            body: (
              <p>
                You must be at least 13 years of age (or the minimum digital age of consent in your
                jurisdiction) to use SecondMind. By using the service, you represent that you meet this
                requirement.
              </p>
            ),
          },
          {
            id: '4-accounts',
            title: '4. Accounts & Security',
            body: (
              <>
                <p>When you create an account, you agree to:</p>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Keep your credentials confidential</li>
                  <li>Notify us immediately of unauthorized account access</li>
                  <li>Be responsible for all activity under your account</li>
                </ul>
                <p style={{ marginTop: '16px' }}>
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </>
            ),
          },
          {
            id: '5-acceptable-use',
            title: '5. Acceptable Use',
            body: (
              <>
                <p>You agree not to:</p>
                <ul>
                  <li>Use the service for illegal purposes or in violation of any applicable laws</li>
                  <li>Upload content that infringes intellectual property rights</li>
                  <li>Attempt to reverse-engineer, scrape, or abuse the API</li>
                  <li>Distribute malware or harmful code through the service</li>
                  <li>Harass, threaten, or impersonate others</li>
                  <li>Circumvent rate limits, access controls, or security measures</li>
                </ul>
              </>
            ),
          },
          {
            id: '6-content-ownership',
            title: '6. Your Content',
            body: (
              <p>
                You retain full ownership of all content you save to SecondMind. By using the service,
                you grant us a limited, non-exclusive, royalty-free license to store, process, and display
                your content solely for the purpose of providing the service to you. We do not claim
                ownership of your content and will not use it for any other purpose without your explicit
                consent.
              </p>
            ),
          },
          {
            id: '7-ai-limitations',
            title: '7. AI-Generated Content & Accuracy',
            body: (
              <p>
                AI summaries, tags, and answers generated by SecondMind are provided for informational
                purposes only. We do not guarantee their accuracy, completeness, or fitness for any
                particular purpose. Do not rely on AI-generated content for medical, legal, financial,
                or safety-critical decisions without independent verification.
              </p>
            ),
          },
          {
            id: '8-payments',
            title: '8. Payments & Refunds',
            body: (
              <p>
                Paid plans are billed monthly or annually via Stripe. Subscriptions auto-renew unless
                cancelled before the renewal date. We offer a 7-day refund for new paid subscriptions.
                Refund requests after 7 days are considered on a case-by-case basis. Contact{' '}
                <a href="mailto:billing@secondmind.ai" style={{ color: '#66A4AC' }}>
                  billing@secondmind.ai
                </a>{' '}
                for billing inquiries.
              </p>
            ),
          },
          {
            id: '9-termination',
            title: '9. Termination',
            body: (
              <p>
                You may cancel your account at any time from Settings. We may suspend or terminate access
                for violations of these Terms, fraudulent activity, or extended inactivity on free
                accounts (&gt;12 months). Upon termination, we will delete your data within 30 days per
                our{' '}
                <Link href="/privacy" style={{ color: '#66A4AC' }}>
                  Privacy Policy
                </Link>
                .
              </p>
            ),
          },
          {
            id: '10-disclaimer',
            title: '10. Disclaimer of Warranties',
            body: (
              <p>
                The service is provided &quot;as is&quot; without warranties of any kind, express or implied,
                including but not limited to merchantability, fitness for a particular purpose, and
                non-infringement. We do not warrant that the service will be uninterrupted, error-free,
                or completely secure.
              </p>
            ),
          },
          {
            id: '11-limitation',
            title: '11. Limitation of Liability',
            body: (
              <p>
                To the maximum extent permitted by law, SecondMind shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising from your use of the
                service, even if we have been advised of the possibility of such damages. Our total
                liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            ),
          },
          {
            id: '12-changes',
            title: '12. Changes to Terms',
            body: (
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material
                changes via email or an in-app notice at least 14 days before they take effect. Continued
                use after the effective date constitutes acceptance.
              </p>
            ),
          },
          {
            id: '13-governing-law',
            title: '13. Governing Law',
            body: (
              <p>
                These Terms are governed by and construed in accordance with applicable law. Disputes
                will first be addressed through good-faith negotiation. If unresolved, disputes shall be
                submitted to binding arbitration.
              </p>
            ),
          },
          {
            id: '14-contact',
            title: '14. Contact',
            body: (
              <p>
                Questions about these Terms?{' '}
                <a href="mailto:legal@secondmind.ai" style={{ color: '#66A4AC' }}>
                  legal@secondmind.ai
                </a>
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
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
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
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Also see</p>
          <Link
            href="/privacy"
            style={{ fontSize: '14px', color: '#66A4AC', textDecoration: 'none', fontWeight: 600 }}
          >
            Privacy Policy →
          </Link>
        </div>
      </article>

      <style>{`
        article ul { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
        article ul li { color: var(--text-secondary); }
        article strong { color: rgba(255,255,255,0.9); }
      `}</style>
    </div>
  );
}
