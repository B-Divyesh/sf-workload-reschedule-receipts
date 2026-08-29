import './styles.css';
import { makeDemoState } from './demo';
import { parseIcs } from './ics';
import { acceptLicenseFromUrl, cachedLicenseState, checkoutUrl, storeLicense, verifyLicense } from './license';
import type { LicenseState } from './license';
import { buildPlan, emptyState, formatDateTime, formatMinutes, markBlockDone, missBlock, uid } from './scheduler';
import { loadState, saveState } from './storage';
import type { AppState, Receipt, StudyTask } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('App root is missing.');

let state: AppState = emptyState();
let route = window.location.pathname;
let demo = route === '/demo' || new URLSearchParams(window.location.search).get('demo') === '1';
let license: LicenseState = cachedLicenseState();
let formMessage = '';
let toastTimer = 0;

const titles: Record<string, string> = {
  '/': 'Deadline Reality Check — Reschedule missed work',
  '/planner': 'Planner — Deadline Reality Check',
  '/demo': 'Demo — Deadline Reality Check',
  '/privacy': 'Privacy — Deadline Reality Check',
  '/terms': 'Terms — Deadline Reality Check',
  '/404': 'Page not found — Deadline Reality Check',
};

const metadata: Record<string, { description: string; path: string }> = {
  '/': { description: 'Reschedule missed study time and get a plain receipt of moved work and deadline risk.', path: '/' },
  '/planner': { description: 'Add assignments, protect busy time, and rebuild a study plan after a missed block.', path: '/planner' },
  '/demo': { description: 'Try Deadline Reality Check with isolated sample assignments and a reschedule receipt.', path: '/demo' },
  '/privacy': { description: 'Learn how Deadline Reality Check stores plans and handles license checks.', path: '/privacy' },
  '/terms': { description: 'Read the Deadline Reality Check terms, license details, and purchase information.', path: '/terms' },
  '/404': { description: 'Return to Deadline Reality Check, the local planner for missed study time.', path: '/404.html' },
};

function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function taskById(id: string): StudyTask | undefined {
  return state.tasks.find((task) => task.id === id);
}

function activeTaskCount(tasks = state.tasks): number {
  return tasks.filter((task) => task.estimateMinutes - task.doneMinutes - task.trimMinutes > 0).length;
}

function canTrim(task: StudyTask | undefined): boolean {
  return Boolean(task && task.estimateMinutes - task.doneMinutes - task.trimMinutes >= 60);
}

function receiptTaskTitle(receipt: Receipt, taskId: string): string {
  return taskById(taskId)?.title ?? receipt.taskTitles?.[taskId] ?? (receipt.missedTaskId === taskId ? receipt.missedTaskTitle : undefined) ?? 'Former assignment';
}

function freezeReceiptTaskTitles(receipt: Receipt, tasks = state.tasks): Receipt {
  const taskTitles = { ...Object.fromEntries(tasks.map((task) => [task.id, task.title])), ...(receipt.taskTitles ?? {}) };
  return {
    ...receipt,
    missedTaskTitle: receipt.missedTaskTitle ?? taskTitles[receipt.missedTaskId] ?? 'Former assignment',
    taskTitles,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readBackup(value: unknown): AppState {
  if (!isRecord(value) || !Array.isArray(value.tasks) || !Array.isArray(value.busyEvents) || !Array.isArray(value.receipts) || !isRecord(value.settings)) {
    throw new Error('missing plan data');
  }
  const settings = value.settings;
  if (!isFiniteNumber(settings.dayStartHour) || !isFiniteNumber(settings.dayEndHour) || !isFiniteNumber(settings.maxDailyMinutes) || !isFiniteNumber(settings.blockMinutes)
    || !Number.isInteger(settings.dayStartHour) || !Number.isInteger(settings.dayEndHour) || settings.dayStartHour < 0 || settings.dayEndHour > 23 || settings.dayStartHour >= settings.dayEndHour || settings.maxDailyMinutes <= 0 || settings.blockMinutes <= 0) {
    throw new Error('invalid settings');
  }
  const tasks: StudyTask[] = value.tasks.map((task) => {
    if (!isRecord(task) || typeof task.id !== 'string' || typeof task.title !== 'string' || typeof task.course !== 'string' || !isDate(task.deadline)
      || !isFiniteNumber(task.estimateMinutes) || !isFiniteNumber(task.doneMinutes) || !isFiniteNumber(task.trimMinutes)
      || task.estimateMinutes < 0 || task.doneMinutes < 0 || task.trimMinutes < 0 || task.doneMinutes + task.trimMinutes > task.estimateMinutes
      || !['rough', 'fair', 'solid'].includes(String(task.confidence)) || !['fixed', 'flexible'].includes(String(task.priority))) throw new Error('invalid task');
    return task as unknown as StudyTask;
  });
  const busyEvents = value.busyEvents.map((event) => {
    if (!isRecord(event) || typeof event.id !== 'string' || typeof event.title !== 'string' || !isDate(event.start) || !isDate(event.end)
      || new Date(event.start) >= new Date(event.end) || !['ics', 'manual'].includes(String(event.source))) throw new Error('invalid calendar event');
    return event as unknown as AppState['busyEvents'][number];
  });
  const taskTitles = Object.fromEntries(tasks.map((task) => [task.id, task.title]));
  const receipts: Receipt[] = value.receipts.map((receipt) => {
    if (!isRecord(receipt) || typeof receipt.id !== 'string' || typeof receipt.missedTaskId !== 'string' || !isDate(receipt.createdAt) || !isDate(receipt.missedStart)
      || !isFiniteNumber(receipt.missedMinutes) || receipt.missedMinutes < 0 || typeof receipt.replacement !== 'string' || !isStringArray(receipt.moved) || !isStringArray(receipt.kept)
      || !Array.isArray(receipt.shorten) || !Array.isArray(receipt.risks)) throw new Error('invalid receipt');
    if (!receipt.shorten.every((item) => isRecord(item) && typeof item.taskId === 'string' && isFiniteNumber(item.minutes) && item.minutes > 0 && typeof item.reason === 'string')
      || !receipt.risks.every((risk) => isRecord(risk) && typeof risk.taskId === 'string' && isFiniteNumber(risk.unscheduledMinutes) && risk.unscheduledMinutes >= 0 && isDate(risk.deadline))) throw new Error('invalid receipt detail');
    const importedTitles = isRecord(receipt.taskTitles) && Object.values(receipt.taskTitles).every((title) => typeof title === 'string') ? receipt.taskTitles as Record<string, string> : {};
    return {
      ...receipt as Omit<Receipt, 'missedTaskTitle' | 'taskTitles'>,
      missedTaskTitle: typeof receipt.missedTaskTitle === 'string' ? receipt.missedTaskTitle : importedTitles[receipt.missedTaskId] ?? taskTitles[receipt.missedTaskId] ?? 'Former assignment',
      taskTitles: { ...taskTitles, ...importedTitles },
    };
  });
  const plan = buildPlan(tasks, busyEvents, settings as unknown as AppState['settings']);
  return {
    tasks,
    busyEvents,
    ...plan,
    receipts,
    settings: settings as unknown as AppState['settings'],
    calendarName: typeof value.calendarName === 'string' ? value.calendarName : undefined,
    updatedAt: new Date().toISOString(),
  };
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(value));
}

function shell(content: string, current: string): string {
  const nav = [
    ['/demo', 'Demo'],
    ['/planner', 'Planner'],
    ['/privacy', 'Privacy'],
  ];
  return `
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-route>
        <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M5 39h17V21h20v18h17" fill="none" stroke="currentColor" stroke-width="8"/><rect x="28" y="28" width="8" height="8" fill="#d5532d"/></svg>
        <span>Deadline Reality Check</span>
      </a>
      <nav aria-label="Main navigation"><ul class="nav-list">${nav.map(([path, label]) => `<li><a href="${path}" data-route ${current === path ? 'aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul></nav>
    </header>
    ${demo ? `<aside class="demo-banner" aria-label="Demo mode"><span>Demo — sample data, nothing is saved</span><button type="button" data-action="reset-demo">Reset demo</button><a class="button" href="/planner" data-route>Start for real</a></aside>` : ''}
    <aside class="offline-banner" data-offline-banner hidden>Offline — your saved plan still works.</aside>
    <div id="route-status" class="visually-hidden" aria-live="polite"></div>
    ${content}
    <footer class="site-footer">
      <span>Reschedule missed study time and see deadline risk.</span>
      <span class="footer-links"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="visually-hidden">(external)</span></a><span>v1.0.0</span></span>
    </footer>
    <div class="toast" role="status" data-toast hidden></div>`;
}

function landing(): string {
  return shell(`<main id="main">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Missed-study rescheduler</span>
        <h1 tabindex="-1">Reschedule missed study time</h1>
        <p class="hero-lead">For students whose missed work block could turn several assignments into one late night.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="/demo" data-route>Try it with sample data</a>
          <span class="action-note">A missed block and risk receipt load next.</span>
        </div>
        <ul class="facts">
          <li>Your plan stays on this device.</li>
          <li>It works offline after your first visit.</li>
          <li>Core planning is free. Unlimited plans cost $9 once.</li>
        </ul>
      </div>
      <div class="hero-art">
        <picture>
          <source media="(max-width: 720px)" srcset="/assets/hero-plan-720.webp">
          <img src="/assets/hero-plan-1200.webp" width="1200" height="800" alt="An orange paper path bends around a missed block, then rejoins a row of green work blocks." fetchpriority="high" decoding="async">
        </picture>
      </div>
    </section>
    <section class="section" aria-labelledby="receipt-preview-title"><div class="shell preview-grid">
      <div class="section-intro"><span class="eyebrow">Sample reschedule receipt</span><h2 id="receipt-preview-title">Example reschedule receipt</h2><p>A revised plan shows what moves. Estimates change only when you choose a trim.</p><a href="/planner" data-route>Start with your assignments →</a></div>
      <article class="receipt" aria-label="Sample reschedule receipt">
        <div class="receipt-head"><span class="receipt-label">RESCHEDULE / 001</span><span class="status-risk">1 deadline at risk</span></div>
        <div class="receipt-section"><h3>Missed</h3><p>60 minutes of the biology lab discussion.</p></div>
        <div class="receipt-section"><h3>What changes</h3><ul><li>Biology returns Wednesday at 6:30 PM.</li><li>Citation checks move to Thursday morning.</li></ul></div>
        <div class="receipt-section"><h3>What stays true</h3><p>No estimate was cut. Calendar events remain unavailable.</p></div>
      </article>
    </div></section>
    <section class="section" aria-labelledby="how-title"><div class="shell">
      <div class="section-intro"><span class="eyebrow">How it works</span><h2 id="how-title">Rebuild the week in three moves</h2></div>
      <div class="how-grid">
        <div class="step"><span class="step-number">01 / ESTIMATE</span><h3>Add the work you can name</h3><p>Enter each task, deadline, time estimate, and estimate confidence.</p></div>
        <div class="step"><span class="step-number">02 / BLOCK</span><h3>Protect time already taken</h3><p>Import an ICS calendar. Class, work, and appointments stay blocked.</p></div>
        <div class="step"><span class="step-number">03 / RECOVER</span><h3>Mark the block you missed</h3><p>See a new plan that fits your study hours and deadlines at risk.</p></div>
      </div>
    </div></section>
    <section class="section" aria-labelledby="limits-title"><div class="shell policy-grid">
      <div><span class="eyebrow">Planning scope</span><h2 id="limits-title">What this planner does</h2><p>Enter estimates, protect busy time, and see what can still fit before each deadline.</p><p>Rough estimates stay marked in a receipt so you can review them.</p></div>
      <div><span class="eyebrow">Local by default</span><h2>How calendar data is handled</h2><p>ICS files are read in your browser. Assignment and calendar data stay in this browser unless you export a backup.</p><p><a href="/privacy" data-route>Read the privacy details →</a></p></div>
    </div></section>
    ${pricingSection()}
  </main>`, '/');
}

function pricingSection(): string {
  return `<section class="section" aria-labelledby="price-title"><div class="shell preview-grid">
    <div><span class="eyebrow">Keep using it</span><h2 id="price-title">Four tasks free.</h2><p>The free plan includes the full rescheduler, risk receipt, calendar import, and data export.</p></div>
    <div class="panel panel-signal"><p class="price">$9 once</p><h3>Unlimited plans and receipt history</h3><p>Buy once to add unlimited active tasks and keep every past receipt.</p>
      <div class="button-row"><a class="button button-primary" href="${checkoutUrl}">Buy the one-time license</a></div>
      <form data-license-form><div class="form-field"><label for="license-token">Have a license? Paste it</label><input id="license-token" name="license" autocomplete="off" required></div><button class="button-quiet" type="submit">Verify my license</button></form>
      ${license.notice ? `<p class="form-error" role="status">${esc(license.notice)} <a href="${checkoutUrl}">Buy a license</a>.</p>` : ''}
      <p class="field-help">Checkout opens with Sociobot. See <a href="/terms" data-route>terms</a>.</p>
    </div>
  </div></section>`;
}

function planBlocks(): string {
  if (!state.tasks.length) return `<div class="empty"><h3>Your plan will appear here</h3><p>Add one assignment to make the first study block.</p></div>`;
  if (!state.blocks.length) return `<div class="empty"><h3>No block fits yet</h3><p>Extend your study hours, raise the daily limit, or check the deadlines.</p></div>${riskList()}`;
  let lastDay = '';
  return `<ol class="timeline">${state.blocks.map((block) => {
    const day = formatDay(block.start);
    const heading = day !== lastDay ? `<li class="plan-day">${esc(day)}</li>` : '';
    lastDay = day;
    const task = taskById(block.taskId);
    return `${heading}<li class="plan-block">
      <span class="plan-time">${esc(formatTime(block.start))}</span>
      <span><span class="task-title">${esc(task?.title ?? 'Task')}</span><br><span class="meta">${esc(task?.course)} · ${formatMinutes(block.minutes)}</span></span>
      <span class="plan-actions"><button type="button" data-action="done" data-id="${esc(block.id)}" aria-label="Mark ${esc(task?.title)} done">Done</button><button type="button" class="button-signal" data-action="miss" data-id="${esc(block.id)}" aria-label="Mark ${esc(task?.title)} missed">Missed</button></span>
    </li>`;
  }).join('')}</ol>${riskList()}`;
}

function riskList(): string {
  if (!state.risks.length) return '';
  return `<aside class="risk-box" aria-labelledby="risk-title"><h3 id="risk-title">Work that does not fit</h3><ul class="risk-list">${state.risks.map((risk) => {
    const task = taskById(risk.taskId);
    return `<li><strong>${esc(task?.title)}</strong>: ${formatMinutes(risk.unscheduledMinutes)} short before ${esc(formatDateTime(risk.deadline))}.</li>`;
  }).join('')}</ul></aside>`;
}

function receiptCard(receipt: Receipt): string {
  const hasRisk = receipt.risks.length > 0;
  return `<article class="receipt" aria-labelledby="receipt-title">
    <div class="receipt-head"><span class="receipt-label">RESCHEDULE / ${esc(receipt.id.slice(-6).toUpperCase())}</span><span class="${hasRisk ? 'status-risk' : 'status-safe'}">${hasRisk ? `${receipt.risks.length} deadline${receipt.risks.length === 1 ? '' : 's'} at risk` : 'No deadline at risk'}</span></div>
    <div class="receipt-section"><h2 id="receipt-title">What this miss changes</h2><p><strong>Missed:</strong> ${formatMinutes(receipt.missedMinutes)} of ${esc(receiptTaskTitle(receipt, receipt.missedTaskId))} at ${esc(formatDateTime(receipt.missedStart))}.</p><p><strong>Replacement:</strong> ${esc(receipt.replacement)}</p></div>
    ${receipt.moved.length ? `<div class="receipt-section"><h3>Work that moves</h3><ul>${receipt.moved.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div>` : `<div class="receipt-section"><h3>Work that moves</h3><p>No other task moved.</p></div>`}
    <div class="receipt-section"><h3>What stays true</h3><ul>${receipt.kept.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>${receipt.shorten.length ? '<p class="field-help">Rough estimates are marked below for review.</p>' : ''}</div>
    ${receipt.shorten.filter((item) => canTrim(taskById(item.taskId))).length ? `<div class="receipt-section"><h3>Possible trims</h3><p>These are choices, not automatic cuts.</p>${receipt.shorten.filter((item) => canTrim(taskById(item.taskId))).map((item) => `<div class="data-row"><span>${esc(item.reason)}</span><button type="button" data-action="trim" data-id="${esc(item.taskId)}">Trim 30 min</button></div>`).join('')}</div>` : ''}
    ${hasRisk ? `<div class="receipt-section"><h3>Deadline risk</h3><ul>${receipt.risks.map((risk) => `<li>${esc(receiptTaskTitle(receipt, risk.taskId))} is ${formatMinutes(risk.unscheduledMinutes)} short.</li>`).join('')}</ul></div>` : ''}
    <div class="button-row"><button type="button" data-action="copy-receipt">Copy receipt</button><button type="button" class="button-quiet" data-action="download-receipt">Download receipt</button></div>
  </article>`;
}

function receiptHistory(): string {
  if (!license.active || state.receipts.length < 2) return '';
  return `<section class="panel" aria-labelledby="history-title"><h2 id="history-title">Past receipts</h2><ol class="task-list">${state.receipts.slice(1).map((receipt) => `<li class="task-item"><span><span class="task-title">${esc(receiptTaskTitle(receipt, receipt.missedTaskId))}</span><br><span class="meta">${esc(formatDateTime(receipt.createdAt))} · ${receipt.risks.length ? `${receipt.risks.length} at risk` : 'no deadline at risk'}</span></span></li>`).join('')}</ol></section>`;
}

function taskList(): string {
  if (!state.tasks.length) return `<div class="empty"><h3>No assignments yet</h3><p>Add a task above. Its study blocks will appear beside this form.</p></div>`;
  return `<ul class="task-list">${state.tasks.map((task) => `<li class="task-item">
    <span><span class="task-title">${esc(task.title)}</span><br><span class="meta">${esc(task.course)} · ${formatMinutes(task.estimateMinutes - task.trimMinutes)} · due ${esc(formatDateTime(task.deadline))}</span><br><span class="tag">${esc(task.confidence)} estimate</span><span class="tag">${esc(task.priority)}</span></span>
    <button type="button" class="button-quiet button-danger" data-action="delete-task" data-id="${esc(task.id)}" aria-label="Delete ${esc(task.title)}">Delete</button>
  </li>`).join('')}</ul>`;
}

function planner(): string {
  const latest = state.receipts[0];
  const nextDeadline = new Date(Date.now() + 2 * 86_400_000);
  nextDeadline.setHours(17, 0, 0, 0);
  const localDeadline = new Date(nextDeadline.getTime() - nextDeadline.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  return shell(`<main id="main" class="app-page"><div class="shell">
    <div class="app-heading"><div><span class="eyebrow">Local recovery planner</span><h1 tabindex="-1">Rebuild the plan you have</h1><p class="hero-lead">Add real estimates, protect busy time, then mark the block you missed.</p></div><span class="tag">${license.active ? 'Unlimited license active' : `${activeTaskCount()} / 4 free tasks`}</span></div>
    <div class="planner-grid">
      <div>
        <section class="panel" aria-labelledby="add-title"><h2 id="add-title">Add an assignment</h2>
          <form data-task-form novalidate><div class="form-grid">
            <div class="form-field form-field-wide"><label for="task-title">Task</label><input id="task-title" name="title" required maxlength="80" placeholder="Draft lab discussion"></div>
            <div class="form-field"><label for="course">Course</label><input id="course" name="course" required maxlength="40" placeholder="BIO 204"></div>
            <div class="form-field"><label for="deadline">Deadline</label><input id="deadline" name="deadline" type="datetime-local" required value="${localDeadline}"></div>
            <div class="form-field"><label for="estimate">Time estimate</label><select id="estimate" name="estimate"><option value="30">30 minutes</option><option value="60" selected>1 hour</option><option value="90">1 hour 30 minutes</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option><option value="360">6 hours</option></select></div>
            <div class="form-field"><label for="confidence">How sure is the estimate?</label><select id="confidence" name="confidence"><option value="rough">Rough</option><option value="fair" selected>Fair</option><option value="solid">Solid</option></select></div>
            <div class="form-field form-field-wide"><label for="priority">Can this task move?</label><select id="priority" name="priority"><option value="fixed">Keep it ahead of flexible work</option><option value="flexible">Move it when needed</option></select></div>
          </div><p class="form-error" role="alert">${esc(formMessage)}</p><button class="button-primary" type="submit">Add assignment and plan it</button></form>
        </section>
        <section class="panel" aria-labelledby="calendar-title"><h2 id="calendar-title">Protect your busy time</h2><p>Import an ICS file exported from your calendar. The file is read here.</p><div class="form-field"><label for="ics-file">ICS calendar</label><input id="ics-file" data-ics-input type="file" accept=".ics,text/calendar"><span class="field-help">${state.calendarName ? `${esc(state.calendarName)} · ${state.busyEvents.length} timed events` : 'No calendar imported. Your study hours are still enforced.'}</span></div></section>
        <details class="panel settings"><summary>Study limits and data</summary>
          <form data-settings-form><div class="form-grid"><div class="form-field"><label for="day-start">Start hour</label><input id="day-start" name="dayStart" type="number" min="0" max="22" value="${state.settings.dayStartHour}"></div><div class="form-field"><label for="day-end">End hour</label><input id="day-end" name="dayEnd" type="number" min="1" max="23" value="${state.settings.dayEndHour}"></div><div class="form-field"><label for="daily-limit">Daily study limit</label><select id="daily-limit" name="dailyLimit"><option value="120" ${state.settings.maxDailyMinutes === 120 ? 'selected' : ''}>2 hours</option><option value="180" ${state.settings.maxDailyMinutes === 180 ? 'selected' : ''}>3 hours</option><option value="240" ${state.settings.maxDailyMinutes === 240 ? 'selected' : ''}>4 hours</option><option value="360" ${state.settings.maxDailyMinutes === 360 ? 'selected' : ''}>6 hours</option></select></div><div class="form-field"><label for="block-size">Longest work block</label><select id="block-size" name="blockSize"><option value="30" ${state.settings.blockMinutes === 30 ? 'selected' : ''}>30 minutes</option><option value="60" ${state.settings.blockMinutes === 60 ? 'selected' : ''}>1 hour</option><option value="90" ${state.settings.blockMinutes === 90 ? 'selected' : ''}>1 hour 30 minutes</option></select></div></div><button type="submit">Save limits and rebuild</button></form>
          <div class="button-row"><button type="button" class="button-quiet" data-action="export-data">Export my data</button><label class="button button-quiet" for="import-data">Import a backup</label><input id="import-data" data-import-input class="visually-hidden" type="file" accept="application/json"></div>
        </details>
        <section class="panel" aria-labelledby="task-list-title"><h2 id="task-list-title">Assignment estimates</h2>${taskList()}</section>
      </div>
      <div>
        ${latest ? receiptCard(latest) : `<section class="panel panel-signal" aria-labelledby="plan-title"><h2 id="plan-title">Your next study blocks</h2><p class="muted">Mark any block missed to get a new plan and receipt.</p>${planBlocks()}</section>`}
        ${latest ? `<section class="panel" aria-labelledby="revised-title"><h2 id="revised-title">Revised study blocks</h2>${planBlocks()}</section>` : ''}
        ${receiptHistory()}
      </div>
    </div>
    ${!license.active ? pricingSection() : ''}
  </div></main>`, demo ? '/demo' : '/planner');
}

function privacy(): string {
  return shell(`<main id="main"><article class="shell legal"><span class="eyebrow">Policy</span><h1 tabindex="-1">Your plan stays on your device</h1><p>Effective August 28, 2026.</p><h2>What this app stores</h2><p>The app stores assignments, estimates, calendar events, settings, and receipts in this browser. Demo data stays in memory and is discarded when you leave the demo.</p><h2>What leaves your device</h2><p>Planning data stays in this browser. A license check sends its token to the Sociobot billing API. Opening checkout takes you to Sociobot.</p><h2>Your choices</h2><p>You can export a backup from the planner. You can delete assignments or clear site data in your browser.</p><h2>Calendar files</h2><p>ICS files are parsed in your browser.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></article></main>`, '/privacy');
}

function terms(): string {
  return shell(`<main id="main"><article class="shell legal"><span class="eyebrow">Terms</span><h1 tabindex="-1">Use the receipt as a planning aid</h1><p>Effective August 28, 2026.</p><h2>The service</h2><p>Deadline Reality Check proposes study blocks from information you enter. It cannot guarantee completion, grades, or deadline acceptance.</p><h2>Your responsibility</h2><p>Check every deadline and estimate. Keep your own backup before clearing browser data.</p><h2>Purchase</h2><p>The $9 license is a one-time purchase for unlimited active tasks and receipt history. Sociobot and Dodo are the merchant of record. Their checkout handles payment and refunds. A refund revokes the license.</p><h2>Availability</h2><p>The app is provided as available, without a promise that every schedule will fit. Core planning continues offline after the app has loaded once.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></article></main>`, '/terms');
}

function notFound(): string {
  return shell(`<main id="main"><article class="shell legal"><span class="eyebrow">404 / wrong turn</span><h1 tabindex="-1">This block is not in the plan</h1><p>The address may have moved. Your saved plan is still on this device.</p><a class="button button-primary" href="/" data-route>Return home</a></article></main>`, '/404');
}

function showToast(message: string): void {
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4000);
}

async function persist(): Promise<void> {
  if (demo) return;
  try { await saveState(state); } catch { showToast('This change could not be saved. Export a backup, then check browser storage.'); }
}

function receiptText(receipt: Receipt): string {
  const risk = receipt.risks.length
    ? receipt.risks.map((item) => `${receiptTaskTitle(receipt, item.taskId)}: ${formatMinutes(item.unscheduledMinutes)} short`).join('\n')
    : 'No deadline is at risk.';
  return `DEADLINE REALITY CHECK\n\nMissed: ${formatMinutes(receipt.missedMinutes)} of ${receiptTaskTitle(receipt, receipt.missedTaskId)}\nReplacement: ${receipt.replacement}\n\nMoved:\n${receipt.moved.join('\n') || 'No other task moved.'}\n\nRisk:\n${risk}\n\nEstimates came from the student.`;
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

async function handleAction(element: HTMLElement): Promise<void> {
  const action = element.dataset.action;
  const id = element.dataset.id ?? '';
  if (action === 'reset-demo') {
    state = makeDemoState();
    render();
    showToast('Demo reset to its starting plan.');
  }
  if (action === 'miss') {
    state = missBlock(state, id);
    if (!license.active) state.receipts = state.receipts.slice(0, 1);
    await persist();
    render();
    showToast('The plan changed. Read the receipt first.');
  }
  if (action === 'done') {
    state = markBlockDone(state, id);
    await persist();
    render();
    showToast('Block marked done. The remaining plan was rebuilt.');
  }
  if (action === 'delete-task') {
    const task = taskById(id);
    if (!task || !window.confirm(`Delete “${task.title}” and its study blocks?`)) return;
    state.receipts = state.receipts.map((receipt) => freezeReceiptTaskTitles(receipt));
    state.tasks = state.tasks.filter((item) => item.id !== id);
    const plan = buildPlan(state.tasks, state.busyEvents, state.settings);
    state = { ...state, ...plan, updatedAt: new Date().toISOString() };
    await persist();
    render();
  }
  if (action === 'trim') {
    const chosen = taskById(id);
    if (!canTrim(chosen)) {
      showToast('This estimate cannot be trimmed further.');
      return;
    }
    const tasks = state.tasks.map((task) => task.id === id
      ? { ...task, trimMinutes: Math.min(task.trimMinutes + 30, task.estimateMinutes - task.doneMinutes) }
      : task);
    const plan = buildPlan(tasks, state.busyEvents, state.settings);
    if (state.receipts[0]) {
      state.receipts[0] = {
        ...state.receipts[0],
        risks: plan.risks,
        shorten: state.receipts[0].shorten.filter((item) => canTrim(tasks.find((task) => task.id === item.taskId))),
        kept: [...state.receipts[0].kept, 'You chose one 30-minute trim.'],
      };
    }
    state = { ...state, tasks, ...plan, updatedAt: new Date().toISOString() };
    await persist();
    render();
    showToast('The chosen estimate was trimmed by 30 minutes.');
  }
  if (action === 'copy-receipt' && state.receipts[0]) {
    await navigator.clipboard.writeText(receiptText(state.receipts[0]));
    showToast('Receipt copied.');
  }
  if (action === 'download-receipt' && state.receipts[0]) download('deadline-reality-check.txt', receiptText(state.receipts[0]), 'text/plain');
  if (action === 'export-data') download('deadline-reality-check-backup.json', JSON.stringify(state, null, 2), 'application/json');
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('[data-route]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(link.getAttribute('href') ?? '/');
  }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => element.addEventListener('click', () => { void handleAction(element); }));

  const taskForm = document.querySelector<HTMLFormElement>('[data-task-form]');
  taskForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(taskForm);
    const title = String(data.get('title') ?? '').trim();
    const course = String(data.get('course') ?? '').trim();
    const deadline = new Date(String(data.get('deadline')));
    if (!title || !course || Number.isNaN(deadline.getTime())) formMessage = 'Add a task, course, and valid deadline.';
    else if (deadline <= new Date()) formMessage = 'The deadline has passed. Choose a future time.';
    else if (!license.active && activeTaskCount() >= 4) formMessage = 'The free plan holds four active tasks. Finish one or buy the one-time license.';
    else {
      state.tasks.push({ id: uid('task'), title, course, deadline: deadline.toISOString(), estimateMinutes: Number(data.get('estimate')), doneMinutes: 0, trimMinutes: 0, confidence: data.get('confidence') as StudyTask['confidence'], priority: data.get('priority') as StudyTask['priority'] });
      const plan = buildPlan(state.tasks, state.busyEvents, state.settings);
      state = { ...state, ...plan, receipts: [], updatedAt: new Date().toISOString() };
      formMessage = '';
      await persist();
      render();
      showToast('Assignment added. Its blocks are in the plan.');
      return;
    }
    render();
    document.querySelector<HTMLInputElement>('#task-title')?.focus();
  });

  const icsInput = document.querySelector<HTMLInputElement>('[data-ics-input]');
  icsInput?.addEventListener('change', async () => {
    const input = icsInput;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const events = parseIcs(await file.text());
      state.busyEvents = events;
      state.calendarName = file.name;
      const plan = buildPlan(state.tasks, state.busyEvents, state.settings);
      state = { ...state, ...plan, receipts: [], updatedAt: new Date().toISOString() };
      await persist();
      render();
      showToast(`${events.length} calendar events now protect busy time.`);
    } catch (error) {
      showToast(`${error instanceof Error ? error.message : 'The calendar could not be read'} Choose an exported .ics file.`);
      input.value = '';
    }
  });

  const settingsForm = document.querySelector<HTMLFormElement>('[data-settings-form]');
  settingsForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(settingsForm);
    const dayStartHour = Number(data.get('dayStart'));
    const dayEndHour = Number(data.get('dayEnd'));
    if (dayStartHour >= dayEndHour) { showToast('The end hour must be later than the start hour.'); return; }
    state.settings = { dayStartHour, dayEndHour, maxDailyMinutes: Number(data.get('dailyLimit')), blockMinutes: Number(data.get('blockSize')) };
    const plan = buildPlan(state.tasks, state.busyEvents, state.settings);
    state = { ...state, ...plan, receipts: [], updatedAt: new Date().toISOString() };
    await persist();
    render();
    showToast('Study limits saved. The plan was rebuilt.');
  });

  const importInput = document.querySelector<HTMLInputElement>('[data-import-input]');
  importInput?.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const imported = readBackup(JSON.parse(await file.text()));
      state = imported;
      await persist();
      render();
      showToast('Backup imported. Review the rebuilt plan.');
    } catch {
      importInput.value = '';
      showToast('This backup could not be read. Your current plan was not changed. Choose a JSON export from this app.');
    }
  });

  document.querySelectorAll<HTMLFormElement>('[data-license-form]').forEach((form) => form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = String(new FormData(form).get('license') ?? '').trim();
    if (!token) return;
    storeLicense(token);
    license = await verifyLicense();
    render();
    showToast(license.active ? 'License active. Unlimited tasks are ready.' : 'That license could not be verified.');
  }));
}

function updateNetworkBanner(): void {
  const banner = document.querySelector<HTMLElement>('[data-offline-banner]');
  if (banner) banner.hidden = navigator.onLine;
}

function updateMetadata(key: string): void {
  const item = metadata[key] ?? metadata['/404'];
  const url = `https://workload-reschedule-receipts.sociobot.in${item.path}`;
  document.title = titles[key] ?? titles['/404'];
  document.querySelector('meta[name="description"]')?.setAttribute('content', item.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', item.description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', item.description);
}

function render(): void {
  route = window.location.pathname;
  demo = route === '/demo' || new URLSearchParams(window.location.search).get('demo') === '1';
  const known = ['/', '/planner', '/demo', '/privacy', '/terms'];
  const view = demo ? planner() : route === '/' ? landing() : route === '/planner' ? planner() : route === '/privacy' ? privacy() : route === '/terms' ? terms() : notFound();
  app.innerHTML = view;
  const titleKey = demo ? '/demo' : known.includes(route) ? route : '/404';
  updateMetadata(titleKey);
  bindEvents();
  updateNetworkBanner();
}

async function navigate(path: string): Promise<void> {
  history.pushState({}, '', path);
  const nextDemo = path === '/demo';
  if (nextDemo) state = makeDemoState();
  else if (path === '/planner' && demo) state = (await loadState()) ?? emptyState();
  window.scrollTo(0, 0);
  render();
  const heading = document.querySelector<HTMLElement>('h1');
  heading?.focus();
  const status = document.querySelector<HTMLElement>('#route-status');
  if (status && heading) status.textContent = heading.textContent;
}

async function start(): Promise<void> {
  acceptLicenseFromUrl();
  license = cachedLicenseState();
  state = demo ? makeDemoState() : (await loadState()) ?? emptyState();
  render();
  void verifyLicense().then((verified) => { license = verified; render(); });
  window.addEventListener('popstate', async () => {
    const wasDemo = demo;
    demo = window.location.pathname === '/demo';
    if (demo) state = makeDemoState();
    else if (wasDemo) state = (await loadState()) ?? emptyState();
    render();
    document.querySelector<HTMLElement>('h1')?.focus();
  });
  window.addEventListener('online', updateNetworkBanner);
  window.addEventListener('offline', updateNetworkBanner);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        if (navigator.serviceWorker.controller) showToast('An update is ready. Reload to use it.');
      });
    }).catch(() => showToast('Offline setup failed. Reload while connected to try again.'));
  }
}

void start();
