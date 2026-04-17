import './main.css';
import {
  getSessionsByDay,
  getSessionsByRoutineId,
  getSessionById,
  updateSession,
} from '../../js/modules/sessionModule.js';
import { getAllRoutines } from '../../js/modules/routineModule.js';
import { getQuoteOfTheDay, getRandomQuote } from '../../js/api/QuotesAPI.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { DAY_NAMES } from '../../js/entities/session.js';
import { qs } from '../../js/utils/dom.js';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

// This is because JavaScript's Date.getDay() returns 0=Sun, 1=Mon, …, 6=Sat
// And I've configured the app's DAY_OF_WEEK to use 0=Mon, 1=Tue, …, 6=Sun
function getTodayAppDay() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

document.addEventListener('DOMContentLoaded', () => {
  const today = getTodayAppDay();
  const quoteRefreshBtn = qs('#home-quote-refresh');

  qs('#home-today-day').textContent = DAY_NAMES[today];

  renderTodaySessions(today);
  renderActiveRoutines();
  renderQuote();

  quoteRefreshBtn?.addEventListener('click', () => {
    renderQuote({ forceNew: true });
  });
});

function renderTodaySessions(appDay) {
  const listEl = qs('#home-today-list');
  const emptyEl = qs('#home-today-empty');

  const activeRoutines = getAllRoutines().filter((r) => r.status === 'active');
  const routineMap = new Map(activeRoutines.map((r) => [r.id, r]));

  const sessions = getSessionsByDay(appDay).filter((s) =>
    routineMap.has(s.routineId)
  );

  if (!sessions.length) {
    emptyEl.style.display = 'block';
    return;
  }

  listEl.innerHTML = sessions
    .map((s) => renderTodaySessionCard(s, routineMap.get(s.routineId)))
    .join('');

  listEl.querySelectorAll('.home-btn-start:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => {
      const session = getSessionById(btn.dataset.sessionId);
      if (!session) return;
      const alreadyDone = (session.completedDates || []).some((d) =>
        d.startsWith(todayISO())
      );
      if (alreadyDone) return;
      updateSession(btn.dataset.sessionId, {
        completedDates: [...(session.completedDates || []), nowISO()],
      });
      btn.textContent = 'Done ✓';
      btn.classList.add('home-btn-start--done');
      btn.disabled = true;
    });
  });
}

function renderTodaySessionCard(session, routine) {
  const exerciseCount = session.exercises.length;
  const doneToday = (session.completedDates || []).some((d) => d.startsWith(todayISO()));

  const exerciseItems = exerciseCount
    ? session.exercises
        .map(
          (ex) =>
            `<li class="home-session__exercise">
              <span class="home-session__exercise-name">${capitalizeWords(ex.name)}</span>
              <span class="home-session__exercise-detail">${
                ex.type === 'timed'
                  ? `${ex.plannedSets ?? 3} × ${ex.plannedDurationSeconds ?? 60}s`
                  : `${ex.plannedSets ?? 3} × ${ex.plannedReps ?? 10}`
              }</span>
            </li>`
        )
        .join('')
    : '<li class="home-session__exercise home-session__exercise--empty">No exercises added yet</li>';

  return `
    <article class="home-session-card">
      <div class="home-session-card__header">
        ${routine ? `<p class="home-session-card__routine">Routine: ${capitalizeWords(routine.name)}</p>` : ''}
        ${exerciseCount ? `<span class="home-session__count">${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}</span>` : ''}
      </div>
      <ul class="home-session__exercises">${exerciseItems}</ul>
      <button
        class="home-btn-start${doneToday ? ' home-btn-start--done' : ''}"
        data-session-id="${session.id}"
        ${doneToday ? 'disabled' : ''}
      >
        ${doneToday ? 'Done ✓' : 'Mark as Done'}
      </button>
    </article>`;
}

function renderActiveRoutines() {
  const listEl = qs('#home-routines-list');
  const emptyEl = qs('#home-routines-empty');

  const active = getAllRoutines()
    .filter((r) => r.status === 'active')
    .slice(0, 3);

  if (!active.length) {
    emptyEl.style.display = 'block';
    return;
  }

  listEl.innerHTML = active.map(renderRoutineCard).join('');

  listEl.querySelectorAll('.home-routine-card').forEach((card) => {
    card.addEventListener('click', () => {
      window.location.href = `/src/pages/routines/index.html?routineId=${card.dataset.routineId}`;
    });
  });
}

function renderRoutineCard(routine) {
  const sessions = getSessionsByRoutineId(routine.id);
  const count = sessions.length;
  const days = sessions
    .filter((s) => s.dayOfWeek !== null)
    .map((s) => DAY_NAMES[s.dayOfWeek].slice(0, 3))
    .join(', ');

  const summary = count
    ? `${count} session${count !== 1 ? 's' : ''}${days ? ' · ' + days : ''}`
    : 'No sessions';

  return `
    <article class="home-routine-card" data-routine-id="${routine.id}">
      <div class="home-routine-card__header">
        <h3>${capitalizeWords(routine.name)}</h3>
      </div>
      ${routine.description ? `<p class="home-routine-card__description">${routine.description}</p>` : ''}
      <p class="home-routine-card__summary">${summary}</p>
    </article>`;
}

async function renderQuote(options = {}) {
  const { forceNew = false } = options;
  const sectionEl = qs('#home-quote-section');
  const refreshBtn = qs('#home-quote-refresh');

  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.classList.add('is-loading');
  }

  try {
    const quote = forceNew
      ? await getRandomQuote(['inspirational', 'success', 'wisdom'])
      : await getQuoteOfTheDay();
    const safeQuote = quote ?? (forceNew ? await getQuoteOfTheDay() : null);
    if (!safeQuote?.quote) return;

    qs('#home-quote-text').textContent = safeQuote.quote;
    qs('#home-quote-author').textContent = `— ${safeQuote.author}`;
    sectionEl.style.display = 'block';
  } catch {
    // Hide quote section on API failure
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove('is-loading');
    }
  }
}
