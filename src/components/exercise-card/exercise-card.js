import './exercise-card.css';
import { capitalizeWords } from '../../js/utils/string.js';

export function renderExerciseCard(
  exercise,
  actionsHtml,
  { saved = false, compact = false } = {}
) {
  const badge = exercise.source
    ? ` <span class="exercise-card__source-badge exercise-card__source-badge--${exercise.source}">${exercise.source}</span>`
    : '';
  const savedClass = saved ? ' exercise-card--saved' : '';

  if (compact) {
    const meta = [exercise.bodyPart, exercise.target]
      .filter(Boolean)
      .map(capitalizeWords)
      .join(' · ');
    return `
    <li class="exercise-card exercise-card--compact${savedClass}">
      <div class="exercise-card__content">
        <div class="exercise-card__info">
          <h3 class="exercise-card__title">${capitalizeWords(exercise.name)}${badge}</h3>
          ${meta ? `<p class="exercise-card__meta-inline">${meta}</p>` : ''}
        </div>
        <div class="exercise-card__actions">
          ${actionsHtml}
        </div>
      </div>
    </li>`;
  }

  return `
    <li class="exercise-card${savedClass}">
      ${renderExerciseThumbnail(exercise)}
      <div class="exercise-card__content">
        <div class="exercise-card__info">
          <h3 class="exercise-card__title">${capitalizeWords(exercise.name)}${badge}</h3>
          <div class="exercise-card__meta">
            <span><strong>Body Part:</strong> ${capitalizeWords(exercise.bodyPart || 'N/A')}</span>
            <span><strong>Target:</strong> ${capitalizeWords(exercise.target || 'N/A')}</span>
            <span><strong>Equipment:</strong> ${capitalizeWords(exercise.equipment || 'N/A')}</span>
          </div>
        </div>
        <div class="exercise-card__actions">
          ${actionsHtml}
        </div>
      </div>
    </li>`;
}

function renderExerciseThumbnail(exercise) {
  if (exercise.id) {
    return `<img
          class="exercise-card__image exercise-card__image--placeholder"
          data-exercise-id="${exercise.id}"
          alt="${exercise.name}"
          loading="lazy"
        />`;
  }

  return '<div class="exercise-card__image exercise-card__image--placeholder" aria-hidden="true"></div>';
}
