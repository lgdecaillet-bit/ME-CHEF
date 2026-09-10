#!/usr/bin/env node
/**
 * Comprueba que las reglas de arquitectura DISPARAN de verdad.
 *
 * Por qué existe: en D2 se escribieron cinco reglas de dependency-cruiser y dos
 * de ellas (`engine-no-native` y `ai-only-proxy`) no podían dispararse nunca. El
 * patrón no casaba con nada y `node_modules` estaba fuera del grafo. Los gates
 * salían verdes y las prohibiciones duras de CLAUDE.md no estaban protegidas por
 * nada. Nadie lo vio porque una regla que jamás ha visto una violación parece
 * igual de sana que una que funciona.
 *
 * Desde aquí, cada regla tiene un fixture que la viola a propósito y este script
 * falla si la regla NO se queja. Es el control positivo de los gates.
 *
 * Los fixtures viven en src/engine/__fixtures__/ (arquitectura) y, desde D6.5a,
 * en src/__fixtures__/ y src/ui/__fixtures__/ (interfaz). Están excluidos de la
 * ejecución normal de ESLint, de dependency-cruiser, de Jest y de la cobertura.
 */
const { execSync } = require('node:child_process');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');

// execSync con cadena, no execFileSync: desde Node 20 lanzar un `.cmd` sin shell
// está bloqueado (CVE-2024-27980), y en Windows los binarios de npm son `.cmd`.
// Con execFileSync este script devolvía salida vacía y daba TODAS las reglas por
// muertas, que es el peor falso positivo posible en un control.
function correr(cmd) {
  try {
    return execSync(cmd, { cwd: raiz, encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    // Se espera que fallen: su trabajo es quejarse.
    return `${e.stdout ?? ''}${e.stderr ?? ''}`;
  }
}

const fallos = [];

function debeAparecer(salida, marca, comoSeLlama) {
  if (salida.includes(marca)) {
    console.log(`  ok    ${comoSeLlama}`);
  } else {
    console.log(`  FALLA ${comoSeLlama}`);
    fallos.push(comoSeLlama);
  }
}

// El control negativo: una regla que dispara donde no debe también está rota.
function noDebeAparecer(salida, marca, comoSeLlama) {
  if (salida.includes(marca)) {
    console.log(`  FALLA ${comoSeLlama}`);
    fallos.push(comoSeLlama);
  } else {
    console.log(`  ok    ${comoSeLlama}`);
  }
}

console.log('\ndependency-cruiser · con la exclusión de fixtures levantada');
const dep = correr(
  'npx depcruise src --config .dependency-cruiser.cjs --exclude "(^|/)(coverage|dist)(/|$)"'
);
if (dep.trim() === '') {
  console.error(
    '  depcruise no devolvió nada. Revisa el comando antes de fiarte de esto.'
  );
  process.exit(1);
}
debeAparecer(
  dep,
  'engine-no-native',
  'engine-no-native detecta react-native en el motor'
);
debeAparecer(dep, 'ai-only-proxy', 'ai-only-proxy detecta un SDK de modelo');
debeAparecer(dep, 'engine-no-ai', 'engine-no-ai detecta un import de src/ai/');
debeAparecer(dep, 'engine-no-db', 'engine-no-db detecta un import de src/db/');

console.log('\nESLint · sobre los fixtures, con --no-ignore');
// --no-inline-config: los fixtures llevan un /* eslint-disable */ para que el
// editor no los pinte de rojo, y sin esta bandera ese comentario apagaba las
// reglas y el control daba todo por muerto.
const lint = correr('npx eslint src/engine/__fixtures__ --no-ignore --no-inline-config');
if (lint.trim() === '') {
  console.error('  ESLint no devolvió nada. Revisa el comando antes de fiarte de esto.');
  process.exit(1);
}
debeAparecer(lint, 'no-restricted-imports', 'no-restricted-imports dispara en el motor');
debeAparecer(
  lint,
  'Ninguna API key de modelo',
  'el SDK de modelo está prohibido dentro del motor'
);
debeAparecer(lint, 'no-explicit-any', 'no-explicit-any dispara');
debeAparecer(lint, 'no-console', 'no-console dispara');
debeAparecer(lint, 'no-only-tests', 'no-only-tests dispara');

console.log(
  '\nESLint · interfaz, sobre una pantalla que viola cada regla (diseno.md § 4)'
);
const pantalla = correr('npx eslint src/__fixtures__ --no-ignore --no-inline-config');
if (pantalla.trim() === '') {
  console.error('  ESLint no devolvió nada. Revisa el comando antes de fiarte de esto.');
  process.exit(1);
}
debeAparecer(pantalla, 'Color escrito a mano', 'un color hex fuera de tokens.ts no pasa');
debeAparecer(
  pantalla,
  'Medida escrita a mano',
  'un tamaño o un espacio con número no pasa'
);
debeAparecer(pantalla, 'jsx-no-literals', 'un texto suelto en JSX no pasa');
debeAparecer(
  pantalla,
  'lo que lee VoiceOver',
  'una etiqueta de VoiceOver escrita a mano no pasa'
);
debeAparecer(
  pantalla,
  'solo se importan en src/ui/',
  'Text y Pressable fuera de src/ui/ no pasan'
);

console.log('\nESLint · interfaz, dentro de src/ui/');
const ui = correr('npx eslint src/ui/__fixtures__ --no-ignore --no-inline-config');
if (ui.trim() === '') {
  console.error('  ESLint no devolvió nada. Revisa el comando antes de fiarte de esto.');
  process.exit(1);
}
debeAparecer(ui, 'Color escrito a mano', 'dentro de src/ui/ tampoco hay colores a mano');
noDebeAparecer(
  ui,
  'solo se importan en src/ui/',
  'dentro de src/ui/ Text sí se puede importar'
);

if (fallos.length > 0) {
  console.error(`\n${fallos.length} regla(s) NO disparan. Están muertas:\n`);
  for (const f of fallos) console.error(`  · ${f}`);
  console.error(
    '\nUna regla que no dispara no protege nada. Arréglala antes de mergear.'
  );
  process.exitCode = 1;
} else {
  console.log('\nTodas las reglas disparan.\n');
}
