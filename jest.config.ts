/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import {defaults} from 'jest-config';

export default {
    clearMocks: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', 'src/index.ts'],
    coverageProvider: 'v8',
    coverageReporters: [
        'json-summary',
        // "json",
        // "text",
        // "lcov",
        // "clover"
    ],
    testEnvironment: 'node',
    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[tj]s?(x)',
    ],
    testPathIgnorePatterns: [
        'src/e2e-tests/'
    ],
    moduleFileExtensions: [...defaults.moduleFileExtensions],
};
