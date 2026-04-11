import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        home: 'index.html',
        'exercises': 'src/pages/exercises/index.html',
        routines: 'src/pages/routines/index.html',
      },
    },
  },
});
