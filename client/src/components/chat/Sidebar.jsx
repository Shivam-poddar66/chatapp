import React, { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import UserList from './UserList';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chat.service';
import { Search, LogOut, MessageSquare, X } from 'lucide-react';

export default function Sidebar({
  contacts = [],
  activeContactId,
  onSelectContact,
  getStatus,
  isLoading
}) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await chatService.searchUsers(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('User search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const rawList = searchQuery.trim() ? searchResults : contacts;
  const displayedList = Array.from(
    new Map(rawList.map((item) => [Number(item.id), item])).values()
  );

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white border-r border-gray-200 select-none">
      {/* 1. Profile & App Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            status="online"
            size="md"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate leading-tight">
              {user?.name}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Search Bar */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Section Title */}
      <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <span>{searchQuery.trim() ? 'Search Results' : 'Conversations'}</span>
        <span className="text-[11px] font-normal lowercase bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
          {displayedList.length} total
        </span>
      </div>

      {/* 4. Contact List */}
      <UserList
        contacts={displayedList}
        activeContactId={activeContactId}
        onSelectContact={(contact) => {
          onSelectContact(contact);
          if (searchQuery.trim()) {
            setSearchQuery('');
          }
        }}
        getStatus={getStatus}
        isLoading={isLoading || isSearching}
      />
    </div>
  );
}
