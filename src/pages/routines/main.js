import './main.css';
import {
  getAllRoutines,
  getRoutineById,
  saveRoutine,
} from '../../js/modules/routineModule.js';
import {
  getSessionsByRoutineId,
  saveSession,
} from '../../js/modules/sessionModule.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { DAY_NAMES } from '../../js/entities/session.js';
import { DetailsDialog } from '../../components/details-dialog/details-dialog.js';

// DOM Elements
const listView = document.querySelector('#routines-list-view');
const detailView = document.querySelector('#routine-detail-view');
const activeRoutinesList = document.querySelector('#active-routines-list');
const inactiveRoutinesList = document.querySelector('#inactive-routines-list');
const activeSection = document.querySelector('#active-section');
const inactiveSection = document.querySelector('#inactive-section');
const emptyState = document.querySelector('#empty-state');
const btnNewRoutine = document.querySelector('#btn-new-routine');
let routineDialog = null;

let currentCreateState = {
  routineName: '',
  routineDescription: '',
  selectedDays: [],
  selectedTemplate: null,
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderRoutines();
  setupEventListeners();
});

function setupEventListeners() {
  btnNewRoutine.addEventListener('click', openCreateModal);
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
    .map((s) => DAY_NAMES[s.dayOfWeek].slice(0, 3)) // 3 letters from day
    .join(', ');

  const summary = count
    ? `${count} session${count !== 1 ? 's' : ''}${days ? ' · ' + days : ''}`
    : 'No sessions';

  card.innerHTML = `
    <div class="routine-card-header">
      <h3>${capitalizeWords(routine.name)}</h3>
      <span class="routine-status">${routine.status}</span>
    </div>
    <p class="routine-description">${routine.description || 'No description'}</p>
    <p class="routine-summary">${summary}</p>
  `;

  card.addEventListener('click', () => showRoutineDetail(routine.id));

  return card;
}

// --- Detail View ---

function showRoutineDetail(routineId) {
  const routine = getRoutineById(routineId);
  if (!routine) return;

  const sessions = getSessionsByRoutineId(routineId);

  const sessionsHTML = sessions.length
    ? sessions
        .map((session) => {
          const dayLabel =
            session.dayOfWeek !== null
              ? DAY_NAMES[session.dayOfWeek]
              : 'No day';
          const exerciseCount = session.exercises.length;
          const exerciseList = session.exercises.length
            ? session.exercises
                .map(
                  (ex) =>
                    `<li>
                      <span class="session-exercise__name">${capitalizeWords(ex.name)}</span>
                      <span class="session-exercise__detail">${ex.plannedSets} × ${ex.plannedReps}</span>
                    </li>`
                )
                .join('')
            : '<li class="session-exercise--empty">No exercises added yet</li>';

          return `
            <div class="session-card">
              <div class="session-card__header">
                <h3>${capitalizeWords(session.name)}</h3>
                <span class="session-card__day">${dayLabel}</span>
              </div>
              <p class="session-card__summary">${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}</p>
              <ul class="session-card__exercises">${exerciseList}</ul>
            </div>`;
        })
        .join('')
    : '<p class="empty-state">No sessions in this routine.</p>';

  detailView.innerHTML = `
    <button id="btn-back-to-list" class="btn-back">← Back to Routines</button>
    <div class="routine-detail__header">
      <div>
        <h2>${capitalizeWords(routine.name)}</h2>
        <p class="routine-detail__description">${routine.description || 'No description'}</p>
      </div>
      <span class="routine-status">${routine.status}</span>
    </div>
    <section class="routine-detail__sessions">
      <h3>Sessions</h3>
      <div class="sessions-grid">${sessionsHTML}</div>
    </section>
  `;

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

function renderScreen1HTML() {
  const dayCheckboxes = DAY_NAMES.map(
    (name, i) =>
      `<label class="checkbox-label">
        <input type="checkbox" name="day" value="${i}" ${currentCreateState.selectedDays.includes(i) ? 'checked' : ''} /> ${name}
      </label>`
  ).join('');

  return `
    <div class="form-group">
      <label for="routine-name">Routine Name</label>
      <input id="routine-name" type="text" placeholder="e.g., Push/Pull/Legs" value="${currentCreateState.routineName}" />
    </div>
    <div class="form-group">
      <label for="routine-description">Description (optional)</label>
      <textarea id="routine-description" placeholder="e.g., 6-day split focusing on compound movements">${currentCreateState.routineDescription}</textarea>
    </div>
    <div class="form-group">
      <label>Auto-create Sessions</label>
      <div class="day-selector">${dayCheckboxes}</div>
    </div>
    <div class="modal-actions">
      <button type="button" id="btn-cancel-1" class="secondary">Cancel</button>
      <button type="button" id="btn-next">Next</button>
    </div>
  `;
}

function renderScreen2HTML() {
  const templates = [
    {
      id: 'full-body-3',
      title: 'Full Body (3 Days)',
      desc: 'Balanced routine hitting all muscle groups each session',
    },
    {
      id: 'ppl',
      title: 'Push/Pull/Legs',
      desc: '6-day split optimized for upper/lower muscle separation',
    },
    {
      id: 'upper-lower',
      title: 'Upper/Lower',
      desc: '4-day split alternating between upper and lower body',
    },
    {
      id: 'none',
      title: 'Build From Scratch',
      desc: 'Start with empty sessions and add exercises manually',
    },
  ];

  const cards = templates
    .map(
      (t) =>
        `<div class="template-card${currentCreateState.selectedTemplate === t.id ? ' selected' : ''}" data-template="${t.id}">
      <h3>${t.title}</h3>
      <p>${t.desc}</p>
    </div>`
    )
    .join('');

  return `
    <p class="template-subtitle">Pick a template or build from scratch</p>
    <div class="template-grid">${cards}</div>
    <div class="modal-actions">
      <button type="button" id="btn-back" class="secondary">Back</button>
      <button type="button" id="btn-create">Create Routine</button>
    </div>
  `;
}

function bindScreen1Events(dialog) {
  document
    .querySelector('#btn-cancel-1')
    .addEventListener('click', () => dialog.close());
  document
    .querySelector('#btn-next')
    .addEventListener('click', () => goToScreen2(dialog));
}

function bindScreen2Events(dialog) {
  document.querySelectorAll('.template-card').forEach((card) => {
    card.addEventListener('click', () => selectTemplate(card.dataset.template));
  });
  document
    .querySelector('#btn-back')
    .addEventListener('click', () => goToScreen1(dialog));
  document
    .querySelector('#btn-create')
    .addEventListener('click', () => createRoutine(dialog));
}

function openCreateModal() {
  currentCreateState = {
    routineName: '',
    routineDescription: '',
    selectedDays: [0, 3, 5],
    selectedTemplate: null,
  };
  if (!routineDialog) {
    routineDialog = new DetailsDialog();
  }
  routineDialog.setTitle('Create New Routine');
  routineDialog.setContent(renderScreen1HTML());
  bindScreen1Events(routineDialog);
  routineDialog.open();
}

function goToScreen2(dialog) {
  const name = document.querySelector('#routine-name').value.trim();
  if (!name) {
    alert('Please enter a routine name');
    return;
  }

  currentCreateState.routineName = name;
  currentCreateState.routineDescription = document
    .querySelector('#routine-description')
    .value.trim();

  const dayCheckboxes = document.querySelectorAll('input[name="day"]:checked');
  currentCreateState.selectedDays = Array.from(dayCheckboxes).map((checkbox) =>
    parseInt(checkbox.value)
  );

  dialog.setTitle('Choose a Template (optional)');
  dialog.setContent(renderScreen2HTML());
  bindScreen2Events(dialog);
}

function goToScreen1(dialog) {
  dialog.setTitle('Create New Routine');
  dialog.setContent(renderScreen1HTML());
  bindScreen1Events(dialog);
}

function selectTemplate(templateId) {
  document
    .querySelectorAll('.template-card')
    .forEach((card) => card.classList.remove('selected'));
  if (templateId !== 'none') {
    document
      .querySelector(`[data-template="${templateId}"]`)
      .classList.add('selected');
  }
  currentCreateState.selectedTemplate =
    templateId === 'none' ? null : templateId;
}

function createRoutine(dialog) {
  const routine = saveRoutine({
    name: currentCreateState.routineName,
    description: currentCreateState.routineDescription,
    status: 'active',
  });

  currentCreateState.selectedDays.forEach((dayOfWeek, index) => {
    const sessionName = `${DAY_NAMES[dayOfWeek]} Workout`;
    saveSession({
      routineId: routine.id,
      name: sessionName,
      dayOfWeek,
      order: index,
      isAutoGenerated: true,
    });
  });

  dialog.close();
  renderRoutines();
}
