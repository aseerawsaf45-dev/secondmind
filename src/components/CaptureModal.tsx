'use client';

import { useState } from 'react';
import { X, Link2, FileText, Image, Sparkles, Check, Loader } from 'lucide-react';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: string; title: string; content: string; url?: string; thumbnailUrl?: string; summary?: string; tags?: string[] }) => void;
}

type TabType = 'url' | 'note' | 'upload';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'url', label: 'Paste URL', icon: <Link2 size={14} /> },
  { id: 'note', label: 'Quick Note', icon: <FileText size={14} /> },
  { id: 'upload', label: 'Upload', icon: <Image size={14} /> },
];

export default function CaptureModal({ isOpen, onClose, onSave }: CaptureModalProps) {
  const [tab, setTab] = useState<TabType>('url');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (tab === 'url' && !url.trim()) return;
    if (tab === 'note' && !note.trim()) return;

    setIsSaving(true);
    let extractedData = null;

    if (tab === 'url') {
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        });
        if (res.ok) {
          extractedData = await res.json();
        }
      } catch (err) {
        console.error('Extraction failed', err);
      }
    } else {
      await new Promise(r => setTimeout(r, 600)); // fake delay for notes
    }

    setIsSaving(false);
    setSaved(true);

    const useTitle = title || (extractedData?.title) || (tab === 'url' ? url : note.slice(0, 60) + '...');
    const useContent = tab === 'url' ? url : note;

    onSave({
      type: tab === 'url' ? (extractedData?.tags?.includes('Video') ? 'video' : 'link') : 'note',
      title: useTitle,
      content: useContent,
      url: tab === 'url' ? url : undefined,
      thumbnailUrl: extractedData?.image,
      summary: extractedData?.description,
      tags: extractedData?.tags,
    });

    await new Promise(r => setTimeout(r, 800));
    setSaved(false);
    setUrl('');
    setNote('');
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.1)',
        }}
        className="animate-fade-in-up"
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Save to Memory</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>AI will organize it automatically</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: '4px' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                background: tab === t.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: tab === t.id ? 'var(--violet-bright)' : 'var(--text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--violet)' : '2px solid transparent',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {tab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  URL *
                </label>
                <input
                  className="input"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  type="url"
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Note (optional)
                </label>
                <textarea
                  className="input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Why is this important to you?"
                  rows={2}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>
          )}

          {tab === 'note' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Your thought *
                </label>
                <textarea
                  className="input"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Capture any idea, insight, or thought..."
                  rows={5}
                  style={{ resize: 'none' }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Title (optional — AI will generate one)
                </label>
                <input
                  className="input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give it a name..."
                />
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--violet)';
                e.currentTarget.style.background = 'var(--violet-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📎</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                Drop files here or click to upload
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                PNG, JPG, PDF, MP4 up to 50MB
              </div>
            </div>
          )}

          {/* AI processing notice */}
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={13} style={{ color: 'var(--violet-bright)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              AI will auto-summarize, tag, and find connections when you save
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || saved || (tab === 'url' ? !url.trim() : !note.trim())}
              className="btn btn-primary"
              style={{
                flex: 2,
                opacity: (tab === 'url' ? !url.trim() : !note.trim()) ? 0.6 : 1,
              }}
            >
              {isSaving ? (
                <>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Processing with AI...
                </>
              ) : saved ? (
                <>
                  <Check size={14} />
                  Saved!
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Save to Memory
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
