# ME CHEF

App iOS que resuelve la fatiga de decidir qué comer. Le tomas una foto a la
nevera y en segundos tienes tres recetas con lo que hay.

**Estado:** Fase 0 · Fundaciones y barreras. No hay producto todavía: hay un sitio
seguro donde construirlo. La app abre en Expo Go con la pantalla de inicio y una
galería del sistema de diseño (solo en desarrollo). El estado vivo, siempre al día,
está en [`docs/estado.md`](docs/estado.md).

---

## Qué documento manda

Cada cosa tiene un solo sitio. Si dos documentos se contradicen, manda el de esta tabla.

| Pregunta | Documento |
|---|---|
| Qué es el producto, su backend y su stack | [`docs/producto.html`](docs/producto.html) (se abre en el navegador) |
| Las reglas que no se rompen | [`CLAUDE.md`](CLAUDE.md) — se lee entero antes de tocar código |
| Qué se decidió y por qué | [`docs/decisiones.md`](docs/decisiones.md), numeradas y fechadas |
| Dónde está el proyecto hoy | [`docs/estado.md`](docs/estado.md) |
| Qué se hizo en cada sesión | [`docs/bitacora.md`](docs/bitacora.md) |
| El plan completo y cuándo hace falta Apple | [`docs/roadmap.md`](docs/roadmap.md) |
| Qué hay que construir en cada fase, con su criterio de salida | [`docs/fases/`](docs/fases/) |
| Cómo se verifica que nada está roto | [`docs/protocolos-calidad.md`](docs/protocolos-calidad.md) |
| El sistema de diseño | [`docs/diseno.md`](docs/diseno.md) |
| Los comandos del día a día, para copiar y pegar | [`../COMANDOS.md`](../COMANDOS.md) |

---

## Expo Go hasta la Fase 5

Se desarrolla en **Windows**, sin Mac, y se prueba en el iPhone con **Expo Go**. Así
se trabaja hasta la Fase 5 (decisiones #27 y #62): **no se paga la licencia de Apple
hasta que el producto funcione en Expo Go.** Expo Go es el entorno de desarrollo,
nunca el destino final.

Cinco piezas no funcionan en Expo Go y quedan aplazadas hasta que haya licencia y
development build:

1. el cifrado de la base del teléfono (SQLCipher);
2. Sign in with Apple contra Supabase (tampoco Google: mientras tanto, la cuenta va
   por correo);
3. la Live Activity de la cocina;
4. la ejecución en segundo plano;
5. TestFlight.

**La app no llega a ninguna persona que no sea Luciano** hasta que haya licencia,
development build y cifrado encendido y verificado. En Expo Go los datos del teléfono
van sin cifrar. La barrera se levanta en el paso 5.9, TestFlight interno.

Los builds para el smoke de iOS no necesitan licencia: se compilan para el simulador
en las máquinas Mac de GitHub (decisión #61).

---

## Puesta en marcha en Windows

Todo se corre desde **`michef/`**, que es donde vive la app. En la raíz del repo están
`COMANDOS.md` y los workflows de GitHub. Los comandos son de PowerShell.

### 0 · Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | **22.23.2**, la que fija [`.node-version`](.node-version) (con `fnm`) | todo. El CI lee el mismo archivo |
| Git y `gh` | — | ramas y PRs |
| Docker Desktop | — | solo para la base de datos local |
| gitleaks | 8.30.1 o superior (`winget install Gitleaks.Gitleaks`) | que el `pre-commit` busque secretos |
| Expo Go | la de la App Store | ver la app en el iPhone |

Cuentas: expo.dev (`lucogav8`), supabase.com, sentry.io y GitHub. **Ninguna de Apple.**

### 1 · Instalar

```powershell
cd michef
npm ci --ignore-scripts
npm run prepare
```

**Por qué no un `npm ci` a secas.** `better-sqlite3` (solo para tests) no publica un
binario para esta versión e intenta compilarse, y en Windows sin Visual Studio falla.
`--ignore-scripts` lo evita, pero también se salta los enganches de git; por eso va
`npm run prepare` después. Sin ese paso, el `pre-commit` y el `pre-push` no existen y
nada avisa. Se comprueba así, y debe decir `michef/.husky/_`:

```powershell
git config core.hooksPath
```

En el CI (Ubuntu) `better-sqlite3` se compila solo y se usa `npm ci` normal.

### 2 · Variables de entorno

```powershell
Copy-Item .env.example .env
```

Solo hay que pegar **una** línea, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, y conviene pegar el
DSN de Sentry. El resto viene puesto. [`.env.example`](.env.example) explica dónde está
cada valor y qué **nunca** va ahí: los tokens de CI, la `service_role` y cualquier key de
un modelo. Si falta una variable obligatoria, la app no arranca y la pantalla dice cuál.

### 3 · Ver la app en el iPhone

```powershell
npx expo start
```

Se escanea el QR con la cámara del iPhone, que abre Expo Go. Con el PC y el iPhone en la
misma WiFi; si no conecta, `npx expo start --tunnel`. La app recarga sola al guardar.

### 4 · La base de datos compartida, en local

Con Docker Desktop abierto:

```powershell
npm run supabase:start     # levanta Postgres y aplica las migraciones
npm run supabase:test      # pgTAP y proxy: comprueba que los candados deniegan lo que deben
npm run supabase:stop      # cuando termines
```

Las tablas se ven en http://localhost:54323. El esquema son migraciones versionadas en
`supabase/migrations/`: **no se pega SQL a mano en el panel.** Sin la migración de RLS,
la clave que viaja dentro de la app podría escribir precios y leer el caché de modelos.

`deno` no hace falta: `scripts/probar-supabase.js` lo corre en un contenedor si no lo
encuentra.

---

## Cómo se verifica

**Un solo comando antes de decir que algo está listo:**

```powershell
npm run gates
```

Corre, en orden: `typecheck`, `lint`, `arquitectura` (dependency-cruiser), `reglas` (que
cada regla de arquitectura dispara sobre un fixture que la viola, #47) y `test` (Jest con
cobertura). Para un solo archivo de tests: `npx jest src/engine/__tests__/portions.test.ts`.

Fuera de `gates`, porque tardan o necesitan Docker: `npm run supabase:test`,
`npm run doctor` (expo-doctor, que perdona solo el tercer número, #63),
`npm run secrets:bundle` y `npm run codigo-muerto` (knip).

Las barreras, de la más rápida a la más lenta (detalle en
[`protocolos-calidad.md`](docs/protocolos-calidad.md) § 1):

| Capa | Cuándo | Qué |
|---|---|---|
| `pre-commit` | cada commit | lint-staged (ESLint y Prettier) y gitleaks sobre lo staged |
| `commit-msg` | cada commit | commitlint valida el formato del mensaje |
| `pre-push` | cada push | `npm run gates` |
| CI · `gates` | cada PR | lo anterior, más expo-doctor, secretos en el bundle y knip (este solo avisa) |
| CI · `supabase` | cada PR | migraciones desde cero, pgTAP, `db lint` y `deno test` del proxy |
| CI · `secretos` | cada PR | gitleaks sobre el historial completo |
| CI · `smoke-ios` | cada PR que no sea solo documentos | build de simulador en un Mac de GitHub y Maestro abre la app ([`maestro/flows/smoke.yaml`](maestro/flows/smoke.yaml)). Todavía no es obligatorio (#61) |

`main` está protegida: no acepta push directo y un PR en rojo no se puede mergear
(#54). **Nada entra en rojo, sin `--no-verify` y sin `gh pr merge --admin`** (#55). Si un
enganche estorba, se arregla el enganche.

El mensaje de commit sigue el formato `tipo: qué hiciste` (`feat`, `fix`, `docs`,
`chore`, `test`, `refactor`…); lo valida commitlint.

---

## Mapa del repo

```
ME-CHEF/
  README.md                  una línea; el README de verdad es este
  COMANDOS.md                la chuleta de comandos de Luciano
  .github/workflows/         ci (gates + supabase), gitleaks, smoke-ios, eval (vacío hasta Fase 2)
  michef/                    la app: todo se corre desde aquí
    CLAUDE.md                reglas del proyecto
    app.config.ts            identidad de la app (com.mechef.app, dueño lucogav8) y Sentry
    docs/                    la memoria del proyecto (ver «Qué documento manda»)
    src/
      app/                   pantallas (expo-router); (dev)/galeria solo en desarrollo
      ui/                    sistema de diseño: tokens, tema, contraste y 11 componentes base
      engine/                motor determinista — sin IA, sin red, funciones puras
        portions.ts          escalar recetas al hogar
        groceries.ts         lista de mercado = necesario − inventario
        inventory.ts         fusión de escaneo y factura con el inventario
        coverage.ts          tres recetas con lo que hay
        __tests__/bugs.test.ts   los bugs conocidos: pendientes como it.failing, arreglados como regresión
      ai/                    cliente que llama al proxy, nunca a los modelos
      db/schema.ts           datos personales (SQLite en el teléfono)
      config/                env.ts (zod) y flags.ts: se validan al arrancar
      lib/                   log y Sentry con filtro de datos personales
      i18n/                  textos de la interfaz (es.ts) y t()
    supabase/
      migrations/            el catálogo compartido y sus candados RLS
      tests/database/        pgTAP: que `anon` NO pueda lo que no debe
      functions/ai-proxy/    proxy de modelos, en Deno: aquí viven las keys
    scripts/                 doctor, reglas, secretos del bundle, supabase, reglas de rama
    maestro/flows/           el smoke de iOS
    eval/                    harness de las 200 fotos (Promptfoo, Fase 2)
    .claude/agents/revisor.md   el revisor que aprueba cada PR
```

`supabase/functions/` es Deno: queda fuera de `tsconfig`, ESLint y knip a propósito, y
lo revisa `deno test`.

---

## Reglas que no se rompen

Están todas en [`CLAUDE.md`](CLAUDE.md). Las tres que más se olvidan:

1. Ninguna API key de modelo en la app. Todo por el proxy.
2. `src/engine/` nunca importa de `src/ai/`.
3. Una receta a partir de una foto solo usa ingredientes `seguro` más la despensa
   básica. Nunca inventar.
