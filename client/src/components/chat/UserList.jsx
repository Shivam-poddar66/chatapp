import React from 'react';
import UserItem from './UserItem';
import { Loader2, Users } from 'lucide-react';

export default function UserList({
  contacts = [],
  activeContactId,
  onSelectContact,
  getStatus,
  isLoading
}) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 select-none">
        <Users className="w-10 h-10 mb-2 text-gray-300" />
        <p className="text-sm font-medium text-gray-600">No contacts found</p>
        <p className="text-xs text-gray-400 mt-1">Try searching for other registered users above.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
      {contacts.map((contact) => (
        <UserItem
          key={contact.id}
          contact={contact}
          isActive={Number(activeContactId) === Number(contact.id)}
          onClick={() => onSelectContact(contact)}
          presence={getStatus(contact.id)}
        />
      ))}
    </div>
  );
}
