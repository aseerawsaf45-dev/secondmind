'use client';

import { useState } from 'react';
import { X, Sparkles, FolderPlus, Loader, Check } from 'lucide-react';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; emoji: string; color: string; isSmart: boolean }) => Promise<void>;
}

const EMOJIS = ['📁', '🎨', '💼', '🚀', '🧠', '📚', '⚡', '🌈', '🥑', '🎬', '🎮', '💡'];
const COLORS = ['#9CA3AF', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#7C3AED', '#EC4899'];

export default function CreateCollectionModal({ isOpen, onClose, onSave }: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('#9CA3AF');
  const [isSmart, setIsSmart] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await onSave({ name, emoji, color, isSmart });
    setIsSaving(false);
    setSaved(true);
    await new Promise(r => setTimeout(r, 600));
    setSaved(false);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 110 }}>
      <div 
        onClick={e => e.stopPropagation()} 
        className="animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(124,58,237,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--violet-bright)'
            }}>
              <FolderPlus size={18} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>New Space</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Space Name
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design Inspiration, Reading List..."
              autoFocus
            />
          </div>

          {/* Emoji & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Emoji
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: emoji === e ? 'var(--violet)' : 'transparent',
                      background: emoji === e ? 'rgba(124,58,237,0.1)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Color
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '2px solid white' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: color === c ? `0 0 10px ${c}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Smart Toggle */}
          <div 
            onClick={() => setIsSmart(!isSmart)}
            style={{ 
              padding: '12px', 
              background: isSmart ? 'rgba(124,58,237,0.08)' : 'var(--bg-elevated)', 
              border: `1px solid ${isSmart ? 'var(--violet)' : 'var(--border)'}`, 
              borderRadius: '12px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isSmart ? 'var(--violet)' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isSmart ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}>
              <Sparkles size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: isSmart ? 'var(--text-primary)' : 'var(--text-muted)' }}>Smart Space</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auto-organize items by tag</div>
            </div>
            <div style={{
              width: '32px',
              height: '18px',
              borderRadius: '999px',
              background: isSmart ? 'var(--violet)' : 'rgba(255,255,255,0.1)',
              position: 'relative',
              transition: 'all 0.2s'
            }}>
              <div style={{
                position: 'absolute',
                top: '2px',
                left: isSmart ? '16px' : '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: 'white',
                transition: 'all 0.2s'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={isSaving || saved || !name.trim()}
              className="btn btn-primary" 
              style={{ flex: 2 }}
            >
              {isSaving ? <Loader size={16} className="spin" /> : saved ? <Check size={16} /> : 'Create Space'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
