import './sidebar.css';
import logoUrl from '../../assets/images/logo.svg';
import { NAV_ITEMS } from '../../js/nav-items.js';
import { qs } from '../../js/utils/dom.js';

const STORAGE_KEY = 'sidebar-collapsed';

export function sidebarTemplate(activePage = 'home') {
  const items = NAV_ITEMS.filter((item) => !item.hidden)
    .map(({ label, href, icon }) => {
      const key = label.toLowerCase();
      const isActive = key === activePage;
      return `
      <a href="${href}" class="sidebar__item${isActive ? ' sidebar__item--active' : ''}">
        ${icon}
        <span class="sidebar__item-label">${label}</span>
      </a>`;
    })
    .join('');

  return `
    <nav class="sidebar">
      <div class="sidebar__header">
        <a href="/" class="sidebar__logo">
          <img src="${logoUrl}" alt="Workout Tracker" />
        </a>
        <button class="sidebar__icon" aria-label="Collapse sidebar">${collapseIcon}</button>
        <button class="sidebar__expand-btn" aria-label="Expand sidebar">${chevronRightIcon}</button>
      </div>
      <div class="sidebar__nav">
        ${items}
      </div>
    </nav>`;
}

export function initSidebar() {
  const sidebar = qs('.sidebar');
  if (!sidebar) return;

  const isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
  setCollapsed(sidebar, isCollapsed);

  sidebar.querySelector('.sidebar__icon').addEventListener('click', () => {
    setCollapsed(sidebar, true);
  });

  sidebar
    .querySelector('.sidebar__expand-btn')
    .addEventListener('click', () => {
      setCollapsed(sidebar, false);
    });
}

function setCollapsed(sidebar, collapsed) {
  sidebar.classList.toggle('sidebar--collapsed', collapsed);
  document.body.classList.toggle('sidebar--collapsed', collapsed);
  localStorage.setItem(STORAGE_KEY, String(collapsed));
}

const collapseIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" fill="#1e3a5f" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 64 64">
    <path d="M-1088 0H192v800h-1280z" style="fill:none"/>
    <path d="M49.984 56H13.995A5.997 5.997 0 0 1 8 50.005V13.994a6 6 0 0 1 5.995-5.995h35.989a6 6 0 0 1 5.995 5.995v36.011A5.997 5.997 0 0 1 49.984 56M24 51.999V12h-9.012a2.99 2.99 0 0 0-2.989 2.989V49.01a2.99 2.99 0 0 0 2.989 2.989zM48.991 12H28v39.999h20.991a2.99 2.99 0 0 0 2.989-2.989V14.989A2.99 2.99 0 0 0 48.991 12"/>
    <path d="m19.999 38.774-6.828-6.828 6.828-6.829 2.829 2.829-4 4 4 4z"/>
  </svg>
`;

const chevronRightIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
`;
