import React from 'react';

const GamepadIcon = ({ className = '', size = 20, color = 'currentColor' }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="11" x2="10" y2="11"></line>
      <line x1="8" y1="9" x2="8" y2="13"></line>
      <line x1="15" y1="12" x2="15.01" y2="12"></line>
      <line x1="18" y1="10" x2="18.01" y2="10"></line>
      <path d="M17.32 5H6.68a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h10.64a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4z"></path>
    </svg>
  );
};

export default GamepadIcon;
