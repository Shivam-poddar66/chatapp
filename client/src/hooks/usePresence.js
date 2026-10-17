import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

export function usePresence() {
  const { socket } = useSocket();
  const [presenceMap, setPresenceMap] = useState(new Map());

  // Handle incoming status change events
  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = ({ userId, status, lastSeen }) => {
      setPresenceMap((prev) => {
        const next = new Map(prev);
        next.set(Number(userId), { status, lastSeen: lastSeen || new Date().toISOString() });
        return next;
      });
    };

    socket.on('user:status_changed', handleStatusChanged);

    return () => {
      socket.off('user:status_changed', handleStatusChanged);
    };
  }, [socket]);

  // Seed presence map with initial contacts statuses
  const initPresence = useCallback((contacts) => {
    if (!Array.isArray(contacts)) return;
    setPresenceMap((prev) => {
      const next = new Map(prev);
      contacts.forEach((contact) => {
        if (!next.has(contact.id)) {
          next.set(contact.id, {
            status: contact.status || 'offline',
            lastSeen: contact.last_seen_at
          });
        }
      });
      return next;
    });
  }, []);

  const getStatus = useCallback((userId) => {
    if (!userId) return { status: 'offline', lastSeen: null };
    return presenceMap.get(Number(userId)) || { status: 'offline', lastSeen: null };
  }, [presenceMap]);

  return {
    presenceMap,
    initPresence,
    getStatus
  };
}
