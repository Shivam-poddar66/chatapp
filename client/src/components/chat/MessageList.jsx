import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Loader2 } from 'lucide-react';

export default function MessageList({
  messages = [],
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  isRecipientTyping,
  recipientName
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevHeightRef = useRef(0);

  // Auto scroll to bottom when new messages are added or when typing
  useEffect(() => {
    if (bottomRef.current && !isLoading) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isRecipientTyping]);

  // Handle scroll to top for pagination
  const handleScroll = () => {
    if (!containerRef.current || !hasMore || isLoading) return;

    if (containerRef.current.scrollTop === 0) {
      prevHeightRef.current = containerRef.current.scrollHeight;
      if (typeof onLoadMore === 'function') {
        onLoadMore();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-50/50 to-white"
    >
      {hasMore && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-full transition cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> : null}
            Load older messages
          </button>
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8 select-none">
          <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-3">
            💬
          </div>
          <p className="text-sm font-semibold text-gray-600">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Send a message to start this private encrypted conversation. Phone numbers and email addresses will be automatically masked!
          </p>
        </div>
      )}

      {messages.map((msg) => {
        const isSender = Number(msg.senderId || msg.sender_id) === Number(currentUserId);
        return (
          <MessageBubble
            key={msg.tempId || msg.id}
            message={msg}
            isSender={isSender}
          />
        );
      })}

      {isRecipientTyping && (
        <div className="pt-2">
          <TypingIndicator userName={recipientName} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
