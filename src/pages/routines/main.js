import './main.css';
import { getAllRoutines } from '../../js/modules/routineModule.js';
import { getSessionsByRoutineId } from '../../js/modules/sessionModule.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { DAY_NAMES } from '../../js/entities/session.js';
import { openCreateModal } from '../../components/create-routine-modal/create-routine-modal.js';
import { qs } from '../../js/utils/dom.js';

const ROUTINE_DETAIL_URL = '../routine-detail/';

// DOM Elements
const activeRoutinesList = qs('#active-routines-list');
const inactiveRoutinesList = qs('#inactive-routines-list');
const activeSection = qs('#active-section');
const inactiveSection = qs('#inactive-section');
const emptyState = qs('#empty-state');
const btnNewRoutine = qs('#btn-new-routine');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderRoutines();
  setupEventListeners();
});

function setupEventListeners() {
  btnNewRoutine.addEventListener('click', () =>
    openCreateModal((routine) => {
      window.location.href = `${ROUTINE_DETAIL_URL}?routineId=${routine.id}`;
    })
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

  card.addEventListener('click', () => {
    window.location.href = `${ROUTINE_DETAIL_URL}?routineId=${routine.id}`;
  });

  return card;
}
