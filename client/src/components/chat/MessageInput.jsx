import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

const COMMON_EMOJIS = ['😊', '👍', '❤️', '🔥', '🎉', '👋', '🙏', '🚀'];

export default function MessageInput({ onSendMessage, onTyping, disabled }) {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (typeof onTyping === 'function') {
      onTyping(val.length > 0);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;

    onSendMessage(text);
    setText('');
    setShowEmojis(false);
    if (typeof onTyping === 'function') {
      onTyping(false);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojis(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative p-3 bg-white border-t border-gray-200">
      {/* Quick emoji drawer */}
      {showEmojis && (
        <div className="absolute bottom-16 left-4 p-2 bg-white rounded-xl shadow-lg border border-gray-200 flex gap-1.5 z-10 animate-in fade-in zoom-in-95 duration-150">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition ${
            showEmojis ? 'text-blue-600 bg-blue-50' : ''
          }`}
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type a message (emails & phone numbers will be automatically masked)..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
