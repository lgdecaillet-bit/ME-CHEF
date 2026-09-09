# Fase 0 · Fundaciones y barreras

> **Semanas 1–2 · No necesita licencia de Apple.**
>
> Al terminar, es imposible que código roto llegue a `main`, y la app se ve en tu iPhone.
> No hay producto todavía. Hay un lugar seguro donde construirlo.

---

## En una frase

Antes de escribir la primera pantalla de producto, se construye la estructura que va a
impedir que la pantalla cincuenta rompa la pantalla uno.

## Criterio de entrada

- `michef/` existe (creado con `create-expo-app`, SDK 57).
- `michef-starter/` existe con las reglas, el motor y los esquemas.
- Node 22, npm 10, git, `gh` instalados. Docker Desktop instalado (para Supabase local).
- Cuentas gratuitas en expo.dev, supabase.com, sentry.io. **No hace falta cuenta de Apple.**

## Criterio de salida — se verifica cada punto, en orden

- [ ] `npm run gates` verde en local. `pre-push` lo ejecuta solo.
- [ ] Un PR con un test roto **queda bloqueado** por CI. Al arreglarlo, se puede mergear. `main` no acepta push directo. (Evidencia anotada en `protocolos-calidad.md §8`.)
- [ ] `npm run supabase:test` verde: migraciones aplican, pgTAP pasa, `anon` no puede escribir en `precio` ni leer `cache_modelo`.
- [ ] El proxy responde `401` sin JWT y `200` en `/health`, verificado por `deno test`.
- [ ] Un PR que toca `app.config.ts` dispara build de simulador en EAS y Maestro pasa el smoke.
- [ ] La app abre en **Expo Go en tu iPhone** y muestra la pantalla inicial.
- [ ] Un crash provocado desde el menú de desarrollo aparece en Sentry con stack trace legible.
- [ ] El motor tiene tests: los bugs conocidos están registrados como `test.failing`; cobertura del engine ≥ 95 %.
- [ ] Sistema de diseño: tokens, componentes base con tests, galería en Expo Go en claro y oscuro, `contraste.ts` verde, gates de interfaz en ESLint activos.
- [ ] `michef-starter/` borrado. `CLAUDE.md`, `decisiones.md`, `README.md` actualizados.
- [ ] `docs/protocolos-calidad.md`, `docs/roadmap.md` y `docs/fases/` en el repo.
- [x] **Memoria del proyecto** (D0.5): `docs/estado.md`, `docs/bitacora.md`, `docs/decisiones.md` numerado, protocolo de sesión en `CLAUDE.md`, `.claude/agents/revisor.md`. Verificado abriendo una sesión nueva que retoma sin contexto.
- [ ] Cada PR de esta fase tiene veredicto `APROBADO` del revisor y su entrada en `bitacora.md`.

---

## Stack que entra en esta fase

Versiones verificadas el 2026-09-09 contra el proyecto real y la documentación oficial.

| Capa | Herramienta | Versión | Para qué |
|---|---|---|---|
| Runtime | Expo SDK | **57.0.21** | New Architecture obligatoria. `expo-router` v7 |
| | React Native | 0.86.3 | |
| | React | 19.2.3 | Con React Compiler activado en el scaffold |
| | TypeScript | 6.0.3 | `strict: true` |
| | Node | 22.12 | |
| Calidad | ESLint + `eslint-config-expo` | flat config | Reglas base de Expo + `no-console` + `no-restricted-imports` en el engine |
| | Prettier | 3.x | Formato. No se discute el formato |
| | Husky + lint-staged | 9.x / 15.x | Hooks `pre-commit`, `commit-msg`, `pre-push` |
| | commitlint | config-conventional | Mensajes de commit |
| | dependency-cruiser | 16.x | Reglas de arquitectura ejecutables |
| | knip | 5.x | Código y dependencias muertas |
| | gitleaks | 8.x | Secretos en el repo |
| Tests | Jest + `jest-expo` | Jest 30 | Único runner. Preset de Expo mockea lo nativo |
| | `@testing-library/react-native` | 13.x | Tests de componentes |
| | `fast-check` | 4.x | Property-based testing del motor |
| | `better-sqlite3` | 12.x | SQLite en Node para probar migraciones sin iPhone |
| Backend | Supabase CLI | 2.x | `supabase start`, migraciones, pgTAP, `db lint` |
| | Deno | 2.x (lo trae el CLI) | Edge Functions y sus tests |
| | pgTAP | (incluido) | Tests de la base de datos y de RLS |
| CI | GitHub Actions | ubuntu-latest | Capa 3 |
| | EAS Build + EAS Workflows | eas-cli 23.2.0 | Capa 4, 5, 6. Builds en la nube sobre Macs de Expo |
| | Maestro (job `maestro` de EAS, alpha) | — | Smoke E2E en simulador iOS, en la nube, **sin cuenta de Apple** |
| Observabilidad | Sentry (`@sentry/react-native`) | 7.x | Crashes desde el primer día |
| Dispositivo | **Expo Go** | App Store | Ver la app en el iPhone. Gratis |

### Lo que NO entra todavía (y por qué)

| | Por qué no |
|---|---|
| SQLCipher | Necesita development build → licencia. Fase 1, detrás de flag |
| Sign in with Apple | Igual. Fase 1, al final |
| PostHog | No hay eventos que medir. Fase 1 |
| expo-camera, expo-notifications | Se instalan en su fase; cada dependencia nativa cambia el fingerprint |
| Promptfoo | No hay prompts. Fase 2 |
| Trigger.dev | No hay lotes. Fase 5 |

---

## Qué se construye, paso a paso

Cada paso es un PR. El primero (D1) no tiene CI todavía, así que se revisa a mano.

### D0 · Cuentas, accesos y herramientas — lo hace Luciano, a mano

**Coste: 0. Tiempo: ~1 h. No necesita aprobación de código porque no toca el repo.**
Todo lo de D1 en adelante depende de que esto exista. Apple **no** entra aquí.

| # | Qué | Dónde | Qué sale de ahí | Para qué paso |
|---|---|---|---|---|
| 0.1 | Cuenta en expo.dev (Free) | expo.dev → Sign up | Un **robot access token** (Account → Access tokens → «Robot») | D6 (`eas init`), D7 (workflows), CI |
| 0.2 | `npm i -g eas-cli` + `eas login` | terminal | `eas whoami` responde tu usuario | D6, D7 |
| 0.3 | Proyecto Supabase (Free), región **East US N. Virginia (us-east-1)** — decisión #41 | supabase.com → New project | `Project URL`, `anon key` (Settings → API), `project ref`, y un **access token** (Account → Access Tokens) | D4, D6 |
| 0.4 | Docker Desktop para Windows, backend WSL2 | docker.com | `docker run hello-world` funciona | D4 (`supabase start`) |
| 0.5 | Supabase CLI | `scoop install supabase` **o** `npx supabase --version` | `supabase --version` responde | D4 |
| 0.6 | Sentry (Free), organización en **región EU (Frankfurt)** + proyecto tipo **React Native** — decisión #42 | sentry.io | `DSN` (Settings → Projects → Client Keys) y un **Organization Token** (Settings → Developer Settings → Organization Tokens), no un Personal Token | D6 |
| 0.7 | Expo Go en el iPhone | App Store | Abre y pide escanear QR | D6 |
| 0.8 | `gh auth status` | terminal | Autenticado contra `lgdecaillet-bit/ME-CHEF` con permisos de admin | D5 (rulesets) |
| 0.9 | Secretos en GitHub (Settings → Secrets → Actions) | github.com | `EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SENTRY_AUTH_TOKEN` | D5, D7 |
| 0.10 | ~~Secretos en EAS por environment~~ **Movido a D6** (decisión #39): `eas env:create` necesita el proyecto vinculado con `eas init`, que toca `app.json`. En D0 solo se guardan los valores | — | — | D6 |
| 0.11 | PostHog (Free, **EU cloud**) | eu.posthog.com | Project API key | Fase 1 (puede esperar) |
| — | **Apple Developer Program** | developer.apple.com | — | **Semana 3, no ahora.** Alta tarda 24–48 h, a veces días |

**Seguridad de D0:**
- Los tokens **nunca** se pegan en el chat, en un archivo del repo, ni en `.env`. Van directo a GitHub Secrets y a `eas env:create --type secret`.
- La anon key de Supabase **sí** puede ir en `.env` local (es pública por diseño; la seguridad la da RLS). La `service_role` key **jamás** sale del panel de Supabase — ni siquiera a EAS.
- El robot token de Expo se crea con el mínimo alcance (un solo proyecto).
- Región de Supabase: `us-east-1`, no EU (decisión #41). El servidor no guarda ninguna fila con identidad de usuario (decisión #9), así que no hay residencia de datos que proteger; manda la latencia, y `us-east-1` es mejor centroide para una audiencia global con sesgo América y deja el `ai-proxy` junto al proveedor del modelo. **PostHog sí va en EU cloud**: ese recibe eventos de usuario.

**Verificación de D0 (Luciano, 5 min):** `eas whoami` · `docker run hello-world` · `supabase --version` · `gh auth status` · Expo Go instalado · los 4 secretos visibles en GitHub (solo el nombre).

**Qué reporta Luciano al terminar:** solo valores públicos: URL de Supabase, project ref,
anon/publishable key, DSN de Sentry, slugs de organización y proyecto de Sentry. Los
tokens no se mandan nunca. El progreso se marca en `docs/estado.md § D0`.

### D0.5 · memoria del proyecto — hecho el 2026-09-09, solo documentos

**Qué pasa.** Antes de escribir código, el repo gana memoria: una sesión nueva de Claude
lee tres archivos y sabe qué se hizo, qué toca y cómo, sin que Luciano explique nada
(decisión #36). Es la mitad «barata» del sistema multi-agente; la coordinación entre
ventanas se difiere hasta que haga falta (decisión #38).

| Archivo | Qué es |
|---|---|
| `docs/estado.md` | Tablero: fase, paso, tareas tomadas, progreso de D0, bloqueos, siguiente paso |
| `docs/bitacora.md` | Historial: una entrada por sesión, campos fijos, solo se añade |
| `docs/decisiones.md` | Visión numerada (#1–#40), con estado vigente/reemplazada. Canónico desde hoy; la copia del starter solo apunta aquí |
| `CLAUDE.md` (starter, canónico) | Sección nueva «Protocolo de sesión»: qué leer al abrir, qué escribir al cerrar, ramas, revisor, cambios de visión |
| `CLAUDE.md` (`michef/`, provisional) | Mismas reglas resumidas hasta D1 |
| `.claude/agents/revisor.md` | Subagente de solo lectura. Lista de 6 puntos: alcance, visión, arquitectura, seguridad, bugs, continuidad. Veredicto `APROBADO` / `CAMBIOS` |

**Cómo se verifica.** Abrir una ventana nueva de Claude Code en `michef/`, decir «sigue»,
y comprobar que responde con la fase, el paso y el siguiente paso correctos sin que se le
explique nada. Si no lo hace, `estado.md` o `CLAUDE.md` están mal, no la sesión.

**Qué no incluye (a propósito).** Worktrees, carriles por carpeta, `coordinar.sh`,
agente coordinador, `tablero.sh`, plantilla de PR. Se construyen cuando se abra la
segunda ventana. Diseño completo en `bitacora.md` (2026-09-09).

### D1 · `chore/bootstrap` — migrar el starter a `michef/`

**Qué pasa.** El scaffold de `create-expo-app` es una demo con tabs, íconos de Expo y un
componente "explore". Se limpia y se le pone encima lo que ya existe en `michef-starter/`.

1. Copiar de `michef-starter/` → `michef/`:
   - `CLAUDE.md` → reemplaza el provisional de `michef/`. Se conserva la línea `@AGENTS.md` al principio y `AGENTS.md` (apunta a docs v57).
   - `docs/producto.html`. (`docs/decisiones.md` **ya vive en `michef/docs/`** desde D0.5; la copia del starter es solo un puntero y se borra.)
   - `src/engine/` (5 archivos), `src/db/schema.ts`, `src/ai/client.ts`
   - `supabase/schema.sql`, `supabase/functions/ai-proxy/README.md`
   - `eval/README.md`
   - `.env.example`
2. Fusionar `.gitignore`: añadir `eval/fotos/`, `eval/resultados/`, `.env`, `.env.local`.
3. Borrar del scaffold: `src/app/explore.tsx`, `src/components/*` de demo, `assets/images/expo-*`, `react-logo*`, `tutorial-web.png`, `LICENSE` del template, `scripts/reset-project.js`, el script `reset-project` de `package.json`.
4. Quitar `web` y `android` de `app.json` (iOS-only). Quitar `react-native-web`, `react-dom` de dependencias.
5. **Actualizar `CLAUDE.md`** (ver sección "Cambios a CLAUDE.md" abajo).
6. **`docs/decisiones.md`**: ya numerado y con las entradas #25–#40 desde D0.5. En D1 solo se verifica que `CLAUDE.md` cite los números correctos.
7. Borrar `michef-starter/`.
8. `.gitignore` en la raíz de `ME-CHEF/` que excluya `research/raw/` si supera lo razonable para git (verificar tamaño con `du -sh research/raw`).

**Cómo se ve.** Nada visible. El repo queda con una sola app, una sola fuente de verdad.

**Qué debe funcionar.** `npx expo start` arranca sin errores. `npx tsc --noEmit` pasa.

**Qué no debe funcionar.** Nada más. La pantalla es el placeholder de Expo, todavía.

### D2 · mismo PR — tooling de calidad local

1. `npm i -D eslint-config-expo prettier husky lint-staged @commitlint/cli @commitlint/config-conventional dependency-cruiser knip jest jest-expo @testing-library/react-native fast-check @types/jest better-sqlite3 @types/better-sqlite3 drizzle-kit`
2. `eslint.config.js` (flat):
   - base: `eslint-config-expo`
   - `no-console: error` con excepción para `src/lib/log.ts`
   - override para `src/engine/**`: `no-restricted-imports` con patrones `../ai/*`, `@/ai/*`, `react-native`, `expo*`, `@supabase/*`
   - `no-only-tests`
3. `.dependency-cruiser.cjs` con cuatro reglas nombradas:
   - `engine-no-ai`: `src/engine` → `src/ai` prohibido
   - `engine-no-native`: `src/engine` → `react-native|expo|@supabase` prohibido
   - `ai-only-proxy`: `src/**` → `@google/*|@anthropic-ai/*|openai` prohibido (las keys viven en el proxy, nunca en la app)
   - `no-circular`
4. `jest.config.js`: preset `jest-expo`, `collectCoverageFrom: ['src/**/*.{ts,tsx}']`, `coverageThreshold`: global `{ lines: 60 }`, `src/engine/**` `{ lines: 100, branches: 95 }`.
5. `.husky/pre-commit` → `npx lint-staged`. `.husky/commit-msg` → `npx commitlint --edit`. `.husky/pre-push` → `npm run gates`.
6. `.lintstagedrc`: `*.{ts,tsx}` → `eslint --fix`, `prettier --write`. `*` → `gitleaks protect --staged`.
7. Scripts en `package.json` (lista completa en `protocolos-calidad.md §7`).
8. `tsconfig.json`: mantener `strict`. Añadir `noUncheckedIndexedAccess: true`. Evaluar `exactOptionalPropertyTypes`; si genera más de 20 errores en el motor, dejarlo para Fase 1.

**Cómo se siente.** Guardas un archivo mal formateado y el editor lo arregla. Intentas
hacer commit con un `console.log` y el commit no pasa. Es incómodo un día y un alivio
el resto del proyecto.

### D3 · mismo PR — primeros tests del motor

El objetivo no es cobertura por cobertura. Es que **el gate tenga dientes desde el día 1**:
si no hay tests, un CI verde no significa nada.

`src/engine/__tests__/`:

- `portions.test.ts` — `porcionesDelHogar([])` es 2. Suma de factores. `redondear`: ejemplos de cada rango + propiedades (idempotente, monótona, `redondear(0) === 0`).
- `groceries.test.ts` — semana con dos recetas que comparten un ingrediente suma. Inventario confiable resta; inventario con confianza < 0,6 no resta. Propiedad: nunca cantidad negativa.
- `inventory.test.ts` — la foto manda sobre la cantidad. Lo no visto baja de confianza a la mitad. Lo `manual` no baja. Propiedad: nunca aparece un ingrediente que no venía de ningún lado.
- `coverage.test.ts` — solo recetas cuyos ingredientes están todos en `seguro ∪ despensa`. `posible` no cuenta. Orden por visibles usados × 10 + ranking. Propiedad: ningún resultado tiene un ingrediente fuera de lo disponible.

**Bugs conocidos, registrados como `test.failing`** (se arreglan en Fase 1; ver `fase-1-motor-y-datos.md §Bugs`):

| Id | Función | Qué está mal |
|---|---|---|
| BUG-1 | `fusionarEscaneo` | Un ítem detectado **sin cantidad** entra con `cantidad: 0` y el filtro final `cantidad > 0` **lo elimina**. Una foto casi nunca da cantidad → los `seguro` desaparecerían |
| BUG-2 | `fusionarEscaneo` | Ítems nuevos siempre entran con `unidad: 'g'`, aunque sean líquidos |
| BUG-3 | `listaDeMercado` | Suma cantidades del mismo ingrediente **sin verificar que la unidad coincida** |
| BUG-4 | `listaDeMercado` | El mapa `enCasa` **pisa** filas duplicadas del mismo ingrediente en vez de sumarlas |
| BUG-5 | `recetasConLoQueHay` | **No aplica `Comensal.noCome`** (alergias). Una alergia tiene que ser restricción dura |
| BUG-6 | `recetasConLoQueHay` | `tiempo_max` con valor no numérico → `NaN` → el filtro se desactiva **en silencio** |
| BUG-7 | `escalarReceta` | Devuelve el total en un campo llamado `cantidadPorPorcion`. Riesgo de doble escalado |

`src/db/__tests__/schema.test.ts`: `drizzle-kit generate` produce SQL → se aplica en
`better-sqlite3` en memoria → inserta y lee un `hogar` con dos `comensal`.

### D4 · `chore/supabase` — Supabase como código

> **✅ HECHO el 2026-09-09** (rama `chore/F0-D4-supabase`, decisiones #51 y #52).
> Lo de abajo es el plan original. En lo que el resultado se apartó de él:
>
> · Las tablas hijas de `receta` **no** quedaron con lectura abierta: heredan la
>   condición de «publicada». Con lectura abierta, el contenido de un borrador
>   seguía siendo legible y el candado principal no servía de nada.
> · Se añadió `security_invoker = on` a las dos vistas, que el plan no
>   contemplaba. Sin eso, una vista se salta el RLS de sus tablas base.
> · Los tests pgTAP son **20**, no cuatro: a los de comportamiento se sumaron
>   cuatro estructurales, porque un `select` sobre una tabla cerrada no da error,
>   devuelve cero filas, y sobre una tabla vacía eso es indistinguible de no
>   tener candado (decisión #51).
> · El archivo de tests del proxy se llama `ai-proxy.test.ts` y no
>   `ai-proxy-test.ts`: Deno solo descubre `*.test.ts` o `*_test.ts`.
> · Los índices de la migración 0001 llevan nombre. `if not exists` no existe
>   para un índice anónimo, y sin él la migración no era repetible.
> · Hay tres scripts más de los previstos — `supabase:start`, `supabase:stop`,
>   `supabase:reset` — porque son los que Luciano necesita para ver la base.
> · **No se hizo `supabase link`.** D4 se queda entero en local; enlazar y
>   empujar migraciones al proyecto real espera a que exista CI (D5) que las
>   verifique antes. Empujar a mano a la base que tendrá datos, sin red, es
>   justo lo que la Fase 0 existe para evitar.
> · `deno` no está instalado en la máquina: `scripts/probar-supabase.js` lo usa
>   si está en el PATH y si no lo corre en un contenedor. Docker ya hacía falta
>   para Supabase, así que no añade ningún requisito.

**Qué pasa.** `supabase/schema.sql` deja de ser un archivo que se pega en un panel y pasa
a ser migraciones versionadas que corren en local, en CI y en producción con el mismo
comando.

1. `supabase init` → `supabase/config.toml`.
2. `supabase/migrations/20260909000001_catalogo.sql` = `schema.sql` con `create table if not exists` y `create extension if not exists vector`. Sin otros cambios.
3. `supabase/migrations/20260909000002_rls.sql`:
   - `alter table … enable row level security` en **todas** las tablas.
   - Políticas `select` para `anon` y `authenticated` en `ingrediente`, `ingrediente_nombre`, `ingrediente_porcion`, `nutricion`, `receta` (solo `estado = 'publicada'`), `receta_ingrediente`, `receta_paso`, `receta_texto`, `receta_senal`, `producto`, `tienda`.
   - **Ninguna** política de `insert/update/delete` para clientes. Solo `service_role` escribe, y solo desde el proxy y los jobs.
   - `cache_modelo`, `precio`, `off_producto`, `receta_vector`: **sin política de lectura de cliente**. Se accede vía el proxy o vía vistas agregadas en fases posteriores.
4. `supabase/tests/database/rls.test.sql` (pgTAP):
   - `anon` puede `select` en `ingrediente`.
   - `anon` **no** puede `insert` en `precio`.
   - `anon` **no** puede `select` en `cache_modelo`.
   - `anon` no ve recetas en `borrador`.
5. `supabase/functions/ai-proxy/index.ts` — esqueleto:
   - `GET /health` → `200 { ok: true }`.
   - Cualquier otra ruta sin `Authorization: Bearer <jwt>` válido → `401`.
   - Con JWT válido → `501 { error: 'tarea no implementada' }`. Nada de keys todavía.
6. `supabase/functions/tests/ai-proxy-test.ts` (`deno test`): los tres casos de arriba.
7. Script `supabase:test` en `package.json`.

**Cómo se ve.** Nada en la app. En la terminal: `supabase start` levanta Postgres, Studio en `localhost:54323`, y las tablas están ahí con sus candados.

**Qué debe funcionar.** `supabase db reset` aplica las dos migraciones en limpio. pgTAP verde. `deno test` verde.

**Qué no debe funcionar.** Desde Studio, como `anon`, insertar una fila en `precio` **tiene que fallar**. Si no falla, RLS está mal y la fase no cierra.

### D5 · `chore/ci` — CI de GitHub Actions y reglas de rama

1. `.github/workflows/ci.yml`:
   - `on: pull_request` y `push: main`. `paths-ignore: ['research/**', '**.md']`.
   - Job `gates` (ubuntu, Node 22, caché npm): `npm ci` → `npx expo-doctor` → `typecheck` → `lint` → `depcruise` → `test:coverage` → `secrets:bundle` → `knip` (`continue-on-error: true` en Fase 0–1).
   - Job `supabase` (ubuntu, `supabase/setup-cli@v1`): `supabase start` → migraciones → `supabase test db` → `supabase db lint` → `deno test supabase/functions/tests/`.
2. `.github/workflows/gitleaks.yml`: `gitleaks/gitleaks-action@v2` en push y PR.
3. `.github/workflows/eval.yml`: `workflow_dispatch`, vacío. Se rellena en Fase 2.
4. `scripts/branch-rules.sh`: crea el ruleset de `main` con `gh api` — PR obligatorio, checks `gates` y `supabase` requeridos, historia lineal, sin force-push.
5. **La prueba del gate.** Rama `test/gate-rojo`, un test del motor roto a propósito, PR → rojo → bloqueado → arreglar → verde → merge. Se anota en `protocolos-calidad.md §8`.

**Cómo se siente.** Abres un PR y en ~6 minutos hay un ✓ o una ✗. La ✗ te dice qué línea.

### D6 · `feat/app-base` — la app base, en Expo Go

**Qué pasa.** Se deja `app.json` y se pasa a `app.config.ts` con lo mínimo para que la app
sea "ME CHEF" y no "michef". Se instalan las dependencias base (no las nativas de fases
posteriores).

1. `app.config.ts`:
   - `name: 'ME CHEF'`, `slug: 'michef'`, `ios.bundleIdentifier` (elegir ya, p. ej. `ch.michef.app`; cambiarlo después cuesta).
   - `runtimeVersion: { policy: 'fingerprint' }`.
   - `updates.url` (lo da `eas init`).
   - plugins: `expo-router`, `expo-splash-screen`, `@sentry/react-native/expo`.
   - **Todavía no**: `expo-sqlite` con SQLCipher (Fase 1), `expo-camera` (Fase 2). Cada plugin nativo se añade en su fase para que el fingerprint cambie **una vez por motivo** y sea rastreable.
2. `npx expo install expo-dev-client expo-updates @sentry/react-native expo-secure-store` + `npm i @supabase/supabase-js drizzle-orm zod`.
   - `expo-dev-client` se instala ya aunque no se use: así el día que llegue la licencia, el development build es un `eas build`, no un PR.
3. `src/lib/log.ts` — el **único** archivo con `console.*`. Exporta `log.info/warn/error`. En producción `error` va a Sentry.
4. `src/lib/sentry.ts` — init con DSN de `EXPO_PUBLIC_SENTRY_DSN`. `beforeSend` que **borra cualquier campo que parezca PII**.
5. `src/config/env.ts` — zod valida al arrancar que `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` existen. Si falta una, la app **no arranca** y dice cuál falta. Mejor un error claro en el segundo 0 que uno confuso en el minuto 20.
6. `src/config/flags.ts` — `{ cifrado: false, nevera: false, facturas: false, … }` leídos de `EXPO_PUBLIC_FLAG_*`. Tipado, con valores por defecto.
7. `src/app/_layout.tsx` — Sentry wrap, `ThemeProvider`, un `Stack` de expo-router (sin tabs todavía).
8. `src/app/index.tsx` — pantalla inicial mínima con `testID="home"`. En `__DEV__`, un botón "Provocar crash" que llama a `Sentry.nativeCrash()`.
9. `metro.config.js` con `getSentryExpoConfig` y `.sql` como asset (para las migraciones de Drizzle en Fase 1).
10. `eas.json`:
    ```
    development  distribution internal · developmentClient true       (Fase 1+, con licencia)
    simulator    ios.simulator true · developmentClient false          (Maestro, gratis)
    preview      distribution internal · channel preview               (con licencia)
    production   channel production · autoIncrement true               (con licencia)
    ```
11. `eas init` (vincula el proyecto a expo.dev, gratis) y `eas build:configure`.

**Cómo se ve.** Una pantalla con el nombre de la app y nada más. Fondo, tipografía del
sistema, un texto. **Es honestamente vacía** — no se maqueta nada de producto aquí.

**Cómo se siente.** Abres Expo Go en el iPhone, escaneas el QR, cambias el texto en
`index.tsx`, guardas, y el iPhone cambia antes de que levantes la vista. **Ese segundo es
el hito de la fase.**

**Qué debe funcionar.** La app abre en Expo Go. El botón de crash produce un evento en
Sentry con el archivo y la línea. `npm run gates` sigue verde.

**Qué no debe funcionar.** Sin navegación, sin datos, sin red útil. Si alguien abre esta
build y ve una feature, la fase se está saltando pasos.

### D6.5 · `feat/sistema-diseno` — los ladrillos de la interfaz

**Qué pasa.** Antes de la primera pantalla de producto existe el sistema con el que se
van a construir todas. Detalle completo en [`../diseno.md`](../diseno.md) §2.

1. `src/ui/tokens.ts` — color (semántico, claro/oscuro), tipografía (escala iOS, Dynamic Type), espacio (rejilla 4 pt), radio, movimiento, tamaño táctil mínimo 44.
2. `src/ui/tema.tsx` — `ProveedorTema` + `useTema()`. Se monta en `_layout.tsx`.
3. Componentes base en `src/ui/`: `Texto`, `Boton`, `Chip`, `Tarjeta`, `Etiqueta`, `Campo`, `Stepper`, `EstadoVacio`, `Cargando`, `Aviso`, `Icono` (SF Symbols), `Progreso`. Cada uno con **todos** sus estados y su test RNTL.
4. `src/i18n/es.ts` — todos los textos, con clave semántica. `t()`. La guía de tono en la cabecera.
5. `src/app/(dev)/galeria.tsx` — cada componente en cada estado, claro y oscuro, tres tamaños de Dynamic Type. Solo en `__DEV__`.
6. Gates de interfaz en ESLint: sin hex ni tamaños numéricos fuera de `tokens.ts`; sin texto literal en JSX; `eslint-plugin-react-native-a11y`; `<Text>` solo dentro de `Texto`.
7. `scripts/contraste.ts` — verifica AA (≥ 4,5:1) en cada par texto/fondo de los tokens, claro y oscuro. En CI.
8. `maestro/flows/galeria.yaml` — abre la galería y hace `takeScreenshot` de cada sección. Corre en PRs que toquen `src/ui/`.
9. La pantalla inicial de D6 se **reescribe** con estos componentes. Sigue vacía; ahora está vacía *con* el sistema.

**Cómo se ve.** La galería: una lista larga de botones, chips y tarjetas en todos sus
estados, y un interruptor para verla en oscuro. Es fea a propósito — es un inventario.

**Cómo se siente.** Que ya sabes cómo va a verse cualquier pantalla futura antes de
dibujarla, porque todas salen de estas piezas.

**Qué debe funcionar.** Galería completa en Expo Go. `contraste.ts` verde. Cambiar un
token cambia todo. Un `<Text>` suelto fuera de `Texto` no pasa el lint.

**Qué no debe funcionar.** Ninguna pantalla de producto. La galería es la única ruta
además del inicio.

### D7 · `chore/eas-workflows` — los espejos ② y ⑤

1. `.eas/workflows/pr.yml` — `on: pull_request`:
   ```
   fingerprint
   → get-build (perfil simulator, mismo fingerprint)
   → si no existe: build (perfil simulator)
   → maestro (flow_path: maestro/flows/smoke.yaml)
   → github-comment con el resultado
   ```
2. `.eas/workflows/main.yml` — `on: push main`:
   ```
   fingerprint
   → get-build (perfil preview)
   → si no existe y hay licencia: build preview
   → si existe: update (canal preview)
   → github-comment
   ```
   En Fase 0 el build de `preview` falla por falta de credenciales de Apple: se deja el job con `continue-on-error` hasta la licencia. El de simulador sí corre.
3. `.eas/workflows/release.yml` — `on: push tags v*`:
   ```
   build production → testflight (internal_groups) → require-approval → testflight (external_groups)
   ```
   Se escribe ahora, se activa cuando haya licencia.
4. `maestro/flows/smoke.yaml`:
   ```yaml
   appId: ch.michef.app
   ---
   - launchApp
   - assertVisible:
       id: home
   ```

**Qué debe funcionar.** Un PR que cambie `app.config.ts` → fingerprint distinto → build de
simulador (~15–25 min) → Maestro abre la app en un simulador iOS en la nube y ve `home` →
comentario en el PR con ✓.

**Qué no debe funcionar.** Un PR que solo cambie `.ts` sin tocar nativo **no debe
compilar** (fingerprint igual → `get-build` lo encuentra → salta directo). Si compila
cada vez, el cupo gratuito de EAS se acaba en una semana.

### D8 · `docs/protocolos` — documentación

Ya hecho en esta ronda: `docs/roadmap.md`, `docs/protocolos-calidad.md`, `docs/fases/*.md`.
Falta: reescribir `README.md` (puesta en marcha real, sin Expo Go como destino final; comandos; mapa del repo).

---

## Cambios a `CLAUDE.md`

Las dos primeras filas (SDK 57, Expo Go) y la de «Cuenta» en «Estado y orden» **ya se
aplicaron en D0.5** al canónico (`michef-starter/CLAUDE.md`), citando #26, #27 y #29.
El resto se aplica en D1. Diffs concretos:

| Sección | Antes | Después |
|---|---|---|
| Stack · App | «Expo SDK 54+» | «Expo SDK 57 (RN 0.86, React 19.2, TS 6). New Architecture obligatoria.» |
| Stack · App | (nada sobre Expo Go) | «**Expo Go sirve para desarrollar hasta la Fase 2.** Se abandona al entrar SQLCipher, Sign in with Apple o Live Activities. Nunca es el destino final.» |
| Estado y orden | «Fase actual: 0 — fundaciones» + lista de 6 puntos | «Fase actual: 0. El roadmap completo está en `docs/roadmap.md`; el detalle de cada fase en `docs/fases/`.» |
| Prohibiciones | (nada sobre cuenta) | Sección nueva **«Cuenta»**: «La primera foto y las tres recetas ocurren **sin cuenta**, con sesión anónima. El login (Apple/Google) se pide **al tocar «Cocinar»**, explicando qué se guarda. **Cocinar requiere cuenta.** Nunca antes: ni al abrir, ni al ver las recetas.» |
| Cómo trabajar conmigo | 3 puntos | + «Corre `npm run gates` antes de decir que algo está listo. Si no lo corriste, dilo.» + «Prohibido `--no-verify`.» + «Una feature = una rama = un PR.» |
| (nueva) Cómo se verifica | — | «Los gates están en `docs/protocolos-calidad.md`. Un PR sin CI verde no se mergea.» |

## Entradas nuevas en `docs/decisiones.md`

**Ya aplicadas en D0.5** como #25–#40 (numeradas, con estado). Esta lista queda como
resumen; la autoridad es `docs/decisiones.md`. Todas fechadas 2026-09-08 o 2026-09-09:

- **Layout del repo:** todo dentro de `michef/`. `research/` al lado, fuera de CI.
- **SDK 57.** No 54. New Architecture, sin opción de legacy.
- **Onboarding sin cuenta.** Foto y 3 recetas con sesión anónima; **login al tocar «Cocinar», obligatorio para cocinar**. Es el momento con una acción concreta que lo justifica («para guardar tu nevera y lo que cocinas»): ver es anónimo, cocinar recuerda. Motivo: el informe de research (P1, ⚠ CONTRADICE) — cuenta antes del valor no baja el rating pero genera un flujo constante de 1★ evitables. Coste: una sesión anónima que se migra con `linkIdentity`.
- **Expo Go como entorno de desarrollo hasta Fase 2.** Verificado: cámara, SQLite sin cifrar, Supabase, notificaciones locales funcionan en Expo Go SDK 57. SQLCipher, Apple auth y Live Activities no.
- **Licencia de Apple: recomendada semana 3–4, máximo semana 7.** Los builds de simulador para E2E no la necesitan.
- **Jest-expo como único runner.** No Vitest. Un solo runner, un solo mock de lo nativo.
- **dependency-cruiser** para la regla «engine no importa ai», además de ESLint. Dos herramientas, una regla: el editor avisa, CI bloquea.
- **Maestro en EAS Workflows** para E2E. No Detox (necesita Mac local).
- **Sentry desde Fase 0. PostHog desde Fase 1.**

---

## Cómo se ve y cómo se siente al cerrar la fase

**Lo que ves en el iPhone:** una pantalla con "ME CHEF". Nada más. Y eso está bien.

**Lo que ves en GitHub:** cada PR con dos ✓ verdes (`gates`, `supabase`) y, cuando toca
nativo, un comentario de EAS con el resultado de Maestro.

**Lo que sientes:** que puedes romper cosas sin miedo, porque nada roto llega a `main`.
Esa es la sensación que compra la fase entera.

## Qué NO debe funcionar al cerrar la fase

Es tan importante como lo que sí. Si algo de esto funciona, se coló trabajo de otra fase
y hay que sacarlo a su rama:

- Ninguna pantalla de producto (onboarding, inventario, recetas).
- Ninguna llamada a un modelo. El proxy responde `501`.
- Ningún dato personal en SQLite. No hay tablas creadas en el teléfono todavía.
- Sin cifrado (`flags.cifrado === false`).
- Sin auth de ningún tipo.
- Sin cámara.

---

## Prohibiciones de `CLAUDE.md` que se hacen mecánicas aquí

| Regla | Cómo se aplica desde esta fase |
|---|---|
| Ninguna API key de modelo en la app | `depcruise` prohíbe importar SDKs de modelos en `src/`. `gitleaks` en pre-commit. `secrets:bundle` grepea el bundle en CI |
| `src/engine/` no importa `src/ai/` | ESLint (editor) + `depcruise` (CI). Dos capas |
| TypeScript estricto, sin `any` sin comentario | `strict: true` + regla ESLint `no-explicit-any: error` con `allowWithDescription` |
| Catálogo compartido sin identidad de usuario | pgTAP verifica que ninguna tabla del catálogo tiene columna `user_id`/`hogar_id` |

---

## Riesgos de esta fase y cómo se mitigan

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Docker en Windows da problemas con `supabase start` | media | Se prueba el día 1. Si no va: WSL2 + Docker, o se deja `supabase:test` solo en CI y en local se usa el proyecto remoto con una rama de Supabase |
| El cupo gratuito de EAS se agota (15 builds/mes) | media | `get-build` reutiliza builds por fingerprint. Se restringe `maestro` a PRs con etiqueta `native` si hace falta |
| `expo-doctor` marca warnings del scaffold (deps de web, iconos) | alta | Se limpian en D1. `expo-doctor` es bloqueante desde D5 |
| TypeScript 6 + Jest: babel-preset-expo no soporte alguna sintaxis nueva | baja | Se usa la config de `jest-expo` tal cual; si falla, se fija TS a 5.9 y se anota |
| `knip` marca falsos positivos en un proyecto Expo | alta | Empieza como `continue-on-error`. Se configura `knip.json` con los entry points de expo-router |
| Git Bash en Windows y hooks de Husky | media | Se prueba en D2 con un commit real. Husky 9 funciona en Git Bash; si el shell es PowerShell, se documenta usar Git Bash para git |

---

## Decisiones que se toman durante esta fase

- **`ios.bundleIdentifier`.** Se elige en D6 y no se cambia. Propuesta: `ch.michef.app`.
- **¿`exactOptionalPropertyTypes`?** Se decide en D2 según cuánto ruido genera.
- **Nombre del canal de EAS Update de desarrollo.** Propuesta: `preview`.

---

## Referencias

- Expo SDK 57: https://expo.dev/changelog/sdk-57
- Jest con Expo: https://docs.expo.dev/develop/unit-testing/
- EAS Workflows, jobs: https://docs.expo.dev/eas/workflows/pre-packaged-jobs/
- E2E con Maestro en EAS: https://docs.expo.dev/eas/workflows/examples/e2e-tests/
- Builds de simulador (sin cuenta de Apple): https://docs.expo.dev/build-reference/simulators/
- Supabase testing y lint: https://supabase.com/docs/guides/local-development/cli/testing-and-linting
- Sentry en Expo: https://docs.expo.dev/guides/using-sentry/
