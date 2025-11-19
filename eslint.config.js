import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

// ESLint config: enable TypeScript unused checks via @typescript-eslint
export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parser: '@typescript-eslint/parser',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    extends: [
      js.configs.recommended,
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
    ],
    rules: {
      // Prefer TypeScript's unused checks
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 'args': 'after-used', 'vars': 'all', 'ignoreRestSiblings': true }],
      '@typescript-eslint/no-unused-vars-experimental': 'off',
    },
  },
])
