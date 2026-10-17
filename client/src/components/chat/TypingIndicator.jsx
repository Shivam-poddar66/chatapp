import React from 'react';

export default function TypingIndicator({ userName = 'Typing' }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full w-fit shadow-xs">
      <span className="text-xs text-gray-500 font-medium">{userName} is typing</span>
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
}
