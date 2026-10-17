import React from 'react';
import Avatar from '../common/Avatar';
import { ArrowLeft, Phone, Video, MoreVertical, ShieldCheck } from 'lucide-react';

export default function ChatHeader({ contact, presence, onBack, isRecipientTyping }) {
  if (!contact) return null;

  const status = presence?.status || contact.status || 'offline';

  const formatLastSeen = (isoString) => {
    if (!isoString) return 'Offline';
    try {
      const date = new Date(isoString);
      const isToday = new Date().toDateString() === date.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return isToday ? `Last seen today at ${timeStr}` : `Last seen ${date.toLocaleDateString()}`;
    } catch {
      return 'Offline';
    }
  };

  return (
    <div className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between z-10 shadow-xs">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar
          src={contact.avatar}
          name={contact.name}
          status={status}
          size="md"
        />

        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">
              {contact.name}
            </h2>
            <span
              className="inline-flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full font-medium"
              title="PII Masking Active: Emails & Phone numbers protected"
            >
              <ShieldCheck className="w-3 h-3 mr-0.5" />
              Masked
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {isRecipientTyping ? (
              <span className="text-blue-600 font-medium">Typing...</span>
            ) : status === 'online' ? (
              <span className="text-emerald-600 font-medium">Online</span>
            ) : (
              formatLastSeen(presence?.lastSeen || contact.last_seen_at)
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-gray-500">
        <button
          className="p-2 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
          title="Start voice call (Demo)"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
          title="Start video call (Demo)"
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
          title="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
