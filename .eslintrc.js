module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unused-imports', 'import'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/member-ordering': 'error',
        'lines-between-class-members': 'error',
        'padding-line-between-statements': 'error',
        'no-unused-vars': 'off',
        'max-len': ['error', {code: 100}],
        'max-depth': ['error', 3],
        'max-lines-per-function': ['error', 50],
        'max-params': ['error', 5],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': 0,
        'import/no-cycle': 'error'
    },
    overrides: [
        {
            files: ['src/**/*.test.ts'],
            rules: {
                'max-lines-per-function': ['error', 400],
                'max-len': ['error', {code: 130}],
            },
        },
        {
            files: ['src/e2e-tests/**/*.test.ts'],
            rules: {
                'max-lines-per-function': ['error', 2000],
                'max-len': ['error', {code: 130}],
                '@typescript-eslint/no-explicit-any': 'warn',
            },
        },
    ],
};
