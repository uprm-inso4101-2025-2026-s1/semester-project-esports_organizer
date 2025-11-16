// Utility functions shared across components

export const toggleSetItem = (set, item) => {
  const newSet = new Set(set);
  newSet.has(item) ? newSet.delete(item) : newSet.add(item);
  return newSet;
};

export const formatTime = (time) => {
  return time.format('HH:mm');
};

export const preventDefault = (e) => {
  e.preventDefault();
};
