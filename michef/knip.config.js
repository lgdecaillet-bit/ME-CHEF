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

    // Fronteras públicas de cada capa.
    //
    // OJO, esto tiene un límite real: `engine/index.ts` es un barril de
    // `export *`, así que declararlo como entrada hace que TODO el motor quede
    // alcanzable y knip deje de mirar dentro. Comprobado: sin esta línea marca
    // 4 archivos y `escalarReceta` y `redondear` como no usados. Se acepta a
    // sabiendas mientras el motor no tenga consumidores; quien vigila el código
    // muerto del motor a partir de D3 es la cobertura (100 % de líneas).
    'src/engine/index.ts',
    'src/db/schema.ts',
    'src/ai/client.ts',

    'scripts/*.js',
  ],

  project: ['src/**/*.{ts,tsx}', 'scripts/**/*.js'],

  ignore: [
    // Violan las reglas a proposito para que scripts/probar-reglas.js compruebe
    // que disparan. Nadie los importa, y eso es justo lo que deben ser.
    'src/**/__fixtures__/**',

    // Las Edge Functions son Deno, no Node: importan por URL (`jsr:@std/...`) y
    // con extension `.ts`. knip las lee como si fueran de aqui y da la
    // dependencia por no declarada. Quien las revisa es `deno test`, que las
    // compila de verdad — y de hecho ya cazó un error de tipos que este
    // proyecto no habría visto. Mismo motivo por el que estan fuera de ESLint
    // y de tsconfig.
    'supabase/functions/**',
  ],

  ignoreDependencies: [
    // drizzle-kit estuvo aquí hasta que `src/db/__tests__/schema.test.ts` empezó
    // a importar `drizzle-kit/api` para generar el DDL. El ignore decía «se usa
    // por línea de comandos, no se importa», y dejó de ser cierto. knip lo avisó.
    // Validación en la frontera. Entra en uso en D4 (respuestas del proxy) y D6 (env).
    'zod',
    // knip la infiere del preset de Expo aunque no esté instalada. Entra en D6.
    'expo-updates',
    // Vienen del scaffold y las usa el runtime de Expo, no un import nuestro.
    'expo-font',
    'expo-status-bar',
  ],
};
