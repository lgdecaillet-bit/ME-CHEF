# Estado · ME CHEF

> **El tablero.** Dónde está el proyecto ahora mismo. Se lee en 30 segundos, al abrir
> cualquier sesión, antes de hablar. Se actualiza al tomar y al cerrar cada tarea.
> Historial completo en [`bitacora.md`](bitacora.md). Por qué se decidió cada cosa en
> [`decisiones.md`](decisiones.md). Qué hay que construir en [`fases/`](fases/).

Actualizado: 2026-09-09 · por sesión S-20260909-g

| | |
|---|---|
| **Fase actual** | 0 · Fundaciones y barreras ([fase-0-fundaciones.md](fases/fase-0-fundaciones.md)) |
| **Paso actual** | D3 **mergeado** (PR #4, `72a0d1a`). En curso: `fix/F1-motor-cuatro-bugs`, adelanto de Fase 1 |
| **Decisiones vigentes** | hasta **#49** |
| **Modo de trabajo** | **un solo agente** hasta cerrar Fase 0 (decisión #38) |
| **Rama de trabajo** | `fix/F1-motor-cuatro-bugs` — espera merge. D4 sale de `main` |
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
| S-20260909-d | D1 · chore/bootstrap | cerrada |
| S-20260909-e | D2 · tooling de calidad | cerrada |
| S-20260909-f | D3 · tests del motor | cerrada |
| S-20260909-g | arreglo de BUG-1, 4, 5 y 7 (adelanto de Fase 1) | abierta |

## Tareas tomadas

| Tarea | Rama | Sesión | Desde | Estado |
|---|---|---|---|---|
| D0.5 · memoria del proyecto | `main` (solo docs, pre-Git-flow) | S-20260909-a | 2026-09-09 | **hecha** |
| Arreglo de BUG-1, 4, 5 y 7 | `fix/F1-motor-cuatro-bugs` | S-20260909-g | 2026-09-09 | en revisión, espera merge |

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
| D1 | `chore/bootstrap`: migrar starter a `michef/`, limpiar scaffold | Claude | ✅ mergeado (PR #1, `2ba0d81`) |
| D2 | Tooling: ESLint, Prettier, Husky, commitlint, depcruise, knip, gitleaks, Jest | Claude | ✅ mergeado (PR #2 y #3) |
| D3 | Tests del motor, 7 bugs como `test.failing` | Claude | ✅ mergeado (PR #4, `72a0d1a`) |
| D4 | Supabase como código: migraciones, RLS, pgTAP, esqueleto `ai-proxy` | Claude | ⏳ espera presentación + «adelante» |
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

- ~~El enganche de pre-commit no revisa secretos~~ **Diagnosticado mal y corregido el
  mismo día.** Los commits de las sesiones de Claude imprimían «gitleaks no está
  instalado» y pasaban sin revisar. La primera explicación escrita aquí fue que winget
  no había dejado el ejecutable en el PATH. **Era falsa**, y comprobarla antes de
  arreglar nada fue lo que lo destapó: el registro (`HKCU:\Environment`) ya contenía la
  carpeta, y un proceso nuevo que relee el PATH encuentra `gitleaks.exe` sin tocar nada.
  - **La causa real:** una terminal hereda la lista de programas que había al abrirla.
    La sesión de Claude arrancó antes de que Luciano instalara gitleaks, así que sus
    procesos hijos — y con ellos el enganche — nunca lo vieron. **En la terminal de
    Luciano el enganche sí funciona.** No hay nada que instalar ni que configurar: se
    cierra y se abre la terminal.
  - Lección, que vale para D4 y D5 igual: «la herramienta no está» y «este proceso no
    la ve» se parecen mucho y se arreglan distinto. Antes de escribir una causa, hay que
    comprobarla; escribir la equivocada en `estado.md` habría mandado a Luciano a
    reconfigurar algo que ya estaba bien.
  - **Lo que sí quedó verificado, y era lo importante:** `gitleaks git` sobre los 10
    commits del repo → **no leaks found**. El árbol de trabajo da 573 hallazgos, 572 en
    `research/` (ignorado, 2,6 GB de datos crudos) y **uno** en `michef/.env`, que está
    sin seguir por git e ignorado por `michef/.gitignore:47`. Es exactamente donde debe
    estar una clave. **Nada se ha filtrado.**
  - Pendiente real, pequeño: que las sesiones de Claude corran el enganche con el PATH
    al día. Hasta D5 (CI), el respaldo es correr `gitleaks git` a mano antes de un PR.

- **D1 no empieza** hasta que Luciano reporte D0 verificado (0.1–0.9) y diga «adelante» a D1.
- ~~Nada está commiteado~~ **Resuelto el 2026-09-09:** `a5bfa0c` en `origin/main` con
  `michef/` y `michef-starter/`; `research/` fuera por `.gitignore` (decisión #43).

---

## Avisos entre sesiones

(vacío)

---

## Siguiente paso concreto

1. ~~Primer commit en `main`~~ hecho: `a5bfa0c` (sesión c). `research/` fuera.
2. ~~D1 `chore/bootstrap`~~ **mergeado**: Luciano verificó «ME CHEF» en Expo Go, se hizo
   squash merge en `main` (`2ba0d81`) y se borró la rama.
3. ~~D2 tooling~~ mergeado (PR #2), más el arreglo del mensaje del hook (PR #3).
   gitleaks 8.30.1 instalado y probado.
4. ~~D3 tests del motor~~ **mergeado** (PR #4, `72a0d1a`) tras dos vueltas de revisión.
5. ~~¿Por qué se dejan los bugs sin arreglar?~~ Luciano lo preguntó y la respuesta honesta
   partió los siete en dos (decisión #49). Rama `fix/F1-motor-cuatro-bugs`: BUG-1, 4, 5
   y 7 arreglados, **171 tests**, cobertura 100 %. El revisor devolvió `CAMBIOS` — la
   alergia había quedado como parámetro opcional, o sea con el mismo agujero que decía
   cerrar — y encontró **BUG-8**, que ya está registrado. Corregido todo. Espera merge.

   **Decisión que le toca a Luciano:** BUG-8 y BUG-9 son los dos arreglos más baratos que
   quedan. BUG-9 es un `Math.ceil`. BUG-8 necesita antes decidir la forma del inventario.
6. Claude presenta **D4** (`chore/supabase`): `supabase init`, migración 0001 con el
   esquema actual, migración 0002 con **RLS en todas las tablas**, tests pgTAP que
   comprueban que `anon` NO puede escribir en `precio` ni leer `cache_modelo`, esqueleto
   del `ai-proxy` (401 sin JWT, 200 en `/health`, 501 en cualquier tarea) con `deno test`,
   y el script `npm run supabase:test`. No se ejecuta nada sin «adelante» (#34).

   **Aviso para D4, de la decisión #47:** una política RLS que no deniega nada se ve
   exactamente igual que una que funciona. Los tests pgTAP tienen que incluir el caso
   negativo (intentar escribir y comprobar que falla), no solo el positivo.

Propuesto aparte, dos minutos, cuando Luciano quiera: **regla de rama básica en `main`**
(solo PRs, sin push directo, sin force-push). No depende de que exista CI; los checks
requeridos se añaden en D5.

**Lo que tiene que hacer Luciano para cerrar D2:**

```powershell
winget install Gitleaks.Gitleaks
```

Sin él, el enganche de pre-commit avisa y deja pasar. El CI lo revisará igual en D5,
pero entonces el aviso llega tarde y con un PR abierto.

Abierto, sin urgencia:
- El casing del nombre quedó en versales, `ME CHEF`, 1.059 veces en prosa. Si se prefiere
  `Me Chef`, es un reemplazo de un comando.
- En D4, no arrancar el contenedor `teso-dev-db`: publica el puerto 54322, el mismo que
  usa el Postgres local de Supabase.
- En D6, verificar si `@sentry/wizard` necesita `SENTRY_URL=https://de.sentry.io` por ser
  la organización de región EU.
- ~~Node 22.12.0 y metro pide `^22.13.0`~~ **Resuelto el 2026-09-09:** `fnm` ya estaba en
  la máquina, así que se instaló **Node 22.23.2** (última LTS de la línea Jod) y quedó
  por defecto. npm pasó a 10.9.8. Sin `EBADENGINE`. Se eligió la línea 22 y no la 24,
  aunque fnm ya tenía 24.15.0, para no cambiar de major mientras entra `better-sqlite3`
  en D2 (módulo nativo). **En D5, `actions/setup-node` debe fijar `22.23.2`.** Queda
  para D2 decidir si se añade `.node-version` al repo para que fnm y CI lean lo mismo.
- ~~`.gitattributes`~~ y ~~`.node-version`~~ hechos en D2. Las versiones del scaffold
  siguen con `~`: se fijarán cuando una dé un problema, no antes. Todo lo instalado en
  D1 y D2 sí está fijado exacto.
- Decisiones nuevas registradas en D2: **#44** ESLint 9 hasta que Expo suba sus plugins ·
  **#45** documentos fuera de Prettier · **#46** se aceptan las 18 moderadas de Expo ·
  **#47** cada regla necesita un fixture que la viole.
- ~~`inventory.ts` con `ahora: Date = new Date()`~~ cubierto en D3: los tests pasan la
  fecha siempre, y hay dos que ejercitan el valor por defecto a propósito. Fase 1 sigue
  debiendo quitar el default.
- **De los 7 bugs del motor, 4 están arreglados y 3 siguen registrados**
  (decisión #49). Viven en `src/engine/__tests__/bugs.test.ts`.
  - **Arreglados:** BUG-1 (la foto perdía lo que no contaba), BUG-4 (las filas
    repetidas del inventario), BUG-5 (las alergias no llegaban al filtro) y BUG-7
    (el campo que decía «por porción» y traía el total). Sus tests ya no son
    `.failing`: son tests de regresión normales.
  - **Abiertos, como `.failing`:** BUG-2 y BUG-3 necesitan un catálogo de
    ingredientes con unidad canónica y densidad; BUG-6 necesita una frontera donde
    validar. Sin esos datos, arreglarlos sería inventarse las conversiones.
  - Al arreglar uno, su test se pone rojo con «Failing test passed»: hay que
    quitarle el `.failing`.
- **ESLint: siete reglas de `import/*` apagadas** en D3, registrado como **decisión
  #48**. Tres de ellas (`no-duplicates`, `no-named-as-default`,
  `no-named-as-default-member`) son de estilo y **no las cubre nadie**: se pierden a
  sabiendas. Revisar junto con #44 al subir de SDK.
- **Casos límite del motor sin validar, caracterizados en D3:** un `factorPorcion` NaN
  o negativo pasa tal cual y contamina la lista de mercado; `redondear(NaN)` da NaN;
  `escalarReceta` con porciones negativas da cantidades negativas. Hay tests que fijan
  ese comportamiento para que el cambio de Fase 1 (zod en la frontera) sea deliberado.
- **Dos bugs nuevos, registrados y sin arreglar. Esperan «adelante» (#34).**
  - **BUG-8**, el más grave de los dos: `fusionarEscaneo` y `descontarCocinado`
    llevan el mismo `new Map` con claves repetidas que tenía BUG-4. Medido: seis
    huevos de factura más seis de escaneo quedan en **seis** al sacar una foto, y
    en cuatro al cocinar dos. Sacar una foto de la nevera borra inventario real.
    Lo encontró el revisor mirando el arreglo de BUG-4. **Antes de arreglarlo hay
    que decidir** si el inventario se normaliza a una fila por (ingrediente,
    unidad, origen).
  - **BUG-9**: `redondear` va al más cercano, y la lista de mercado lo aplica a
    la cantidad a comprar: si hacen falta 12, manda a comprar 10. Debería ir
    hacia arriba — quedarse corto obliga a volver a la tienda. Técnicamente es un
    `Math.ceil`; falta el «adelante» porque cambia números que ve el usuario.
- **Límite conocido, sin registrar como bug:** `LineaMercado.cantidadEnCasa` es un
  `number`, así que un ingrediente que está pero sin cantidad conocida sale como
  `0`. El número a comprar es correcto; el «0» es una media verdad que llegará a
  la pantalla de Fase 3 («tienes 0 g de arroz» sobre un arroz que está en la
  despensa). Decidir en Fase 3, al diseñar esa pantalla, antes de pintar la cifra.
- **Ningún líquido visto en la foto descuenta hoy de la lista de mercado.** Es
  consecuencia de BUG-2 (todo entra en gramos) más el arreglo de BUG-4 (la clave
  lleva la unidad). No inventa nada y por eso se acepta, pero sube la prioridad
  de BUG-2. Anotado también en su registro.

---

## Regla permanente · `COMANDOS.md`

En la raíz del repo (`../../COMANDOS.md`) hay una chuleta de comandos para Luciano, que
no escribe comandos de memoria. **Cada vez que un paso introduzca un comando nuevo que
Luciano vaya a correr, se añade allí**, con qué hace y cuándo se usa, antes de dar el
paso por cerrado. Si un comando no está en ese archivo, para Luciano no existe.

Pendiente de añadir cuando existan: `npm run gates` (D2), `npm run supabase:test` (D4),
`eas build` y `eas update` (D6–D7).

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
