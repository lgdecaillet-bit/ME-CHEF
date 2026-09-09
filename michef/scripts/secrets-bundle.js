#!/usr/bin/env node
/**
 * Exporta el bundle de iOS y busca secretos dentro.
 *
 * Por qué existe: gitleaks mira el REPO. Esto mira lo que realmente se instala
 * en el teléfono. Una key puede entrar por una variable EXPO_PUBLIC_, por una
 * dependencia, o por un copiar-pegar en un archivo que gitleaks no cubre.
 * Si algo aparece aquí, ya está al alcance de cualquiera que descargue la app.
 *
 * Corre en CI (capa 3). No entra en `npm run gates` porque el export tarda.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PATRONES = [
  // El guion importa: las keys actuales son sk-ant-api03-…, sk-proj-…,
  // sk-svcacct-…. Una clase sin [-_] no las ve y da un falso «todo limpio».
  [/sk-ant-[A-Za-z0-9_-]{10,}/g, 'API key de Anthropic'],
  [/sk-(proj|svcacct|admin)?-?[A-Za-z0-9_-]{32,}/g, 'API key de OpenAI'],
  [/AIza[0-9A-Za-z_-]{30,}/g, 'API key de Google'],
  [/sb_secret_[A-Za-z0-9_-]{10,}/g, 'Supabase secret key'],
  [/sbp_[0-9a-f]{40,}/g, 'Supabase access token'],
  [/ghp_[A-Za-z0-9]{30,}/g, 'token de GitHub'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, 'clave privada'],
];

// La service_role key de Supabase es un JWT: la palabra «service_role» va dentro
// del payload en base64, no en claro. Buscar solo el literal deja pasar justo el
// caso que importa. Aquí se decodifica cada JWT que aparezca y se mira el rol.
const JWT = /eyJ[A-Za-z0-9_-]{8,}\.([A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]{8,}/g;
const ROLES_PROHIBIDOS = ['service_role', 'supabase_admin'];

function jwtsPeligrosos(texto) {
  const encontrados = [];
  for (const m of texto.matchAll(JWT)) {
    let payload;
    try {
      payload = Buffer.from(m[1], 'base64').toString('utf8');
    } catch {
      continue;
    }
    for (const rol of ROLES_PROHIBIDOS) {
      if (payload.includes(rol)) encontrados.push(rol);
    }
  }
  return encontrados;
}

const salida = fs.mkdtempSync(path.join(os.tmpdir(), 'mechef-bundle-'));
let codigo = 0;

try {
  console.log('Exportando el bundle de iOS…');
  execSync(`npx expo export --platform ios --output-dir "${salida}"`, {
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });

  const archivos = [];
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else archivos.push(p);
    }
  };
  recorrer(salida);

  const hallazgos = [];
  for (const archivo of archivos) {
    const texto = fs.readFileSync(archivo, 'latin1');
    const rel = path.relative(salida, archivo);
    for (const [patron, nombre] of PATRONES) {
      const m = texto.match(patron);
      if (m) hallazgos.push({ archivo: rel, nombre, veces: m.length });
    }
    for (const rol of jwtsPeligrosos(texto)) {
      hallazgos.push({ archivo: rel, nombre: `JWT con rol ${rol}`, veces: 1 });
    }
  }

  if (hallazgos.length > 0) {
    console.error('\nSECRETOS EN EL BUNDLE. No se mergea:\n');
    for (const h of hallazgos) {
      console.error(`  ${h.nombre} · ${h.archivo} · ${h.veces} vez/veces`);
    }
    console.error(
      '\nRevoca la credencial ANTES de arreglar el código: ya salió del repo.'
    );
    codigo = 1;
  } else {
    console.log(`\nOK · ${archivos.length} archivos revisados, 0 secretos.`);
  }
} finally {
  // process.exit() dentro del try se salta este finally, y entonces el bundle
  // con el secreto dentro se queda en %TEMP% justo en el único caso que importa.
  // Por eso se guarda el código y se sale DESPUÉS de limpiar.
  fs.rmSync(salida, { recursive: true, force: true });
}

process.exit(codigo);
