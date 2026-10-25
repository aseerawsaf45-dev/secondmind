'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, ArrowRight, RefreshCw, HardDrive, Sparkles, CheckCircle2 } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      await fetch('/favicon.ico', { cache: 'no-store', method: 'HEAD' });
      setIsOnline(true);
      window.location.href = '/app';
    } catch (_) {
      setIsOnline(false);
    } finally {
      setTimeout(() => setIsChecking(false), 500);
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
        background: '#040408',
        color: '#FFFFFF',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Background Ambience */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Animated Icon Avatar */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: isOnline
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
            border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isOnline ? '#34D399' : '#FBBF24',
          }}
        >
          {isOnline ? <CheckCircle2 size={30} /> : <WifiOff size={30} />}
        </div>

        {/* Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            fontSize: '12px',
            fontWeight: 600,
            color: isOnline ? '#34D399' : '#FBBF24',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#34D399' : '#FBBF24',
              display: 'inline-block',
            }}
          />
          <span>{isOnline ? 'Internet Connection Restored' : 'Offline Mode Active'}</span>
        </div>

        {/* Title & Copy */}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {isOnline ? 'Ready to Reconnect' : 'Local Memory Storage Ready'}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', margin: 0, lineHeight: 1.5 }}>
            {isOnline
              ? 'Your network is back online. Re-enter the dashboard to sync all local changes.'
              : 'You are currently disconnected, but SecondMind runs locally. You can read, organize, and capture memories offline.'}
          </p>
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'left',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.75)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={15} color="#38BDF8" />
            <span>Local browser storage cached & accessible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} color="#06B6D4" />
            <span>Offline changes automatically sync when reconnected</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href="/app"
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
            }}
          >
            <span>Launch Offline Dashboard</span>
            <ArrowRight size={16} />
          </Link>

          <button
            onClick={handleCheckConnection}
            disabled={isChecking}
            style={{
              width: '100%',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
            <span>{isChecking ? 'Checking...' : 'Check Connection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
