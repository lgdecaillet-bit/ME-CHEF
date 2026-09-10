# ME CHEF · Protocolos de calidad

> Cómo se impide que código roto llegue a `main`, a TestFlight o al usuario.
>
> Principio: **cada regla vive en una herramienta que la ejecuta, no en un documento.**
> Este archivo explica el sistema; la autoridad es el archivo de configuración de cada
> herramienta. Si este documento y una configuración discrepan, se corrige el documento.

Última revisión: 2026-09-09

---

## 1 · Las seis capas de defensa

Ordenadas de la más rápida a la más lenta. Cada una atrapa lo que la anterior no pudo.

| # | Capa | Cuándo corre | Qué corre | Tiempo | Qué bloquea |
|---|---|---|---|---|---|
| 0 | Editor | al guardar | ESLint + Prettier + TypeScript (VS Code) | inmediato | nada — solo avisa |
| 1 | `pre-commit` | cada commit | `lint-staged`: eslint --fix, prettier, gitleaks sobre lo staged | < 5 s | el commit |
| 2 | `pre-push` | cada push | `npm run gates` = typecheck + lint + tests + depcruise | < 60 s | el push |
| 3 | CI · GitHub Actions | cada PR | capa 2 + Supabase local (migraciones, pgTAP, `db lint`, `deno test`) + `expo-doctor` + `expo export` + grep de secretos en el bundle + cobertura + knip | < 8 min | el merge |
| 4 | CI · EAS Workflows | cada PR | `fingerprint` → si cambió lo nativo: build de simulador → Maestro smoke. Si no: solo `update` de preview | 15–35 min | el merge (cuando aplica) |
| 5 | `main` post-merge | cada merge | build `preview` o `update` al canal preview + source maps a Sentry | 15–35 min | — |
| 6 | Release | tag `v*` | build `production` → TestFlight interno → **aprobación manual** → TestFlight externo | manual | TestFlight externo |

### Qué hacer cuando cada capa falla

- **Capa 1 (pre-commit) roja:** casi siempre es formato. `npm run lint -- --fix` y vuelve a hacer commit. Si es gitleaks: **no** hagas commit; el secreto va a un `.env` o a EAS/GitHub secrets.
- **Capa 2 (pre-push) roja:** `npm run gates` te dice cuál. Arregla en local. **Nunca `--no-verify`.**
- **Capa 3 (CI) roja y local verde:** casi siempre es Supabase (Docker) o una dependencia que no está en `package-lock.json`. Corre `npm run supabase:test` en local con Docker levantado.
- **Capa 4 (EAS) roja:** abre el log del build. Si falla el build: es `app.config.ts` o un plugin. Si falla Maestro: es la app que no arrancó — mira Sentry.
- **Capa 6 roja:** no hay capa 6 roja. Si algo falló antes, no llegas aquí.

---

## 2 · Reglas de rama

Configuradas como **GitHub Rulesets** sobre `main` (vía `gh api`, script en `scripts/branch-rules.sh`).

- **Nada entra a `main` sin PR.** Aunque el autor sea el único desarrollador. El PR es donde corren las capas 3 y 4; sin PR no hay barrera.
- **Checks obligatorios:** `ci / gates`, `ci / supabase`, `eas / fingerprint`, y `eas / maestro` cuando se ejecute.
- **Historia lineal.** Sin merge commits, sin force-push, sin borrar `main`.
- **Ramas cortas:** `feat/…`, `fix/…`, `chore/…`, `docs/…`. Vida objetivo < 3 días. Si una rama vive una semana, la feature está mal partida.
- **Trunk-based con feature flags.** Lo incompleto se mergea apagado, no se guarda en una rama larga.
- **Conventional Commits** (`commitlint` en `commit-msg`): `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. Alimenta el changelog y el versionado.

---

## 3 · Tipos de test y dónde viven

| Tipo | Herramienta | Alcance | Umbral / regla |
|---|---|---|---|
| **Unit · engine** | `jest-expo` + `fast-check` | `src/engine/**` | **100 % líneas, 95 % ramas.** Es código puro; no hay excusa |
| **Unit · datos** | `jest` + `better-sqlite3` en Node contra el SQL que genera Drizzle | migraciones, round-trip por tabla, export y borrado total | migraciones aplican sobre DB vacía **y** sobre DB con datos de la versión anterior |
| **Componentes** | React Native Testing Library | pantallas críticas | una prueba por estado: vacío, cargando, error, ok |
| **Arquitectura** | `dependency-cruiser` + ESLint `no-restricted-imports` | `src/engine` no importa `src/ai`, `react-native`, `expo-*`, `@supabase/*`. `src/ai` solo habla con el proxy | 0 violaciones |
| **Secretos** | `gitleaks` + `scripts/secrets-bundle.sh` (`expo export` y grep del bundle) | repo y bundle final | 0 hallazgos de `sk-ant-`, `AIza`, `service_role`, JWT que no sea la anon key |
| **Backend · DB** | `supabase test db` (pgTAP) | migraciones, RLS, vistas | `anon` no escribe `precio`; nadie lee `cache_modelo` desde el cliente; el catálogo publicado sí se lee |
| **Backend · proxy** | `deno test` en `supabase/functions/tests/` | `ai-proxy` con proveedores mockeados | rechaza sin JWT; aplica rate limit; enruta cada tarea a su modelo; **nunca persiste la imagen** |
| **Smoke E2E** | Maestro en EAS (`maestro` job, simulador iOS) | `maestro/flows/smoke.yaml` y un flujo por función central | pasa en cada PR que cambie lo nativo y en cada merge a `main` |
| **Evals de IA** | Promptfoo, `eval/promptfooconfig.yaml` | las 200 fotos (locales, fuera de git) | **precisión de `seguro` > 95 %** para aceptar cualquier cambio de prompt, modelo o guía de cámara |
| **Salud** | `npx expo-doctor`, `knip` | todo | 0 errores. `knip` avisa en Fase 0–1 y bloquea desde Fase 2 |
| **Interfaz** | ESLint (tokens, textos, a11y) + `scripts/contraste.ts` + Maestro `galeria.yaml` con capturas | `src/ui/**`, `src/app/**` | Detalle en [`diseno.md`](diseno.md) §4. Sin colores a mano, sin texto literal, AA en todos los pares, capturas revisadas a ojo |

### Property-based testing en el motor

El motor es funciones puras: entra un objeto, sale un objeto. Eso permite probar
**propiedades**, no solo ejemplos. Con `fast-check`, cada función tiene al menos una
propiedad que se cumple para miles de entradas aleatorias:

- `listaDeMercado` nunca devuelve una cantidad negativa.
- `redondear` es idempotente (`redondear(redondear(x)) === redondear(x)`) y monótona.
- `fusionarEscaneo` nunca devuelve un ingrediente que no estaba ni en el inventario ni en lo detectado.
- `recetasConLoQueHay` nunca devuelve una receta con un ingrediente fuera de `seguro ∪ despensa`.
- `escalarReceta` con `porciones = 1` devuelve las cantidades originales.

Si una propiedad falla, `fast-check` devuelve **el caso mínimo** que la rompe. Eso es un
test de regresión gratis.

### Tests que registran bugs conocidos

Un bug encontrado pero no arreglado se escribe como test con `test.failing`, con un
comentario que dice qué está mal y en qué fase se arregla. Así el gate queda verde hoy,
y el día que se arregla el test **pasa a rojo por haberse vuelto verde**, obligando a
quitar el `.failing`. El bug queda registrado como código, no como nota.

---

## 4 · Definition of Done · por PR

Un PR está listo cuando cumple **todo** esto. No hay "casi".

1. CI verde: capas 3 y 4.
2. Tests nuevos para lo nuevo. Test de caracterización **antes** de tocar un bug.
3. Ninguna regla de `CLAUDE.md` rota. Si hubo que tomar una decisión nueva, está en `docs/decisiones.md` con fecha.
4. Feature incompleta → detrás de un flag apagado.
5. Sin `any` sin comentario que lo justifique. Sin `console.log` (ESLint lo bloquea; se usa `src/lib/log.ts`).
6. Si tocó lo nativo (plugin, dependencia nativa, `app.config.ts`): el fingerprint cambió → build de simulador + Maestro pasaron.
7. La descripción del PR dice **qué, por qué y cómo se probó**. "Cómo se probó" no puede ser "corrí los tests" — dice qué se miró en el iPhone.
8. **Veredicto `APROBADO` del revisor** (`.claude/agents/revisor.md`) pegado en la descripción del PR. Decisión #37.
9. **Entrada en `docs/bitacora.md`** y `docs/estado.md` actualizado, en el mismo PR. Decisión #36.
10. El paso fue **aprobado por Luciano antes de empezar** («adelante» explícito). Decisión #34.

---

## 5 · Que la app esté funcionando todo el tiempo

Los gates evitan romper. Esto detecta y repara lo que igual se rompió.

### Observabilidad

- **Sentry** desde Fase 0. Crashes y errores de JS. Source maps automáticos en EAS Build; en `eas update` los sube un script en el workflow (no es automático).
- **PostHog** desde Fase 1. Eventos **sin PII**: `nunca` nombres, objetivos, comensales ni ingredientes concretos. Sí: `foto_tomada`, `recetas_mostradas {n}`, `receta_elegida {posicion}`, `tiempo_foto_a_recetas_ms`.
- **Coste de IA por request** logueado desde el proxy: tarea, modelo, tokens, ms, cache hit. Es la métrica que decide si el sistema escala.

### Feature flags

- **Fase 0–1:** locales, en `src/config/flags.ts`, leídos de `EXPO_PUBLIC_FLAG_*`.
- **Fase 2+:** PostHog feature flags, para apagar la nevera en remoto sin build si el proxy se cae o el modelo empeora.
- Regla: **cada función nueva nace con flag.** Se quita el flag cuando lleva dos releases encendida sin incidentes.

### EAS Update y rollouts

- `runtimeVersion: { policy: 'fingerprint' }`. Un update de JS **nunca** llega a un binario cuyo código nativo no coincide. Esto elimina la clase entera de "la app abre en blanco tras un update".
- Cada update sale con `rollout_percentage` (10 % → 50 % → 100 %) y se mira Sentry entre pasos.
- Rollback = republicar el update anterior en la misma rama. Es un comando, no un build.

### Umbrales que detienen un rollout

| Métrica | Umbral |
|---|---|
| Crash-free users | < 99,8 % |
| p95 de arranque en frío | > 3 s |
| Error rate del proxy | > 2 % |
| Foto → recetas p95 | > 8 s |

### Resistencia sin red

La app se usa en supermercados y cocinas con mala cobertura. **Plan, lista de mercado,
receta en curso e inventario viven en SQLite y se muestran sin red.** Solo la foto de la
nevera, la factura y el asistente necesitan conexión, y lo dicen honestamente cuando no
la hay ("Sin conexión: puedo mostrarte tu lista, pero no leer la nevera").

### Health check

`GET /functions/v1/ai-proxy/health` → `200 { ok: true, modelos: [...] }`. Lo llama CI
contra Supabase local y lo llama la app al arrancar para decidir si enciende la nevera.

---

## 6 · Reglas para trabajar con Claude Code

Complementan la sección "Cómo trabajar conmigo" de `CLAUDE.md`.

- **Una feature = una rama = un PR.** Nunca refactor y feature en el mismo PR.
- Claude corre `npm run gates` antes de decir que algo está listo. Si no lo corrió, lo dice.
- **Prohibido `--no-verify`.** Si un hook estorba, se arregla el hook.
- Un `test.skip` lleva comentario con motivo y fecha. CI falla si encuentra `.only`.
- Cuando una tarea parece requerir romper una regla de `CLAUDE.md`, Claude **para y pregunta**. No busca el atajo.
- Cuando algo no funciona, se dice. "No lo he corrido en el iPhone" es una frase válida y obligatoria cuando es verdad.

---

## 7 · Comandos

Todos en `package.json`. Los que empiezan por `supabase:` necesitan Docker levantado.

| Comando | Qué hace |
|---|---|
| `npm run gates` | typecheck + lint + test + depcruise. **El que corres antes de decir "listo".** |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint. `-- --fix` para arreglar formato |
| `npm run test` / `test:watch` | Jest. El watch se deja abierto todo el día |
| `npm run test:coverage` | Jest con cobertura; falla si el engine baja de 100/95 |
| `npm run arquitectura` | Reglas de arquitectura (era `depcruise`, ver #53) |
| `npm run codigo-muerto` | Código y dependencias muertas (era `knip`, ver #53) |
| `npm run secrets:bundle` | `expo export` + grep de secretos en el bundle |
| `npm run db:generate` | Drizzle genera la migración SQL desde `src/db/schema.ts` |
| `npm run db:test` | Aplica migraciones en `better-sqlite3` y corre los tests de datos |
| `npm run supabase:test` | `supabase start` + `db reset` + `test db` + `db lint` + `deno test` |
| `npm run eval` | Promptfoo contra las 200 fotos (Fase 2+; cuesta dinero, pide confirmación) |

---

## 8 · Evidencia de que los gates funcionan

Al terminar la Fase 0 se hace esta prueba **y se anota aquí el resultado con fecha**:

1. Rama `test/gate-rojo`. Se rompe un test del motor a propósito.
2. Se abre PR. CI debe quedar rojo y el botón de merge, bloqueado.
3. Se arregla el test. CI verde. Se mergea.
4. Se anota: fecha, tiempo de CI, tiempo de EAS, y capturas.

| Fecha | Resultado | CI | EAS | Notas |
|---|---|---|---|---|
| 2026-09-10 | **mitad probada** | 1m14s | — | PR #10. El CI se pone rojo. |
| 2026-09-10 | **superada, entera** | 52s | — | PR #13, con `main` protegida. |

### 2026-09-10 · primera prueba, y qué mitad quedó sin probar

**Lo que se hizo.** Rama `test/gate-rojo` con `redondearParaComprar` devuelto a
`Math.floor`, o sea BUG-9 reintroducido. Se empujó **con `--no-verify` a propósito**: el
enganche de pre-push lo habría parado en local, y el punto de la prueba es justamente que
un enganche local se puede saltar y el CI no. PR #10.

**Resultado.** El CI se puso rojo en **1m14s**, en el paso `tests y cobertura`, y nombró
los cinco tests que caen: el registro de BUG-9, tres casos de `redondearParaComprar` y el
de `listaDeMercado`. Los otros dos checks siguieron en verde — `supabase` (2m56s) y
`secretos` (11s) — que es lo correcto: el fallo era del motor, no de la base ni de los
secretos. Un CI que pusiera todo en rojo ante cualquier fallo diría mucho menos.

El PR se cerró sin mergear y la rama se borró.

**Lo que NO se pudo probar, y es la mitad que de verdad protege.** El paso 2 de la lista
dice «el botón de merge, bloqueado». **No lo estaba.** GitHub no permite proteger ramas en
repositorios privados con cuenta gratuita (decisión #54), así que el PR #10 se podía
mergear en rojo perfectamente; simplemente no se hizo.

Distinguir las dos mitades importa:

- **Probado:** el CI detecta lo roto, corre en una máquina limpia, y dice con precisión
  qué falló y dónde.
- **Sin probar, y sin poder probarse hoy:** que el merge quede bloqueado, y que un
  `git push` directo a `main` sea imposible.

Mientras la #54 siga abierta, **la última barrera es la disciplina de una persona**, que es
exactamente lo que la Fase 0 existe para no necesitar. Esta prueba se repite entera — y
esta tabla se rellena de verdad — el día que `npm run reglas:rama` pueda aplicarse.

**La columna de EAS queda vacía**: los builds y Maestro llegan en D7.

### 2026-09-10, más tarde · segunda prueba: la mitad que faltaba

Luciano hizo el repositorio **público**, con lo que la protección de rama dejó de estar
bloqueada por el plan de GitHub (decisión #54). `npm run reglas:rama` aplicó el ruleset y
la prueba se repitió entera.

**1 · Push directo a `main`.** Se hizo un commit en `main` y se intentó empujar, con
`--no-verify` para saltarse también el enganche local:

```
remote: - 3 of 3 required status checks are expected.
 ! [remote rejected] main -> main (push declined due to repository rule violations)
```

**Rechazado.** Este era el agujero más grande que podía tener el proyecto: los gates no
corren en lo que no pasa por un PR.

**2 · Merge de un PR en rojo.** Rama `test/gate-rojo-2`, con `redondearParaComprar`
devuelto a `Math.floor` otra vez. CI rojo en **52 s** (`gates` falla; `supabase` y
`secretos` siguen en verde, que es lo correcto). Y al intentar mergear de verdad:

```
X Pull request #13 is not mergeable: the base branch policy prohibits the merge.
```

**Bloqueado.** El PR se cerró sin mergear y la rama se borró.

**La salida de emergencia que sigue existiendo, dicha en voz alta.** `gh pr merge --admin`
puede saltarse la regla, porque Luciano es administrador del repo. Eso es deliberado y no
se puede quitar sin dejar de ser dueño del repositorio. La diferencia con antes es que
**ahora hay que escribir `--admin`**: saltarse el gate pasó de ser lo que ocurre por
descuido a ser un acto consciente que queda escrito en el historial del PR.

**Las dos mitades comprobadas.** Con esto, `main` solo se toca por PR y solo en verde.
