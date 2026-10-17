import React from 'react';

export default function Badge({ count }) {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full shadow-sm">
      {displayCount}
    </span>
  );
}
