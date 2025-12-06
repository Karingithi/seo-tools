import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

// Flat config compatible with ESLint 8.x (no eslint/config import)
export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      // Base from recommended sets
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // Prefer TypeScript's unused checks
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used', vars: 'all', ignoreRestSiblings: true }],
      '@typescript-eslint/no-unused-vars-experimental': 'off',
    },
  },
]
