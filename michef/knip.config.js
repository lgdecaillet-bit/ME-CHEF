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
    // zod estuvo aquí hasta D6: `src/config/env.ts` la importa. Se quitó.
    // expo-updates y expo-dev-client también: desde que la configuración es
    // `app.config.ts`, knip las ve como runtime de Expo. Él mismo avisó de que
    // las excepciones sobraban.
    //
    // Nativa que entró en D6 con las demás, para que la huella del build cambie
    // una sola vez. Su plugin no entra hasta su primer uso (decisión #57, punto
    // 9), así que hasta entonces nada la usa. Sale de aquí en Fase 1, con la
    // sesión anónima.
    'expo-secure-store',
    //
    // Viene del scaffold. Expo la usa para aplicar `userInterfaceStyle` (claro
    // u oscuro) en Android; con `platforms: ['ios']` (D6) knip ya no ve quién
    // la usa. Quitarla es un cambio de dependencias con su propio paso, y se
    // decide en D6.5, cuando entre el tema claro/oscuro.
    'expo-system-ui',
    // Vienen del scaffold y las usa el runtime de Expo, no un import nuestro.
    'expo-font',
    'expo-status-bar',
  ],
};
