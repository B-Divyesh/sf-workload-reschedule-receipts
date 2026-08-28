import { buildPlan, emptyState, missBlock } from './scheduler';
import type { AppState, StudyTask } from './types';

function at(days: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function makeDemoState(): AppState {
  const now = new Date();
  const tasks: StudyTask[] = [
    { id: 'demo-bio', title: 'Draft biology lab discussion', course: 'BIO 204', estimateMinutes: 180, doneMinutes: 0, trimMinutes: 0, deadline: at(1, 18).toISOString(), confidence: 'fair', priority: 'fixed' },
    { id: 'demo-history', title: 'Check history essay citations', course: 'HIST 118', estimateMinutes: 120, doneMinutes: 0, trimMinutes: 0, deadline: at(2, 12).toISOString(), confidence: 'rough', priority: 'flexible' },
    { id: 'demo-stats', title: 'Finish statistics problem set', course: 'STAT 210', estimateMinutes: 150, doneMinutes: 0, trimMinutes: 0, deadline: at(2, 17).toISOString(), confidence: 'solid', priority: 'fixed' },
    { id: 'demo-reading', title: 'Read seminar paper', course: 'SOC 302', estimateMinutes: 90, doneMinutes: 0, trimMinutes: 0, deadline: at(3, 15).toISOString(), confidence: 'rough', priority: 'flexible' },
  ];
  const busyEvents = [
    { id: 'demo-class', title: 'Statistics class', start: at(0, 14).toISOString(), end: at(0, 16).toISOString(), source: 'ics' as const },
    { id: 'demo-shift', title: 'Library shift', start: at(1, 10).toISOString(), end: at(1, 14).toISOString(), source: 'ics' as const },
  ];
  const seed = { ...emptyState(), tasks, busyEvents, calendarName: 'Campus week.ics' };
  const plan = buildPlan(tasks, busyEvents, seed.settings, now);
  const planned = { ...seed, ...plan };
  const first = planned.blocks[0];
  return first ? missBlock(planned, first.id, new Date(first.start)) : planned;
}
