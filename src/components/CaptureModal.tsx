import { X, Link2, FileText, Image, Sparkles, Check, Loader, Upload, Tag, Plus, Video, ExternalLink, RefreshCw } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { getYouTubeThumbnailUrl, isYouTubeUrl } from '@/lib/youtube';
import { isFacebookUrl } from '@/lib/facebook';
import { isTwitterUrl } from '@/lib/twitter';

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

const SUGGESTED_TAGS = ['AI', 'Design', 'Business', 'Tech', 'Productivity', 'Research', 'Social', 'Facebook', 'X'];

export default function CaptureModal({ isOpen, onClose, onSave, user }: CaptureModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabType>('url');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Live URL Analysis States
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<{
    title?: string;
    description?: string;
    image?: string;
    tags?: string[];
    type?: string;
  } | null>(null);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState('');

  const handleAddTag = (tagToAdd?: string) => {
    const text = (tagToAdd || tagInput).trim().replace(/^#/, '');
    if (text && !customTags.includes(text)) {
      setCustomTags([...customTags, text]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter(t => t !== tagToRemove));
  };

  // Perform live extraction on URL paste/change
  const analyzeUrl = useCallback(async (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean || clean === lastAnalyzedUrl) return;
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.includes('.')) {
      return;
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }

    setIsAnalyzingUrl(true);
    setLastAnalyzedUrl(clean);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: clean }),
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedPreview(data);

        // Auto-fill title if user hasn't typed one
        if (!title && data.title) {
          setTitle(data.title);
        }

        // Auto-add extracted tags to tag list
        if (data.tags && Array.isArray(data.tags)) {
          setCustomTags(prev => {
            const set = new Set([...prev, ...data.tags]);
            return Array.from(set);
          });
        }
      }
    } catch (err) {
      console.error('Failed to analyze URL:', err);
    } finally {
      setIsAnalyzingUrl(false);
    }
  }, [lastAnalyzedUrl, title]);

  // Debounced trigger when URL changes
  useEffect(() => {
    if (tab !== 'url') return;
    const trimmed = url.trim();
    if (!trimmed) {
      setExtractedPreview(null);
      setLastAnalyzedUrl('');
      return;
    }

    const timer = setTimeout(() => {
      analyzeUrl(trimmed);
    }, 700);

    return () => clearTimeout(timer);
  }, [url, tab, analyzeUrl]);

  // Handle immediate paste event
  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      setTimeout(() => {
        analyzeUrl(pasted);
      }, 50);
    }
  };

  const handleSave = async () => {
    let cleanUrl = url.trim();
    if (tab === 'url' && !cleanUrl) return;
    if (tab === 'note' && !note.trim()) return;
    if (tab === 'upload' && !selectedFile) return;

    if (tab === 'url') {
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
    }

    setIsSaving(true);
    let extractedData = extractedPreview;
    let fileUrl = null;

    try {
      if (tab === 'url' && !extractedData) {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });
        if (res.ok) {
          extractedData = await res.json();
        }
      } else if (tab === 'note') {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: note, title }),
        });
        if (res.ok) {
          extractedData = await res.json();
        }
      } else if (tab === 'upload' && selectedFile) {
        fileUrl = URL.createObjectURL(selectedFile);
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: selectedFile.name }),
        });
        if (res.ok) {
          extractedData = await res.json();
        }
      }
    } catch (err) {
      console.error('AI extraction failed', err);
    }

    const lowerUrl = cleanUrl.toLowerCase();
    const isTweet = tab === 'url' && (isTwitterUrl(cleanUrl) || lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com'));
    const isFb = tab === 'url' && isFacebookUrl(cleanUrl);
    const isVideo = tab === 'url' && (isYouTubeUrl(cleanUrl) || extractedData?.tags?.includes('Video') || extractedData?.type === 'video');

    let type: 'link' | 'note' | 'image' | 'pdf' | 'tweet' | 'video' = 'note';
    if (tab === 'url') {
      if (isTweet) type = 'tweet';
      else if (isVideo) type = 'video';
      else type = 'link';
    }
    if (tab === 'upload' && selectedFile) {
      type = selectedFile.type.includes('pdf') ? 'pdf' : selectedFile.type.includes('image') ? 'image' : 'link';
    }

    // Determine thumbnail URL
    let finalThumbnail = extractedData?.image;
    if (!finalThumbnail && isYouTubeUrl(cleanUrl)) {
      finalThumbnail = getYouTubeThumbnailUrl(cleanUrl) || undefined;
    }

    const useTitle = title.trim() || extractedData?.title || (selectedFile?.name) || (tab === 'url' ? cleanUrl : note.slice(0, 50) + '...');
    const useContent = tab === 'upload' ? (fileUrl || '') : (tab === 'url' ? (extractedData?.description || cleanUrl) : note);
    const useSummary = extractedData?.description || (tab === 'note' ? note : tab === 'upload' ? `Uploaded ${selectedFile?.name}` : 'Saved memory reference');

    // Merge AI extracted tags with user's custom tags
    const mergedTagsSet = new Set<string>([...customTags, ...(extractedData?.tags || [])]);
    if (isFb) mergedTagsSet.add('Facebook');
    if (isTweet) mergedTagsSet.add('X');
    if (tab === 'upload' && mergedTagsSet.size === 0) mergedTagsSet.add('Uploaded');
    if (mergedTagsSet.size === 0) mergedTagsSet.add('Saved');

    onSave({
      type,
      title: useTitle,
      content: useContent,
      url: tab === 'url' ? cleanUrl : (tab === 'upload' ? fileUrl || undefined : undefined),
      thumbnailUrl: finalThumbnail,
      summary: useSummary,
      tags: Array.from(mergedTagsSet),
    });

    setIsSaving(false);
    setSaved(true);

    await new Promise(r => setTimeout(r, 400));
    setSaved(false);
    setUrl('');
    setNote('');
    setTitle('');
    setCustomTags([]);
    setTagInput('');
    setExtractedPreview(null);
    setLastAnalyzedUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: 'min(90dvh, 720px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(6, 86, 91,0.1)',
        }}
        className="animate-fade-in-up"
      >
        {/* Header */}
        <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Save to Memory</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>AI will analyze, tag, and organize content automatically</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: '4px', flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setExtractedPreview(null);
              }}
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
                background: tab === t.id ? 'rgba(6, 86, 91,0.15)' : 'transparent',
                color: tab === t.id ? 'var(--violet-bright)' : 'var(--text-muted)',
                borderBottom: tab === t.id ? '2px solid var(--violet)' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px 20px', overflowY: 'auto', flex: 1 }}>
          {tab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    URL (Facebook, X, YouTube, Articles) *
                  </label>
                  {isAnalyzingUrl && (
                    <span style={{ fontSize: '11px', color: 'var(--violet-bright)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Loader size={11} className="spin" />
                      Analyzing link...
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onPaste={handleUrlPaste}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="Paste Facebook reel/post, X/Twitter, YouTube or article link..."
                    type="text"
                    autoFocus
                    style={{ paddingRight: url ? '36px' : '12px' }}
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={() => {
                        setUrl('');
                        setExtractedPreview(null);
                        setLastAnalyzedUrl('');
                      }}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Instant AI Analysis & Brief Preview Card */}
              {extractedPreview && (
                <div style={{
                  padding: '14px',
                  background: 'linear-gradient(135deg, rgba(6, 86, 91,0.12), rgba(0, 58, 68,0.06))',
                  border: '1px solid rgba(6, 86, 91,0.3)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }} className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={13} style={{ color: 'var(--violet-bright)' }} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--violet-bright)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        AI Content Brief & Analysis
                      </span>
                    </div>
                    {isFacebookUrl(url) && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(24, 119, 242, 0.2)', color: '#60A5FA', fontWeight: 600 }}>
                        📘 Facebook
                      </span>
                    )}
                    {isTwitterUrl(url) && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.1)', color: '#F3F4F6', fontWeight: 600 }}>
                        𝕏 Post
                      </span>
                    )}
                    {isYouTubeUrl(url) && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', fontWeight: 600 }}>
                        🎬 YouTube
                      </span>
                    )}
                  </div>

                  {extractedPreview.title && (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {extractedPreview.title}
                    </div>
                  )}

                  {extractedPreview.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {extractedPreview.description}
                    </div>
                  )}

                  {extractedPreview.image && (
                    <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', marginTop: '4px', background: '#000' }}>
                      <img src={extractedPreview.image} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.target as HTMLElement).style.display = 'none'} />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Title / Note (optional — AI suggested)
                </label>
                <textarea
                  className="input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give it a title or personal note..."
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
                  background: selectedFile ? 'rgba(6, 86, 91,0.05)' : 'transparent',
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

          {/* Custom Tags Section */}
          <div style={{ marginTop: '14px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 500 }}>
              <Tag size={12} />
              AI Tags & Custom Tags
            </label>

            {/* Selected Tag Pills */}
            {customTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {customTags.map(t => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'rgba(6, 86, 91,0.2)',
                      border: '1px solid rgba(6, 86, 91,0.4)',
                      color: '#c2dde4',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      style={{ background: 'none', border: 'none', color: '#c2dde4', cursor: 'pointer', display: 'flex', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input Field & Add Button */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag & press Enter (e.g. Work, Article)"
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="btn btn-ghost"
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            {/* Suggested Tag Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '2px' }}>
                Suggested:
              </span>
              {SUGGESTED_TAGS.map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleAddTag(st)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--violet)';
                    e.currentTarget.style.color = 'var(--violet-bright)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  +#{st}
                </button>
              ))}
            </div>
          </div>

          {/* AI processing notice */}
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(6, 86, 91,0.08)',
            border: '1px solid rgba(6, 86, 91,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={13} style={{ color: 'var(--violet-bright)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              AI extracts tags, generates a brief, and connects memories automatically
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
                  {tab === 'upload' ? 'Uploading...' : 'Saving Memory...'}
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
