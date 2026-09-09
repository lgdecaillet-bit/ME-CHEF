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

## 2026-09-09 · S-20260909-d · Node 22.23.2 (añadido tras cerrar D1)

Tarea: — · Rama: `chore/F0-D1-bootstrap` · Resultado: resuelto el `EBADENGINE` que dejó D1.

Tocado: `docs/estado.md` (§ Abierto), `docs/bitacora.md`. Ningún archivo de la app.

Corrido, tal cual:
- Inventario de la máquina: `node -v` → v22.12.0; `npm -v` → 10.9.0; `where node` →
  `AppData\Roaming\fnm\aliases\default\node.exe`. Gestores presentes: **fnm** (vía
  winget) y `winget`. No hay nvm, volta, choco ni scoop. Sesión sin permisos de
  administrador.
- `fnm list` → v22.12.0 (default), v24.15.0 (lts-latest), system.
- `fnm install 22.23.2` → OK. `fnm default 22.23.2` → OK.
- `node -v` → **v22.23.2**; `npm -v` → **10.9.8**.
- `npm install` en `michef/` → `up to date in 1s`, **sin `EBADENGINE`**. Lockfile
  intacto (`git status` limpio).
- `npx tsc --noEmit` → 0 errores. `npx expo-doctor` → **21/21** (antes 18/18 con una
  versión anterior de la herramienta).

Por qué la 22 y no la 24: fnm ya tenía 24.15.0 instalada, pero se mantuvo la línea 22
(Jod, LTS) para no cambiar de major justo antes de que D2 traiga `better-sqlite3`, que es
un módulo nativo y depende de que existan prebuilds para la versión de Node. `metro-config
0.84.5` pide `^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25.0.0`, y 22.23.2 lo cumple.

Como se hizo con `fnm` y no con `winget`, no se tocó el Node del sistema, no hizo falta
elevación, y volver atrás es `fnm default 22.12.0`.

Decisiones nuevas: ninguna. No cambia la visión; es entorno de la máquina.

Avances de Luciano: pidió instalar la versión nueva de Node. La regla «instalaciones
globales las corre Luciano» nació de un `npm i -g` que falló desde el shell de la
herramienta; aquí no aplicó el mismo riesgo porque `fnm` instala en el perfil del
usuario, sin elevación y sin tocar `node_modules`.

Pendiente:
- **Luciano:** si tenía `npx expo start` corriendo, reiniciarlo para que tome el Node
  nuevo. Verificar D1 en Expo Go y mergear el PR #1.
- D5: `actions/setup-node` debe fijar `22.23.2`.
- D2: decidir si entra `.node-version` en el repo para que fnm y CI lean la misma versión.

Para la siguiente sesión: sin cambios respecto a la entrada anterior. Tras el merge del
PR #1, presentar D2.

---

## 2026-09-09 · S-20260909-d · D1 mergeado; `COMANDOS.md`; `.env`; secreto corregido

Tarea: cierre de D1 · Rama: `main` · Resultado: **Fase 0 tiene D0, D0.5 y D1 cerrados.**

Tocado:
- `COMANDOS.md` (nuevo, en la raíz): chuleta de comandos para Luciano, que no escribe
  comandos de memoria. Diez secciones. **Regla permanente añadida a `estado.md`:** cada
  paso que introduzca un comando nuevo lo añade ahí antes de darse por cerrado.
- `michef/.env.example`: documentado por secciones. Explica qué va (`EXPO_PUBLIC_*`,
  públicos por diseño, viajan en el bundle) y qué no (los cuatro tokens, `service_role`,
  keys de modelos). Lleva la URL de Supabase ya puesta porque es pública y deriva del ref.
- `michef/.env` (no versionado, ignorado): creado desde la plantilla. Luciano pegó la
  `anon key`.
- `docs/estado.md`, `docs/bitacora.md`.

Corrido, tal cual:
- Verificación del `.env` **sin mostrar valores**: `EXPO_PUBLIC_SUPABASE_URL` es una URL;
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` empieza por `sb_publishable_` (llave pública correcta,
  no la `sb_secret_`); `EXPO_PUBLIC_SENTRY_DSN` vacía, como toca hasta D6.
- `git check-ignore michef/.env` → ignorado por `michef/.gitignore:47`. No puede subir.
- `gh secret list` → los cuatro nombres correctos. **No existe ningún
  `SUPABASE_SERVICE_ROLE_KEY`, y es correcto que no exista.**
- **Corrección:** Luciano detectó que en `SUPABASE_PROJECT_ID` había pegado la URL
  completa en vez del Reference ID. Como un secreto de GitHub no se puede leer, no se
  comprueba: se sobreescribe. `echo "npswkfpomhinewxsmiic" | gh secret set
  SUPABASE_PROJECT_ID` → marca de tiempo 09:00:34 frente a 07:03 de los otros tres.
  Verificado contra `npx supabase projects list`: ME-CHEF, ref `npswkfpomhinewxsmiic`,
  `us-east-1`, `ACTIVE_HEALTHY`. **Qué habría roto:** el `supabase link` del CI en D5,
  con un error que no apunta a la causa.
- Luciano verificó la app en Expo Go: ve «ME CHEF», sin pestañas ni logo de Expo.
- `gh pr merge 1 --squash --delete-branch` → `2ba0d81` en `main`. `git fetch --prune` →
  solo queda `main`. `michef-starter/` ya no existe en el árbol.
- `npx tsc --noEmit` desde `main` → 0 errores.

Decisiones nuevas: ninguna.

Avances de Luciano: verificó D1 en el iPhone; pegó la `anon key` en `.env`; detectó el
error del secreto. Pidió expresamente que exista un archivo de comandos porque no los
escribe de memoria — de ahí `COMANDOS.md` y su regla de mantenimiento.

Pendiente: D2 espera presentación y «adelante».

Para la siguiente sesión: `main` está limpio y al día. Presentar **D2** (tooling) con la
tabla de paquetes y versiones, las reglas de ESLint y dependency-cruiser, los umbrales de
cobertura y los scripts de `package.json`; incluir `.gitattributes` con `eol=lf` y decidir
si se fijan todas las versiones. Añadir `npm run gates` a `COMANDOS.md`. No instalar nada
sin «adelante». Recordar: en D4 no arrancar `teso-dev-db` (puerto 54322); en D5
`actions/setup-node` fija `22.23.2`; en D6 verificar `SENTRY_URL=https://de.sentry.io`.

---

## 2026-09-09 · S-20260909-e · D2 · tooling de calidad

Tarea: F0-D2 · Rama: `chore/F0-D2-tooling` · Resultado: `npm run gates` existe y está
verde en 12 s. Los enganches rechazan de verdad: probado con un commit real.

Tocado (nuevos): `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.gitattributes`,
`commitlint.config.js`, `.lintstagedrc.json`, `.dependency-cruiser.cjs`, `jest.config.js`,
`knip.config.js`, `scripts/secrets-bundle.js`, `.husky/{pre-commit,commit-msg,pre-push}`,
`src/engine/__tests__/humo.test.ts`.
Modificados: `package.json` (14 scripts), `tsconfig.json` (`types: [jest, node]`),
`.gitignore` (+`coverage/`), `COMANDOS.md` (§ 5 reescrita, § 7b nueva).

Corrido, tal cual:
- **ESLint 10.10.0 no sirve.** Se instaló como se presentó y `npm ls eslint` devolvió
  cuatro `invalid`: `eslint-plugin-import` pide `<= ^9`, `eslint-plugin-react` pide
  `<= ^9.7`, y `eslint-plugin-expo` se trajo su propia copia de la 9.39.5 anidada. Se
  bajó a **9.39.5** y quedó en 0 conflictos. La declaración `eslint >=8.10` de
  `eslint-config-expo` es engañosa: sus plugins son más estrictos que ella.
- `npm audit` → **18 moderadas, 0 altas, 0 críticas.** Todas internas de Expo.
- `better-sqlite3@13.0.3` compila y corre en Node 22.23.2 (prueba: crear tabla, insertar,
  leer). Sin necesidad de herramientas de compilación de Windows.
- **Primer `eslint .`** → 7 errores. Dos en el motor: `!= null` y `== null` en
  `inventory.ts:32` y `:86`. **No eran bugs, la regla estaba mal escrita:** `x != null`
  comprueba null e indefinido a la vez, y forzar `!==` habría introducido un bug. Se
  cambió a `eqeqeq: ['error','always',{null:'ignore'}]`. Los otros cinco eran `console`
  en `scripts/`, que es su interfaz: override añadido.
- **`depcruise`** → 0 errores, 4 avisos de `no-orphans`. Se **eliminó esa regla**: el
  código muerto es trabajo de knip, y duplicarlo hacía que la orden imprimiera ruido en
  cada ejecución. Ahora depcruise solo habla de arquitectura y todas sus reglas son
  `error`: si imprime algo, es una violación real.
- **`knip`** → primero pidió quitar 15 ignores redundantes; luego marcó el motor entero
  como no usado. Se pasó de `knip.json` a `knip.config.js` para poder documentar **cuándo
  deja de hacer falta cada ignore**, y se declararon como entradas las fronteras públicas
  de cada capa (`engine/index.ts`, `db/schema.ts`, `ai/client.ts`). Salida limpia, código 0.
- **`prettier --write .` tocó 16 documentos**: 556 líneas insertadas y 481 borradas, solo
  por añadir líneas en blanco tras los títulos y realinear tablas. **Se revirtió y se
  añadió `*.md` a `.prettierignore`:** los documentos son la memoria del proyecto y ese
  ruido ahogaría el cambio real en cada diff futuro. También se excluyó `assets/`
  (generado por Expo) y `docs/producto.html` (1 MB escrito a mano).
- **Cobertura:** los umbrales objetivo (motor 100 % líneas / 95 % ramas) hacen fallar el
  gate hoy porque **no hay tests todavía**. Quedan escritos en `jest.config.js` como
  `OBJETIVO`, y `ACTIVO` apunta a cero. **D3 cambia esa línea.** Un umbral imposible de
  cumplir no protege: obliga a saltarse el gate, y saltarlo una vez enseña a saltarlo
  siempre.
- **Husky no arrancaba:** `.git can't be found`, porque el repo está en `ME-CHEF/` y el
  proyecto npm en `ME-CHEF/michef/`. Resuelto con `prepare: cd .. && husky michef/.husky`
  y un `cd michef` al principio de cada enganche.
- **Prueba de los enganches, con commits reales:**
  1. Archivo con `console.log`, `git commit` → **rechazado** por `no-console`, y
     lint-staged revirtió al estado original. `git log` confirma que no se commiteó.
  2. Mensaje `arreglando cositas` → **rechazado** por commitlint (`type may not be
     empty`).
- `npm run gates` → **verde en 12,4 s** (objetivo: menos de 60).
- `npx prettier --check .` → limpio. `npm run knip` → limpio.

Decisiones nuevas: ninguna que cambie la visión. Cuatro de implementación, todas
documentadas dentro del archivo que afectan: ESLint 9 en vez de 10; `no-orphans` fuera de
depcruise; markdown fuera de Prettier; umbrales de cobertura diferidos a D3.

Avances de Luciano: «adelante» a D2 con la lista presentada.

Pendiente:
- **Luciano:** `winget install Gitleaks.Gitleaks`, y mergear el PR.
- D3 espera presentación y «adelante».

Para la siguiente sesión: si el PR está mergeado, presentar **D3**. Recordar que D3 sube
los umbrales de cobertura (`ACTIVO` → `OBJETIVO` en `jest.config.js`) y registra los 7
bugs como `test.failing` antes de arreglarlos en Fase 1. Y añadir a `COMANDOS.md` lo que
salga nuevo.

---

## 2026-09-09 · S-20260909-e · D2, segunda vuelta: dos reglas estaban muertas

Tarea: F0-D2, correcciones del revisor · Rama: `chore/F0-D2-tooling` · Resultado: las
nueve reglas de arquitectura **disparan de verdad**, comprobado con un control positivo
que ahora corre en cada `npm run gates`.

**El hallazgo grave.** El revisor devolvió `CAMBIOS`. Los gates salían verdes y la
prohibición dura número uno de `CLAUDE.md` — ninguna API key de modelo en la app — no
estaba protegida por nada:

1. En `.dependency-cruiser.cjs`, `engine-no-native` y `ai-only-proxy` **no podían
   dispararse jamás**. Dos fallos independientes, cada uno bastaba:
   - `options.exclude` incluía `node_modules`, y eso lo borra del **grafo entero**, no
     solo de la travesía. El grafo pasaba de 15 dependencias a 12 y las reglas no tenían
     nada que mirar. Lo que se quería (no entrar dentro de los paquetes) ya lo daba
     `doNotFollow`.
   - Los patrones decían `^(react-native|…)` y `^(openai|…)`, pero un paquete instalado
     se resuelve a `node_modules/<paquete>/…`. El ancla `^` no casaba con nada.
2. En `eslint.config.js`, el override de `src/engine/**` redefinía `no-restricted-imports`.
   **ESLint reemplaza las opciones de una regla, no las fusiona**, así que el override
   borraba la prohibición de los SDK de modelos. Verificado: `import OpenAI from 'openai'`
   dentro de `src/engine/` pasaba `npm run gates` entero.

Lo reprodujimos antes de tocar nada, con un fixture: `depcruise` decía «0 violaciones» y
ESLint solo se quejaba de `react-native`, no de `openai`.

**Qué se hizo con eso.** Además de arreglar las dos causas, se añadió lo que faltaba de
verdad: **un control positivo**. `scripts/probar-reglas.js` corre `depcruise` y `eslint`
contra fixtures que violan cada regla a propósito y **falla si la regla no se queja**.
Está dentro de `npm run gates` como `npm run reglas`. Sale así:

    dependency-cruiser · con la exclusión de fixtures levantada
      ok    engine-no-native detecta react-native en el motor
      ok    ai-only-proxy detecta un SDK de modelo
      ok    engine-no-ai detecta un import de src/ai/
      ok    engine-no-db detecta un import de src/db/
    ESLint · sobre los fixtures, con --no-ignore
      ok    no-restricted-imports dispara en el motor
      ok    el SDK de modelo está prohibido dentro del motor
      ok    no-explicit-any dispara
      ok    no-console dispara
      ok    no-only-tests dispara
    Todas las reglas disparan.

El propio script tuvo dos bugs antes de funcionar, y los dos daban **falsos «todo
muerto»**: `execFileSync` no puede lanzar un `.cmd` desde Node 20 (CVE-2024-27980) y
devolvía salida vacía; y el `/* eslint-disable */` de los fixtures apagaba las reglas
hasta que se añadió `--no-inline-config`. Ahora aborta si cualquiera de las dos órdenes
devuelve salida vacía, porque un control que no ve nada no puede afirmar nada.

**El resto de correcciones del revisor:**
- `@typescript-eslint/no-explicit-any` añadida (estaba prometida en `fase-0` y faltaba).
  Obligó a instalar `@typescript-eslint/eslint-plugin@8.70.0`, que ya estaba en el árbol
  como transitiva: ESLint exige que la regla y su plugin vivan en el mismo objeto.
- `noUncheckedIndexedAccess: true` en `tsconfig.json` (prometida en D2 punto 8, se había
  caído sin declararlo). **Cero errores nuevos** en el código real.
- El objetivo global de cobertura se había escrito como 40 cuando lo aprobado era 60.
  Corregido a `{ lines: 60, branches: 40 }`. Sigue inactivo hasta D3.
- El comentario de `knip.config.js` afirmaba que knip audita dentro del motor. Es falso
  mientras `engine/index.ts` sea un barril de `export *`: declararlo como entrada hace
  todo alcanzable. Comprobado A/B (sin esa línea, knip marca 4 archivos y `escalarReceta`
  y `redondear`). Se dejó así a sabiendas y **el comentario ahora dice la verdad**.
- `scripts/secrets-bundle.js` tenía tres fallos, los tres verificados y corregidos:
  1. `/sk-[A-Za-z0-9]{32,}/` **no ve** `sk-proj-…` ni `sk-svcacct-…`, que son los formatos
     actuales de OpenAI: el guion corta la clase de caracteres.
  2. Buscar el literal `service_role` **no encuentra** una clave `service_role` real, que
     es un JWT con el rol dentro del payload en base64. Ahora decodifica cada JWT y mira
     el rol. Probado: detecta el JWT con `service_role` y **no** marca el de `anon`.
  3. `process.exit(1)` dentro del `try` **se salta el `finally`**, así que dejaba el
     bundle con el secreto dentro en `%TEMP%` justo en el único caso que importa. Ahora
     guarda el código y sale después de limpiar.
- El hook de pre-commit usaba `gitleaks protect`, obsoleto desde 8.19. Ahora prueba
  `gitleaks git --staged` y cae al viejo si no existe, y **distingue «hay una fuga» de
  «la herramienta se rompió»**: si el hook grita «secreto» cada vez que gitleaks falla
  por otra cosa, dejas de leerlo.
- `.lintstagedrc.json` no pasaba ESLint a `scripts/*.js`. Corregido.
- `.node-version` con `22.23.2`, que era una decisión abierta de `estado.md`: fnm y el CI
  de D5 leen la misma versión.
- Cuatro decisiones registradas en `decisiones.md`: **#44** ESLint 9 · **#45** documentos
  fuera de Prettier · **#46** 18 moderadas aceptadas · **#47** cada regla con su fixture.

Estado final, todo corrido: `npm run gates` verde · `npm run reglas` las nueve en verde ·
`npm run knip` limpio · `npx prettier --check .` limpio · `npx tsc --noEmit` limpio con
`noUncheckedIndexedAccess`.

Decisiones nuevas: #44, #45, #46, #47.

Avances de Luciano: ninguno nuevo; sigue pendiente instalar gitleaks y mergear.

Pendiente:
- **Luciano:** `winget install Gitleaks.Gitleaks`, y mergear el PR.
- D3 espera presentación y «adelante».

Para la siguiente sesión: la lección de esta vuelta es la decisión **#47** y vale para
todo lo que viene: **un gate verde no prueba que el gate funcione.** En D4 (RLS de
Supabase) y D5 (CI) hay que escribir el caso negativo antes de fiarse: una política RLS
que no deniega nada y un CI que no bloquea nada se ven exactamente igual que los que
funcionan.

---
