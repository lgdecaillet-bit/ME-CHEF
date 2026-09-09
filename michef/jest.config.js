// Jest · ME CHEF
//
// Un solo runner para todo (decisión #30): jest-expo trae los mocks de lo nativo,
// así que los tests de componentes y los del motor corren con la misma orden.

// ── Umbrales de cobertura ────────────────────────────────────────────────────
//
// El motor determinista es donde vive la corrección del producto: una lista de
// mercado mal sumada sigue mal sumada aunque la proponga un modelo. Por eso su
// umbral es más alto que el del resto: 100 % de líneas y 95 % de ramas.
//
// Estuvieron en cero durante D2, cuando el gate existía pero no había tests.
// **Activados en D3.** Hoy el motor está en 100/100, o sea con margen sobre su
// propio umbral.
//
// Cómo lee Jest esto, que no es obvio: un archivo que casa con una clave de ruta
// SALE del cómputo «global». Así que ahora mismo `global` mide `src/ai/` y
// `src/db/` (los dos al 100 %), y `src/app/` se le sumará cuando tenga tests de
// componente en D6.5. Si algún día todas las rutas tienen umbral propio, el
// bucket global se queda vacío y Jest reporta 0 %: no es un fallo real, es esto.
//
// Bajar un umbral para que pase un PR está prohibido (CLAUDE.md). Solo suben.

const OBJETIVO = {
  global: { lines: 60, branches: 40 },
  'src/engine/**/*.ts': { lines: 100, branches: 95 },
};

const ACTIVO = OBJETIVO;

module.exports = {
  preset: 'jest-expo',

  // Solo los *.test.ts son tests. Sin esto, Jest recoge cualquier archivo bajo
  // __tests__/ y falla con «tu suite debe contener al menos un test» sobre los
  // constructores de datos compartidos (ayudas.ts).
  testMatch: ['**/*.test.{ts,tsx}'],
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
    // `src/engine/index.ts` y `src/engine/types.ts` salen al 0 % en el informe
    // porque no tienen ni una sentencia ejecutable (uno son tipos, el otro es
    // `export *`). NO se excluyen: se comprobó que con cero sentencias el
    // umbral no los penaliza, así que excluirlos solo habría escondido dos
    // filas del informe. Y el día que el barril deje de ser `export *`, su
    // lógica queda dentro del umbral del 100 %, como debe ser.
    // El barril además se prueba por contrato en engine/__tests__/index.test.ts.
  ],

  coverageThreshold: ACTIVO,

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
};
