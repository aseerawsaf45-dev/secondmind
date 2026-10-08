import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: '#08080F',
      overflow: 'hidden',
      padding: '24px 16px',
    }}>
      {/* Decorative grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <SignUp routing="hash" signInUrl="/login" fallbackRedirectUrl="/app" />
        
        <footer style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
          © Developed by Aseer Awsaf
        </footer>
      </div>
    </div>
  );
}
