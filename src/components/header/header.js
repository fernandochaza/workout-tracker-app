import './header.css';

export function headerTemplate({
  variant = 'home',
  title = '',
  backHref = '/',
} = {}) {
  if (variant === 'home') {
    return `
      <header class="header header--page">
      </header>`;
  }

  if (variant === 'subpage') {
    return `
      <header class="header header--subpage">
        <a href="${backHref}" class="header__back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </a>
        <h1 class="header__title">${title}</h1>
      </header>`;
  }

  // variant: 'page'
  return `
    <header class="header header--page">
      <h1 class="header__title">${title}</h1>
    </header>`;
}
