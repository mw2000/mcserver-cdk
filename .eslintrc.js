module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ['standard', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    semi: ['error', 'never'],
    quotes: [2, 'single', { avoidEscape: true }],
    'no-tabs': ['error', { allowIndentationTabs: false }],
    'indent': ['error', 2],
  },
}