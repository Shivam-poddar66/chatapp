import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export default function UserItem({ contact, isActive, onClick, presence }) {
  const status = presence?.status || contact.status || 'offline';

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const isToday = new Date().toDateString() === date.toDateString();
      return isToday
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition select-none ${
        isActive
          ? 'bg-blue-50/80 text-blue-900 border border-blue-100'
          : 'hover:bg-gray-100 text-gray-800'
      }`}
    >
      <Avatar
        src={contact.avatar}
        name={contact.name}
        status={status}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-semibold truncate leading-tight">
            {contact.name}
          </h4>
          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap ml-2">
            {formatTime(contact.last_message_time)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <p className="text-xs text-gray-500 truncate">
            {contact.last_message || 'Tap to start conversation'}
          </p>

          <Badge count={contact.unread_count} />
        </div>
      </div>
    </div>
  );
}
