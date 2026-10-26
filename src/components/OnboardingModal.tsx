'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, UploadCloud, CheckCircle2, X } from 'lucide-react';

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5, 5, 5, 0.8)',
          backdropFilter: 'blur(12px)',
          padding: '24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-panel)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 24px 48px -12px rgba(0,0,0,0.8)',
            position: 'relative',
          }}
        >
          <button
            onClick={() => {
              try {
                localStorage.setItem('secondmind_onboarding_dismissed', '1');
              } catch {}
              onClose();
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <X size={20} />
          </button>

          {/* Progress Bar */}
          <div style={{ display: 'flex', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              style={{ background: '#06B6D4', height: '100%' }}
            />
          </div>

          <div style={{ padding: '40px 32px 32px' }}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(6, 182, 212, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#06B6D4',
                    marginBottom: '24px',
                  }}
                >
                  <Brain size={32} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                  Welcome to your SecondMind
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
                  Your new AI-powered external brain is ready. Say goodbye to scattered bookmarks and messy folders.
                  Just save what matters, and AI will connect the dots.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '15px', display: 'flex', justifyContent: 'center' }}
                >
                  Next <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                  Import your existing brain
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Bring over your notes and bookmarks from other apps to instantly populate your knowledge graph.
                </p>

                <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
                  {['Notion', 'Evernote', 'Chrome Bookmarks'].map((app) => (
                    <div
                      key={app}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UploadCloud size={16} color="rgba(255,255,255,0.6)" />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{app}</span>
                      </div>
                      <button
                        onClick={() => alert(`Importing from ${app} is coming soon in beta!`)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setStep(1)}
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '15px' }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('secondmind_onboarding_dismissed', '1');
                      onComplete();
                    }}
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '14px', borderRadius: '12px', fontSize: '15px', display: 'flex', justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={16} />
                    Start Exploring
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
