import { describe, expect, it } from 'vitest';
import { parseIcs } from '../../src/ics';
import { buildPlan, defaultSettings, formatMinutes, missBlock } from '../../src/scheduler';
import type { AppState, StudyTask } from '../../src/types';

const task: StudyTask = {
  id: 'task-1', title: 'Draft lab notes', course: 'BIO 204', estimateMinutes: 120,
  doneMinutes: 0, trimMinutes: 0, deadline: '2030-01-02T18:00:00.000Z', confidence: 'fair', priority: 'fixed',
};

describe('scheduler', () => {
  it('keeps work outside a busy calendar event', () => {
    const result = buildPlan([task], [{ id: 'busy', title: 'Class', start: '2030-01-01T09:00:00.000Z', end: '2030-01-01T11:00:00.000Z', source: 'ics' }], defaultSettings, new Date('2030-01-01T08:00:00.000Z'));
    expect(result.blocks.length).toBeGreaterThan(0);
    expect(result.blocks.every((block) => new Date(block.end) <= new Date('2030-01-01T09:00:00.000Z') || new Date(block.start) >= new Date('2030-01-01T11:00:00.000Z'))).toBe(true);
  });

  it('records short work when a deadline cannot fit', () => {
    const result = buildPlan([{ ...task, estimateMinutes: 240, deadline: '2030-01-01T10:00:00.000Z' }], [], defaultSettings, new Date('2030-01-01T08:00:00.000Z'));
    expect(result.risks).toEqual([{ taskId: 'task-1', unscheduledMinutes: 120, deadline: '2030-01-01T10:00:00.000Z' }]);
  });

  it('makes a receipt when a block is missed', () => {
    const plan = buildPlan([task], [], defaultSettings, new Date('2030-01-01T08:00:00.000Z'));
    const state: AppState = { tasks: [task], busyEvents: [], ...plan, receipts: [], settings: defaultSettings, updatedAt: '2030-01-01T08:00:00.000Z' };
    const next = missBlock(state, plan.blocks[0].id, new Date('2030-01-01T08:00:00.000Z'));
    expect(next.receipts).toHaveLength(1);
    expect(next.receipts[0].missedMinutes).toBe(60);
    expect(next.receipts[0].missedTaskTitle).toBe('Draft lab notes');
    expect(next.receipts[0].taskTitles['task-1']).toBe('Draft lab notes');
  });

  it('never formats an impossible negative duration', () => {
    expect(formatMinutes(-90)).toBe('0 min');
  });
});

describe('ICS parser', () => {
  it('reads timed events and rejects non-calendars', () => {
    const events = parseIcs('BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:20300101T090000Z\nDTEND:20300101T100000Z\nSUMMARY:Chemistry class\nEND:VEVENT\nEND:VCALENDAR');
    expect(events[0].title).toBe('Chemistry class');
    expect(() => parseIcs('hello')).toThrow('not a calendar (.ics) file');
  });
});
