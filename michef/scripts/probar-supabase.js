#!/usr/bin/env node
/**
 * Corre los dos juegos de tests del servidor: los candados de la base (pgTAP) y
 * el proxy de IA (Deno).
 *
 * Por qué es un script y no dos líneas en `package.json`:
 *
 * 1. **Deno no está instalado en la máquina de Luciano, y no hace falta que lo
 *    esté.** Si está en el PATH se usa; si no, se corre dentro de un contenedor.
 *    Docker ya es obligatorio para levantar Supabase en local, así que no añade
 *    ningún requisito nuevo. En CI (D5) habrá `deno` de verdad y se usará ese.
 * 2. Para poder decir con claridad **cuál** de los dos falló, y para no dejar de
 *    correr el segundo porque el primero se cayó: los dos corren siempre, y el
 *    resumen del final dice qué pasó con cada uno.
 * 3. Para avisar de la causa más probable cuando `supabase test db` no puede
 *    conectarse: que no se ha hecho `npm run supabase:start`.
 *
 * `execSync` con cadena, no `execFileSync`: desde Node 20 lanzar un `.cmd` sin
 * shell está bloqueado (CVE-2024-27980) y en Windows `npx` es un `.cmd`.
 */
const { execSync } = require('node:child_process');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');

function hayDeno() {
  try {
    execSync('deno --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function correr(cmd, cwd = raiz) {
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
    return { ok: true };
  } catch (e) {
    return { ok: false, codigo: e.status ?? 1 };
  }
}

const resultados = [];

console.log('\n── Candados de la base de datos (pgTAP) ──────────────────────\n');
const bd = correr('npx supabase test db');
resultados.push(['pgTAP · RLS', bd.ok]);

console.log('\n── Proxy de IA (Deno) ────────────────────────────────────\n');
const local = hayDeno();
console.log(
  local ? 'Usando el deno de la máquina.' : 'Sin deno en el PATH: se usa el de Docker.'
);
// Se corre DENTRO de supabase/functions, no en la raíz del proyecto. Si no,
// deno ve el package.json de al lado y mete las cuarenta dependencias de npm
// dentro de `deno.lock`, que a partir de ahí se desactualiza cada vez que
// cambia una versión de la app. El lock vive junto al código que bloquea.
// La etiqueta lleva version, no `:alpine` a secas. Este contenedor ejecuta los
// tests del control de acceso del proxy: una etiqueta movil significa que
// manana los corre otro compilador sin que nadie lo haya decidido, y CLAUDE.md
// pide version fijada para todo lo que entra en el proyecto.
const dirDeno = `${raiz.replace(/\\/g, '/')}/supabase/functions`;
const cmdDeno = local
  ? 'deno test --allow-env tests/'
  : `docker run --rm -v "${dirDeno}:/app" -w /app ` +
    'denoland/deno:alpine-2.9.6 deno test --allow-env tests/';
const proxy = correr(cmdDeno, dirDeno);
resultados.push(['Deno · ai-proxy', proxy.ok]);

console.log('\n── Resumen ────────────────────────────────────────────\n');
for (const [nombre, ok] of resultados) {
  console.log(`  ${ok ? 'ok  ' : 'FALLA'}  ${nombre}`);
}

if (!bd.ok) {
  console.error(
    '\nSi pgTAP no pudo conectarse, casi siempre es que Supabase no está levantado.\n' +
      'Arráncalo con:  npm run supabase:start\n' +
      '\nY si el puerto 54322 está ocupado, mira si tienes corriendo el contenedor\n' +
      '`teso-dev-db` del otro proyecto: usa ese mismo puerto.'
  );
}

if (resultados.some(([, ok]) => !ok)) process.exit(1);
console.log('\nTodo verde.\n');
