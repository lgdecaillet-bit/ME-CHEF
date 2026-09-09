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
  [/sk-ant-[A-Za-z0-9_-]{10,}/g, 'API key de Anthropic'],
  [/AIza[0-9A-Za-z_-]{30,}/g, 'API key de Google'],
  [/sk-[A-Za-z0-9]{32,}/g, 'API key de OpenAI'],
  [/sb_secret_[A-Za-z0-9_-]{10,}/g, 'Supabase secret key'],
  [/sbp_[0-9a-f]{40,}/g, 'Supabase access token'],
  [/service_role/g, 'referencia a service_role'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, 'clave privada'],
];

const salida = fs.mkdtempSync(path.join(os.tmpdir(), 'mechef-bundle-'));

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
    for (const [patron, nombre] of PATRONES) {
      const m = texto.match(patron);
      if (m)
        hallazgos.push({
          archivo: path.relative(salida, archivo),
          nombre,
          veces: m.length,
        });
    }
  }

  if (hallazgos.length > 0) {
    console.error('\nSECRETOS EN EL BUNDLE. No se mergea:\n');
    for (const h of hallazgos)
      console.error(`  ${h.nombre} · ${h.archivo} · ${h.veces} vez/veces`);
    console.error(
      '\nRevoca la credencial ANTES de arreglar el código: ya salió del repo.'
    );
    process.exit(1);
  }

  console.log(`\nOK · ${archivos.length} archivos revisados, 0 secretos.`);
} finally {
  fs.rmSync(salida, { recursive: true, force: true });
}
