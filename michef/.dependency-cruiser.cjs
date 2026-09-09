// dependency-cruiser · ME CHEF
//
// Las reglas de arquitectura de CLAUDE.md, convertidas en algo que se ejecuta.
// ESLint avisa mientras escribes; esto BLOQUEA en CI aunque el editor calle
// (decisión #31). Cada regla lleva el porqué, para que nadie la borre por
// molesta sin entender qué protegía.

module.exports = {
  // Aquí SOLO viven reglas de arquitectura, y todas son 'error'. El código muerto
  // es trabajo de knip: si esta orden imprime algo, es una violación de verdad.
  forbidden: [
    {
      name: 'engine-no-ai',
      severity: 'error',
      comment:
        'src/engine/ es el motor determinista: puro y testeable sin red. Si una función ' +
        'del motor parece necesitar un modelo, el diseño está mal (CLAUDE.md).',
      from: { path: '^src/engine' },
      to: { path: '^src/ai' },
    },
    {
      name: 'engine-no-native',
      severity: 'error',
      comment:
        'El motor no depende del dispositivo ni del backend: entra un objeto, sale un ' +
        'objeto. Así se prueba en Node, sin iPhone y sin Supabase.',
      from: { path: '^src/engine' },
      to: {
        // Un paquete instalado se resuelve a `node_modules/<paquete>/…`; uno que
        // no está instalado se queda con su nombre a secas. El patrón cubre las
        // dos formas: con `^(react-native|…)` a secas no casaba ninguna y la
        // regla nunca disparó. Sin `dependencyTypes`, porque el tipo de una
        // dependencia sin resolver es 'unknown' y se escapaba por ahí.
        path: '(^|node_modules/)(react-native|react|expo|@expo|@supabase|@sentry|posthog)(/|$)',
      },
    },
    {
      name: 'engine-no-db',
      severity: 'error',
      comment:
        'El motor calcula; no lee ni escribe. Quien persiste es la capa de datos, ' +
        'que le pasa los objetos ya cargados.',
      from: { path: '^src/engine' },
      to: { path: '^src/(db|lib/supabase)' },
    },
    {
      name: 'ai-only-proxy',
      severity: 'error',
      comment:
        'Ninguna API key de modelo vive en la app (CLAUDE.md, prohibición dura). Si un ' +
        'SDK de modelo entra en el bundle, la key entra detrás. Todo pasa por ' +
        'supabase/functions/ai-proxy.',
      from: { path: '^src' },
      to: {
        // Misma razón que en engine-no-native: cubre el paquete instalado y el
        // que todavía no lo está (que es el caso normal cuando alguien acaba de
        // escribir el import y aún no ha corrido npm install).
        path: '(^|node_modules/)(@google|@google-cloud|@anthropic-ai|openai|cohere-ai|replicate)(/|$)',
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'Un ciclo hace que el orden de carga decida el comportamiento. Se rompe ' +
        'extrayendo lo común a un tercer módulo.',
      from: {},
      to: { circular: true },
    },
  ],

  options: {
    // doNotFollow no entra DENTRO de los paquetes, pero sí registra la arista
    // `src/… → node_modules/paquete`, que es justo lo que miran engine-no-native
    // y ai-only-proxy. Tener `node_modules` en `exclude` las dejaba muertas: el
    // grafo bajaba de 15 dependencias a 12 y las reglas no veían nada.
    // Comprobado con el fixture de src/engine/__fixtures__/.
    doNotFollow: { path: 'node_modules' },
    // __fixtures__ viola las reglas a propósito: scripts/probar-reglas.js levanta
    // esta exclusión y comprueba que cada regla dispara de verdad.
    exclude: { path: '(^|/)(coverage|dist|\\.expo|__fixtures__)(/|$)' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
