import { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	moduleNameMapper: {
		'^types$': '<rootDir>/src/types.ts',
		'^entities$': '<rootDir>/src/entities.ts',
		'^components$': '<rootDir>/src/components.ts',
		'^utils$': '<rootDir>/src/utils.ts',
		'^widgets$': '<rootDir>/src/widgets.ts',
		'^context$': '<rootDir>/src/context.ts',
		'^hook$': '<rootDir>/src/hook.ts',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;
