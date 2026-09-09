# Estado · ME CHEF

> **El tablero.** Dónde está el proyecto ahora mismo. Se lee en 30 segundos, al abrir
> cualquier sesión, antes de hablar. Se actualiza al tomar y al cerrar cada tarea.
> Historial completo en [`bitacora.md`](bitacora.md). Por qué se decidió cada cosa en
> [`decisiones.md`](decisiones.md). Qué hay que construir en [`fases/`](fases/).

Actualizado: 2026-09-09 · por sesión S-20260909-c

| | |
|---|---|
| **Fase actual** | 0 · Fundaciones y barreras ([fase-0-fundaciones.md](fases/fase-0-fundaciones.md)) |
| **Paso actual** | **D0 cerrado** y **primer commit en `main`** (`a5bfa0c`, 2026-09-09). Siguiente: presentar D1 |
| **Decisiones vigentes** | hasta **#43** |
| **Modo de trabajo** | **un solo agente** hasta cerrar Fase 0 (decisión #38) |
| **Rama de trabajo** | `main` todavía. Primer PR será D1 (`chore/bootstrap`) |
| **Licencia de Apple** | no. Semana 3 (decisión #28) |

---

## Regla que gobierna todo

**Todo paso se aprueba antes de ejecutarse** (decisión #34). Un agente presenta el paso
(archivos, instalaciones con versión, test que lo protege, cómo se verifica), Luciano
dice «adelante», el agente lo hace y reporta qué corrió y qué salió. Aprobar un paso no
aprueba el siguiente.

---

## Sesiones de hoy

Cada sesión anota su ID aquí **antes de hacer nada** (letra siguiente a la última).
Se vacía al cambiar de día.

| Sesión | Ventana / propósito | Estado |
|---|---|---|
| S-20260909-a | planificación + D0.5 | cerrada |
| S-20260909-b | acompañar D0 paso a paso + rename a ME CHEF | cerrada |
| S-20260909-c | primer commit y push a `main` sin `research/` | cerrada |

## Tareas tomadas

| Tarea | Rama | Sesión | Desde | Estado |
|---|---|---|---|---|
| D0.5 · memoria del proyecto | `main` (solo docs, pre-Git-flow) | S-20260909-a | 2026-09-09 | **hecha** |

Ninguna otra. Nadie ha tomado D1.

**Hasta D1** no hay ramas, gates ni PRs: los cambios de solo documentos van directo a
`main`, commiteados, con entrada en `bitacora.md`. Revisor y `npm run gates` aplican
desde el primer PR de código.

---

## Fase 0 · progreso por paso

| Paso | Qué | Quién | Estado |
|---|---|---|---|
| — | Docs de planificación: roadmap, protocolos, diseño, fases 0–6 | Claude | ✅ hecho |
| D0 | Cuentas y herramientas | **Luciano** | ✅ hecho (detalle abajo) |
| D0.5 | `estado.md`, `bitacora.md`, `decisiones.md` numerado, protocolo en `CLAUDE.md`, `revisor.md` | Claude | ✅ hecho |
| D1 | `chore/bootstrap`: migrar starter a `michef/`, limpiar scaffold | Claude | ⏳ espera presentación + «adelante» |
| D2 | Tooling: ESLint, Prettier, Husky, commitlint, depcruise, knip, gitleaks, Jest | Claude | ⏳ |
| D3 | Tests del motor, 7 bugs como `test.failing` | Claude | ⏳ |
| D4 | Supabase como código: migraciones, RLS, pgTAP, esqueleto `ai-proxy` | Claude | ⏳ |
| D5 | CI GitHub Actions + rulesets + prueba del gate rojo | Claude | ⏳ |
| D6 | App base en Expo Go, Sentry, `env.ts`, `flags.ts`, `eas init`, secretos EAS | Claude + Luciano | ⏳ |
| D6.5 | Sistema de diseño + galería | Claude | ⏳ |
| D7 | EAS Workflows + Maestro smoke | Claude | ⏳ |
| D8 | README | Claude | ⏳ |

### D0 · avances de Luciano

Se marca cada punto cuando Luciano lo reporta. Detalle de cada uno en
[fase-0-fundaciones.md § D0](fases/fase-0-fundaciones.md).

- [x] 0.1 Cuenta expo.dev (`lucogav8`) · robot `github-ci` con rol **Developer** creado (decisión: robot, no personal — mínimo alcance según fase-0:111). Pendiente: revocar el Personal access token `github-ci` una vez cargado el secreto
- [x] 0.2 `eas-cli` instalado (23.2.0), `eas whoami` → `lucogav8`
- [x] 0.3 Proyecto Supabase `ME-CHEF`, región **East US (North Virginia)** verificada con `npx supabase projects list` (decisión #41)
      - REFERENCE ID (= `SUPABASE_PROJECT_ID`): `npswkfpomhinewxsmiic`
      - ORG ID: `uimilwirsuqqrvnplzbt` — **compartida con el proyecto TESO** (West US Oregon). Por eso el access token se generó con alcance `Project`, no `Organization`: uno de organización habría alcanzado TESO desde el CI de ME CHEF
      - `LINKED` sale vacío: el enlace local se hace en D4
- [x] 0.4 Docker Desktop, `docker run hello-world` funciona
- [x] 0.5 Supabase CLI 2.117.0 — **vía `npx supabase`, no global** (no hay scoop). Los scripts de D4 deben invocarlo como `npx supabase ...`
- [x] 0.6 Sentry: org `mechef` (display «ME CHEF»), **región EU verificada** — el DSN contiene `.de.`; proyecto React Native slug `mechef`; DSN y **Organization Token** guardados (decisión #42)
      - Comando del wizard para D6: `npx @sentry/wizard@latest -i reactNative --saas --org mechef --project mechef`
      - Verificar en D6 si hace falta añadirle la URL de la región EU (`https://de.sentry.io`); la pantalla de onboarding no la incluye
- [x] 0.7 Expo Go en el iPhone
- [x] 0.8 `gh auth status` OK como `lgdecaillet-bit` (permiso ADMIN sobre el repo)
- [x] 0.9 Cuatro secretos en GitHub (verificado con `gh secret list` el 2026-09-09): `EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SENTRY_AUTH_TOKEN`
- — 0.10 → **movido a D6** (necesita `eas init`, decisión #39). No cuenta para cerrar D0.
- — 0.11 PostHog EU (opcional, Fase 1). No cuenta para cerrar D0.

### ⏰ Vencimientos de credenciales

Un token de CI que caduca en silencio se manifiesta como un CI rojo sin causa
aparente. Revisar esta tabla antes de culpar al código.

| Credencial | Alcance | Vence |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` (`github-ci`) | Full access, **un solo proyecto** | **2027-09-08** |
| `EXPO_TOKEN` (robot `github-ci`, rol Developer) | cuenta `lucogav8` | sin caducidad. Se revoca a mano |
| `SENTRY_AUTH_TOKEN` (Organization Token) | org `mechef` | sin caducidad. La doc de Sentry no define TTL y la UI no ofrece campo de vencimiento; se revoca a mano (solo owners/managers) |

Los dos sin caducidad son los que hay que rotar por disciplina, no por aviso: nadie te
va a decir que llevan dos años vivos. El de Supabase, en cambio, avisa cayéndose.

Higiene hecha el 2026-09-09: revocado el Personal access token `github-ci` de expo.dev
que precedió al robot.


**D0 está cerrado cuando 0.1–0.9 están marcados.**

**Cuando D0 esté:** Luciano manda solo los valores públicos (URL Supabase, ref, anon key,
DSN Sentry, slugs de org y proyecto Sentry). Los tokens no se mandan nunca.

---

## Bloqueos

- **D1 no empieza** hasta que Luciano reporte D0 verificado (0.1–0.9) y diga «adelante» a D1.
- ~~Nada está commiteado~~ **Resuelto el 2026-09-09:** `a5bfa0c` en `origin/main` con
  `michef/` y `michef-starter/`; `research/` fuera por `.gitignore` (decisión #43).

---

## Avisos entre sesiones

(vacío)

---

## Siguiente paso concreto

1. ~~Primer commit en `main`~~ hecho: `a5bfa0c` (sesión c). `research/` fuera.
2. Claude presenta **D1** (`chore/bootstrap`) para aprobación: lista exacta de archivos a
   mover de `michef-starter/` a `michef/`, qué se borra del scaffold, y el texto de los
   cambios a `CLAUDE.md`. No se ejecuta nada sin «adelante» (decisión #34).

Abierto, sin urgencia:
- El casing del nombre quedó en versales, `ME CHEF`, 1.059 veces en prosa. Si se prefiere
  `Me Chef`, es un reemplazo de un comando.
- En D4, no arrancar el contenedor `teso-dev-db`: publica el puerto 54322, el mismo que
  usa el Postgres local de Supabase.
- En D6, verificar si `@sentry/wizard` necesita `SENTRY_URL=https://de.sentry.io` por ser
  la organización de región EU.

---

## Cómo se usa este archivo

- **Al abrir sesión:** leer entero. Luego las últimas 3 entradas de `bitacora.md`. Luego
  `decisiones.md` desde la última que conocías hasta la vigente. Decir en una frase
  dónde está el proyecto y qué toca; si Luciano no está de acuerdo, se corrige antes de
  tocar nada.
- **Al tomar una tarea:** fila en «Tareas tomadas», con rama y sesión. Desde D1, la
  rama en `origin` es el candado: si existe, la tarea está tomada.
- **Al cerrar una tarea:** actualizar «progreso por paso», quitar la fila de «Tareas
  tomadas», escribir «Siguiente paso concreto», y añadir entrada en `bitacora.md`.
  **En el mismo PR** que el código.
- **Identificador de sesión:** `S-AAAAMMDD-x` (x = a, b, c… por orden en el día).
