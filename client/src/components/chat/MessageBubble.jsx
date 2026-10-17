import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

export default function MessageBubble({ message, isSender }) {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderStatus = () => {
    if (!isSender) return null;

    if (message.status === 'sending') {
      return <Clock className="w-3.5 h-3.5 text-blue-200 animate-pulse" />;
    }

    if (message.status === 'read') {
      return <CheckCheck className="w-3.5 h-3.5 text-sky-200" title="Read" />;
    }

    if (message.status === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-blue-200" title="Delivered" />;
    }

    // Default 'sent'
    return <Check className="w-3.5 h-3.5 text-blue-200" title="Sent" />;
  };

  return (
    <div className={`flex flex-col mb-3 ${isSender ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm transition-all ${
          isSender
            ? 'bg-blue-600 text-white rounded-tr-xs'
            : 'bg-white text-gray-900 border border-gray-100 rounded-tl-xs shadow-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        <div
          className={`flex items-center justify-end gap-1 text-[10px] mt-1 select-none font-medium ${
            isSender ? 'text-blue-100' : 'text-gray-400'
          }`}
        >
          <span>{formatTime(message.createdAt || message.created_at)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}
