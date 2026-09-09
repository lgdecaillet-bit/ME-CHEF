// ESLint · ME CHEF
//
// Este archivo convierte reglas de CLAUDE.md en errores que bloquean el commit.
// Si una regla de aquí discrepa de CLAUDE.md, gana CLAUDE.md y se corrige aquí.
//
// Las reglas de arquitectura viven en DOS sitios a propósito (decisión #31):
// aquí, para que el editor te avise mientras escribes, y en
// .dependency-cruiser.cjs, para que CI lo bloquee aunque el editor calle.
//
// CUIDADO al editar `no-restricted-imports`: ESLint **reemplaza** las opciones de
// una regla, no las fusiona. Un override que la redefina borra los patrones de
// arriba. Por eso los grupos viven en constantes y se repiten explícitamente en
// cada bloque. Hay un fixture que lo comprueba: src/engine/__fixtures__/.

const tsPlugin = require('@typescript-eslint/eslint-plugin');
const noOnlyTests = require('eslint-plugin-no-only-tests');
const prettier = require('eslint-config-prettier/flat');
const expoConfig = require('eslint-config-expo/flat');

// Prohibición dura de CLAUDE.md: ninguna API key de modelo vive en la app.
// Si un SDK de modelo entra en el bundle, la key entra detrás.
const SDK_DE_MODELOS = {
  group: [
    '@google/*',
    '@google-cloud/*',
    '@anthropic-ai/*',
    'openai',
    'openai/*',
    'cohere-ai',
    'replicate',
  ],
  message:
    'Ninguna API key de modelo vive en la app (CLAUDE.md). Todo pasa por supabase/functions/ai-proxy.',
};

// El motor determinista es puro: entra un objeto, sale un objeto.
const MOTOR_NO_IA = {
  group: ['**/ai/*', '**/ai', '@/ai', '@/ai/*', '../ai', '../ai/*', '../../ai/*'],
  message: 'src/engine/ no importa nada de src/ai/ (CLAUDE.md).',
};

const MOTOR_NO_ENTORNO = {
  group: [
    'react-native',
    'react-native/*',
    'react',
    'expo',
    'expo-*',
    '@expo/*',
    '@supabase/*',
    '@sentry/*',
    'posthog*',
    '@/db',
    '@/db/*',
    '../db',
    '../db/*',
    '../../db/*',
    '**/lib/supabase',
  ],
  message:
    'El motor es puro y testeable sin red ni dispositivo: entra un objeto, sale un objeto.',
};

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
      // Violan las reglas a proposito. scripts/probar-reglas.js los revisa con
      // --no-ignore y comprueba que las reglas SI disparan.
      'src/**/__fixtures__/**',
    ],
  },

  ...expoConfig,

  // ── Reglas generales ───────────────────────────────────────────────────────
  {
    // El plugin se registra aqui mismo: ESLint exige que la regla y su plugin
    // vivan en el mismo objeto de configuracion.
    plugins: { 'no-only-tests': noOnlyTests, '@typescript-eslint': tsPlugin },
    rules: {
      // Un console.log olvidado en producción filtra datos y ensucia el log real.
      // El único punto donde se permite es src/lib/log.ts (ver override abajo).
      'no-console': 'error',

      // Un .only hace que CI corra UN test y pase en verde con todo lo demás sin
      // ejecutar. Es la forma más silenciosa de romper el gate.
      'no-only-tests/no-only-tests': 'error',

      'no-restricted-imports': ['error', { patterns: [SDK_DE_MODELOS] }],

      // «TypeScript estricto. Nada de `any` sin comentario que lo justifique»
      // (CLAUDE.md). Con comentario se permite; a secas, no.
      '@typescript-eslint/no-explicit-any': [
        'error',
        { fixToUnknown: false, ignoreRestArgs: false },
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
  // OJO: este bloque redefine no-restricted-imports, así que repite
  // SDK_DE_MODELOS. Sin esa repetición, `import OpenAI from 'openai'` pasaría
  // dentro de src/engine/ (comprobado: pasaba).
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [SDK_DE_MODELOS, MOTOR_NO_IA, MOTOR_NO_ENTORNO] },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'El motor no hace red.' },
        { name: 'localStorage', message: 'El motor no guarda nada.' },
      ],
    },
  },

  // ── Scripts de línea de comandos ───────────────────────────────────────────
  // Su salida por consola ES su interfaz: la lee una persona o el log de CI.
  {
    files: ['scripts/**/*.js', '*.config.js', '.dependency-cruiser.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: { 'no-console': 'off' },
  },

  // ── Tests ──────────────────────────────────────────────────────────────────
  // Se relaja lo del motor (un test del engine sí puede importar helpers), pero
  // NO la prohibición de SDKs de modelos: una key en un test es una key filtrada.
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'no-restricted-imports': ['error', { patterns: [SDK_DE_MODELOS] }],
    },
  },

  // ── Prettier al final: apaga todo lo que sea formato ───────────────────────
  prettier,
];
