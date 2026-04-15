import './create-routine-modal.css';
import { saveRoutine } from '../../js/modules/routineModule.js';
import { saveSession } from '../../js/modules/sessionModule.js';
import { DAY_NAMES } from '../../js/entities/session.js';
import { DetailsDialog } from '../details-dialog/details-dialog.js';

let routineDialog = null;

let currentCreateState = {
  routineName: '',
  routineDescription: '',
  selectedDays: [],
  selectedTemplate: null,
};

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

let onCreatedCallback = null;

function createRoutine(dialog) {
  const routine = saveRoutine({
    name: currentCreateState.routineName,
    description: currentCreateState.routineDescription,
    status: 'active',
  });

  currentCreateState.selectedDays.forEach((dayOfWeek, index) => {
    const sessionName = `${DAY_NAMES[dayOfWeek]}`;
    saveSession({
      routineId: routine.id,
      name: sessionName,
      dayOfWeek,
      order: index,
      isAutoGenerated: true,
    });
  });

  dialog.close();
  if (onCreatedCallback) onCreatedCallback(routine);
}

export function openCreateModal(onCreated) {
  onCreatedCallback = onCreated;
  currentCreateState = {
    routineName: '',
    routineDescription: '',
    selectedDays: [0, 1, 2, 3, 4],
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
