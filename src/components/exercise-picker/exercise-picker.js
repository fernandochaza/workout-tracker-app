import './exercise-picker.css';
import {
  getAllExercises,
  searchExercises,
} from '../../js/modules/exerciseModule.js';
import { DetailsDialog } from '../details-dialog/details-dialog.js';
import { renderExerciseCard } from '../exercise-card/exercise-card.js';

let pickerDialog = null;
let onSelectedCallback = null;

export function openExercisePicker(onSelected) {
  if (!pickerDialog) pickerDialog = new DetailsDialog();
  onSelectedCallback = onSelected;
  pickerDialog.setTitle('Add Exercise');
  pickerDialog.setContent(`
    <div class="ep-body">
      <input id="ep-search" type="text" placeholder="Search your library…" autocomplete="off" />
      <div id="ep-results"></div>
      <a href="/src/pages/exercises/index.html" class="ep-browse-link">Browse Exercises to add more →</a>
    </div>
  `);

  const searchInput = pickerDialog.dialog.querySelector('#ep-search');
  searchInput.addEventListener('input', (e) =>
    renderResults(e.target.value.trim())
  );
  renderResults('');
  pickerDialog.open();
  searchInput.focus();
}

function renderResults(query) {
  const exercises = query ? searchExercises(query) : getAllExercises();
  const resultsEl = pickerDialog.dialog.querySelector('#ep-results');
  if (!resultsEl) return;

  resultsEl.innerHTML = exercises.length
    ? `<ul class="ep-list">
        ${exercises
          .map((ex) =>
            renderExerciseCard(
              ex,
              `<button class="outline btn-small ep-add-btn" data-id="${ex.id}" data-type="reps">+ Reps</button>
               <button class="outline btn-small ep-add-btn" data-id="${ex.id}" data-type="timed">+ Seconds</button>`,
              { compact: true }
            )
          )
          .join('')}
      </ul>`
    : `<p class="ep-empty">${query ? 'No matches in your library.' : 'Your library is empty.'}</p>`;

  resultsEl.querySelectorAll('.ep-add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ex = getAllExercises().find((e) => e.id === btn.dataset.id);
      if (!ex || !onSelectedCallback) return;
      const type = btn.dataset.type === 'timed' ? 'timed' : 'reps';
      onSelectedCallback({
        exerciseId: ex.id,
        exerciseSource: ex.source,
        name: ex.name,
        bodyPart: ex.bodyPart,
        target: ex.target,
        equipment: ex.equipment,
        type,
        plannedSets: 3,
        plannedReps: 10,
        plannedDurationSeconds: 60,
        notes: '',
      });
      pickerDialog.close();
    });
  });
}
