import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rolldownOptions: {
			input: {
				home: 'index.html',
				'browse-exercises': 'src/pages/browse-exercises/index.html',
			},
		},
	},
});
