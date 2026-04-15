import './main.css';
import {
  getAllRoutines,
  getRoutineById,
} from '../../js/modules/routineModule.js';
import { getSessionsByRoutineId } from '../../js/modules/sessionModule.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { DAY_NAMES } from '../../js/entities/session.js';
import { openCreateModal } from '../../components/create-routine-modal/create-routine-modal.js';
import {
  renderSessionViewModeCard,
  bindSessionEditButtons,
} from '../../components/session-card/session-card.js';

// DOM Elements
const listView = document.querySelector('#routines-list-view');
const detailView = document.querySelector('#routine-detail-view');
const activeRoutinesList = document.querySelector('#active-routines-list');
const inactiveRoutinesList = document.querySelector('#inactive-routines-list');
const activeSection = document.querySelector('#active-section');
const inactiveSection = document.querySelector('#inactive-section');
const emptyState = document.querySelector('#empty-state');
const btnNewRoutine = document.querySelector('#btn-new-routine');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderRoutines();
  setupEventListeners();

  const params = new URLSearchParams(window.location.search);
  const routineId = params.get('routineId');
  if (routineId) showRoutineDetail(routineId);
});

function setupEventListeners() {
  btnNewRoutine.addEventListener('click', () =>
    openCreateModal((routine) => showRoutineDetail(routine.id))
  );
}

function renderRoutines() {
  const routines = getAllRoutines();
  const active = routines.filter((r) => r.status === 'active');
  const inactive = routines.filter((r) => r.status === 'inactive');

  activeRoutinesList.innerHTML = '';
  inactiveRoutinesList.innerHTML = '';

  // Show empty state if no routines exists
  if (!active.length && !inactive.length) {
    emptyState.style.display = 'block';
    activeSection.style.display = 'none';
    inactiveSection.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';

  if (active.length) {
    activeSection.style.display = 'block';
    active.forEach((routine) => {
      activeRoutinesList.appendChild(createRoutineCard(routine));
    });
  } else {
    activeSection.style.display = 'none';
  }

  if (inactive.length) {
    inactiveSection.style.display = 'block';
    inactive.forEach((routine) => {
      inactiveRoutinesList.appendChild(createRoutineCard(routine));
    });
  } else {
    inactiveSection.style.display = 'none';
  }
}

function createRoutineCard(routine) {
  const card = document.createElement('div');
  card.className = 'routine-card routine-card--clickable';

  const sessions = getSessionsByRoutineId(routine.id);
  const count = sessions.length;
  const days = sessions
    .filter((s) => s.dayOfWeek !== null)
    .map((s) => DAY_NAMES[s.dayOfWeek].slice(0, 3))
    .join(', ');

  const summary = count
    ? `${count} session${count !== 1 ? 's' : ''}${days ? ' · ' + days : ''}`
    : 'No sessions';

  card.innerHTML = `
    <div class="routine-card-header">
      <h3>${capitalizeWords(routine.name)}</h3>
    </div>
    <p class="routine-description">${routine.description || 'No description'}</p>
    <p class="routine-summary">${summary}</p>
  `;

  card.addEventListener('click', () => showRoutineDetail(routine.id));

  return card;
}

function showRoutineDetail(routineId) {
  const routine = getRoutineById(routineId);
  if (!routine) return;

  const sessions = getSessionsByRoutineId(routineId);

  const sessionsHTML = sessions.length
    ? sessions
        .map(
          (session) =>
            `<div class="session-card" data-session-id="${session.id}">${renderSessionViewModeCard(session)}</div>`
        )
        .join('')
    : '<p class="empty-state">No sessions in this routine.</p>';

  detailView.innerHTML = `
    <button id="btn-back-to-list" class="btn-back">← Back to Routines</button>
    <div class="routine-detail__header">
      <div>
        <h2>${capitalizeWords(routine.name)}</h2>
        <p class="routine-detail__description">${routine.description || 'No description'}</p>
      </div>
      <span class="routine-status routine-status--${routine.status}">${routine.status}</span>
    </div>
    <section class="routine-detail__sessions">
      <h3>Sessions</h3>
      <div class="sessions-grid">${sessionsHTML}</div>
    </section>
  `;

  bindSessionEditButtons(sessions);

  detailView
    .querySelector('#btn-back-to-list')
    .addEventListener('click', showListView);

  listView.style.display = 'none';
  detailView.style.display = 'block';
}

function showListView() {
  detailView.style.display = 'none';
  listView.style.display = 'block';
}
