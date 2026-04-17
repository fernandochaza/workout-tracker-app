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
  saveExercise,
  deleteExercise,
  exerciseExists,
  searchExercises as searchLibrary,
} from '../../js/modules/exerciseModule.js';
import { capitalizeWords } from '../../js/utils/string.js';
import { qs } from '../../js/utils/dom.js';

// --- DOM: Tabs ---
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');

// --- DOM: My Library ---
const librarySearch = qs('#library-search');
const libraryList = qs('#library-list');
const libraryStatus = qs('#library-status');

// --- DOM: Discover ---
const searchForm = qs('#panel-discover form');
const searchInput = qs('#search-input');
const searchButton = qs('#search-button');
const bodyPartSelect = qs('#filter-body-part');
const targetMuscleSelect = qs('#filter-target-muscle');
const equipmentSelect = qs('#filter-equipment');
const resultsList = qs('#results-list');
const resultsStatus = qs('#results-status');

const PAGE_SIZE = 10;
const detailsDialog = new DetailsDialog();

// ARIA tabs pattern: only the active tab is in the tab order.
tabs.forEach((tab, index) => {
  tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;

  tab.addEventListener('click', () => {
    activateTab(tab);
  });

  tab.addEventListener('keydown', (event) => {
    let nextIndex = index;

    // Arrow keys move between sibling tabs; Home/End jump to first/last.
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft')
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== index) {
      event.preventDefault();
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    }
  });
});

function activateTab(activeTab) {
  tabs.forEach((tab) => {
    const isActive = tab === activeTab;
    // Keep aria-selected and tabindex in sync for screen readers + keyboard users.
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  // Show only the panel referenced by aria-controls on the active tab.
  panels.forEach((panel) => {
    panel.hidden = panel.id !== activeTab.getAttribute('aria-controls');
  });

  // Refresh library content when switching back to the library tab.
  if (activeTab.id === 'tab-my-library') {
    renderLibrary();
  }
}

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
  const apiExercises = exercises.filter(
    (ex) => ex.source !== 'custom' && ex.id
  );

  for (const exercise of apiExercises) {
    try {
      const imageBlob = await getExerciseImage(exercise.id);
      const imageUrl = URL.createObjectURL(imageBlob);

      const imageElement = qs(`img[data-exercise-id="${exercise.id}"]`);
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
  qs('#btn-add-custom')?.addEventListener('click', openAddCustomModal);
});

function openAddCustomModal() {
  const dialog = new DetailsDialog();
  dialog.setTitle('Add Custom Exercise');

  const template = qs('#custom-exercise-form-template');
  if (!template) return;
  dialog.setContent(template.innerHTML);

  qs('#custom-ex-cancel').addEventListener('click', () => dialog.close());

  qs('#custom-ex-confirm').addEventListener('click', () => {
    const name = qs('#custom-ex-name').value.trim();
    const errorEl = qs('#custom-ex-error');
    errorEl.style.display = 'none';

    if (!name) {
      errorEl.textContent = 'Please enter an exercise name.';
      errorEl.style.display = '';
      qs('#custom-ex-name').focus();
      return;
    }

    saveExercise({
      source: 'custom',
      name,
      bodyPart: qs('#custom-ex-body-part').value.trim(),
      target: qs('#custom-ex-target').value.trim(),
      equipment: qs('#custom-ex-equipment').value.trim(),
      notes: qs('#custom-ex-notes').value.trim(),
    });

    dialog.close();
    renderLibrary();
  });

  dialog.open();
}
