import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SecondMind — AI-Powered Second Brain';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#040408',
          padding: '60px 80px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.28) 0%, rgba(59, 130, 246, 0.1) 60%, rgba(0, 0, 0, 0) 80%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.05) 60%, rgba(0, 0, 0, 0) 80%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px -4px rgba(6, 182, 212, 0.5)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#fff',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            SecondMind
          </span>
          <div
            style={{
              marginLeft: '12px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#67E8F9',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            AI MEMORY & SECOND BRAIN
          </div>
        </div>

        {/* Center Main Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, maxWidth: '960px' }}>
          <div
            style={{
              fontSize: '66px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            Save Anything.{' '}
            <span
              style={{
                color: '#38BDF8',
              }}
            >
              Remember Everything.
            </span>
          </div>

          <div
            style={{
              fontSize: '26px',
              color: '#94A3B8',
              lineHeight: 1.4,
              maxWidth: '820px',
            }}
          >
            AI automatically categorizes, summarizes, and connects your links, notes, and research in under 2 seconds.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '32px',
            width: '100%',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06B6D4' }} />
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#E2E8F0' }}>⌘K Natural Language Search</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38BDF8' }} />
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#E2E8F0' }}>Offline PWA Sync</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#E2E8F0' }}>Zero-Training Private Vault</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
