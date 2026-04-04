import './bottom-nav.css';
import { NAV_ITEMS } from '../../js/nav-items.js';

export function bottomNavTemplate(activePage = 'home') {
  const items = NAV_ITEMS.map(({ label, href, icon }) => {
    const key = label.toLowerCase();
    const isActive = key === activePage;
    return `
      <a href="${href}" class="bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}">
        ${icon}
        <span>${label}</span>
      </a>`;
  }).join('');

  return `<nav class="bottom-nav">${items}</nav>`;
}
