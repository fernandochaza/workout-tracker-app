import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './style.css';

import { headerTemplate } from './components/header/header.js';
import { bottomNavTemplate } from './components/bottom-nav/bottom-nav.js';
import { sidebarTemplate, initSidebar } from './components/sidebar/sidebar.js';
import { initExerciseMeta } from './js/services/exerciseMetaService.js';

const EXERCISES_PAGE = 'exercises';
const ROUTINES_PAGE = 'routines';

document.documentElement.setAttribute('data-theme', 'light');

const { activePage, headerOptions } = getPageState(window.location.pathname);

document.body.insertAdjacentHTML('afterbegin', headerTemplate(headerOptions));
document.body.insertAdjacentHTML('beforeend', bottomNavTemplate(activePage));
document.body.insertAdjacentHTML('beforeend', sidebarTemplate(activePage));

initSidebar();
initExerciseMeta();

function getPageState(pathname) {
  if (pathname.includes(EXERCISES_PAGE)) {
    return {
      activePage: 'exercises',
      headerOptions: {
        variant: 'page',
        title: 'Browse Exercises',
      },
    };
  }

  if (pathname.includes(ROUTINES_PAGE)) {
    return {
      activePage: 'routines',
      headerOptions: {
        variant: 'page',
        title: 'Routines',
      },
    };
  }

  return {
    activePage: 'home',
    headerOptions: { variant: 'home' },
  };
}
