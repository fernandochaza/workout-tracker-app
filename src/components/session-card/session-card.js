import './session-card.css';
import { updateSession } from '../../js/modules/sessionModule.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { DAY_NAMES } from '../../js/entities/session.js';
import { openExercisePicker } from '../exercise-picker/exercise-picker.js';
import { qs } from '../../js/utils/dom.js';

function formatExerciseDetail(exercise) {
  const sets = exercise.plannedSets ?? 3;
  if (exercise.type === 'timed') {
    const duration = exercise.plannedDurationSeconds ?? 60;
    return `${sets} × ${duration}s`;
  }
  const reps = exercise.plannedReps ?? 10;
  return `${sets} × ${reps}`;
}

export function renderSessionViewModeCard(session) {
  const dayLabel =
    session.dayOfWeek !== null ? DAY_NAMES[session.dayOfWeek] : 'No day';
  const exerciseCount = session.exercises.length;

  const exerciseList = exerciseCount
    ? session.exercises
        .map(
          (ex) =>
            `<li>
              <span class="session-exercise__name">${capitalizeWords(ex.name)}</span>
              <span class="session-exercise__detail">${formatExerciseDetail(ex)}</span>
            </li>`
        )
        .join('')
    : '<li class="session-exercise--empty">No exercises added yet</li>';

  return `
    <div class="session-card__header">
      <h3>${capitalizeWords(session.name)}</h3>
      <span class="session-card__day">${dayLabel}</span>
    </div>
    ${exerciseCount ? `<p class="session-card__summary">${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}</p>` : ''}
    <ul class="session-card__exercises">${exerciseList}</ul>
    <div class="session-card__footer">
      <button class="outline btn-small session-card__delete-btn" data-session-id="${session.id}">Delete</button>
      <button class="outline btn-small session-card__edit-btn" data-session-id="${session.id}">Edit</button>
    </div>`;
}

export function bindSessionEditButtons(sessions) {
  document.querySelectorAll('.session-card__edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const session = sessions.find((s) => s.id === btn.dataset.sessionId);
      if (session) enterEditMode(session, sessions);
    });
  });
}

function renderSessionEditModeCard(session, editExercises) {
  const dayLabel =
    session.dayOfWeek !== null ? DAY_NAMES[session.dayOfWeek] : 'No day';

  const exerciseRows = editExercises.length
    ? editExercises
        .map(
          (ex, i) =>
            `<li class="session-edit__exercise-row" data-index="${i}">
              <span class="session-edit__exercise-name">${capitalizeWords(ex.name)}</span>
              <div class="session-edit__inputs">
                <select class="session-edit__type" data-index="${i}">
                  <option value="reps" ${ex.type === 'reps' ? 'selected' : ''}>Reps</option>
                  <option value="timed" ${ex.type === 'timed' ? 'selected' : ''}>Seconds</option>
                </select>
                <input type="number" class="session-edit__sets" value="${ex.plannedSets}" min="1" max="99" data-index="${i}" />
                <span>×</span>
                ${
                  ex.type === 'timed'
                    ? `<input type="number" class="session-edit__duration" value="${ex.plannedDurationSeconds}" min="5" max="3600" step="5" data-index="${i}" /><span>s</span>`
                    : `<input type="number" class="session-edit__reps" value="${ex.plannedReps}" min="1" max="999" data-index="${i}" />`
                }
              </div>
              <div class="session-edit__actions">
                <button class="session-edit__move-up" data-index="${i}" ${i === 0 ? 'disabled' : ''}>▲</button>
                <button class="session-edit__move-down" data-index="${i}" ${i === editExercises.length - 1 ? 'disabled' : ''}>▼</button>
                <button class="session-edit__remove" data-index="${i}">✕</button>
              </div>
            </li>`
        )
        .join('')
    : '<li class="session-exercise--empty">No exercises added yet</li>';

  return `
    <div class="session-card__header">
      <input
        class="session-edit__name-input"
        type="text"
        value="${capitalizeWords(session.name)}"
        placeholder="Session name"
        aria-label="Session name"
      />
      <span class="session-card__day">${dayLabel}</span>
    </div>
    <ul class="session-edit__exercise-list">${exerciseRows}</ul>
    <button class="outline btn-small session-edit__add-btn">+ Add Exercise</button>
    <div class="session-edit__footer">
      <button class="secondary btn-small session-edit__cancel-btn">Cancel</button>
      <button class="btn-small session-edit__save-btn">Save</button>
    </div>`;
}

function bindEditModeEvents(card, session, editExercises, sessions) {
  card.querySelectorAll('.session-edit__type').forEach((select) => {
    select.addEventListener('change', () => {
      const idx = parseInt(select.dataset.index);
      editExercises[idx].type =
        select.value === 'timed' ? 'timed' : 'reps';
      card.innerHTML = renderSessionEditModeCard(session, editExercises);
      bindEditModeEvents(card, session, editExercises, sessions);
    });
  });

  card.querySelectorAll('.session-edit__sets').forEach((input) => {
    input.addEventListener('change', () => {
      const idx = parseInt(input.dataset.index);
      editExercises[idx].plannedSets = parseInt(input.value) || 1;
    });
  });

  card.querySelectorAll('.session-edit__reps').forEach((input) => {
    input.addEventListener('change', () => {
      const idx = parseInt(input.dataset.index);
      editExercises[idx].plannedReps = parseInt(input.value) || 1;
    });
  });

  card.querySelectorAll('.session-edit__duration').forEach((input) => {
    input.addEventListener('change', () => {
      const idx = parseInt(input.dataset.index);
      editExercises[idx].plannedDurationSeconds = parseInt(input.value) || 60;
    });
  });

  card.querySelectorAll('.session-edit__move-up').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (idx > 0) {
        [editExercises[idx - 1], editExercises[idx]] = [
          editExercises[idx],
          editExercises[idx - 1],
        ];
        card.innerHTML = renderSessionEditModeCard(session, editExercises);
        bindEditModeEvents(card, session, editExercises, sessions);
      }
    });
  });

  card.querySelectorAll('.session-edit__move-down').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      if (idx < editExercises.length - 1) {
        [editExercises[idx], editExercises[idx + 1]] = [
          editExercises[idx + 1],
          editExercises[idx],
        ];
        card.innerHTML = renderSessionEditModeCard(session, editExercises);
        bindEditModeEvents(card, session, editExercises, sessions);
      }
    });
  });

  card.querySelectorAll('.session-edit__remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      editExercises.splice(idx, 1);
      card.innerHTML = renderSessionEditModeCard(session, editExercises);
      bindEditModeEvents(card, session, editExercises, sessions);
    });
  });

  card.querySelector('.session-edit__add-btn').addEventListener('click', () => {
    openExercisePicker((exercise) => {
      editExercises.push(exercise);
      card.innerHTML = renderSessionEditModeCard(session, editExercises);
      bindEditModeEvents(card, session, editExercises, sessions);
    });
  });

  card
    .querySelector('.session-edit__cancel-btn')
    .addEventListener('click', () => {
      card.classList.remove('session-card--editing');
      card.innerHTML = renderSessionViewModeCard(session);
      bindSessionEditButtons(sessions);
    });

  card
    .querySelector('.session-edit__save-btn')
    .addEventListener('click', () => {
      const nameInput = card.querySelector('.session-edit__name-input');
      const name = nameInput?.value.trim() || session.name;
      const updated = updateSession(session.id, {
        name,
        exercises: editExercises,
      });
      if (updated) {
        Object.assign(session, updated);
      }
      card.classList.remove('session-card--editing');
      card.innerHTML = renderSessionViewModeCard(session);
      bindSessionEditButtons(sessions);
    });
}

export function enterEditMode(session, sessions) {
  const card = qs(`.session-card[data-session-id="${session.id}"]`);
  if (!card) return;

  const editExercises = session.exercises.map((ex) => ({
    ...ex,
    type: ex.type === 'timed' ? 'timed' : 'reps',
    plannedSets: ex.plannedSets ?? 3,
    plannedReps: ex.plannedReps ?? 10,
    plannedDurationSeconds: ex.plannedDurationSeconds ?? 60,
  }));

  card.classList.add('session-card--editing');
  card.innerHTML = renderSessionEditModeCard(session, editExercises);
  bindEditModeEvents(card, session, editExercises, sessions);
}
