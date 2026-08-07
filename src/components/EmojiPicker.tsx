import React, { useState, useEffect, useRef } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
  placement?: 'top' | 'bottom';
}

const EMOJI_CATEGORIES = [
  {
    name: 'Reações',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒', '😔', '😟', '😕', '🙁', '☹️', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    name: 'Gestos',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪']
  },
  {
    name: 'Corações',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💋', '🎈', '🎉', '✨']
  },
  {
    name: 'Negócios & Angola',
    emojis: ['🤝', '💰', '💵', '💸', '💳', '📈', '📉', '📦', '🚚', '🛒', '🏠', '🏢', '📱', '💻', '🚗', '🎯', '⭐', '✅', '❌', '📢', '🔥', '💎', '👑', '🇦🇴']
  }
];

export default function EmojiPicker({ onEmojiSelect, className = '', placement = 'top' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEmojiSelect(emoji);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center"
        title="Inserir Emoji"
        id="emoji-picker-btn"
      >
        <Smile size={16} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 bg-[#121212] border border-slate-800 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } right-0`}
          style={{ width: '270px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header/Categories */}
          <div className="flex border-b border-slate-800 pb-2 mb-2 overflow-x-auto gap-1 scrollbar-none">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(idx)}
                className={`text-[10px] font-sans font-bold px-2 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto scrollbar-thin p-1">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleEmojiClick(emoji, e)}
                className="text-lg p-0.5 aspect-square hover:bg-slate-800 rounded-lg transition-all transform active:scale-90 hover:scale-110 flex items-center justify-center cursor-pointer select-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
