const WIB = 'Asia/Jakarta';

const WEEKDAY_TO_ISO: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function isoWeekdayInWib(date: Date): number {
  const label = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: WIB,
  }).format(date);
  return WEEKDAY_TO_ISO[label] ?? 1;
}

export function wibDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: WIB }).format(date);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

/** HH:mm WIB → ISO timestamptz */
export function wibLocalDateTimeToIso(dateKey: string, time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour - 7, minute, 0, 0);
  return new Date(utcMs).toISOString();
}

export function buildRecurringSessionStarts(params: {
  daysOfWeek: number[];
  startTime: string;
  horizonWeeks: number;
  anchorDateKey?: string;
}): string[] {
  const uniqueDays = [...new Set(params.daysOfWeek)].sort((a, b) => a - b);
  if (uniqueDays.length === 0 || params.horizonWeeks < 1) return [];

  const anchor = params.anchorDateKey ?? wibDateKey(new Date());
  const totalDays = params.horizonWeeks * 7;
  const starts: string[] = [];

  for (let offset = 0; offset < totalDays; offset += 1) {
    const dateKey = addDaysToDateKey(anchor, offset);
    const weekday = isoWeekdayInWib(new Date(`${dateKey}T12:00:00.000Z`));
    if (!uniqueDays.includes(weekday)) continue;
    starts.push(wibLocalDateTimeToIso(dateKey, params.startTime));
  }

  return starts.sort();
}
