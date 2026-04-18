import { X, Link2, FileText, Image, Sparkles, Check, Loader, Upload } from 'lucide-react';
import { useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { uploadFile } from '@/lib/supabase-storage';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSave: (data: { type: string; title: string; content: string; url?: string; thumbnailUrl?: string; summary?: string; tags?: string[] }) => void;
}

type TabType = 'url' | 'note' | 'upload';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'url', label: 'Paste URL', icon: <Link2 size={14} /> },
  { id: 'note', label: 'Quick Note', icon: <FileText size={14} /> },
  { id: 'upload', label: 'Upload', icon: <Upload size={14} /> },
];

export default function CaptureModal({ isOpen, onClose, onSave, user }: CaptureModalProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabType>('url');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (tab === 'url' && !url.trim()) return;
    if (tab === 'note' && !note.trim()) return;
    if (tab === 'upload' && !selectedFile) return;

    setIsSaving(true);
    let extractedData = null;
    let fileUrl = null;

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
    } else if (tab === 'upload' && selectedFile) {
      const { url: uploadedUrl, error } = await uploadFile(supabase, user?.id, selectedFile);
      if (error) {
        alert('File upload failed. Please try again.');
        setIsSaving(false);
        return;
      }
      fileUrl = uploadedUrl;
    } else {
      await new Promise(r => setTimeout(r, 600)); // fake delay for notes
    }

    setIsSaving(false);
    setSaved(true);

    const useTitle = title || (selectedFile?.name) || (extractedData?.title) || (tab === 'url' ? url : note.slice(0, 60) + '...');
    const useContent = tab === 'upload' ? (fileUrl || '') : (tab === 'url' ? url : note);

    const lowerUrl = (url || '').trim().toLowerCase();
    const isTweet = tab === 'url' && (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com'));
    const isVideo = tab === 'url' && extractedData?.tags?.includes('Video');
    
    // Determine type
    let type = 'note';
    if (tab === 'url') type = isTweet ? 'tweet' : isVideo ? 'video' : 'link';
    if (tab === 'upload' && selectedFile) {
      type = selectedFile.type.includes('pdf') ? 'pdf' : selectedFile.type.includes('image') ? 'image' : 'link';
    }

    onSave({
      type,
      title: useTitle,
      content: useContent,
      url: tab === 'url' ? url : (tab === 'upload' ? fileUrl || undefined : undefined),
      thumbnailUrl: extractedData?.image,
      summary: extractedData?.description || (tab === 'upload' ? `Uploaded ${selectedFile?.name}` : undefined),
      tags: extractedData?.tags || (tab === 'upload' ? ['Uploaded'] : []),
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.mp4"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: '12px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedFile ? 'rgba(124,58,237,0.05)' : 'transparent',
                  borderColor: selectedFile ? 'var(--violet)' : 'var(--border-strong)',
                }}
                onMouseEnter={e => {
                  if (!selectedFile) e.currentTarget.style.borderColor = 'var(--violet)';
                }}
                onMouseLeave={e => {
                  if (!selectedFile) e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                  {selectedFile ? '📄' : '📎'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                  {selectedFile ? selectedFile.name : 'Drop files here or click to upload'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'PNG, JPG, PDF, MP4 up to 50MB'}
                </div>
                {selectedFile && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    style={{ marginTop: '12px', fontSize: '12px', color: 'var(--violet-bright)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Change file
                  </button>
                )}
              </div>
              
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Space (Optional)
                </label>
                <input
                  className="input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Project Q3, Research..."
                />
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
              disabled={isSaving || saved || (tab === 'url' ? !url.trim() : tab === 'note' ? !note.trim() : !selectedFile)}
              className="btn btn-primary"
              style={{
                flex: 2,
                opacity: (tab === 'url' ? !url.trim() : tab === 'note' ? !note.trim() : !selectedFile) ? 0.6 : 1,
              }}
            >
              {isSaving ? (
                <>
                  <Loader size={14} className="spin" />
                  {tab === 'upload' ? 'Uploading...' : 'Processing with AI...'}
                </>
              ) : saved ? (
                <>
                  <Check size={14} />
                  Saved!
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {tab === 'upload' ? 'Upload and Save' : 'Save to Memory'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
