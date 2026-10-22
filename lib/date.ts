// Local calendar date, not UTC — toISOString() shifts across midnight for
// any timezone offset from UTC, which silently changes which day "today" is.
export const todayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const isToday = (isoDate: string) => isoDate === todayStr();

export const formatWeekdayDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
};
