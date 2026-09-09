// knip · ME CHEF · encuentra código y dependencias muertas.
//
// dependency-cruiser vigila la arquitectura; knip vigila lo que sobra. No se
// solapan a propósito.
//
// Regla para mantener este archivo: cada entrada de `ignoreDependencies` dice
// CUÁNDO deja de hacer falta. Si un ignore no tiene fecha o paso, se borra.

/** @type {import('knip').KnipConfig} */
module.exports = {
  entry: [
    // expo-router carga estos por convención de archivos, nadie los importa.
    'src/app/**/*.{ts,tsx}',

    // Fronteras públicas de cada capa. Lo de dentro sí lo audita knip: si una
    // función del motor deja de exportarse desde aquí y nadie la usa, aparece.
    'src/engine/index.ts',
    'src/db/schema.ts',
    'src/ai/client.ts',

    'scripts/*.js',
  ],

  project: ['src/**/*.{ts,tsx}', 'scripts/**/*.js'],

  ignoreDependencies: [
    // Genera las migraciones locales; se usa por línea de comandos, no se importa.
    'drizzle-kit',
    // Propiedades invariantes del motor. Entra en uso en D3.
    'fast-check',
    // Validación en la frontera. Entra en uso en D4 (respuestas del proxy) y D6 (env).
    'zod',
    // knip la infiere del preset de Expo aunque no esté instalada. Entra en D6.
    'expo-updates',
    // Vienen del scaffold y las usa el runtime de Expo, no un import nuestro.
    'expo-font',
    'expo-status-bar',
  ],
};
