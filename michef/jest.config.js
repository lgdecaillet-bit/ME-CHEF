// Jest · ME CHEF
//
// Un solo runner para todo (decisión #30): jest-expo trae los mocks de lo nativo,
// así que los tests de componentes y los del motor corren con la misma orden.

// ── Umbrales de cobertura ────────────────────────────────────────────────────
//
// El motor determinista es donde vive la corrección del producto: una lista de
// mercado mal sumada sigue mal sumada aunque la proponga un modelo. Por eso su
// objetivo es 100 % de líneas y 95 % de ramas, más alto que el del resto.
//
// HOY (D2) están en cero porque **todavía no hay tests**: D2 instala el gate, D3
// lo llena. Un umbral que no se puede cumplir no protege nada, solo obliga a
// saltárselo, y saltarse un gate una vez enseña a saltárselo siempre.
//
// D3 cambia OBJETIVO por ACTIVO en la línea de abajo. Es un cambio de una línea
// y está anotado en docs/estado.md. Bajar un umbral ya activo para que pase un
// PR está prohibido (CLAUDE.md): solo suben.

const OBJETIVO = {
  global: { lines: 60, branches: 40 },
  'src/engine/**/*.ts': { lines: 100, branches: 95 },
};

const D2_SIN_TESTS_TODAVIA = {
  global: { lines: 0, branches: 0 },
};

const ACTIVO = D2_SIN_TESTS_TODAVIA; // ← D3: cambiar a OBJETIVO
void OBJETIVO;

module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
  restoreMocks: true,

  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/dist/',
    '/supabase/',
    '__fixtures__',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__fixtures__/**',
    '!src/app/**', // pantallas: se cubren con tests de componente desde D6.5
  ],

  coverageThreshold: ACTIVO,

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
};
