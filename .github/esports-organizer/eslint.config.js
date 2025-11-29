import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore build output and example snippets
  globalIgnores(['dist', 'src/database/core/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Node/CommonJS overrides for Cloud Functions code
  {
    files: ['src/functions/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        exports: 'writable',
        module: 'writable',
        require: 'writable',
        process: 'writable',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        // CommonJS files (require/exports/module)
        sourceType: 'script',
      },
    },
    rules: {
      // Allow console logs in server-side code
      'no-console': 'off',
    },
  },
  // Node ESM overrides for local scripts (use import + process)
  {
    files: ['src/scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Node override for emulator-health utility
  {
    files: ['src/database/emulator-health.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Node override for emailnotifs
  {
    files: ['src/emailnotifs/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
])
