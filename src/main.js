import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './style.css';

import { headerTemplate } from './components/header/header.js';
import { bottomNavTemplate } from './components/bottom-nav/bottom-nav.js';
import { initExerciseMeta } from './js/services/exerciseMetaService.js';

document.body.insertAdjacentHTML('afterbegin', headerTemplate({ variant: 'home' }));
document.body.insertAdjacentHTML('beforeend', bottomNavTemplate('home'));

initExerciseMeta();
