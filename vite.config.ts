import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
	plugins: [solid()],
	resolve: {
		alias: {
			types: path.resolve(__dirname, 'src/types.ts'),
			entities: path.resolve(__dirname, 'src/entities.ts'),
			components: path.resolve(__dirname, 'src/components.ts'),
			utils: path.resolve(__dirname, 'src/utils.ts'),
			widgets: path.resolve(__dirname, 'src/widgets.ts'),
			context: path.resolve(__dirname, 'src/context.ts'),
			hook: path.resolve(__dirname, 'src/hook.ts'),
			'@': path.resolve(__dirname, 'src'),
		},
	},
});
