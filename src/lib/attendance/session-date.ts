const SESSION_TIMEZONE = 'Asia/Jakarta';

export function getSessionDate(scheduledStart: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SESSION_TIMEZONE,
  }).format(new Date(scheduledStart));
}
