import React from "react";
import type { MemoryItem } from "@/lib/data";

interface ContentRendererProps {
  content: string;
  items: MemoryItem[];
  onSelectItem: (item: MemoryItem) => void;
  style?: React.CSSProperties;
}

export default function ContentRenderer({ content, items, onSelectItem, style }: ContentRendererProps) {
  // Split by [[...]]
  const parts = content.split(/(\[\[.*?\]\])/g);

  return (
    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, ...style }}>
      {parts.map((part, index) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const title = part.slice(2, -2).trim();
          // Find matching item case-insensitively
          const linkedItem = items.find(i => i.title.toLowerCase() === title.toLowerCase());
          
          if (linkedItem) {
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(linkedItem);
                }}
                style={{
                  color: "var(--violet-bright, #38BDF8)",
                  cursor: "pointer",
                  fontWeight: 500,
                  textDecoration: "underline",
                  textDecorationColor: "rgba(129, 140, 248, 0.4)",
                  textUnderlineOffset: "4px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#A5B4FC"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--violet-bright, #38BDF8)"}
              >
                {part}
              </span>
            );
          } else {
            // Unlinked or missing
            return (
              <span key={index} style={{ color: "rgba(255,255,255,0.4)" }}>
                {part}
              </span>
            );
          }
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </div>
  );
}
