import './main.css';
import {
  getSessionsByDay,
  getSessionsByRoutineId,
} from '../../js/modules/sessionModule.js';
import { getAllRoutines } from '../../js/modules/routineModule.js';
import { getQuoteOfTheDay } from '../../js/api/QuotesAPI.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { DAY_NAMES } from '../../js/entities/session.js';

// This is because JavaScript's Date.getDay() returns 0=Sun, 1=Mon, …, 6=Sat
// And I've configured the app's DAY_OF_WEEK to use 0=Mon, 1=Tue, …, 6=Sun
function getTodayAppDay() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

document.addEventListener('DOMContentLoaded', () => {
  const today = getTodayAppDay();

  document.querySelector('#home-today-day').textContent = DAY_NAMES[today];

  renderTodaySessions(today);
  renderActiveRoutines();
  renderQuote();
});

function renderTodaySessions(appDay) {
  const listEl = document.querySelector('#home-today-list');
  const emptyEl = document.querySelector('#home-today-empty');

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
}

function renderTodaySessionCard(session, routine) {
  const exerciseCount = session.exercises.length;

  const exerciseItems = exerciseCount
    ? session.exercises
        .map(
          (ex) =>
            `<li class="home-session__exercise">
              <span class="home-session__exercise-name">${capitalizeWords(ex.name)}</span>
              <span class="home-session__exercise-detail">${ex.plannedSets} × ${ex.plannedReps}</span>
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
      <button class="home-btn-start" disabled title="Workout execution coming soon">
        Start Workout
      </button>
    </article>`;
}

function renderActiveRoutines() {
  const listEl = document.querySelector('#home-routines-list');
  const emptyEl = document.querySelector('#home-routines-empty');

  const active = getAllRoutines()
    .filter((r) => r.status === 'active')
    .slice(0, 3);

  if (!active.length) {
    emptyEl.style.display = 'block';
    return;
  }

  listEl.innerHTML = active.map(renderRoutineCard).join('');
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
    <article class="home-routine-card">
      <div class="home-routine-card__header">
        <h3>${capitalizeWords(routine.name)}</h3>
      </div>
      ${routine.description ? `<p class="home-routine-card__description">${routine.description}</p>` : ''}
      <p class="home-routine-card__summary">${summary}</p>
    </article>`;
}

async function renderQuote() {
  const sectionEl = document.querySelector('#home-quote-section');

  try {
    const quote = await getQuoteOfTheDay();
    if (!quote?.quote) return;

    document.querySelector('#home-quote-text').textContent = quote.quote;
    document.querySelector('#home-quote-author').textContent =
      `— ${quote.author}`;
    sectionEl.style.display = 'block';
  } catch {
    // Hide quote section on API failure
  }
}
