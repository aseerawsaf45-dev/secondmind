'use client';

import { SignIn, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogIn, LogOut, UserCheck, Sparkles, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState<'signin' | 'guest'>('signin');
  const [isGuestActive, setIsGuestActive] = useState(false);

  useEffect(() => {
    // Check if guest cookie is currently active
    const hasGuestCookie = document.cookie.includes('guest_mode=true');
    setIsGuestActive(hasGuestCookie);

    // If authenticated via Clerk, route straight to dashboard
    if (isLoaded && isSignedIn) {
      router.replace('/app');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGuestLogin = () => {
    document.cookie = 'guest_mode=true; path=/; max-age=31536000; SameSite=Lax';
    document.cookie = 'guest_seed_demo=true; path=/; max-age=600; SameSite=Lax';
    router.replace('/app');
  };

  const handleSignOut = async () => {
    document.cookie = 'guest_mode=; path=/; max-age=0';
    document.cookie = 'guest_seed_demo=; path=/; max-age=0';
    setIsGuestActive(false);
    if (isSignedIn) {
      await signOut({ redirectUrl: '/login' });
    } else {
      router.refresh();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: '#040408',
        padding: '24px 16px',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* Background Orbs & Ambient Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              marginBottom: '4px',
            }}
          >
            <Sparkles size={24} color="#FFF" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#FFF' }}>
            SecondMind
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, maxWidth: '340px' }}>
            Your AI-Powered Second Brain. Save anything, remember everything.
          </p>
        </div>

        {/* 3 Main Action Mode Selector Bar */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Option 1: Sign In */}
          <button
            onClick={() => setActiveTab('signin')}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'signin' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              color: activeTab === 'signin' ? '#FFF' : 'rgba(255, 255, 255, 0.6)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>

          {/* Option 2: Guest Login */}
          <button
            onClick={() => {
              setActiveTab('guest');
              handleGuestLogin();
            }}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'guest' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
              color: activeTab === 'guest' ? '#34D399' : 'rgba(255, 255, 255, 0.6)',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <UserCheck size={14} />
            <span>Guest</span>
          </button>

          {/* Option 3: Sign Out */}
          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#F87171',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Content Box */}
        {activeTab === 'signin' ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <SignIn
              routing="hash"
              signUpUrl="/signup"
              fallbackRedirectUrl="/app"
              forceRedirectUrl="/app"
            />
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              padding: '24px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399',
                }}
              >
                <Shield size={20} />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: '#FFF' }}>
                Instant Guest Sandbox
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: 1.4 }}>
                Explore all SecondMind features instantly. Data is saved locally in your browser with zero cloud storage required.
              </p>
            </div>
            <button
              onClick={handleGuestLogin}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.15s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span>Launch Guest Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Footer Note */}
        {(isSignedIn || isGuestActive) && (
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', textAlign: 'center' }}>
            Currently active session detected.{' '}
            <button
              onClick={() => router.push('/app')}
              style={{
                background: 'none',
                border: 'none',
                color: '#818CF8',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: '12px',
              }}
            >
              Go straight to Dashboard
            </button>
          </div>
        )}

        <footer style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
          © Developed by Aseer Awsaf
        </footer>
      </div>
    </div>
  );
}
