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

// ── Interfaz (diseno.md § 4, decisión #58) ────────────────────────────────────
//
// Los textos y los controles solo se dibujan con las piezas de src/ui/, y así
// cada uno lleva el tema, Dynamic Type y su etiqueta de VoiceOver sin que nadie
// tenga que acordarse. Es también lo que hace, sin plugin, el trabajo de
// accesibilidad: eslint-plugin-react-native-a11y no es compatible con ESLint 9.
//
// Tiene límites, escritos en la #58 y en diseno.md § 4: un texto guardado antes
// en una variable, o un control de una librería que no está en esta lista, no
// lo ve ninguna regla. Lo cubre la revisión del PR.
const CONTROLES =
  'Los textos y los controles solo se usan en src/ui/. Fuera, se usan sus piezas (Texto…), que llevan el tema, Dynamic Type y la etiqueta de VoiceOver (diseno.md § 4).';

const CONTROLES_SOLO_EN_UI = [
  {
    name: 'react-native',
    importNames: [
      'Text',
      'TextInput',
      'Pressable',
      'Button',
      'Switch',
      'TouchableOpacity',
      'TouchableHighlight',
      'TouchableWithoutFeedback',
      'TouchableNativeFeedback',
    ],
    message: CONTROLES,
  },
  // Trae sus propios controles, y está instalada: la usa expo-router.
  {
    name: 'react-native-gesture-handler',
    importNames: [
      'Pressable',
      'TextInput',
      'Switch',
      'TouchableOpacity',
      'TouchableHighlight',
      'TouchableWithoutFeedback',
      'TouchableNativeFeedback',
      'RectButton',
      'BaseButton',
      'BorderlessButton',
    ],
    message: CONTROLES,
  },
  // `Link` dibuja su propio texto tocable. Para navegar desde una pantalla:
  // `router.push`, desde una pieza de src/ui/.
  { name: 'expo-router', importNames: ['Link'], message: CONTROLES },
];

// `Animated.Text`, o `RN.Text` tras un `import * as RN`: el mismo `Text` con
// otro nombre. Solo fuera de src/ui/.
const CONTROLES_EN_JSX = [
  {
    selector: 'JSXMemberExpression[property.name=/^(Text|TextInput)$/]',
    message: CONTROLES,
  },
];

// La misma prohibición por la puerta de atrás.
const RN_POR_DENTRO = {
  group: ['react-native/Libraries/**'],
  message: 'Se importa de «react-native», no de sus archivos internos.',
};

// Las propiedades de estilo que son tipografía, espacio o radio.
const MEDIDAS =
  '^(fontSize|lineHeight|letterSpacing|gap|rowGap|columnGap|(padding|margin)(Top|Bottom|Left|Right|Start|End|Horizontal|Vertical)?|border(TopLeft|TopRight|BottomLeft|BottomRight|TopStart|TopEnd|BottomStart|BottomEnd)?Radius)$';

const COLOR_A_MANO =
  'Color escrito a mano. Los colores viven en src/ui/tokens.ts y se piden con useTema() (diseno.md § 4).';
const MEDIDA_A_MANO =
  'Medida escrita a mano. Los tamaños de letra, los espacios y los radios viven en src/ui/tokens.ts y se piden con useTema() (diseno.md § 4).';
const TEXTO_A_MANO =
  'Texto de lo que se ve o de lo que lee VoiceOver, escrito a mano. Va en src/i18n/es.ts y se pide con t().';

// Los atributos cuyo texto se ve o se oye. `testID` no está: no lo ve nadie.
const ATRIBUTOS_CON_TEXTO =
  'JSXAttribute[name.name=/^(accessibilityLabel|accessibilityHint|aria-label|placeholder|etiqueta|descripcion)$/]';

// Una cadena de verdad: su código empieza por comilla. Así no cuentan los
// números ni `null`.
const CADENA = `Literal[raw=/^['"]/]`;
// Lo que monta un texto: un condicional, un «y/o», o una suma de cadenas. Solo
// la suma: `modo === 'oscuro'` es una comparación, no un texto.
const MONTA_TEXTO =
  ":matches(ConditionalExpression, LogicalExpression, BinaryExpression[operator='+'])";
// Un hijo de un elemento, no un atributo: `testID={x ? 'a' : 'b'}` no se ve.
const HIJO_DE_JSX = ':matches(JSXElement, JSXFragment) > JSXExpressionContainer';

const SIN_VALORES_A_MANO = [
  {
    selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
    message: COLOR_A_MANO,
  },
  { selector: 'Literal[value=/^(rgb|hsl)a?\\(/i]', message: COLOR_A_MANO },
  {
    selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]',
    message: COLOR_A_MANO,
  },
  // Un color con nombre («white», «red») en un estilo. `transparent` no es un
  // color que se elija: es la ausencia de uno. En un atributo JSX no se mira:
  // `<Texto color="texto2">` recibe el nombre de un token, y un selector no
  // distingue «texto2» de «red». Queda escrito como límite en la #58.
  {
    selector: `Property[key.name=/[cC]olor$/] > ${CADENA}.value:not([value='transparent'])`,
    message: COLOR_A_MANO,
  },
  // El 0 sí se puede escribir: no es una medida, es la ausencia de una.
  {
    selector: `Property[key.name=/${MEDIDAS}/] > Literal.value:not([value=0])`,
    message: MEDIDA_A_MANO,
  },
  {
    selector: `Property[key.name=/${MEDIDAS}/] > UnaryExpression.value`,
    message: MEDIDA_A_MANO,
  },
  { selector: `${ATRIBUTOS_CON_TEXTO} > Literal`, message: TEXTO_A_MANO },
  {
    selector: `${ATRIBUTOS_CON_TEXTO} > JSXExpressionContainer > :matches(Literal, TemplateLiteral)`,
    message: TEXTO_A_MANO,
  },
  {
    selector: `${ATRIBUTOS_CON_TEXTO} > JSXExpressionContainer > ${MONTA_TEXTO} > ${CADENA}`,
    message: TEXTO_A_MANO,
  },
  // El texto suelto que react/jsx-no-literals no ve: dentro de un condicional,
  // de un «y/o», de una suma (dos niveles: 'a' + x + 'b') o de una plantilla.
  { selector: `${HIJO_DE_JSX} > ${MONTA_TEXTO} > ${CADENA}`, message: TEXTO_A_MANO },
  {
    selector: `${HIJO_DE_JSX} > ${MONTA_TEXTO} > ${MONTA_TEXTO} > ${CADENA}`,
    message: TEXTO_A_MANO,
  },
  { selector: `${HIJO_DE_JSX} > TemplateLiteral`, message: TEXTO_A_MANO },
];

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

      'no-restricted-imports': [
        'error',
        { paths: CONTROLES_SOLO_EN_UI, patterns: [SDK_DE_MODELOS, RN_POR_DENTRO] },
      ],

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

      // ── Reglas de import que dependen de un resolvedor roto ────────────────
      //
      // `eslint-config-expo@57` trae su propia copia anidada de
      // `eslint-plugin-import`, y su interfaz no encaja con la de
      // `eslint-import-resolver-typescript@3.10.1`. El síntoma: primero avisos
      // «typescript with invalid interface loaded as resolver», y en cuanto
      // aparece un `import * as x`, ESLint se cae entero con
      // EslintPluginImportResolveError. No es que la regla encuentre algo: es
      // que no puede correr.
      //
      // Las cuatro de resolución (`namespace`, `no-unresolved`, `named`,
      // `default`) las cubre TypeScript y mejor: un import inexistente da
      // `TS2307` en `npm run typecheck`, que corre ANTES que el lint dentro de
      // `npm run gates`. Comprobado.
      //
      // Las tres últimas son de estilo y **no las cubre nadie**: se pierden a
      // sabiendas, porque tener el linter caído cuesta más que perderlas.
      //
      // Registrado como decisión #48. Revisar cuando Expo suba de SDK, junto
      // con la #44.
      'import/namespace': 'off',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-duplicates': 'off',
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

  // ── Interfaz: nada escrito a mano (diseno.md § 4) ─────────────────────────
  // Colores, medidas y textos salen de los tokens y de es.ts; tokens.ts es el
  // único archivo que escribe valores. Solo en la interfaz: en el motor, en la
  // base o en el logger, un `gap` o una cadena '#abc' no son estilo.
  // src/__fixtures__/ cuenta como pantalla: es la que viola cada regla a
  // propósito, y scripts/probar-reglas.js la revisa línea a línea.
  {
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/ui/**/*.{ts,tsx}',
      'src/__fixtures__/**/*.{ts,tsx}',
    ],
    ignores: ['src/ui/tokens.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...SIN_VALORES_A_MANO, ...CONTROLES_EN_JSX],
      // Los atributos no cuentan aquí (`testID="home"` no lo ve nadie); los que
      // se ven o se oyen los vigila no-restricted-syntax, arriba.
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true, allowedStrings: ['·', '%'] },
      ],
    },
  },

  // ── src/ui/ es donde viven Text y Pressable: ahí sí se usan ──────────────
  // OJO: los dos bloques redefinen reglas enteras, así que repiten lo que haga
  // falta: SDK_DE_MODELOS en los imports, y los valores a mano en la sintaxis.
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [SDK_DE_MODELOS, RN_POR_DENTRO] }],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    ignores: ['src/ui/tokens.ts'],
    rules: { 'no-restricted-syntax': ['error', ...SIN_VALORES_A_MANO] },
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
      // Un test escribe textos y colores a mano para comprobar lo que sale.
      'react/jsx-no-literals': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  // ── Prettier al final: apaga todo lo que sea formato ───────────────────────
  prettier,
];
