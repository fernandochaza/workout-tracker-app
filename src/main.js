import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './style.css';

import { headerTemplate } from './components/header/header.js';
import { footerTemplate } from './components/footer/footer.js';
import { getAllExercises } from './js/api/ExerciseAPI.js';
import { getQuotesByCategory } from './js/api/QuotesAPI.js';

document.body.insertAdjacentHTML('afterbegin', headerTemplate());
document.body.insertAdjacentHTML('beforeend', footerTemplate());

// Sample API calls
getAllExercises(10).then((exercises) => console.log('Exercises:', exercises));
getQuotesByCategory('success').then((quote) => console.log('Quote:', quote));
