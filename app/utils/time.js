export const getUserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getLocalDateString = (date) => {
  return date.toLocaleDateString('en-US', {
    timeZone: getUserTimeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-'); // Returns YYYY-MM-DD format
};

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
};