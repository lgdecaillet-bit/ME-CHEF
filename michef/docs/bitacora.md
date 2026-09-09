# Bitácora · ME CHEF

> **El historial.** Una entrada por sesión de trabajo, en orden cronológico, siempre con
> los mismos campos. Solo se añade al final; lo anterior no se edita. Una sesión nueva lee
> las últimas 3 entradas y sabe qué se hizo, qué salió y qué toca.
>
> Formato de cada entrada:
>
> ```
> ## AAAA-MM-DD · S-AAAAMMDD-x · título corto
> Tarea: ID o «—» · Rama: nombre o «—» · Resultado: una frase
> Tocado: archivos
> Corrido: comandos y qué salió, tal cual
> Decisiones nuevas: #N título · #N título (o «ninguna»)
> Avances de Luciano: lo que reportó (o «—»)
> Pendiente: lo que quedó abierto
> Para la siguiente sesión: qué hacer primero
> ```

---

## 2026-09-07 · (sin sesión) · Repo creado

Tarea: — · Rama: `main` · Resultado: commit inicial `3a280e0`
Tocado: `README.md` raíz
Corrido: —
Decisiones nuevas: ninguna
Avances de Luciano: creó el repo `lgdecaillet-bit/ME-CHEF`, el scaffold `michef/` con
`create-expo-app` (SDK 57), el `michef-starter/` con reglas, motor y esquema, y el
pipeline `research/` (1.010 fichas de apps, informe de recomendaciones).
Pendiente: nada de esto está commiteado; `michef/`, `michef-starter/` y `research/` son
untracked.
Para la siguiente sesión: leer todo el starter antes de escribir código.

---

## 2026-09-09 · S-20260909-a · Planificación completa, protocolo de trabajo y memoria del proyecto

Tarea: planificación + D0.5 · Rama: `main` (solo documentos, antes del flujo de PRs) ·
Resultado: roadmap por fases, protocolos de calidad, sistema de diseño, D0 desglosado
para Luciano, y los archivos de memoria que permiten retomar sin contexto.

Tocado:
- Creados en `michef/docs/`: `roadmap.md`, `protocolos-calidad.md`, `diseno.md`,
  `fases/fase-0-fundaciones.md` … `fase-6-lanzamiento.md`, `estado.md`, `bitacora.md`,
  `decisiones.md` (numerado, canónico desde hoy).
- Creado `michef/.claude/agents/revisor.md` (subagente revisor por PR).
- Editados: `michef-starter/CLAUDE.md` (sección «Cómo trabajar conmigo» ampliada,
  secciones nuevas «Seguridad del código» y «Protocolo de sesión»),
  `michef/CLAUDE.md` (provisional, con las mismas reglas resumidas),
  `michef-starter/docs/decisiones.md` (ahora solo apunta a `michef/docs/decisiones.md`).

Corrido: nada de código. Se leyeron los 18 archivos de `michef-starter/`, el informe de
`research/`, y se verificó el stack contra la documentación oficial: Expo SDK 57
(RN 0.86.3, React 19.2.3, TS 6.0.3), Expo Go (cámara, SQLite sin cifrar, Supabase y
notificaciones locales sí; SQLCipher, Apple auth y Live Activities no), EAS Workflows,
builds de simulador sin cuenta de Apple, Maestro en EAS, Supabase CLI/pgTAP, Sentry Expo.

Hallazgos que el plan corrige:
- Contradicciones: `CLAUDE.md` decía SDK 54 (es 57); `README` del starter dice Expo Go
  para todo (SQLCipher no va en Expo Go); `producto.html` v0.4 menciona SwiftData/CloudKit
  (histórico); `supabase/schema.sql` sin RLS y sin ser migración; `ai-proxy` solo README.
- 7 bugs en `src/engine/` (se registran como `test.failing` en D3, se arreglan en Fase 1):
  BUG-1 `fusionarEscaneo` borra ítems sin cantidad · BUG-2 unidad siempre `'g'` ·
  BUG-3 `listaDeMercado` suma sin verificar unidad · BUG-4 `enCasa` pisa duplicados ·
  BUG-5 `recetasConLoQueHay` ignora `noCome` · BUG-6 `tiempo_max` no numérico apaga el
  filtro en silencio · BUG-7 `escalarReceta` devuelve total en `cantidadPorPorcion`.

Decisiones nuevas: #25 layout del repo · #26 SDK 57 · #27 Expo Go hasta Fase 2 ·
#28 licencia Apple semana 3–4, máximo 7 · #29 onboarding sin cuenta, login al tocar
«Cocinar», cocinar requiere cuenta (reemplaza #4) · #30 jest-expo único runner ·
#31 dependency-cruiser · #32 Maestro en EAS · #33 Sentry Fase 0, PostHog Fase 1 ·
#34 todo paso se aprueba · #35 seguridad del código como condición de PR · #36 memoria
del proyecto en el repo · #37 revisor por PR · #38 coordinación multi-agente diferida,
por evento, con criterio; Fase 0 con un solo agente · #39 secretos EAS en D6 ·
#40 sistema de diseño antes de pantallas.

Correcciones de Luciano durante la sesión (quedan como regla):
- «No se puede cocinar sin cuenta»: se eliminó toda ruta de «cocinar sin cuenta» de
  fases 1 y 2, roadmap y plan. «Ahora no» vuelve a las recetas; la hoja reaparece en
  cada «Cocinar».
- Todos los pasos se aprueban primero. Añadido a `CLAUDE.md`.
- La seguridad del código y la búsqueda de bugs son prioridad. Añadido a `CLAUDE.md`.
- Varias ventanas de Claude a la vez: se diseñó el sistema completo (tablero, historial,
  carriles, worktrees, coordinador por evento con criterio, revisor). Se acordó construir
  **ahora solo la memoria** (este archivo, `estado.md`, decisiones numeradas, protocolo,
  revisor) y **diferir la coordinación multi-agente** hasta que se abra la segunda ventana.
  Luciano preguntó si el sistema completo era demasiada complejidad; se acordó que sí para
  Fase 0.
- El coordinador, cuando llegue, va por evento (no por reloj) y con criterio (agente que
  lee el informe de un script, no solo el script).

Avances de Luciano: D0 recibido y desglosado paso a paso; todavía no reporta ningún check.
Modelo cambiado durante la sesión (Opus → Fable 5.1) sin efecto en el trabajo.

Verificación de D0.5: un subagente sin contexto leyó solo el repo siguiendo el protocolo
y retomó correctamente (fase, paso, decisiones vigentes, qué hacer si llega D0, qué está
prohibido). Reportó seis fricciones; cinco corregidas en esta misma sesión:
- Rutas relativas confusas entre `michef-starter/CLAUDE.md` y `michef/docs/` → nota
  explícita en el protocolo.
- Colisión de ID de sesión el mismo día → tabla «Sesiones de hoy» en `estado.md` y regla
  de elegir la letra siguiente antes de hacer nada.
- `CLAUDE.md` canónico decía «SDK 54+» y «Sign in with Apple obligatorio» → corregidos ya
  (citan #26, #27, #29). D1 completa el resto de la tabla «Cambios a CLAUDE.md».
- 0.10 aparecía como check pendiente → ahora es «no cuenta para cerrar D0».
- No estaba escrito qué ritual aplica antes de D1 → regla «hasta D1, solo docs, directo a
  `main`, con bitácora».
La sexta (nada commiteado) queda como bloqueo en `estado.md`, pendiente de «adelante».

Pendiente:
- D0 completo por parte de Luciano (0.1–0.9; 0.10 movido a D6; 0.11 opcional).
- D1 en adelante, cada uno con su «adelante».
- El starter sigue en `michef-starter/` hasta D1. Su `CLAUDE.md` es el canónico hasta que
  D1 lo mueva a `michef/CLAUDE.md`.
- Nada de esta sesión está commiteado todavía. Se commitea en D1 como parte del bootstrap
  (o antes, si Luciano lo pide).

Para la siguiente sesión: leer `estado.md`. Si Luciano reporta D0, marcar los checks,
escribir entrada aquí, y presentar D1 con la lista exacta de archivos. No ejecutar nada
sin «adelante».

---

---

## 2026-09-09 · S-20260909-b · D0 completo, dos decisiones de región, rename a ME CHEF

Tarea: acompañar D0 paso a paso · Rama: `main` (solo documentos) ·
Resultado: D0 cerrado con los 9 puntos verificados desde la terminal, dos decisiones de
región tomadas con criterio nuevo, y el producto renombrado a ME CHEF.

Tocado:
- `docs/estado.md`: checklist de D0 al día, tabla de vencimientos de credenciales,
  cabecera corregida (decía «decisiones vigentes hasta #40», iban por #42), sesión
  `S-20260909-b` registrada.
- `docs/decisiones.md`: añadidas #41 y #42; índice de vigentes a `#1–#3, #5–#42`.
- `docs/fases/fase-0-fundaciones.md`: filas 0.3 y 0.6 reescritas, viñeta de seguridad
  de D0 corregida, tabla de stack `eas-cli 16.x` → `23.2.0`.
- Rename global `Mi Chef` → `ME CHEF`: 392 archivos, 1.059 ocurrencias, más
  `research/reports/mi-chef-recomendaciones.md` → `me-chef-recomendaciones.md` y sus 8
  enlaces. El identificador `michef` (carpeta, `slug`, `scheme`, `package.json`) NO se
  tocó, por instrucción de Luciano.

Corrido:
- `npm i -g eas-cli` → falló primero desde el shell de la herramienta (`ENOENT spawn
  cmd.exe`: el `postinstall` de `protobufjs` necesita `cmd.exe`), dejó el directorio
  bloqueado y provocó un `EBUSY` en el intento de Luciano. Se resolvió borrando
  `node_modules/eas-cli` y `node_modules/.eas-cli-*` y reinstalando desde PowerShell.
  **Lección: las instalaciones globales de npm las corre Luciano, no el agente.**
- `eas --version` → `eas-cli/23.2.0` · `eas whoami` → `lucogav8`
- `docker run hello-world` → OK. Aviso: el contenedor `teso-dev-db` publica el puerto
  **54322**, el mismo que usa el Postgres local de Supabase. Está parado; si se arranca
  durante D4 habrá conflicto.
- `npx supabase --version` → `2.117.0` (vía npx, no global: no hay scoop en la máquina).
- `npx supabase projects list` → `ME-CHEF` en `East US (North Virginia)`, ref
  `npswkfpomhinewxsmiic`, org `uimilwirsuqqrvnplzbt` compartida con TESO.
- `gh secret list` → los cuatro secretos con los nombres exactos.
- Verificación del rename: 0 ocurrencias restantes de `Mi Chef` y `mi-chef`;
  `app.json` y `package.json` conservan `michef`.

Decisiones nuevas: #41 Supabase en `us-east-1`, no en Frankfurt · #42 Sentry en región EU
con Organization Token · #43 `research/` no se sube a GitHub

Avances de Luciano: D0 entero (0.1–0.9). Cuenta expo.dev `lucogav8` con robot `github-ci`
rol Developer (y revocado el personal que lo precedió); proyecto Supabase `ME-CHEF` en
us-east-1 con RLS automática activada al crearlo; org Sentry `mechef` en región EU con
proyecto React Native y Organization Token; los cuatro secretos cargados en GitHub.
Decidió el rename del producto a ME CHEF conservando el identificador `michef`.

Pendiente:
- Nada está commiteado todavía. Luciano hará el commit desde su sesión central.
- Confirmar en D6 si `@sentry/wizard` necesita `SENTRY_URL=https://de.sentry.io` por ser
  la organización de región EU.
- El casing `ME CHEF` en versales aparece 1.059 veces en prosa; si se prefiere `Me Chef`,
  es un reemplazo de un comando.

Para la siguiente sesión: D0 está cerrado, no hay que rehacerlo. El siguiente paso es el
commit de documentos (lo hace Luciano) y después presentar D1 para aprobación.

## 2026-09-09 · S-20260909-c · Primer commit en `main`, `research/` fuera

Tarea: commit y push de documentos y scaffold · Rama: `main` (solo docs + scaffold,
pre-Git-flow) · Resultado: `a5bfa0c` en `origin/main`, 88 archivos, 15.461 líneas.

Tocado:
- `.gitignore` en la raíz (nuevo): `research/`, `node_modules/`, `.env`, `.env.local`,
  `.env*.local`.
- `docs/estado.md`: sesión `c` registrada; bloqueo «nada commiteado» resuelto; siguiente
  paso → D1.
- `docs/bitacora.md`: esta entrada.

Corrido:
- Auditoría previa: `find` de `.env*` → solo `michef-starter/.env.example`. Escaneo de
  patrones de secretos (`sk-ant-`, `AIza`, `sbp_`, `eyJhbGciOi`, `sntrys_`,
  `service_role`) en `michef/` y `michef-starter/` → 0 reales (3 menciones de
  `service_role` en prosa de docs).
- `git add .gitignore michef michef-starter` → 88 staged; `research/` 0; `node_modules` 0.
- `git commit` → `a5bfa0c docs: scaffold SDK 57, starter, planificación de fases y
  memoria del proyecto`.
- `git push origin main` → `3a280e0..a5bfa0c main -> main`.
- Git avisó «LF will be replaced by CRLF» en ~55 archivos: `core.autocrlf=true` en
  Windows. El repo guarda LF; es ruido, no error. **Para D2:** añadir `.gitattributes`
  con `* text=auto eol=lf` para que Prettier, lint-staged y CI vean lo mismo.

Decisiones nuevas: ninguna. Se aplicó #43.

Avances de Luciano: confirmó que el commit lo hace esta sesión (la «central» que
mencionaba la sesión b) y que solo sube el contenido de la aplicación. «Go» = adelante.

Pendiente:
- `michef-starter/` está en el repo hasta que D1 lo migre y lo borre (según plan).
- D1 espera presentación y «adelante».

Para la siguiente sesión: `main` ya cuenta la verdad. Presentar D1 (`chore/bootstrap`)
con la lista exacta de archivos a mover, borrar y editar, y el texto de los cambios a
`CLAUDE.md`. No ejecutar sin «adelante». Recordar: instalaciones globales de npm las corre
Luciano; en D4 no arrancar `teso-dev-db` (puerto 54322); en D6 verificar `SENTRY_URL`.

---

## 2026-09-09 · S-20260909-d · D1 · `chore/bootstrap`

Tarea: F0-D1 · Rama: `chore/F0-D1-bootstrap` · Resultado: `michef/` es ME CHEF;
`michef-starter/` borrado. 64 archivos, +539 −1.764. Revisor: `APROBADO` tras instalar
`drizzle-orm`. PR abierto, espera verificación en Expo Go y merge de Luciano.

Tocado:
- **13 renombrados** de `michef-starter/` a `michef/` (byte a byte, con historia):
  `CLAUDE.md`, `README.md`, `docs/producto.html`, `src/engine/` (6), `src/db/schema.ts`,
  `src/ai/client.ts`, `supabase/schema.sql`, `supabase/functions/ai-proxy/README.md`,
  `eval/README.md`, `.env.example`.
- **42 borrados**: 39 del scaffold de demo (`src/app/explore.tsx`, `src/components/`,
  `src/constants/`, `src/hooks/`, `src/global.css`, `scripts/reset-project.js`,
  `LICENSE` del template, imágenes de Expo/React/Android/tabIcons) y 3 del starter
  (`.gitignore`, `tsconfig.json`, `docs/decisiones.md` que era un puntero). Quedan
  `icon.png`, `splash-icon.png` y `assets/expo.icon/`: los referencia `app.json`.
- **9 modificados**: `CLAUDE.md` (sección «Cuenta» por #29; «Estado y orden» ahora apunta
  a `roadmap.md`/`fases/`; «Cómo trabajar conmigo» + gates, `--no-verify`, una feature un
  PR, instalaciones globales las corre Luciano; sección nueva «Cómo se verifica»; quitada
  la nota de rutas relativas), `README.md` (el del starter reemplaza al del template; D8
  lo reescribe), `app.json` (`name: "ME CHEF"`, sin `android` ni `web`; `slug` y `scheme`
  siguen `michef`), `package.json` (fuera `react-dom`, `react-native-web`, `@expo/ui`,
  `expo-glass-effect`, `expo-symbols`, `expo-image`, `expo-web-browser`, `expo-device` y
  los scripts `android`, `web`, `reset-project`; dentro `drizzle-orm`),
  `package-lock.json`, `.gitignore` (+ `*.log`, `.env`, `.env.local`, `eval/fotos/`,
  `eval/resultados/`), `src/app/_layout.tsx` y `src/app/index.tsx` (mínimos, con
  `testID="home"`), `docs/estado.md`.

Corrido, tal cual:
- `npx tsc --noEmit` → **1 error**: `src/db/schema.ts:10` importa `drizzle-orm/sqlite-core`
  y `drizzle-orm` no estaba instalado. No estaba en la lista aprobada, así que se paró y
  se preguntó (decisión #34). Luciano aprobó la instalación.
- `npm install --save-exact drizzle-orm@0.45.2` → `added 1 package in 16s`. Versión fijada
  exacta, última publicación 2026-08-12, `postinstall`: ninguno. Solo se importa
  `sqlite-core` (tipos y builders, sin nativo). Ya estaba en `CLAUDE.md § Stack`, así que
  no es decisión de visión nueva.
- `npx tsc --noEmit` → **0 errores**.
- `npm audit --audit-level=high` → sin alta/crítica. Quedan 2 moderados en transitivas de
  Expo (`decode-uri-component` vía `expo-router`, `uuid` vía `@expo/config-plugins`); el
  fix es `--force` y rompe `expo-router`. Se aceptan y se revisan en D2.
- `npx expo export --platform ios` → bundle Hermes 2,3 MB, sin errores. Grep de
  `sk-ant-`, `AIza…`, `service_role`, `sbp_…` en el bundle → **0**.
- `npx expo-doctor` (lo corrió el revisor) → 18/18.
- Grep de `@/components|@/hooks|@/constants|global.css` en `src/` → **0**.
- `npm install` avisa `EBADENGINE`: metro 0.84.5 pide Node `^22.13.0`, la máquina tiene
  22.12.0. Hoy es aviso, no error.
- Git avisa LF→CRLF en cada `add`. Pendiente `.gitattributes` en D2.

Revisor: veredicto `CAMBIOS` en la primera pasada, por el `tsc` rojo (criterio de salida
de D1) y por una viñeta de `CLAUDE.md` fuera de la lista aprobada («las instalaciones
globales de npm las corre Luciano»). Ambos resueltos: instalada `drizzle-orm` con
aprobación; la viñeta se reportó a Luciano y la mantuvo. El revisor dejó cinco apuntes
«para después», recogidos en `estado.md § Abierto`.

Decisiones nuevas: ninguna. `drizzle-orm` ya estaba en `CLAUDE.md § Stack`.

Avances de Luciano: «adelante» a D1 con la lista presentada; aprobó instalar lo necesario
para que `tsc` pase; mantuvo la viñeta de instalaciones globales. Preguntó por qué D1 se
mergea sin CI ni reglas de rama: se le explicó que CI no tiene nada que correr hasta D2 y
que un ruleset exigiendo un check inexistente bloquearía todos los PRs; se le ofreció la
regla básica de `main` (solo PRs, sin force-push) como paso aparte de dos minutos.

Pendiente:
- **Luciano:** abrir la app en Expo Go (`npx expo start` en `michef/`) y confirmar que se
  ve «ME CHEF»; después mergear el PR y borrar la rama.
- D2 espera presentación y «adelante».
- Node 22.12.0 vs `^22.13.0` de metro.

Para la siguiente sesión: si el PR está mergeado, salir de `main` actualizado y presentar
D2 (tooling) con la tabla de paquetes, las reglas de ESLint y dependency-cruiser, los
umbrales de cobertura y los scripts. No instalar nada sin «adelante». Recordar: las
instalaciones globales las corre Luciano; en D4 no arrancar `teso-dev-db` (puerto 54322);
en D6 verificar `SENTRY_URL=https://de.sentry.io`.

---
