module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended'],
    rules: {
        "@typescript-eslint/indent": ["error", 'tab'],
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
    }
};