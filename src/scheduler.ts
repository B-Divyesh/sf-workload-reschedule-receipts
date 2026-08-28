import type { AppState, BusyEvent, PlanBlock, PlanResult, Receipt, Settings, StudyTask } from './types';

const SLOT = 30;

export const defaultSettings: Settings = {
  dayStartHour: 8,
  dayEndHour: 21,
  maxDailyMinutes: 180,
  blockMinutes: 60,
};

export function emptyState(): AppState {
  return {
    tasks: [],
    busyEvents: [],
    blocks: [],
    risks: [],
    receipts: [],
    settings: { ...defaultSettings },
    updatedAt: new Date().toISOString(),
  };
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ceilToSlot(date: Date): Date {
  const next = new Date(date);
  next.setSeconds(0, 0);
  const minutes = next.getMinutes();
  next.setMinutes(Math.ceil(minutes / SLOT) * SLOT);
  return next;
}

function overlaps(start: Date, end: Date, event: BusyEvent | PlanBlock): boolean {
  return start < new Date(event.end) && end > new Date(event.start);
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function orderedTasks(tasks: StudyTask[]): StudyTask[] {
  return [...tasks].sort((a, b) => {
    const deadline = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (deadline !== 0) return deadline;
    return a.priority === b.priority ? 0 : a.priority === 'fixed' ? -1 : 1;
  });
}

export function buildPlan(
  tasks: StudyTask[],
  busyEvents: BusyEvent[],
  settings: Settings,
  from = new Date(),
): PlanResult {
  const start = ceilToSlot(from);
  const occupied: PlanBlock[] = [];
  const dailyUse = new Map<string, number>();
  const risks: PlanResult['risks'] = [];

  for (const task of orderedTasks(tasks)) {
    let remaining = Math.max(0, task.estimateMinutes - task.doneMinutes - task.trimMinutes);
    const deadline = new Date(task.deadline);
    let cursor = new Date(start);
    let current: PlanBlock | undefined;
    let guard = 0;

    while (remaining > 0 && cursor < deadline && guard < 3000) {
      guard += 1;
      const dayStart = new Date(cursor);
      dayStart.setHours(settings.dayStartHour, 0, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(settings.dayEndHour, 0, 0, 0);

      if (cursor < dayStart) cursor = new Date(dayStart);
      if (cursor >= dayEnd) {
        cursor = new Date(dayStart);
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }

      const slotEnd = new Date(cursor.getTime() + SLOT * 60_000);
      const used = dailyUse.get(dayKey(cursor)) ?? 0;
      const unavailable = busyEvents.some((event) => overlaps(cursor, slotEnd, event));
      const claimed = occupied.some((block) => overlaps(cursor, slotEnd, block));
      const fitsDeadline = slotEnd <= deadline;

      if (!unavailable && !claimed && fitsDeadline && used + SLOT <= settings.maxDailyMinutes) {
        const canJoin = current
          && new Date(current.end).getTime() === cursor.getTime()
          && current.minutes + SLOT <= settings.blockMinutes;
        if (canJoin && current) {
          current.end = slotEnd.toISOString();
          current.minutes += SLOT;
        } else {
          current = {
            id: uid('block'),
            taskId: task.id,
            start: cursor.toISOString(),
            end: slotEnd.toISOString(),
            minutes: SLOT,
            status: 'planned',
          };
          occupied.push(current);
        }
        dailyUse.set(dayKey(cursor), used + SLOT);
        remaining -= SLOT;
      } else {
        current = undefined;
      }
      cursor = slotEnd;
    }

    if (remaining > 0) {
      risks.push({ taskId: task.id, unscheduledMinutes: remaining, deadline: task.deadline });
    }
  }

  return { blocks: occupied.sort((a, b) => a.start.localeCompare(b.start)), risks };
}

export function formatDateTime(value: string, includeDate = true): string {
  return new Intl.DateTimeFormat('en', {
    weekday: includeDate ? 'short' : undefined,
    month: includeDate ? 'short' : undefined,
    day: includeDate ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function makeReceipt(
  missed: PlanBlock,
  before: PlanBlock[],
  after: PlanResult,
  tasks: StudyTask[],
  createdAt = new Date(),
): Receipt {
  const replacementBlocks = after.blocks.filter((block) => block.taskId === missed.taskId);
  const firstReplacement = replacementBlocks[0];
  const replacement = firstReplacement
    ? `${formatMinutes(missed.minutes)} returns on ${formatDateTime(firstReplacement.start)}.`
    : `${formatMinutes(missed.minutes)} does not fit before the deadline.`;

  const moved: string[] = [];
  for (const item of tasks.filter((value) => value.id !== missed.taskId)) {
    const oldBlock = before.find((block) => block.taskId === item.id && block.start >= missed.start);
    const newBlock = after.blocks.find((block) => block.taskId === item.id);
    if (oldBlock && newBlock && oldBlock.start !== newBlock.start) {
      moved.push(`${item.title} moves from ${formatDateTime(oldBlock.start)} to ${formatDateTime(newBlock.start)}.`);
    }
  }

  const shorten = tasks
    .filter((item) => item.confidence === 'rough' && item.estimateMinutes - item.trimMinutes - item.doneMinutes >= 60)
    .slice(0, 2)
    .map((item) => ({
      taskId: item.id,
      minutes: 30,
      reason: `${item.title} has a rough estimate, so 30 minutes could be trimmed with care.`,
    }));

  const kept = [
    'Completed blocks stay complete.',
    'No estimate was cut without your choice.',
    'Calendar events remain unavailable.',
  ];

  return {
    id: uid('receipt'),
    createdAt: createdAt.toISOString(),
    missedTaskId: missed.taskId,
    missedStart: missed.start,
    missedMinutes: missed.minutes,
    replacement,
    moved,
    kept,
    shorten,
    risks: after.risks,
  };
}

export function missBlock(state: AppState, blockId: string, now = new Date()): AppState {
  const missed = state.blocks.find((block) => block.id === blockId);
  if (!missed) return state;

  const doneByTask = new Map<string, number>();
  for (const block of state.blocks) {
    if (block.start < missed.start) {
      doneByTask.set(block.taskId, (doneByTask.get(block.taskId) ?? 0) + block.minutes);
    }
  }
  const tasks = state.tasks.map((task) => ({
    ...task,
    doneMinutes: Math.max(task.doneMinutes, doneByTask.get(task.id) ?? 0),
  }));
  const from = new Date(Math.max(now.getTime(), new Date(missed.end).getTime()));
  const after = buildPlan(tasks, state.busyEvents, state.settings, from);
  const receipt = makeReceipt(missed, state.blocks, after, tasks, now);
  return {
    ...state,
    tasks,
    blocks: after.blocks,
    risks: after.risks,
    receipts: [receipt, ...state.receipts],
    updatedAt: now.toISOString(),
  };
}

export function markBlockDone(state: AppState, blockId: string): AppState {
  const block = state.blocks.find((item) => item.id === blockId);
  if (!block) return state;
  const tasks = state.tasks.map((task) => task.id === block.taskId
    ? { ...task, doneMinutes: Math.min(task.estimateMinutes, task.doneMinutes + block.minutes) }
    : task);
  const next = buildPlan(tasks, state.busyEvents, state.settings, new Date(block.end));
  return { ...state, tasks, blocks: next.blocks, risks: next.risks, updatedAt: new Date().toISOString() };
}
