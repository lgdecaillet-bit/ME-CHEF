#!/usr/bin/env node
/**
 * Pone (o actualiza) las reglas de la rama `main` en GitHub.
 *
 * Qué protege, y por qué cada cosa:
 *
 *   · **Solo por PR.** Sin esto, un `git push` a `main` desde la máquina de
 *     Luciano se salta el CI entero. Es el agujero más grande que puede tener
 *     un repo con gates: los gates no corren en lo que no pasa por un PR.
 *   · **Checks obligatorios** (`gates`, `supabase`, `secretos`). Un PR en rojo
 *     no se puede mergear. Hasta hoy, la única barrera era acordarse de mirar.
 *   · **`strict`: la rama tiene que estar al día.** Dos PRs verdes por separado
 *     pueden romper `main` al juntarse. Con esto hay que actualizar y volver a
 *     pasar el CI.
 *   · **Historia lineal y sin force-push.** `main` es la verdad; reescribirla
 *     borra la trazabilidad de la que depende `docs/bitacora.md`.
 *   · **Cero aprobaciones.** Luciano trabaja solo: exigir que alguien apruebe
 *     su propio PR no añade seguridad, añade fricción. Lo que revisa es el CI
 *     y el subagente revisor. El día que haya otra persona, se sube a 1.
 *
 * Es idempotente: si el ruleset ya existe, lo actualiza en vez de duplicarlo.
 *
 * Se escribe en Node y no en `.sh`, como decía el plan, porque Luciano trabaja
 * en PowerShell y `node scripts/...` le funciona igual que los otros dos
 * scripts del repo. Un `.sh` le pediría abrir otra terminal.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO = 'lgdecaillet-bit/ME-CHEF';
const NOMBRE = 'main protegida';

/** Los tres checks son los nombres de los `jobs` en .github/workflows/. */
const CHECKS = ['gates', 'supabase', 'secretos'];

const reglas = {
  name: NOMBRE,
  target: 'branch',
  enforcement: 'active',
  conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
  rules: [
    { type: 'deletion' },
    { type: 'non_fast_forward' },
    { type: 'required_linear_history' },
    {
      type: 'pull_request',
      parameters: {
        required_approving_review_count: 0,
        dismiss_stale_reviews_on_push: false,
        require_code_owner_review: false,
        require_last_push_approval: false,
        required_review_thread_resolution: false,
        allowed_merge_methods: ['squash'],
      },
    },
    {
      type: 'required_status_checks',
      parameters: {
        strict_required_status_checks_policy: true,
        required_status_checks: CHECKS.map((context) => ({ context })),
      },
    },
  ],
};

// execSync con cadena, no execFileSync: en Windows `gh` es un `.cmd` y desde
// Node 20 lanzarlo sin shell está bloqueado (CVE-2024-27980).
function gh(args, entrada) {
  return execSync(`gh ${args}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    input: entrada,
  });
}

function explicarYSalir(salida) {
  if (salida.includes('Upgrade to GitHub Pro')) {
    console.error(`
No se pudieron aplicar las reglas, y NO es un error del script.

GitHub no permite proteger ramas en repositorios **privados** con la cuenta
gratuita. Es una limitación del plan, no de la configuración.

Hay dos salidas, y las dos son decisión de Luciano:

  1. GitHub Pro, unos 4 USD al mes. Es lo que recomiendo: el CI ya corre y ya
     dice rojo o verde, pero sin esto nadie impide mergear en rojo ni hacer un
     push directo a main que se salte el CI entero.

  2. Hacer el repositorio público. Gratis, y probablemente no es lo que quieres
     para el producto.

Mientras tanto el CI sigue funcionando y sigue avisando: lo que falta es que
BLOQUEE. Cuando decidas, vuelve a correr este mismo comando.
`);
    process.exit(2);
  }
  console.error(salida);
  process.exit(1);
}

let existentes = [];
try {
  existentes = JSON.parse(gh(`api repos/${REPO}/rulesets`));
} catch (e) {
  explicarYSalir(`${e.stdout ?? ''}${e.stderr ?? ''}`);
}

const yaEsta = existentes.find((r) => r.name === NOMBRE);
const destino = yaEsta ? `repos/${REPO}/rulesets/${yaEsta.id}` : `repos/${REPO}/rulesets`;
const metodo = yaEsta ? 'PUT' : 'POST';

// El cuerpo va por archivo y no por argumento: en Windows, un JSON con comillas
// dentro de una línea de comandos se rompe de formas difíciles de leer.
const tmp = path.join(os.tmpdir(), `reglas-rama-${process.pid}.json`);
fs.writeFileSync(tmp, JSON.stringify(reglas), 'utf8');

try {
  gh(`api -X ${metodo} ${destino} --input "${tmp}"`);
  console.log(
    yaEsta ? `Reglas de «${NOMBRE}» actualizadas.` : `Reglas «${NOMBRE}» creadas.`
  );
  console.log(`\nEn main, desde ahora:`);
  console.log(`  · solo se entra por PR, con squash`);
  console.log(`  · ${CHECKS.join(', ')} tienen que estar en verde`);
  console.log(`  · la rama tiene que estar al dia con main`);
  console.log(`  · sin force-push, sin borrar la rama, historia lineal`);
} catch (e) {
  explicarYSalir(`${e.stdout ?? ''}${e.stderr ?? ''}`);
} finally {
  fs.rmSync(tmp, { force: true });
}
