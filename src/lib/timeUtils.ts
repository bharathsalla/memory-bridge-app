/**
 * IST timezone utility — all display times use India Standard Time (UTC+5:30)
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Convert a UTC date string or Date to IST Date object */
export function toIST(date: string | Date): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Get UTC time, add IST offset
  return new Date(d.getTime() + IST_OFFSET_MS);
}

/** Format a UTC date/string as IST time string e.g. "10:30 AM" */
export function formatISTTime(date: string | Date): string {
  const ist = toIST(date);
  let hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/** Format a UTC date/string as IST date string e.g. "Monday, February 19" */
export function formatISTDate(date: string | Date): string {
  const ist = toIST(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[ist.getUTCDay()]}, ${months[ist.getUTCMonth()]} ${ist.getUTCDate()}`;
}

/** Get current IST hours (0-23) */
export function getISTHours(): number {
  return toIST(new Date()).getUTCHours();
}
