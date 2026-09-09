// ESLint · ME CHEF
//
// Este archivo convierte reglas de CLAUDE.md en errores que bloquean el commit.
// Si una regla de aquí discrepa de CLAUDE.md, gana CLAUDE.md y se corrige aquí.
//
// Las reglas de arquitectura viven en DOS sitios a propósito (decisión #31):
// aquí, para que el editor te avise mientras escribes, y en
// .dependency-cruiser.cjs, para que CI lo bloquee aunque el editor calle.

const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');
const noOnlyTests = require('eslint-plugin-no-only-tests');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'coverage/**',
      'ios/**',
      'android/**',
      'supabase/functions/**', // Deno, no Node: tiene su propio linter
    ],
  },

  ...expoConfig,

  // ── Reglas generales ───────────────────────────────────────────────────────
  {
    plugins: { 'no-only-tests': noOnlyTests },
    rules: {
      // Un console.log olvidado en producción filtra datos y ensucia el log real.
      // El único punto donde se permite es src/lib/log.ts (ver override abajo).
      'no-console': 'error',

      // Un .only hace que CI corra UN test y pase en verde con todo lo demás sin
      // ejecutar. Es la forma más silenciosa de romper el gate.
      'no-only-tests/no-only-tests': 'error',

      // Prohibiciones duras de CLAUDE.md: las keys de modelos viven en el proxy.
      // Si un SDK de modelo entra en el bundle, la key va detrás.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@google/*', '@anthropic-ai/*', 'openai', 'openai/*'],
              message:
                'Ninguna API key de modelo vive en la app (CLAUDE.md). Todo pasa por supabase/functions/ai-proxy.',
            },
          ],
        },
      ],

      // 'always' salvo con null: `x != null` comprueba null e indefinido a la vez,
      // y es lo que usa el motor. Forzar !== ahí introduciría bugs, no los quitaría.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // ── El logger es el único que puede usar console ───────────────────────────
  {
    files: ['src/lib/log.ts'],
    rules: { 'no-console': 'off' },
  },

  // ── El motor determinista es puro ──────────────────────────────────────────
  // src/engine/ no importa IA, ni nada nativo, ni red. Si una función del motor
  // parece necesitar un modelo, el diseño está mal (CLAUDE.md).
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/ai/*', '**/ai', '@/ai', '@/ai/*'],
              message: 'src/engine/ no importa nada de src/ai/ (CLAUDE.md).',
            },
            {
              group: [
                'react-native',
                'react-native/*',
                'react',
                'expo',
                'expo-*',
                '@expo/*',
                '@supabase/*',
                '@/db',
                '@/db/*',
              ],
              message:
                'El motor es puro y testeable sin red ni dispositivo: entra un objeto, sale un objeto.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'El motor no hace red.' },
      ],
    },
  },

  // ── Scripts de línea de comandos ───────────────────────────────────────────
  // Su salida por consola ES su interfaz: la lee una persona o el log de CI.
  {
    files: ['scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },

  // ── Tests ──────────────────────────────────────────────────────────────────
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-restricted-imports': 'off',
    },
  },

  // ── Prettier al final: apaga todo lo que sea formato ───────────────────────
  prettier,
];
