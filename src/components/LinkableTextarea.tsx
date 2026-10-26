import React, { useState, useRef } from 'react';
import type { MemoryItem } from '@/lib/data';

interface LinkableTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  items: MemoryItem[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
}

export default function LinkableTextarea({ items, value, onChange, ...props }: LinkableTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(suggestionQuery.toLowerCase())
  ).slice(0, 8);

  const updateCursorAndSuggestions = (target: HTMLTextAreaElement) => {
    const text = target.value;
    const pos = target.selectionStart;
    setCursorPos(pos);
    
    // Look backwards from cursor to see if we are inside [[
    const textBeforeCursor = text.slice(0, pos);
    const lastOpenIndex = textBeforeCursor.lastIndexOf('[[');
    const lastCloseIndex = textBeforeCursor.lastIndexOf(']]');
    
    if (lastOpenIndex !== -1 && lastOpenIndex > lastCloseIndex) {
      // We are inside [[ ...
      const query = textBeforeCursor.slice(lastOpenIndex + 2);
      setSuggestionQuery(query);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    updateCursorAndSuggestions(e.currentTarget);
  };

  const handleCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    updateCursorAndSuggestions(e.currentTarget);
  };

  const insertLink = (title: string) => {
    const text = value;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);
    
    const lastOpenIndex = textBeforeCursor.lastIndexOf('[[');
    if (lastOpenIndex !== -1) {
      const beforeLink = text.slice(0, lastOpenIndex);
      const newText = `${beforeLink}[[${title}]]${textAfterCursor}`;
      
      // We have to mock an event for the onChange handler
      const mockEvent = {
        target: { value: newText }
      };
      onChange(mockEvent);
      setShowSuggestions(false);
      
      // Return focus to textarea and place cursor after ]]
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = beforeLink.length + title.length + 4;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertLink(filteredItems[selectedIndex].title);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
    
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <textarea
        {...props}
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onClick={handleCursorMove}
        onKeyUp={handleCursorMove}
      />
      
      {showSuggestions && filteredItems.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          background: 'var(--bg-elevated, #1A1C29)',
          border: '1px solid var(--border-strong, #333)',
          borderRadius: '8px',
          padding: '6px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 100,
          minWidth: '250px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => insertLink(item.title)}
              onMouseEnter={() => setSelectedIndex(idx)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                background: idx === selectedIndex ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                color: idx === selectedIndex ? 'var(--violet-bright, #38BDF8)' : 'var(--text-primary)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{item.type === 'note' ? '📝' : item.type === 'link' ? '🔗' : '📄'}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
