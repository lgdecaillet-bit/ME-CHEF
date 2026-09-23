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

console.log('\ndependency-cruiser · con la exclusión de fixtures levantada');
const dep = correr(
  'npx depcruise src --config .dependency-cruiser.cjs --exclude "^(coverage|dist)(/|$)"'
);
if (dep.trim() === '') {
  console.error(
    '  depcruise no devolvió nada. Revisa el comando antes de fiarte de esto.'
  );
  process.exit(1);
}
// Cada caso se busca en SU línea: regla y destino juntos. Buscar solo el nombre
// de la regla daba «ok» aunque la mitad de los imports se escapara (revisión
// retroactiva del 2026-09-23: `expo-haptics` y `react-native-reanimated` pasaban).
function debeAparecerJuntos(salida, regla, destino, comoSeLlama) {
  const linea = salida
    .split(/\r?\n/)
    .some((l) => l.includes(`${regla}:`) && l.includes(destino));
  debeAparecer(linea ? 'si' : '', 'si', comoSeLlama);
}

debeAparecerJuntos(
  dep,
  'engine-no-native',
  'node_modules/react-native/',
  'engine-no-native detecta react-native'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'node_modules/react-native-reanimated/',
  'engine-no-native detecta react-native-* (Reanimated)'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'node_modules/expo-haptics/',
  'engine-no-native detecta expo-* (Haptics)'
);
debeAparecerJuntos(
  dep,
  'ai-only-proxy',
  'openai',
  'ai-only-proxy detecta un SDK de modelo'
);
debeAparecerJuntos(
  dep,
  'engine-no-ai',
  'src/ai/',
  'engine-no-ai detecta un import de src/ai/'
);
debeAparecerJuntos(
  dep,
  'engine-no-db',
  'src/db/',
  'engine-no-db detecta un import de src/db/'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'node_modules/expo/',
  'engine-no-native detecta expo'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'react-native/Libraries',
  'engine-no-native detecta react-native/*'
);
// Una comprobación por alternativa del patrón de engine-no-native: cada una puede
// morir sola (segunda vuelta del revisor, 2026-09-23).
debeAparecerJuntos(
  dep,
  'engine-no-native',
  '@react-native/assets-registry',
  'engine-no-native detecta @react-native/*'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'node_modules/react/',
  'engine-no-native detecta react'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'node_modules/@expo/',
  'engine-no-native detecta @expo/*'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  '@supabase/supabase-js',
  'engine-no-native detecta @supabase/*'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'node_modules/@sentry/',
  'engine-no-native detecta @sentry/*'
);
debeAparecerJuntos(
  dep,
  'engine-no-native',
  'posthog-react-native',
  'engine-no-native detecta posthog*'
);
debeAparecerJuntos(dep, 'no-circular', 'ciclo-a', 'no-circular detecta un ciclo');

console.log('\nESLint · el test con .only, con --no-ignore');
// --no-inline-config: los fixtures llevan un /* eslint-disable */ para que el
// editor no los pinte de rojo, y sin esta bandera ese comentario apagaba las
// reglas y el control daba todo por muerto.
const lint = correr(
  'npx eslint src/engine/__fixtures__/violacion.test.ts --no-ignore --no-inline-config'
);
if (lint.trim() === '') {
  console.error('  ESLint no devolvió nada. Revisa el comando antes de fiarte de esto.');
  process.exit(1);
}
debeAparecer(lint, 'no-only-tests', 'no-only-tests dispara');

// ── Interfaz: línea a línea ──────────────────────────────────────────────────
//
// Los fixtures de interfaz marcan cada línea con «@espera <trozo del mensaje>»
// o «@permitido». Se comprueba cada una con la salida JSON de ESLint. Buscar el
// mensaje en toda la salida no bastaba: varios selectores comparten mensaje, y
// uno muerto quedaba tapado por otro vivo que dice lo mismo (lo vio el revisor
// de D6.5a).
const fs = require('node:fs');

const MARCA = /(?:\/\/|\{\/\*)\s*@(espera|permitido)\b\s*(.*?)\s*(?:\*\/\})?$/;

function comprobarPorLinea(ruta) {
  let salida;
  try {
    salida = execSync(`npx eslint "${ruta}" --no-ignore --no-inline-config -f json`, {
      cwd: raiz,
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch (e) {
    // ESLint sale con 1 cuando se queja, que es lo que se espera aquí.
    salida = e.stdout ?? '';
  }
  let informe;
  try {
    informe = JSON.parse(salida);
  } catch {
    console.error(`  ESLint no devolvió un informe para ${ruta}. Revisa el comando.`);
    process.exit(1);
  }
  const quejas = new Map();
  for (const m of informe[0]?.messages ?? []) {
    const lista = quejas.get(m.line) ?? [];
    lista.push(`${m.ruleId ?? 'sin regla'}: ${m.message}`);
    quejas.set(m.line, lista);
  }
  const lineas = fs.readFileSync(path.join(raiz, ruta), 'utf8').split(/\r?\n/);
  let marcadas = 0;
  lineas.forEach((texto, i) => {
    // Las líneas que son solo comentario explican el fixture; no son casos.
    if (texto.trimStart().startsWith('//')) return;
    const marca = texto.match(MARCA);
    if (!marca) return;
    marcadas += 1;
    const n = i + 1;
    const codigo = texto.slice(0, marca.index).trim();
    const dichas = quejas.get(n) ?? [];
    if (marca[1] === 'espera') {
      if (dichas.some((d) => d.includes(marca[2]))) {
        console.log(`  ok    ${ruta}:${n}  ${codigo}`);
      } else {
        console.log(`  FALLA ${ruta}:${n}  ${codigo}  (esperaba «${marca[2]}»)`);
        fallos.push(`${ruta}:${n} no dispara`);
      }
    } else if (dichas.length === 0) {
      console.log(`  ok    ${ruta}:${n}  ${codigo}  (permitido)`);
    } else {
      console.log(
        `  FALLA ${ruta}:${n}  ${codigo}  (permitido, y dice: ${dichas.join(' / ')})`
      );
      fallos.push(`${ruta}:${n} dispara donde no debe`);
    }
  });
  if (marcadas === 0) {
    console.error(`  ${ruta} no tiene ninguna línea marcada. Revisa el fixture.`);
    process.exit(1);
  }
}

console.log('\nESLint · el motor, línea a línea');
comprobarPorLinea('src/engine/__fixtures__/violacion.ts');

console.log(
  '\nESLint · interfaz, sobre una pantalla que viola cada regla (diseno.md § 4)'
);
comprobarPorLinea('src/__fixtures__/pantalla.tsx');

console.log('\nESLint · interfaz, dentro de src/ui/');
comprobarPorLinea('src/ui/__fixtures__/componente.tsx');

console.log('\nESLint · fuera de la interfaz, las reglas de interfaz no aplican');
comprobarPorLinea('src/lib/__fixtures__/fuera-de-la-interfaz.ts');

console.log('\nESLint · en los tests, las animaciones también van con Reanimated');
comprobarPorLinea('src/__fixtures__/__tests__/animacion.test.tsx');

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
