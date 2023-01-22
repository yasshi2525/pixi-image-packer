module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true
  },
  extends: ['standard'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'es2015'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {}
}
