/**
 * IST timezone utility — all display times use India Standard Time (UTC+5:30)
 * Uses Intl.DateTimeFormat with Asia/Kolkata for correct conversion.
 */

/** Format a date as IST time string e.g. "10:30 AM" */
export function formatISTTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

/** Format a date as IST date string e.g. "Monday, February 19" */
export function formatISTDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

/** Get current IST hours (0-23) */
export function getISTHours(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).formatToParts(new Date());
  return Number(parts.find(p => p.type === 'hour')?.value || 0);
}

/** Get current IST time string for status bar */
export function getISTStatusBarTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

/** Format a time-only string (e.g. "05:09:00+00") or full date as IST time */
export function formatTimeToIST(timeStr: string): string {
  // If it's a time-only string (no date part), prepend today's date
  if (/^\d{2}:\d{2}/.test(timeStr) && !timeStr.includes('T') && !timeStr.includes('-')) {
    const today = new Date().toISOString().split('T')[0];
    return formatISTTime(`${today}T${timeStr}`);
  }
  return formatISTTime(timeStr);
}
