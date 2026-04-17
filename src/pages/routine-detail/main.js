import './main.css';
import {
  getRoutineById,
  updateRoutine,
  deleteRoutine,
} from '../../js/modules/routineModule.js';
import {
  getSessionsByRoutineId,
  saveSession,
  deleteSession,
} from '../../js/modules/sessionModule.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { qs } from '../../js/utils/dom.js';
import { DAY_NAMES } from '../../js/entities/session.js';
import {
  renderSessionViewModeCard,
  bindSessionEditButtons,
} from '../../components/session-card/session-card.js';
import { DetailsDialog } from '../../components/details-dialog/details-dialog.js';

const ROUTINES_URL = '../routines/';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const routineId = params.get('routineId');
  // Redirect if no routineId in URL or the routine no longer exists
  if (!routineId || !getRoutineById(routineId)) {
    window.location.replace(ROUTINES_URL);
    return;
  }

  populateDetail(routineId);
  bindDetailEvents(routineId); // Events are bound once; populateDetail handles re-renders
});

function populateDetail(routineId) {
  const routine = getRoutineById(routineId);
  const sessions = getSessionsByRoutineId(routineId).sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek
  );

  qs('#routine-name').textContent = capitalizeWords(routine.name);

  const statusEl = qs('#routine-status');
  statusEl.textContent = routine.status;
  statusEl.className = `routine-status routine-status--${routine.status}`;

  qs('#routine-description').textContent =
    routine.description || 'No description';

  qs('#btn-toggle-status').textContent =
    routine.status === 'active' ? 'Deactivate' : 'Activate';

  qs('#edit-name').value = routine.name;
  qs('#edit-description').value = routine.description || '';

  const takenDays = sessions
    .filter((s) => s.dayOfWeek !== null)
    .map((s) => s.dayOfWeek);
  const allDaysTaken = takenDays.length >= 7;
  const addBtnWrapper = qs('#add-session-btn-wrapper');
  const addBtn = qs('#btn-add-session');

  // Disabled buttons don't receive pointer events, so the tooltip is placed
  // on the wrapper span instead, which still receives hover events
  if (allDaysTaken) {
    addBtnWrapper.setAttribute(
      'data-tooltip',
      'All days already have a session'
    );
    addBtnWrapper.style.cursor = 'not-allowed';
    addBtn.disabled = true;
    addBtn.style.pointerEvents = 'none';
  } else {
    addBtnWrapper.removeAttribute('data-tooltip');
    addBtnWrapper.style.cursor = '';
    addBtn.disabled = false;
    addBtn.style.pointerEvents = '';
  }

  const sessionsGrid = qs('#sessions-grid');
  sessionsGrid.innerHTML = sessions.length
    ? sessions
        .map(
          (session) =>
            `<div class="session-card" data-session-id="${session.id}">${renderSessionViewModeCard(session)}</div>`
        )
        .join('')
    : '<p class="empty-state">No sessions yet. Add one below.</p>';

  bindSessionEditButtons(sessions);
}

function bindDetailEvents(routineId) {
  qs('#btn-back-to-list').addEventListener('click', () => {
    window.location.href = ROUTINES_URL;
  });

  qs('#btn-toggle-status').addEventListener('click', () => {
    const routine = getRoutineById(routineId);
    updateRoutine(routineId, {
      status: routine.status === 'active' ? 'inactive' : 'active',
    });
    populateDetail(routineId);
  });

  const editForm = qs('#routine-edit-form');
  const headerEl = qs('.routine-detail__header');
  const actionsEl = qs('.routine-detail__actions');

  qs('#btn-edit-info').addEventListener('click', () =>
    openEditForm(editForm, headerEl, actionsEl)
  );
  qs('#btn-cancel-edit').addEventListener('click', () =>
    closeEditForm(editForm, headerEl, actionsEl)
  );
  qs('#btn-save-edit').addEventListener('click', () =>
    saveEdit(routineId, editForm, headerEl, actionsEl)
  );
  qs('#btn-delete-routine').addEventListener('click', () =>
    confirmDeleteRoutine(routineId)
  );
  qs('#btn-add-session').addEventListener('click', () =>
    handleAddSession(routineId)
  );

  // Handles delete clicks on cards that may be re-rendered
  qs('#sessions-grid').addEventListener('click', (e) =>
    handleSessionDelete(e, routineId)
  );
}

function openEditForm(editForm, headerEl, actionsEl) {
  headerEl.style.display = 'none';
  actionsEl.style.display = 'none';
  editForm.style.display = 'block';
  qs('#edit-name').focus();
}

function closeEditForm(editForm, headerEl, actionsEl) {
  editForm.style.display = 'none';
  headerEl.style.display = '';
  actionsEl.style.display = '';
}

function saveEdit(routineId, editForm, headerEl, actionsEl) {
  const name = qs('#edit-name').value.trim();
  const description = qs('#edit-description').value.trim();
  if (!name) {
    qs('#edit-name').focus();
    return;
  }
  updateRoutine(routineId, { name, description });
  closeEditForm(editForm, headerEl, actionsEl);
  populateDetail(routineId);
}

function confirmDeleteRoutine(routineId) {
  const routine = getRoutineById(routineId);
  if (
    !confirm(
      `Delete "${routine.name}"?\nThis will remove all its sessions and cannot be undone.`
    )
  )
    return;
  deleteRoutine(routineId);
  window.location.href = ROUTINES_URL;
}

function handleAddSession(routineId) {
  const routine = getRoutineById(routineId);
  const takenDays = getSessionsByRoutineId(routineId).map((s) => s.dayOfWeek);
  openAddSessionModal(routine, takenDays, () => populateDetail(routineId));
}

function handleSessionDelete(e, routineId) {
  const deleteBtn = e.target.closest('.session-card__delete-btn');
  if (!deleteBtn) return;
  const sessionId = deleteBtn.dataset.sessionId;
  if (!confirm('Remove this session from the routine?')) return;
  deleteSession(sessionId);
  const freshRoutine = getRoutineById(routineId);
  updateRoutine(routineId, {
    sessionIds: (freshRoutine.sessionIds || []).filter(
      (id) => id !== sessionId
    ),
  });
  populateDetail(routineId);
}

function openAddSessionModal(routine, takenDays, onSuccess) {
  const dialog = new DetailsDialog();
  dialog.setTitle('Add Session');

  const availableOptions = DAY_NAMES.map((name, i) =>
    takenDays.includes(i) ? '' : `<option value="${i}">${name}</option>`
  ).join('');

  dialog.setContent(`
    <div class="form-group">
      <label for="modal-session-day">Day</label>
      <select id="modal-session-day">
        <option value="">-- Select a day --</option>
        ${availableOptions}
      </select>
    </div>
    <div class="form-group">
      <label for="modal-session-name">Session Name</label>
      <input id="modal-session-name" type="text" placeholder="e.g., Push Day" />
    </div>
    <p id="modal-session-error" class="add-session-modal__error" style="display:none"></p>
    <div class="add-session-modal__footer">
      <button id="modal-session-cancel" class="secondary btn-small">Cancel</button>
      <button id="modal-session-confirm" class="btn-small">Add Session</button>
    </div>
  `);

  const daySelect = qs('#modal-session-day');
  const nameInput = qs('#modal-session-name');
  const errorEl = qs('#modal-session-error');

  daySelect.addEventListener('change', () => {
    const dayName =
      daySelect.value !== '' ? DAY_NAMES[parseInt(daySelect.value)] : '';
    const current = nameInput.value.trim();
    // Auto-fill name only if it's empty or still matches a day name (not custom)
    if (!current || DAY_NAMES.includes(capitalizeWords(current))) {
      nameInput.value = dayName;
    }
  });

  document
    .querySelector('#modal-session-cancel')
    .addEventListener('click', () => dialog.close());

  document
    .querySelector('#modal-session-confirm')
    .addEventListener('click', () => {
      const name = nameInput.value.trim();
      errorEl.style.display = 'none';
      if (!daySelect.value) {
        errorEl.textContent = 'Please select a day.';
        errorEl.style.display = '';
        daySelect.focus();
        return;
      }
      if (!name) {
        errorEl.textContent = 'Please enter a session name.';
        errorEl.style.display = '';
        nameInput.focus();
        return;
      }
      const dayOfWeek = parseInt(daySelect.value);
      const newSession = saveSession({
        routineId: routine.id,
        name,
        dayOfWeek,
        exercises: [],
      });
      const freshRoutine = getRoutineById(routine.id);
      updateRoutine(routine.id, {
        sessionIds: [...(freshRoutine.sessionIds || []), newSession.id],
      });
      dialog.close();
      onSuccess();
    });

  dialog.open();
}
