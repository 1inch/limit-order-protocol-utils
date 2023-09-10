/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

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
    projects: [
        {
            displayName: 'main',
            testMatch: ['<rootDir>/src/tests/**/*.test.ts'], // Укажите путь к вашим другим тестам
            globals: {
                'ts-jest': {
                    tsconfig: 'tsconfig.json'
                }
            }
        },
        {
            displayName: 'e2e',
            testMatch: ['<rootDir>/src/e2e-tests/**/*.test.ts'], // Укажите путь к тестам Hardhat
            globals: {
                'ts-jest': {
                    tsconfig: 'tsconfig.e2e.json'
                }
            }
        },
    ]
};
