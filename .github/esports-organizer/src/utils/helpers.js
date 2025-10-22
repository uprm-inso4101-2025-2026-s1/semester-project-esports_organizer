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

//Feature: Add tournament to Google Calendar

export const addToGoogleCalendar = (tournament) => {
  const title = encodeURIComponent(tournament.title);
  const details = encodeURIComponent(`Remember the tournament of: ${tournament.game}`);
  const location = encodeURIComponent(tournament.location || '');

  const start = new Date(tournament.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 hours aprox.

  const startISO = start.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endISO = end.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}&location=${location}`;

  window.open(calendarUrl, '_blank');
};


