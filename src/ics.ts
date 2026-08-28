import type { BusyEvent } from './types';
import { uid } from './scheduler';

function unfold(text: string): string[] {
  return text.replace(/\r\n[ \t]/g, '').replace(/\r/g, '').split('\n');
}

function parseIcsDate(raw: string): Date | null {
  const value = raw.trim();
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/);
  if (!match) return null;
  const [, year, month, day, hour = '00', minute = '00', second = '00', utc] = match;
  return utc
    ? new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second))
    : new Date(+year, +month - 1, +day, +hour, +minute, +second);
}

export function parseIcs(text: string): BusyEvent[] {
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('This file is not an ICS calendar.');
  const lines = unfold(text);
  const events: BusyEvent[] = [];
  let current: Record<string, string> | null = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') current = {};
    else if (line === 'END:VEVENT' && current) {
      const start = parseIcsDate(current.DTSTART ?? '');
      const end = parseIcsDate(current.DTEND ?? '');
      if (start && end && end > start) {
        events.push({
          id: uid('event'),
          title: current.SUMMARY || 'Busy',
          start: start.toISOString(),
          end: end.toISOString(),
          source: 'ics',
        });
      }
      current = null;
    } else if (current) {
      const split = line.indexOf(':');
      if (split > 0) current[line.slice(0, split).split(';')[0]] = line.slice(split + 1).replace(/\\,/g, ',');
    }
  }
  if (!events.length) throw new Error('No timed events were found in this calendar.');
  return events;
}
