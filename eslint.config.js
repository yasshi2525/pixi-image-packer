import neostandard from 'neostandard'
import globals from 'globals'
/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ['spec/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  },
  ...neostandard({
    ignores: ['dist'],
    ts: true
  })
]
