import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { chatService } from '../../services/chat.service';
import { usePresence } from '../../hooks/usePresence';

export default function ChatLayout() {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const { initPresence, getStatus } = usePresence();

  // Load contacts
  const loadContacts = useCallback(async () => {
    try {
      setIsLoadingContacts(true);
      const list = await chatService.getContacts();
      setContacts(list);
      initPresence(list);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [initPresence]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Handle updates from incoming/outgoing messages
  const handleContactUpdate = useCallback((message) => {
    setContacts((prev) => {
      const otherUserId = Number(
        message.senderId === activeContact?.id ? message.senderId : message.recipientId
      );

      return prev.map((c) => {
        if (Number(c.id) === Number(message.senderId) || Number(c.id) === Number(message.recipientId)) {
          const isActiveChat = activeContact && Number(activeContact.id) === Number(message.senderId);
          const currentUnread = Number(c.unread_count) || 0;

          return {
            ...c,
            last_message: message.content,
            last_message_time: message.createdAt || message.created_at || new Date().toISOString(),
            unread_count: isActiveChat ? 0 : currentUnread + (message.senderId === c.id ? 1 : 0)
          };
        }
        return c;
      });
    });
  }, [activeContact]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    // Reset unread count locally for selected contact
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, unread_count: 0 } : c))
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar: Visible on desktop or when no contact is selected on mobile */}
      <div
        className={`${
          activeContact ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 h-full flex-shrink-0 z-0`}
      >
        <Sidebar
          contacts={contacts}
          activeContactId={activeContact?.id}
          onSelectContact={handleSelectContact}
          getStatus={getStatus}
          isLoading={isLoadingContacts}
        />
      </div>

      {/* Chat Area: Visible on desktop or when a contact is selected on mobile */}
      <div
        className={`${
          activeContact ? 'flex' : 'hidden md:flex'
        } flex-1 h-full min-w-0`}
      >
        <ChatWindow
          activeContact={activeContact}
          presence={activeContact ? getStatus(activeContact.id) : null}
          onBack={() => setActiveContact(null)}
          onContactUpdate={handleContactUpdate}
        />
      </div>
    </div>
  );
}
