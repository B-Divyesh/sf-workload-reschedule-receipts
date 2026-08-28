export type Confidence = 'rough' | 'fair' | 'solid';
export type Priority = 'fixed' | 'flexible';

export interface StudyTask {
  id: string;
  title: string;
  course: string;
  estimateMinutes: number;
  doneMinutes: number;
  trimMinutes: number;
  deadline: string;
  confidence: Confidence;
  priority: Priority;
}

export interface BusyEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  source: 'ics' | 'manual';
}

export interface PlanBlock {
  id: string;
  taskId: string;
  start: string;
  end: string;
  minutes: number;
  status: 'planned' | 'done' | 'missed';
}

export interface PlanRisk {
  taskId: string;
  unscheduledMinutes: number;
  deadline: string;
}

export interface Receipt {
  id: string;
  createdAt: string;
  missedTaskId: string;
  missedStart: string;
  missedMinutes: number;
  replacement: string;
  moved: string[];
  kept: string[];
  shorten: Array<{ taskId: string; minutes: number; reason: string }>;
  risks: PlanRisk[];
}

export interface Settings {
  dayStartHour: number;
  dayEndHour: number;
  maxDailyMinutes: number;
  blockMinutes: number;
}

export interface AppState {
  tasks: StudyTask[];
  busyEvents: BusyEvent[];
  blocks: PlanBlock[];
  risks: PlanRisk[];
  receipts: Receipt[];
  settings: Settings;
  calendarName?: string;
  updatedAt: string;
}

export interface PlanResult {
  blocks: PlanBlock[];
  risks: PlanRisk[];
}
