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

const localeFor = (language: 'en' | 'fr') => (language === 'fr' ? 'fr-FR' : 'en-US');

// Hour:minute of a full ISO timestamp in the device's timezone (e.g. "07:45").
export const formatTime = (isoDateTime: string, language: 'en' | 'fr') =>
  new Date(isoDateTime).toLocaleTimeString(localeFor(language), {
    hour: '2-digit',
    minute: '2-digit',
  });

// A full ISO timestamp as "Mon 27 Oct, 07:45" — just the time when it's today.
export const formatDateTime = (isoDateTime: string, language: 'en' | 'fr') => {
  const date = new Date(isoDateTime);
  const time = formatTime(isoDateTime, language);

  if (date.toDateString() === new Date().toDateString()) {
    return time;
  }

  const day = date.toLocaleDateString(localeFor(language), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return `${day}, ${time}`;
};

// A plain "YYYY-MM-DD" date as "Monday 27 October" in the app's language.
export const formatLongDate = (isoDate: string, language: 'en' | 'fr') =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(localeFor(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

export const formatWeekdayDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
};
