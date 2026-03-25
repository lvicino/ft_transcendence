// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint' 
import { defineConfig } from 'eslint/config'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    // Расширяем проверку на TS файлы
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended, // Правила для TypeScript
      // reactHooks.configs.flat.recommended, // Включишь, когда установишь плагин
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Наши кастомные строгие правила
      '@typescript-eslint/no-explicit-any': 'error', // Модуль: No Any [cite: 22]
      'no-unused-vars': 'off', // Отключаем базовый, используем TS версию
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)