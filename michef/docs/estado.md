# Estado · ME CHEF

> **El tablero.** Dónde está el proyecto ahora mismo. Se lee en 30 segundos, al abrir
> cualquier sesión, antes de hablar. Se actualiza al tomar y al cerrar cada tarea.
> Historial completo en [`bitacora.md`](bitacora.md). Por qué se decidió cada cosa en
> [`decisiones.md`](decisiones.md). Qué hay que construir en [`fases/`](fases/).

Actualizado: 2026-09-10 · por sesión S-20260910-a

| | |
|---|---|
| **Fase actual** | 0 · Fundaciones y barreras ([fase-0-fundaciones.md](fases/fase-0-fundaciones.md)) |
| **Paso actual** | **D6.5b en el PR #18** (revisor APROBADO en la tercera vuelta; Luciano lo revisó en el iPhone y le gustó). Falta el CI en verde y que Luciano confirme la #59 |
| **Decisiones vigentes** | hasta **#59** |
| **Modo de trabajo** | **un solo agente** hasta cerrar Fase 0 (decisión #38) |
| **Rama de trabajo** | `feat/F0-D6.5b-componentes` (PR #18) — espera el CI y la confirmación de la #59 |
| **Licencia de Apple** | no. Semana 3 (decisión #28) |

---

## Las dos reglas que gobiernan todo

**1 · Nada se mergea en rojo, y `--admin` no es una salida** (decisión #55, la fija
Luciano). Ningún agente mete nada en `main` que no sea un PR con los tres checks en
verde. Ni `gh pr merge --admin`, ni push directo, ni desactivar un check, ni relajar el
ruleset. Si el CI está rojo: se arregla, o **se para y se avisa**. La protección de rama
no puede impedirlo — un administrador se salta sus propias reglas — así que desde ahí
la barrera es esta regla y nada más.

**2 · Todo paso se aprueba antes de ejecutarse** (decisión #34). Un agente presenta el paso
(archivos, instalaciones con versión, test que lo protege, cómo se verifica), Luciano
dice «adelante», el agente lo hace y reporta qué corrió y qué salió. Aprobar un paso no
aprueba el siguiente.

---

## Sesiones de hoy

Cada sesión anota su ID aquí **antes de hacer nada** (letra siguiente a la última).
Se vacía al cambiar de día.

**2026-09-10**

| Sesión | Ventana / propósito | Estado |
|---|---|---|
| S-20260910-a | D5, la regla #55, D6 · app base, D6.5a · base del sistema de diseño y D6.5b · componentes | abierta |

**2026-09-09** (día anterior, se conserva por trazabilidad)

| Sesión | Ventana / propósito | Estado |
|---|---|---|
| S-20260909-a | planificación + D0.5 | cerrada |
| S-20260909-b | acompañar D0 paso a paso + rename a ME CHEF | cerrada |
| S-20260909-c | primer commit y push a `main` sin `research/` | cerrada |
| S-20260909-d | D1 · chore/bootstrap | cerrada |
| S-20260909-e | D2 · tooling de calidad | cerrada |
| S-20260909-f | D3 · tests del motor | cerrada |
| S-20260909-g | BUG-1/4/5/7 y BUG-9, más D4 | cerrada |

## Tareas tomadas

| Tarea | Rama | Sesión | Desde | Estado |
|---|---|---|---|---|
| D0.5 · memoria del proyecto | `main` (solo docs, pre-Git-flow) | S-20260909-a | 2026-09-09 | **hecha** |
| Arreglo de BUG-1, 4, 5 y 7 | `fix/F1-motor-cuatro-bugs` | S-20260909-g | 2026-09-09 | **mergeada** (PR #5) |
| Arreglo de BUG-9 | `fix/F1-bug9-redondeo-mercado` | S-20260909-g | 2026-09-09 | **mergeada** (PR #7) |
| D4 · Supabase como código | `chore/F0-D4-supabase` | S-20260909-g | 2026-09-09 | **mergeada** (PR #8) |
| D5 · CI y reglas de rama | `chore/F0-D5-ci` | S-20260910-a | 2026-09-10 | **mergeada** (PR #9, #11) |
| D6 · app base | `feat/F0-D6-app-base` | S-20260910-a | 2026-09-10 | **mergeada** (PR #16, `0d4468f`) |
| D6.5a · base del sistema de diseño | `feat/F0-D6.5a-sistema-diseno` | S-20260910-a | 2026-09-10 | **mergeada** (PR #17, `e66df6d`) |
| D6.5b · componentes base | `feat/F0-D6.5b-componentes` | S-20260910-a | 2026-09-10 | PR #18; vista en el iPhone; espera el CI y la #59 |

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
| D4 | Supabase como código: migraciones, RLS, pgTAP, esqueleto `ai-proxy` | Claude | ✅ mergeado (PR #8) |
| D5 | CI GitHub Actions + rulesets + prueba del gate rojo | Claude | ✅ hecho, entero |
| D6 | App base en Expo Go, Sentry, `env.ts`, `flags.ts`, `eas init` | Claude + Luciano | ✅ mergeado (PR #16, `0d4468f`), verificado en el iPhone |
| D6.5a | Base del sistema de diseño: tokens, tema, `Texto`, `es.ts`, galería, reglas de interfaz (decisión #58) | Claude + Luciano | ✅ mergeado (PR #17, `e66df6d`), visto en el iPhone |
| D6.5b | Los 11 componentes base, con `expo-symbols` y `expo-haptics` (decisiones #58 y #59) | Claude + Luciano | 🔨 PR #18, visto en el iPhone; falta el CI y la #59 |
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
      - ~~Verificar en D6 la URL de la región EU~~ **Resuelto en D6:** no se usa el wizard; `app.config.ts` fija `url: 'https://de.sentry.io/'`. Queda un problema con los tokens de organización EU, para D7 (Avisos entre sesiones, #57)
- [x] 0.7 Expo Go en el iPhone
- [x] 0.8 `gh auth status` OK como `lgdecaillet-bit` (permiso ADMIN sobre el repo)
- [x] 0.9 Cuatro secretos en GitHub (verificado con `gh secret list` el 2026-09-09): `EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `SENTRY_AUTH_TOKEN`
- — 0.10 → **movido a D7** (decisión #57, punto 8). `eas init` se hizo en D6; las variables se cargan en EAS con el primer build, que es quien las necesita. No cuenta para cerrar D0.
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

- ~~`main` no está protegida~~ **Resuelto el 2026-09-10.** Luciano hizo el repositorio
  **público**, con lo que la protección de rama dejó de depender del plan de GitHub.
  `main` está protegida y comprobada: un push directo se rechaza, y un PR en rojo no se
  puede mergear (decisión #54, evidencia en `protocolos-calidad.md § 8`).
  - **Consecuencia que conviene no olvidar: todo `docs/` es legible por cualquiera** — el
    roadmap, las 54 decisiones, la estrategia de producto. Es una decisión de negocio,
    tomada a sabiendas. Ningún secreto está expuesto: comprobado con `gitleaks git` sobre
    el historial completo después del cambio.
  - **La salida de emergencia sigue existiendo técnicamente, y queda cerrada por regla:**
    `gh pr merge --admin` se salta la protección, porque Luciano es dueño del repo y eso
    no se puede quitar. **Decisión #55: ningún agente la usa, jamás, por ningún motivo.**
    Si algún día hay que mergear en rojo, lo hace Luciano con su mano y escribe por qué
    en el PR.

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

- **⚠️ En las sesiones de Claude, el enganche de pre-commit NO revisa secretos**: la
  sesión no ve gitleaks en su PATH e imprime «gitleaks no está instalado». En D6 eso
  dejó subir un JWT de ejemplo que el CI paró (check `secretos` en rojo). **Antes de cada
  push, las sesiones de Claude corren gitleaks por su ruta completa**:
  `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gitleaks.Gitleaks_*\gitleaks.exe git --log-opts="main..HEAD" --redact`.
  En la terminal de Luciano el enganche sí funciona.
- **⚠️ Para D7: el build no tendrá las variables de entorno si no se cargan antes en
  EAS.** `.env` está ignorado por git y un build de EAS no lo ve. Sin
  `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `env.ts` para la app al
  arrancar y el smoke de Maestro falla. Cargarlas con `eas env:create` **antes** del primer
  build (decisión #57, punto 8). No se sabe si ya hay alguna cargada: el revisor no pudo
  mirarlo.
- **⚠️ Para D7: los crashes nativos no pasan por el filtro de privacidad.** El SDK de Sentry
  le quita `beforeSend` a la parte nativa, así que un crash nativo sale sin pasar por
  `limpiarEvento` (decisión #57, punto 12). En Expo Go no aplica. En el primer build de
  desarrollo hay que decidir cómo se cubre, y mirar si la parte nativa de iOS manda el
  nombre del dispositivo.
- **⚠️ Para D7: el token de Sentry de GitHub probablemente no sirve para subir mapas de
  código.** La organización `mechef` está en la región EU, y los tokens de organización
  creados ahí llevan dentro la dirección de EE. UU.: `sentry-cli` la usa por encima de
  `SENTRY_URL` y la subida falla con `401 Invalid org token`
  (getsentry/sentry-cli#3385). La salida reconocida es un **token personal** con
  `SENTRY_URL=https://de.sentry.io`. No afecta a D6: Expo Go no sube nada. Se comprueba
  con el primer build de D7 y, si falla así, Luciano crea el token personal y reemplaza
  el secreto (decisión #57, punto 4).
- **`eas` no está en la terminal de Luciano con Node 22.23.2.** Se instaló cuando usaba
  22.12.0, y cada versión de Node tiene sus propios programas globales. Las sesiones de
  Claude lo corren por ruta completa
  (`%APPDATA%\fnm\node-versions\v22.12.0\installation\eas.cmd`). Para Luciano:
  `npm install -g eas-cli`, una vez (está en `COMANDOS.md` § 7). Las instalaciones
  globales las corre él.
- **`eas` tiene dos cuentas en esta máquina: `lucogav8` y `tes0` (TESO).**
  `app.config.ts` fija `owner: 'lucogav8'` para que nada de ME CHEF acabe en la de TESO.
  No quitarlo.

- **Supabase local se queda encendido** después de D4 y consume memoria. Se apaga con
  `npm run supabase:stop`. No hace falta para nada que no sea `supabase:test`.
- **`deno` no está instalado** y no hace falta: `scripts/probar-supabase.js` lo corre en
  un contenedor si no lo encuentra. En D5, el CI sí usará `denoland/setup-deno`.
- **⚠️ Antes de escribir la primera tarea del proxy (Fase 2), comprobar cómo firma
  Supabase los JWT del proyecto.** `jwt.ts` verifica HS256 con un secreto compartido.
  Supabase emite JWT con **claves asimétricas** (ECC/RSA) en los proyectos nuevos, y si
  `npswkfpomhinewxsmiic` es de esos, esa verificación no sirve: haría falta JWKS. No se
  pudo comprobar en D4 porque no se enlazó con el proyecto real, a propósito. Lo levantó
  el revisor y es lo primero que hay que mirar. Se ve en Settings → API → JWT Settings.
- **El proxy no se ha probado de punta a punta.** Todo lo que se sabe de él viene de
  llamar a `manejar()` como función, que es lo que hace `deno test`. El contenedor del
  edge runtime local no tenía la función cargada, así que no se pudo comprobar que el
  runtime entregue el pathname como `/ai-proxy/health`, que es lo que `handler.ts` asume.
  Es lo que el criterio de salida de Fase 0 pide, pero **en D5 conviene levantarla de
  verdad y pegarle un `curl`**.
- **`npm run supabase:test` NO está dentro de `npm run gates`**, a propósito: necesita
  Docker y el enganche de `pre-push` no debería depender de él. Consecuencia: hasta que
  exista el job `supabase` en CI (D5), **una regresión de RLS no la caza nada
  automáticamente**. Hay que correrlo a mano antes de un PR que toque `supabase/`.
- **El código de `supabase/functions/` está fuera de tsconfig, ESLint y knip** a
  propósito: es Deno, con otros imports y otro runtime. Quien lo revisa es `deno test`,
  que lo compila de verdad — y de hecho cazó un error de tipos que este proyecto no
  habría visto. Si alguien lo mete en el tsconfig, `npm run gates` se pone rojo.

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

6. ~~BUG-9~~ **hecho** (rama `fix/F1-bug9-redondeo-mercado`, decisión #50). **186 tests.**
   Espera merge. Queda **BUG-8** como único bug barato pendiente, y necesita antes decidir
   la forma del inventario.
7. ~~D4~~ **hecho** (`chore/F0-D4-supabase`, decisiones #51 y #52). Las quince tablas
   estaban abiertas de verdad — se comprobó escribiendo un precio como `anon` antes de
   tocar nada. Ahora: dos migraciones, RLS en las quince, **20 tests pgTAP** y **16 del
   proxy**, y `npm run supabase:test`. Espera merge.
8. ~~D5~~ **hecho** salvo la protección de rama (#53 y #54). Los tres checks — `gates`,
   `supabase`, `secretos` — en verde en menos de dos minutos y medio. El job `supabase`
   pasó a la primera; el de `gates` encontró tres cosas reales que llevaban días en el
   repo. **Falta que Luciano decida sobre GitHub Pro** (ver Bloqueos).
9. ~~Prueba del gate rojo~~ **superada entera** (PRs #10 y #13, los dos cerrados sin
   mergear; detalle en `protocolos-calidad.md § 8`). El CI se pone rojo y nombra los tests
   que caen; el push directo a `main` se rechaza; y un PR en rojo **no se puede mergear**.
   Con esto, **la Fase 0 tiene sus barreras cerradas de verdad**: lo que falta (D6–D8) es
   la app y el sistema de diseño, no protección.
10. ~~Regla #55~~ **escrita.** Luciano la puso en una frase — «no tienes permiso jamás
   para sobrepasarte el PR si los tests no están en verde» — y quedó en `decisiones.md`,
   en las dos reglas de arriba de este tablero, en `protocolos-calidad.md` §§ 2, 4 y 6, y
   en `CLAUDE.md`. Cierra por escrito el único hueco que la protección de rama no puede
   tapar: que el dueño del repositorio se salta sus propias reglas.
11. ~~D6~~ **hecho** (`feat/F0-D6-app-base`, decisiones #56 y #57). La app ya es ME CHEF
   de verdad: `com.mechef.app`, proyecto `@lucogav8/mechef` en expo.dev, Sentry con filtro
   de datos personales, y entorno e interruptores validados al arrancar. Dos bugs
   que encontró fast-check (el filtro de Sentry dejaba `o'` de un correo a la vista;
   «constructor» y «__proto__» pasaban como apagado en `flags.ts`) y una vuelta del
   revisor que devolvió **CAMBIOS con razón**: el filtro dejaba pasar `first_name`, correos
   con tilde y teléfonos escritos a la suiza y a la colombiana. Todo arreglado con su test
   en rojo antes. Y una **segunda vuelta, también con razón**: el filtro era cuadrático
   con textos largos (3,4 s con 50.000 caracteres, capaz de congelar la app) y dejaba pasar
   `peso`, `edad` o `comensal` por su nombre. Una **tercera**, con tres cosas pequeñas: un
   contexto propio llamado `exportacion` se saltaba el modo estricto, faltaba `restriccion`
   (las alergias), y un comentario de `_layout.tsx` decía algo falso de `Sentry.wrap`.
   **367 tests, 35 de 35 mutaciones cazadas.**
   **Lo que solo podía hacer Luciano, y sin lo cual el PR no se mergeaba** (DoD punto 7),
   **hecho el 2026-09-10:**
   - abrir la app en Expo Go (`npx expo start`, `COMANDOS.md` § 1) y ver «ME CHEF»;
   - que Claude cambie un texto y ver que el iPhone cambia en un segundo: **el hito de la
     fase**;
   - tocar «Provocar error» y confirmar en sentry.io que llegó el aviso, con archivo y
     línea. Si no llega, **no es que falle la app**: es la primera prueba de la región EU,
     y se investiga antes del merge.
   - **Primera prueba, 2026-09-10: el aviso no llegó.** No era la región EU: el DSN estaba
     **vacío** en el `.env` (la plantilla decía dejarlo vacío hasta D6). Y la app apagaba
     Sentry sin decirlo; ahora lo avisa en la terminal.
   - **Segunda prueba, con el DSN puesto: el aviso llegó a sentry.io** (región EU), con
     archivo y línea. El cambio de texto se vio al instante. **La verificación está
     superada.** El modo diagnóstico de Sentry (`debug: true`) se quitó antes del commit,
     y un test impide que vuelva.
   - El párrafo de `COMANDOS.md` § 5 (corrige un texto de D5) **se queda en este PR, con
     su anotación en la descripción**: decisión de Luciano (opción A).
   - **Mergeado el 2026-09-10** (PR #16, `0d4468f`), con los tres checks en verde. El CI de
     `main` sobre el commit del merge, también en verde. Rama borrada.
12. ~~Presentar D6.5~~ **presentado y partido en dos** (decisión #58). Luciano decidió: la
   `Hoja` pasa a Fase 2, con la hoja de cuenta, que es su primer uso; las capturas de la
   galería con Maestro pasan a D7, que es donde entra Maestro; y el paso se hace en dos
   PRs. Además, el plugin de accesibilidad del plan no es compatible con ESLint 9: no se
   instala, y la accesibilidad la exigen los tipos, ESLint y los tests. Mobbin sigue
   aparcado.
13. **D6.5a construido** (`feat/F0-D6.5a-sistema-diseno`), sin dependencias nuevas:
   `tokens.ts`, `tema.tsx`, `Texto`, `es.ts` con `t()`, la galería solo en desarrollo, las
   reglas de ESLint de interfaz con un fixture línea a línea, el contraste AA como test y
   la pantalla inicial rehecha. **474 tests**, cobertura 100 %, **53 comprobaciones de
   reglas** y **56 de 56 mutaciones cazadas**. El revisor devolvió **CAMBIOS con razón** en la
   primera vuelta (las reglas de ESLint tenían agujeros y la #58 prometía más de lo que
   protegían), **CAMBIOS** otra vez en la segunda (tres huecos más pequeños) y
   **APROBADO** en la tercera.
   **Mergeado el 2026-09-10** (PR #17, `e66df6d`), con los tres checks en verde. Luciano
   lo vio en el iPhone: los colores se quedan tal cual (#58.8), y confirmó los puntos 5 a
   11 de la #58. Al forzar «Oscuro» con el teléfono en claro, la barra de arriba sigue en claro: la
   pinta el tema del sistema, no el de la galería. Es lo esperado.
14. **D6.5b construido** (`feat/F0-D6.5b-componentes`): los 11 componentes (`Boton`,
   `Chip`, `Tarjeta`, `Etiqueta`, `Campo`, `Stepper`, `EstadoVacio`, `Cargando`, `Aviso`,
   `Icono`, `Progreso`), cada uno con todos sus estados, su test y su sitio en la galería;
   `expo-symbols` y `expo-haptics` (~57.0.2, en Expo Go); `BotonDeDesarrollo` borrado.
   **628 tests**, cobertura 100 %, **59 comprobaciones de reglas** y **76 de 76
   mutaciones cazadas**. El revisor devolvió **CAMBIOS** dos veces, con razón las dos, y
   **APROBADO** en la tercera (la bitácora cuenta qué encontró). Lo que se decidió al
   construir está en la **#59**, quince puntos, para que Luciano los confirme.
   **2026-09-11:** Luciano la revisó en el iPhone y le gustó. Push y **PR #18**.
   **Falta, y sin eso no hay merge:** el CI en verde (#55) y que Luciano confirme o cambie
   los puntos de la #59. El merge espera su «adelante» (#34).
15. Después, **D7**: EAS Workflows y Maestro (el smoke y las capturas de la galería). Será
   también el primer build de simulador con `expo-symbols` y `expo-haptics` (#59.14). Se
   presenta y espera «adelante».

**Lo que tiene que hacer Luciano para cerrar D2:**

```powershell
winget install Gitleaks.Gitleaks
```

Sin él, el enganche de pre-commit avisa y deja pasar. El CI lo revisará igual en D5,
pero entonces el aviso llega tarde y con un PR abierto.

Abierto, sin urgencia:
- El casing del nombre quedó en versales, `ME CHEF`, 1.059 veces en prosa. Si se prefiere
  `Me Chef`, es un reemplazo de un comando.
- ~~En D4, no arrancar el contenedor `teso-dev-db`~~ D4 corrió sin choque: Docker estaba
  vacío. El aviso sigue valiendo — `teso-dev-db` publica el 54322, el mismo puerto del
  Postgres local de Supabase — y está escrito dentro de `scripts/probar-supabase.js`,
  que lo dice si la conexión falla.
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
- **De los 9 bugs del motor, 5 están arreglados y 4 siguen registrados**
  (decisiones #49 y #50). Viven en `src/engine/__tests__/bugs.test.ts`.
  - **Arreglados:** BUG-1 (la foto perdía lo que no contaba), BUG-4 (las filas
    repetidas del inventario), BUG-5 (las alergias no llegaban al filtro) y BUG-7
    (el campo que decía «por porción» y traía el total), más **BUG-9** (la lista
    de mercado redondeaba hacia abajo lo que hay que comprar). Sus tests ya no
    son `.failing`: son tests de regresión normales.
  - **Abiertos, como `.failing`:** BUG-2 y BUG-3 necesitan un catálogo de
    ingredientes con unidad canónica y densidad; BUG-6 necesita una frontera donde
    validar; **BUG-8** necesita decidir si el inventario se normaliza a una fila
    por (ingrediente, unidad, origen). Sin eso, arreglarlos sería inventarse las
    conversiones o la forma de los datos.
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
  - ~~**BUG-9**~~ **arreglado** el 2026-09-09 (decisión #50). `redondearParaComprar`
    redondea hacia arriba y es la que usa la lista; `redondear` sigue al más
    cercano para las recetas. `cantidadNecesaria` deja de redondearse.
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

Pendiente de añadir cuando existan: `eas build` y `eas update` (D7). `eas init` no se añade:
lo corrió Claude en D6 y se corre una sola vez por proyecto.
Ya añadidos: `npm run gates` (D2) y `supabase:start` / `supabase:stop` / `supabase:reset`
/ `supabase:test` (D4).

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
