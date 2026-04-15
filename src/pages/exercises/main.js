import './main.css';
import { DetailsDialog } from '../../components/details-dialog/details-dialog.js';
import { renderExerciseCard } from '../../components/exercise-card/exercise-card.js';
import {
  getBodyParts,
  getEquipment,
  getTargets,
  initExerciseMeta,
} from '../../js/services/exerciseMetaService.js';
import {
  getAllExercises as apiGetAllExercises,
  getExerciseImage,
  getExercisesByBodyPart,
  getExercisesByEquipment,
  getExercisesByName,
  getExercisesByMuscle,
} from '../../js/api/ExerciseAPI.js';
import {
  getAllExercises as getLibraryExercises,
  saveFromApi,
  deleteExercise,
  exerciseExists,
  searchExercises as searchLibrary,
} from '../../js/modules/exerciseModule.js';
import { capitalizeWords } from '../../js/utils/string.js';

// --- DOM: Tabs ---
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

// --- DOM: My Library ---
const librarySearch = document.querySelector('#library-search');
const libraryList = document.querySelector('#library-list');
const libraryStatus = document.querySelector('#library-status');

// --- DOM: Discover ---
const searchForm = document.querySelector('#panel-discover form');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const bodyPartSelect = document.querySelector('#filter-body-part');
const targetMuscleSelect = document.querySelector('#filter-target-muscle');
const equipmentSelect = document.querySelector('#filter-equipment');
const resultsList = document.querySelector('#results-list');
const resultsStatus = document.querySelector('#results-status');

const PAGE_SIZE = 10;
const detailsDialog = new DetailsDialog();

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
    tab.setAttribute('aria-selected', 'true');

    panels.forEach((p) => (p.hidden = true));
    const target = document.querySelector(
      `#${tab.getAttribute('aria-controls')}`
    );
    if (target) target.hidden = false;

    if (tab.id === 'tab-library') renderLibrary();
  });
});

librarySearch?.addEventListener('input', () => renderLibrary());

function renderLibrary() {
  const query = librarySearch?.value.trim() || '';
  const exercises = query ? searchLibrary(query) : getLibraryExercises();

  if (!exercises.length) {
    libraryList.innerHTML = '';
    libraryStatus.textContent = query
      ? 'No exercises match your filter.'
      : 'Your library is empty. Discover exercises or create a custom one!';
    return;
  }

  libraryStatus.textContent = `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`;

  libraryList.innerHTML = exercises
    .map((exercise) => {
      const actions = `
        <button class="outline btn-small exercise-card__details-btn" data-exercise-id="${exercise.id}">Details</button>
        <button class="outline contrast btn-small library-delete-btn" data-exercise-id="${exercise.id}">Remove</button>`;
      return renderExerciseCard(exercise, actions);
    })
    .join('');

  attachLibraryDetailsButtons(exercises);
  attachLibraryDeleteButtons();
  loadExerciseImages(exercises);
}

function attachLibraryDetailsButtons(exercises) {
  libraryList.querySelectorAll('.exercise-card__details-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ex = exercises.find((e) => e.id === btn.dataset.exerciseId);
      if (ex) showExerciseDetails(ex);
    });
  });
}

function attachLibraryDeleteButtons() {
  libraryList.querySelectorAll('.library-delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      deleteExercise(btn.dataset.exerciseId);
      renderLibrary();
    });
  });
}

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  runSearch();
});

searchButton?.addEventListener('click', () => {
  runSearch();
});

[bodyPartSelect, targetMuscleSelect, equipmentSelect].forEach(
  (selectElement) => {
    selectElement?.addEventListener('change', handleFilterChange);
  }
);

initBrowseFilters();

async function initBrowseFilters() {
  await initExerciseMeta();

  populateSelect(bodyPartSelect, getBodyParts());
  populateSelect(targetMuscleSelect, getTargets());
  populateSelect(equipmentSelect, getEquipment());
}

async function runSearch() {
  setResultsStatus('Loading exercises...');

  try {
    const filters = getActiveFilters();
    let exercises = await fetchBaseResults(filters);
    exercises = applyClientFilters(exercises, filters);
    renderResults(exercises);
  } catch {
    resultsList.innerHTML = '';
    setResultsStatus('Could not load exercises right now.');
  }
}

function handleFilterChange() {
  const { query } = getActiveFilters();

  if (query) {
    setResultsStatus(
      'Filters updated. Press Search to apply them with your text query.'
    );
    return;
  }

  runSearch();
}

function getActiveFilters() {
  return {
    query: searchInput?.value.trim().toLowerCase() || '',
    bodyPart: bodyPartSelect?.value || '',
    target: targetMuscleSelect?.value || '',
    equipment: equipmentSelect?.value || '',
  };
}

async function fetchBaseResults(filters) {
  if (filters.query) {
    return getExercisesByName(filters.query, PAGE_SIZE, 0);
  }

  if (filters.bodyPart) {
    return getExercisesByBodyPart(filters.bodyPart, PAGE_SIZE, 0);
  }

  if (filters.target) {
    return getExercisesByMuscle(filters.target, PAGE_SIZE, 0);
  }

  if (filters.equipment) {
    return getExercisesByEquipment(filters.equipment, PAGE_SIZE, 0);
  }

  return apiGetAllExercises(PAGE_SIZE, 0);
}

function applyClientFilters(exercises, filters) {
  return exercises.filter((exercise) => {
    const bodyPartMatches =
      !filters.bodyPart || exercise.bodyPart === filters.bodyPart;
    const targetMatches = !filters.target || exercise.target === filters.target;
    const equipmentMatches =
      !filters.equipment || exercise.equipment === filters.equipment;
    const queryMatches =
      !filters.query || exercise.name.toLowerCase().includes(filters.query);

    return bodyPartMatches && targetMatches && equipmentMatches && queryMatches;
  });
}

function renderResults(exercises) {
  if (!resultsList || !resultsStatus) return;

  if (!exercises.length) {
    resultsList.innerHTML = '';
    setResultsStatus('No exercises found for those filters.');
    return;
  }

  resultsList.innerHTML = exercises
    .map((exercise) => {
      const isSaved = exerciseExists(exercise.id);
      const saveAction = isSaved
        ? '<span class="exercise-card__saved-badge">✓ In library</span>'
        : `<button class="exercise-card__save-btn" data-exercise-id="${exercise.id}">+ Save</button>`;
      const actions = `
        <button class="outline btn-small exercise-card__details-btn" data-exercise-id="${exercise.id}">Details</button>
        ${saveAction}`;
      return renderExerciseCard(exercise, actions, { saved: isSaved });
    })
    .join('');

  loadExerciseImages(exercises);
  attachDetailsButtons(exercises);
  attachSaveButtons(exercises);

  setResultsStatus(
    `${exercises.length} exercise${exercises.length === 1 ? '' : 's'} found.`
  );
}

function attachSaveButtons(exercises) {
  resultsList.querySelectorAll('.exercise-card__save-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const exercise = exercises.find((ex) => ex.id === btn.dataset.exerciseId);
      if (exercise) {
        saveFromApi(exercise);
        btn.closest('.exercise-card').classList.add('exercise-card--saved');
        btn.outerHTML =
          '<span class="exercise-card__saved-badge">✓ In library</span>';
        renderLibrary();
      }
    });
  });
}

function setResultsStatus(message) {
  if (!resultsStatus) return;
  resultsStatus.textContent = message;
}

function populateSelect(selectElement, values) {
  if (!selectElement) return;

  const options = values
    .toSorted((a, b) => a.localeCompare(b))
    .map(
      (value) => `<option value="${value}">${capitalizeWords(value)}</option>`
    )
    .join('');

  selectElement.innerHTML = `<option value="">All</option>${options}`;
}

async function loadExerciseImages(exercises) {
  const missingImages = exercises.filter((exercise) => exercise.id);

  for (const exercise of missingImages) {
    try {
      const imageBlob = await getExerciseImage(exercise.id);
      const imageUrl = URL.createObjectURL(imageBlob);

      const imageElement = document.querySelector(
        `img[data-exercise-id="${exercise.id}"]`
      );
      if (!imageElement) continue;

      imageElement.src = imageUrl;
      imageElement.classList.remove('exercise-card__image--placeholder');
    } catch {
      // Keep placeholder when image fetch fails.
    }
  }
}

function attachDetailsButtons(exercises) {
  const buttons = resultsList?.querySelectorAll('.exercise-card__details-btn');
  if (!buttons) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const exerciseId = btn.dataset.exerciseId;
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (exercise) {
        showExerciseDetails(exercise);
      }
    });
  });
}

// =====================
// Shared: Exercise Details Dialog
// =====================
function showExerciseDetails(exercise) {
  const secondaryMuscles = exercise.secondaryMuscles?.length
    ? exercise.secondaryMuscles.map((m) => capitalizeWords(m)).join(', ')
    : 'None';

  const instructions = exercise.instructions?.length
    ? exercise.instructions.map((inst) => `<li>${inst}</li>`).join('')
    : '<li>No instructions available</li>';

  const contentHtml = `
    <section class="details-section">
      <h3>Overview</h3>
      <dl>
        <dt>Body Part:</dt>
        <dd>${capitalizeWords(exercise.bodyPart)}</dd>
        <dt>Target Muscle:</dt>
        <dd>${capitalizeWords(exercise.target)}</dd>
        <dt>Secondary Muscles:</dt>
        <dd>${secondaryMuscles}</dd>
        <dt>Equipment:</dt>
        <dd>${capitalizeWords(exercise.equipment)}</dd>
        ${exercise.difficulty ? `<dt>Difficulty:</dt><dd>${capitalizeWords(exercise.difficulty)}</dd>` : ''}
        ${exercise.category ? `<dt>Category:</dt><dd>${capitalizeWords(exercise.category)}</dd>` : ''}
      </dl>
    </section>

    ${
      exercise.description
        ? `
      <section class="details-section">
        <h3>Description</h3>
        <p>${exercise.description}</p>
      </section>
    `
        : ''
    }

    <section class="details-section">
      <h3>Instructions</h3>
      <ol>
        ${instructions}
      </ol>
    </section>
  `;

  detailsDialog.setTitle(capitalizeWords(exercise.name));
  detailsDialog.setContent(contentHtml);
  detailsDialog.open();
}

// Init: render library on load
document.addEventListener('DOMContentLoaded', () => {
  renderLibrary();
});
