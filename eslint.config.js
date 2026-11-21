import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // XSS guard: render HTML strings only through <SafeHtml> (DOMPurify).
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'Use <SafeHtml html={...} /> from @/components/SafeHtml so the HTML is sanitized with DOMPurify.',
        },
      ],
    },
  },
  {
    // SafeHtml sanitizes with DOMPurify. shadcn's chart.tsx writes a <style> tag of CSS colour variables
    // built from our own chart config (never user data), so it's safe too.
    files: ['src/components/SafeHtml.tsx', 'src/components/ui/chart.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // shadcn-generated components export variants (e.g. buttonVariants) alongside components.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
