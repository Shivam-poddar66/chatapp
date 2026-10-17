import React, { useState } from 'react';

export default function Avatar({ src, name = 'User', status = 'offline', size = 'md', showStatus = true }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  };

  const statusSizeClasses = {
    sm: 'w-2.5 h-2.5 bottom-0 right-0',
    md: 'w-3 h-3 bottom-0 right-0',
    lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5'
  };

  const initials = (name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <div className={`relative inline-flex flex-shrink-0 ${sizeClasses[size]}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full rounded-full object-cover shadow-sm bg-gray-100"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-semibold text-white shadow-sm select-none">
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute rounded-full ring-2 ring-white ${statusSizeClasses[size]} ${
            status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
          }`}
          title={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
