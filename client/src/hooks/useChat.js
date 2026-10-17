import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chat.service';
import { playMessagePing } from '../utils/sound';

export function useChat(activeContact, onContactUpdate) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  const activeContactRef = useRef(activeContact);
  const conversationRef = useRef(conversation);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // Load conversation & initial messages when activeContact changes
  useEffect(() => {
    if (!activeContact) {
      setConversation(null);
      setMessages([]);
      setIsRecipientTyping(false);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);

    async function loadChat() {
      try {
        const convo = await chatService.getOrCreateConversation(activeContact.id);
        if (!isMounted) return;

        setConversation(convo);

        const history = await chatService.getMessages(convo.id, { limit: 30 });
        if (!isMounted) return;

        setMessages(history);
        setHasMoreMessages(history.length >= 30);

        // Mark any incoming messages as seen
        if (socket && convo.id) {
          socket.emit('message:seen', {
            conversationId: convo.id,
            senderId: activeContact.id
          });
        }
      } catch (err) {
        console.error('Error loading chat:', err);
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    }

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [activeContact, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // 1. Incoming real-time message
    const handleReceiveMessage = (incoming) => {
      // Check if message belongs to current active conversation
      const currentContact = activeContactRef.current;
      const isFromActiveContact = currentContact && Number(incoming.senderId) === Number(currentContact.id);

      if (isFromActiveContact) {
        setMessages((prev) => [...prev, incoming]);
        playMessagePing();

        // Immediately notify sender that message has been seen
        socket.emit('message:seen', {
          conversationId: incoming.conversationId,
          messageIds: [incoming.id],
          senderId: incoming.senderId
        });
      } else {
        // Message from another contact -> play sound and notify contact list update
        playMessagePing();
      }

      if (typeof onContactUpdate === 'function') {
        onContactUpdate(incoming);
      }
    };

    // 2. Server ACK for sent message
    const handleMessageSent = ({ tempId, message, conversationId }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.tempId === tempId ? { ...message, tempId } : msg))
      );
      if (typeof onContactUpdate === 'function') {
        onContactUpdate(message);
      }
    };

    // 3. Typing indicator from another user
    const handleUserTyping = ({ senderId, isTyping }) => {
      const currentContact = activeContactRef.current;
      if (currentContact && Number(senderId) === Number(currentContact.id)) {
        setIsRecipientTyping(isTyping);
      }
    };

    // 4. Read receipt status updates
    const handleStatusUpdate = ({ conversationId, messageIds, status }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (
            (conversationId && msg.conversationId === conversationId) ||
            (messageIds && messageIds.includes(msg.id))
          ) {
            return { ...msg, status: status || 'read' };
          }
          return msg;
        })
      );
    };

    socket.on('message:receive', handleReceiveMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('user:typing', handleUserTyping);
    socket.on('message:status_update', handleStatusUpdate);

    return () => {
      socket.off('message:receive', handleReceiveMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('user:typing', handleUserTyping);
      socket.off('message:status_update', handleStatusUpdate);
    };
  }, [socket, onContactUpdate]);

  // Send message with optimistic UI updates
  const sendMessage = useCallback(
    (content) => {
      if (!content || !content.trim() || !activeContact || !socket) return;

      const trimmed = content.trim();
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const optimisticMsg = {
        id: tempId,
        tempId,
        conversationId: conversationRef.current?.id,
        senderId: user.id,
        senderName: user.name,
        recipientId: activeContact.id,
        content: trimmed, // Will be replaced by masked content from server ACK
        status: 'sending',
        createdAt: new Date().toISOString()
      };

      // Add to messages immediately
      setMessages((prev) => [...prev, optimisticMsg]);

      // Emit to server
      socket.emit('message:send', {
        recipientId: activeContact.id,
        content: trimmed,
        tempId
      });

      // Clear typing indicator
      socket.emit('message:typing', {
        recipientId: activeContact.id,
        isTyping: false
      });
    },
    [activeContact, socket, user]
  );

  // Send typing trigger with debouncing
  const sendTyping = useCallback(
    (isTyping) => {
      if (!activeContact || !socket) return;

      socket.emit('message:typing', {
        recipientId: activeContact.id,
        isTyping
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('message:typing', {
            recipientId: activeContact.id,
            isTyping: false
          });
        }, 2000);
      }
    },
    [activeContact, socket]
  );

  // Load older messages (Cursor pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversation || messages.length === 0 || isLoadingMessages || !hasMoreMessages) return;

    const oldestId = messages[0]?.id;
    if (!oldestId || typeof oldestId === 'string' && oldestId.startsWith('temp_')) return;

    try {
      const older = await chatService.getMessages(conversation.id, {
        beforeId: oldestId,
        limit: 30
      });

      if (older.length < 30) {
        setHasMoreMessages(false);
      }

      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
      }
    } catch (err) {
      console.error('Error fetching older messages:', err);
    }
  }, [conversation, messages, isLoadingMessages, hasMoreMessages]);

  return {
    conversation,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    isRecipientTyping,
    sendMessage,
    sendTyping,
    loadMoreMessages
  };
}
