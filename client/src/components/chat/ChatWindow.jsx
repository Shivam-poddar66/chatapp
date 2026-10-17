import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import { MessageSquareDashed } from 'lucide-react';

export default function ChatWindow({ activeContact, presence, onBack, onContactUpdate }) {
  const { user } = useAuth();
  const {
    messages,
    isLoadingMessages,
    hasMoreMessages,
    isRecipientTyping,
    sendMessage,
    sendTyping,
    loadMoreMessages
  } = useChat(activeContact, onContactUpdate);

  if (!activeContact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center select-none">
        <div className="w-20 h-20 bg-blue-100/60 text-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
          <MessageSquareDashed className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Select a Contact</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Choose a conversation from the sidebar or search for someone new to start chatting in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <ChatHeader
        contact={activeContact}
        presence={presence}
        onBack={onBack}
        isRecipientTyping={isRecipientTyping}
      />

      <MessageList
        messages={messages}
        currentUserId={user?.id}
        isLoading={isLoadingMessages}
        hasMore={hasMoreMessages}
        onLoadMore={loadMoreMessages}
        isRecipientTyping={isRecipientTyping}
        recipientName={activeContact.name}
      />

      <MessageInput
        onSendMessage={sendMessage}
        onTyping={sendTyping}
        disabled={isLoadingMessages}
      />
    </div>
  );
}
