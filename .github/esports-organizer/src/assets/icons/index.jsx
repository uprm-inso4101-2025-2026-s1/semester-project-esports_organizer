import React from "react";


export const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.59 13.41L11 3.83C10.63 3.46 10.14 3.25 9.64 3.25H4.5C3.67 3.25 3 3.92 3 4.75V9.89C3 10.39 3.21 10.88 3.59 11.25L13.17 20.83C14.34 21.99 16.24 21.99 17.41 20.83L20.59 17.66C21.76 16.49 21.76 14.51 20.59 13.34V13.41ZM6.75 7.5C6.06 7.5 5.5 6.94 5.5 6.25C5.5 5.56 6.06 5 6.75 5C7.44 5 8 5.56 8 6.25C8 6.94 7.44 7.5 6.75 7.5Z"
      fill="currentColor"
    />
  </svg>
);

export const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 2V5M17 2V5M3.5 9.5H20.5M5 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M19 9C19 14 12 21 12 21C12 21 5 14 5 9C5 5.68629 7.68629 3 11 3H13C16.3137 3 19 5.68629 19 9Z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
  </svg>
);

export const GamepadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 14H9M8 13V15M15.5 12.5H15.51M18 15H18.01"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M7 18H17C19.2091 18 21 16.2091 21 14V13C21 10.2386 18.7614 8 16 8H8C5.23858 8 3 10.2386 3 13V14C3 16.2091 4.79086 18 7 18Z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
  </svg>
);

export const BookmarkIcon = ({ active = false }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
  >
    <path
      d="M6 5C6 3.89543 6.89543 3 8 3H16C17.1046 3 18 3.89543 18 5V21L12 17L6 21V5Z"
      stroke="currentColor"
      strokeWidth="1.75"
    />
  </svg>
);
