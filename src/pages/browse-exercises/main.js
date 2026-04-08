import './main.css';
import { DetailsDialog } from '../../components/details-dialog/details-dialog.js';
import {
  getBodyParts,
  getEquipment,
  getTargets,
  initExerciseMeta,
} from '../../js/services/exerciseMetaService.js';
import {
  getAllExercises,
  getExerciseImage,
  getExercisesByBodyPart,
  getExercisesByEquipment,
  getExercisesByName,
  getExercisesByMuscle,
} from '../../js/api/ExerciseAPI.js';
import { capitalizeWords } from '../../js/utils/string.js';

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const bodyPartSelect = document.querySelector('#filter-body-part');
const targetMuscleSelect = document.querySelector('#filter-target-muscle');
const equipmentSelect = document.querySelector('#filter-equipment');
const resultsList = document.querySelector('#results-list');
const resultsStatus = document.querySelector('#results-status');

const PAGE_SIZE = 10;

// Initialize details dialog
const detailsDialog = new DetailsDialog();

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

  return getAllExercises(PAGE_SIZE, 0);
}

/** Utility function to filter out exercises that does not meet the filters + query criteria */
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
    .map(
      (exercise) => `
				<li class="results-list__item">
          ${renderExerciseThumbnail(exercise)}
					<div class="results-list__content">
            <div class="results-list__info">
              <h3 class="results-list__title">${capitalizeWords(exercise.name)}</h3>
              <div class="results-list__meta">
                <span><strong>Body Part:</strong> ${capitalizeWords(exercise.bodyPart)}</span>
                <span><strong>Target:</strong> ${capitalizeWords(exercise.target)}</span>
                <span><strong>Equipment:</strong> ${capitalizeWords(exercise.equipment)}</span>
              </div>
            </div>
            <button class="results-list__details-btn" data-exercise-id="${exercise.id}">View Details</button>
					</div>
				</li>`
    )
    .join('');

  loadResultImages(exercises);
  attachDetailsButtons(exercises);

  setResultsStatus(
    `${exercises.length} exercise${exercises.length === 1 ? '' : 's'} found.`
  );
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

function renderExerciseThumbnail(exercise) {
  if (exercise.id) {
    return `<img
					class="results-list__image results-list__image--placeholder"
					data-exercise-id="${exercise.id}"
					alt="${exercise.name}"
					loading="lazy"
				/>`;
  }

  return '<div class="results-list__image results-list__image--placeholder" aria-hidden="true"></div>';
}

async function loadResultImages(exercises) {
  const missingImages = exercises.filter((exercise) => exercise.id);

  for (const exercise of missingImages) {
    try {
      const imageBlob = await getExerciseImage(exercise.id);
      const imageUrl = URL.createObjectURL(imageBlob);
      if (!resultsList) return;

      const imageElement = resultsList.querySelector(
        `[data-exercise-id="${exercise.id}"]`
      );
      if (!imageElement) return;

      imageElement.src = imageUrl;
      imageElement.classList.remove('results-list__image--placeholder');
    } catch {
      // I keep placeholder when image fetch fails.
    }
  }
}

function attachDetailsButtons(exercises) {
  const buttons = resultsList?.querySelectorAll('.results-list__details-btn');
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

function showExerciseDetails(exercise) {
  const secondaryMuscles = exercise.secondaryMuscles?.length
    ? exercise.secondaryMuscles
        .map((m) => capitalizeWords(m))
        .join(', ')
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

    ${exercise.description ? `
      <section class="details-section">
        <h3>Description</h3>
        <p>${exercise.description}</p>
      </section>
    ` : ''}

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
