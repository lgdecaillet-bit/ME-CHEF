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

## 2026-09-09 · S-20260909-f · D3 · tests del motor

Tarea: F0-D3 · Rama: `test/F0-D3-motor` · Resultado: **138 tests, 8 suites, cobertura
100 % en `src/engine`, `src/db` y `src/ai`.** Los 7 bugs conocidos quedan registrados y
los umbrales de cobertura, activados.

Tocado (nuevos):
- `src/engine/__tests__/`: `ayudas.ts` (constructores de datos), `portions.test.ts`,
  `inventory.test.ts`, `groceries.test.ts`, `coverage.test.ts`, `index.test.ts`,
  **`bugs.test.ts`** (los 7 bugs).
- `src/db/__tests__/schema.test.ts` · `src/ai/__tests__/client.test.ts`.
- Borrado `humo.test.ts`, que era el andamio de D2.
Modificados: `jest.config.js` (umbrales activados, `testMatch`, exclusiones),
`eslint.config.js` (reglas de import), `knip.config.js`, `COMANDOS.md`.

Corrido, tal cual:
- `npm run gates` → **verde**. `npm run knip` → limpio. `npx prettier --check .` → limpio.
- Cobertura final: `engine` 100/100/100/100, `db` 100, `ai` 100.

**Lo que se comprobó de verdad, no se supuso** (decisión #47 aplicada a este paso):
- Se «arregló» BUG-1 a mano, en caliente, para ver qué hace el registro de bugs. Con el
  bug presente: 10 tests pasan. Con el bug arreglado: **2 fallan** con el mensaje
  «Failing test passed even though it was supposed to fail. Remove `.failing`». Es
  exactamente el comportamiento que se necesita: el registro avisa cuando deja de ser
  cierto. Después se revirtió el motor y se verificó con `git diff` que quedó intacto.
- Se comprobó que `tsc` detecta un import inexistente (`TS2307`) antes de apagar las
  reglas de `import/*` que hacían lo mismo.

Problemas encontrados y cómo se resolvieron:
1. **Jest trataba `ayudas.ts` como una suite vacía** y fallaba. Resuelto con
   `testMatch: ['**/*.test.{ts,tsx}']`: solo los `*.test.ts` son tests.
2. **Los umbrales activados fallaban con «global 0 %»**. Causa: Jest **saca del cómputo
   global** los archivos que casan con una clave de ruta. Al poner umbral al motor, el
   bucket global se quedó solo con lo no cubierto. Se resolvió cubriendo de verdad
   `src/ai` y `src/db`, no bajando el umbral. Queda explicado en `jest.config.js`.
3. **`engine/index.ts` y `types.ts` marcan 0 % para siempre**: no tienen ni una sentencia
   ejecutable (uno son tipos, el otro `export *`). Se excluyen de la cobertura **y** se
   prueba el barril por contrato en `index.test.ts`, que comprueba que exporta las nueve
   funciones públicas. No es una exclusión de conveniencia: es que no hay líneas.
4. **`schema.ts` se quedaba en 50 %.** Lo que faltaba eran las claves foráneas, que
   Drizzle declara como funciones perezosas (`.references(() => hogar.id)`) y no resuelve
   hasta que alguien las pide. O sea: **una referencia a una tabla borrada no se nota al
   compilar, se nota cuando SQLite rechaza la migración en el teléfono.** Se añadió un
   test que resuelve todas las claves foráneas de todas las tablas. Sube la cobertura y,
   sobre todo, cubre un fallo real que no tenía red.
5. **ESLint se caía entero** (`EslintPluginImportResolveError`) en cuanto un test usó
   `import * as x`. El `eslint-plugin-import` anidado de `eslint-config-expo@57` no encaja
   con `eslint-import-resolver-typescript@3.10.1`. **No es que la regla encontrara algo:
   es que no puede correr.** Se apagaron las siete reglas de `import/*` que necesitan
   resolver el módulo, tras comprobar que `tsc` hace ese trabajo y mejor. Revisar con #44.
6. Tres errores de tipos en las propiedades: `fc.constantFrom` infiere una unión literal
   y los `Set` heredaban ese tipo. Resuelto con `new Set<string>(...)`.

Qué protege ahora el motor, además de los ejemplos:
- `redondear` es idempotente y nunca devuelve negativos.
- `listaDeMercado` nunca produce una cantidad negativa ni un ingrediente que nadie pidió.
- `fusionarEscaneo` nunca inventa un ingrediente que no estaba ni en el inventario ni en
  la foto (es la prohibición dura de CLAUDE.md, ahora ejecutable).
- `recetasConLoQueHay` nunca propone una receta con algo no disponible, y nunca devuelve
  más recetas de las pedidas.
- `client.ts` llama al proxy y **nunca** a un dominio de proveedor de modelos.
- El esquema no tiene ninguna tabla que se llame como algo que debe calcularse.

Decisiones nuevas: ninguna de visión. Cuatro de implementación, documentadas en el
archivo que afectan: `testMatch`, exclusión de archivos sin sentencias, umbrales por ruta
y su efecto en el global, y las reglas de `import/*`.

Avances de Luciano: instaló gitleaks 8.30.1 y mergieó los PR #2 y #3. «Adelante» a D3.

Pendiente:
- **Luciano:** mergear el PR de D3.
- D4 espera presentación y «adelante».
- Los 7 bugs siguen SIN arreglar, a propósito: eso es Fase 1.

Para la siguiente sesión: presentar **D4** (Supabase como código). Llevar la lección de
#47: los tests de RLS tienen que incluir el caso negativo, porque una política que no
deniega nada se ve igual que una que funciona. Y añadir a `COMANDOS.md` lo que salga
nuevo (`npm run supabase:test`).

---

## 2026-09-09 · S-20260909-f · D3, segunda vuelta: tests que no podían fallar

Tarea: F0-D3, correcciones del revisor · Rama: `test/F0-D3-motor` · Resultado: **157
tests**, cobertura 100 % en motor, datos e IA, y **todo comprobado rompiendo el código a
propósito**, no supuesto.

**El hallazgo.** El revisor devolvió `CAMBIOS`. La primera versión tenía seis problemas y
cuatro eran del mismo tipo: **tests que dan confianza falsa**. Es la decisión #47 otra vez,
con otra cara. Un test verde no prueba que el test sirva.

1. **Cuatro de los once `it.failing` nunca se habrían puesto rojos al arreglar su bug.**
   - BUG-5 llamaba a la función sin pasar la alergia y hacía `void alergico` para callar
     al linter: **ninguna implementación correcta podía satisfacer esa aserción.** No era
     una reproducción, era un marcador de posición.
   - Los dos de BUG-6 se contradecían entre sí: uno exigía que un dato inválido descartara
     todo, el otro que no descartara nada, y el arreglo escrito en el propio comentario
     (lanzar) no habría puesto verde a ninguno.
   - BUG-7 encadenado avisaba por `TS2345` al compilar, no por el «Failing test passed»
     que `COMANDOS.md` le enseña a Luciano a buscar.
   Reescritos los tres para que **afirmen el comportamiento posterior al arreglo**. Donde
   la firma actual no lo permite (BUG-5, BUG-7) se llama con la firma que tendrá después,
   con un `as unknown as` y el porqué escrito encima. **Verificado:** se arreglaron BUG-5,
   BUG-6 y BUG-7 en caliente y los cuatro tests se pusieron rojos con el mensaje correcto;
   después se revirtió el motor y se comprobó con `git diff` que quedó intacto.

2. **Dos propiedades eran trivialmente ciertas.** El revisor lo demostró rompiendo el
   motor: con `porcionesDelHogar` devolviendo `0` la propiedad «nunca negativo» **pasaba**;
   con `PENALIZACION_NO_VISTO = -3` la de «ni cantidad ni confianza negativas» **también**,
   porque solo reformulaba el filtro final de la propia función. Sustituidas por dos que sí
   pueden fallar: el resultado está a menos de 0,05 de la suma de factores, y lo no visto
   pierde **exactamente** la mitad de confianza. Comprobado que ambas cazan el fallo.

3. **Faltaban propiedades** en `escalarReceta`, `totalEstimado`, `descontarCocinado` y
   `porVencerse`, y la de monotonía de `redondear` que pide `fase-0` por su nombre.
   Añadidas las cinco. Total: 16 propiedades.

4. **`schema.test.ts` no probaba `schema.ts`.** Tenía un DDL escrito a mano que **ya se
   había separado del esquema**: le faltaban cinco columnas (`minutos_diarios`,
   `presupuesto_semanal`, `comidas_por_dia`, `come_en_casa`, `objetivo_id`) y no creaba
   doce de las catorce tablas. El comentario prometió que impedía esa separación; no la
   impedía, y de hecho no la había visto. Reescrito: ahora el SQL **se genera desde
   `schema.ts`** con `generateSQLiteMigration` de `drizzle-kit/api`, el mismo generador que
   produce las migraciones reales, y se aplican las 14 sentencias en SQLite. Las
   comprobaciones de columnas pasaron de `arrayContaining` (contención) a igualdad.

5. **La exclusión de cobertura de `index.ts` y `types.ts` no hacía lo que decía.** El
   revisor la quitó y el gate siguió verde: con cero sentencias, el umbral no penaliza.
   O sea, solo escondía dos filas del informe **y abría un agujero futuro**, porque el día
   que el barril deje de ser `export *` su lógica quedaría fuera del 100 %. Exclusión
   retirada.

6. **Siete reglas de ESLint apagadas sin registrar**, y con una justificación inexacta:
   decía que TypeScript cubre lo mismo, y eso vale para cuatro de ellas, no para
   `no-duplicates` ni `no-named-as-default`, que son de estilo y no las cubre nadie.
   Registrado como **decisión #48** con esa distinción escrita.

Menores también corregidos: el test de las siete tareas del proxy era un
`toHaveLength(7)` sobre un array escrito tres líneas antes (tautología), ahora es un
`it.each` con `satisfies` que comprueba que cada tarea viaja sin transformarse; una
promesa suelta en un test no `async`; la propiedad de groceries pasaba el inventario
siempre vacío, así que no podía detectar que un ítem del inventario se colara en la
lista; y el número «138 tests» en `COMANDOS.md`, que caduca en el siguiente PR.

**Casos límite que faltaban** y que CLAUDE.md pide por su nombre: `factorPorcion` NaN o
negativo, `redondear(NaN)`, `escalarReceta` con porciones negativas. Todos pasan tal cual
hoy, y un NaN llega hasta la lista de mercado. Quedan como tests de caracterización para
que el arreglo de Fase 1 (zod en la frontera) sea deliberado y no accidental.

Corrido, tal cual: `npm run gates` verde · 157 tests, 8 suites · cobertura 100 % en
`engine`, `db` y `ai` · `npm run knip` limpio · `npx prettier --check .` limpio ·
`npm run reglas` las nueve disparan.

Decisiones nuevas: **#48**.

Avances de Luciano: ninguno nuevo en esta vuelta.

Pendiente: **Luciano:** mergear el PR de D3. D4 espera presentación y «adelante».

Para la siguiente sesión: la lección de esta vuelta, para D4 y D5. **Un test verde no
prueba que el test sirva.** Antes de fiarse de una comprobación hay que romper lo que
protege y ver que se queja. En D4 eso significa: escribir una política RLS, intentar
saltarsela desde `anon`, y comprobar que el intento falla. Una política que no deniega
nada se ve idéntica a una que funciona.

---

## 2026-09-09 · S-20260909-g · Cuatro de los siete bugs, arreglados

Tarea: adelanto de Fase 1 · Rama: `fix/F1-motor-cuatro-bugs` · Resultado: **166 tests**,
cobertura 100 % en motor, datos e IA, cuatro bugs cerrados y tres que siguen abiertos con
la condición escrita.

**De dónde salió.** Luciano preguntó, textualmente, por qué los bugs se dejaban ahí
puestos y qué sentido tenía. La mitad de la respuesta del plan se sostenía — el test se
escribe antes del arreglo, porque si no, no puede desmentirlo — y la otra mitad no:
esperar a una fase futura no añade nada cuando el bug tiene una sola respuesta correcta y
ningún llamador. Quedó como **decisión #49**, con el criterio de tres condiciones.

**Arreglados**, y por qué estos cuatro y no los siete:

- **BUG-1**, el más grave. `ItemInventario.cantidad` pasa a opcional: `undefined` es
  «está, no sé cuánto» y `0` es «no queda». El filtro final mira la confianza, no la
  cantidad. Arrastró un cambio en la base de datos — `inventario.cantidad` deja de ser
  NOT NULL — porque arreglar solo el motor habría dejado el ítem vivo en memoria y roto
  al guardarlo, en el teléfono, lejos de aquí. Hay un test en `schema.test.ts` que
  vigila esa columna.
- **BUG-4**. Las filas repetidas del inventario se suman. La clave del acumulador lleva la
  unidad: dos filas del mismo ingrediente en gramos y mililitros NO se suman, porque eso
  necesita densidades que no existen (BUG-3). Lo que no se puede comparar cuenta como cero
  y se compra.
- **BUG-5**, las alergias. `recetasConLoQueHay` recibe los comensales y excluye su
  `noCome` siempre. El comportamiento por defecto de una función de seguridad no podía
  seguir siendo «inseguro salvo que quien llama se acuerde».
- **BUG-7**. `escalarReceta` devuelve `IngredienteEscalado`, con `cantidadTotal`.
  Encadenar dos escalados ya no compila. Se arregló ahora precisamente porque **no hay
  llamadores**: cambiar esta firma con pantallas encima costaría diez veces más.

**Siguen abiertos, con la condición escrita:** BUG-2 y BUG-3 esperan un catálogo de
ingredientes con unidad canónica y densidad; BUG-6 espera la frontera donde validar.
Arreglarlos hoy sería inventarse las conversiones.

**Cómo se comprobó que los arreglos arreglan algo** (decisión #47, otra vez):

1. Con el motor ya arreglado y `bugs.test.ts` todavía sin tocar, los cinco `it.failing` de
   BUG-1, 4, 5 y 7 dieron «Failing test passed even though it was supposed to fail», y
   BUG-2, 3 y 6 siguieron verdes. Es decir: el mecanismo distingue exactamente los que se
   arreglaron de los que no. Solo después se convirtieron en tests normales.
2. Los dos guardianes nuevos se probaron rompiéndolos. Devolver `.notNull()` a la columna
   pone rojo el test del esquema. Reintroducir el `...i` de `escalarReceta` pone rojos los
   dos tests de BUG-7 — y **`tsc` no dice absolutamente nada**, que es justo lo que
   afirmaba el comentario: TypeScript no comprueba las propiedades de más que llegan por
   un spread. Sin ese test de ejecución, el bug volvería en silencio.
3. El gate se quedó corto de cobertura al primer intento (`coverage.ts` 93,3 % y
   `groceries.ts` 94,1 % de ramas). Las dos ramas destapadas eran casos reales — un
   comensal sin alergias, y un ítem sin cantidad conocida llegando a la lista de mercado —
   así que se cubrieron con tests, no bajando el umbral.

**Hallazgo lateral, sin tocar.** Un test propio falló esperando 12 y recibiendo 10:
`redondear` redondea al más cercano, y la lista de mercado lo aplica a la cantidad a
comprar. Si hacen falta 12, manda a comprar 10. Para una lista de mercado el redondeo
debería ir hacia arriba. Se cambió el test de números para no mezclar dos asuntos, y queda
anotado en `estado.md` como posible **bug 8**, sin registrar: falta el «adelante» (#34).

También: knip avisó de que el ignore de `drizzle-kit` había dejado de ser cierto — D3
empezó a importar `drizzle-kit/api` de verdad — y se retiró. Es exactamente la regla que
el propio `knip.config.js` se impone: un ignore que ya no aplica se borra.

Corrido, tal cual: `npm run gates` verde · 166 tests, 8 suites · cobertura 100 % en
`engine`, `db` y `ai` · `npm run knip` limpio · `npx prettier --check .` limpio ·
`npm run reglas` las nueve disparan.

Decisiones nuevas: **#49**.

Avances de Luciano: mergeó nada en esta vuelta; el PR #4 de D3 lo cerró Claude por
squash, como en D1, al no haber CI todavía.

Pendiente: **Luciano:** mergear el PR de esta rama. Decidir si el bug 8 se registra.
D4 sigue esperando presentación y «adelante».

Para la siguiente sesión: el criterio de la decisión #49 aplica también a D4 y D5. Un
hallazgo con una sola respuesta correcta y sin llamadores se arregla en el acto; uno que
necesite un dato que no existe se registra **con la condición escrita** de qué tiene que
existir. Nunca «para luego» a secas.

---

## 2026-09-09 · S-20260909-g · Segunda vuelta: la alergia seguía siendo opcional

Tarea: correcciones del revisor sobre `fix/F1-motor-cuatro-bugs` · Resultado: **171
tests**, cobertura 100 %, dos bugs nuevos registrados y el plan de Fase 1 puesto al día.

**El hallazgo, y es el mismo error de siempre con otra cara.** El revisor devolvió
`CAMBIOS`. Lo primero: el arreglo de BUG-5 dejaba `comensales` como parámetro **opcional
y en sexto lugar**. El comentario de encima decía, palabra por palabra, que «el
comportamiento por defecto de una función de seguridad no puede ser inseguro salvo que
quien llama se acuerde» — y el código implementaba exactamente eso. El revisor lo
demostró llamando como llamaría una pantalla distraída, sin el argumento: la receta con
maní sale. El comportamiento de antes del arreglo, a un argumento olvidado de distancia.

Peor todavía: es el mismo caso que BUG-7, y recibió el tratamiento contrario. En BUG-7 se
argumentó que cambiar la firma era gratis por no haber llamadores, y se hizo imposible el
mal uso. En BUG-5, con cero llamadores igual, se dejó opcional. Corregido: `comensales`
es obligatorio y va en cuarto lugar, delante de `restricciones` y `cuantas`. Se
reescribieron las 23 llamadas de los tests. **Comprobado:** la llamada del revisor ahora
da `TS2554: Expected 4-6 arguments, but got 3`.

**Dos bugs nuevos, reproducidos con números antes de registrarlos:**

- **BUG-8.** `fusionarEscaneo` y `descontarCocinado` llevan el mismo `new Map` con claves
  repetidas que tenía BUG-4, y no se vio al arreglar BUG-4. Medido: seis huevos de
  factura más seis de escaneo quedan en **seis** al sacar una foto, y en cuatro al
  cocinar dos. El arreglo de BUG-4 declara que tener el mismo ingrediente en varias filas
  es lo normal, y las dos funciones vecinas lo destruyen en silencio.
- **BUG-9.** `redondear` va al más cercano y la lista de mercado lo aplica a la cantidad
  a comprar: si hacen falta 12, manda a comprar 10. Salió solo, porque un test propio
  falló esperando 12 y recibiendo 10.

Los dos quedan como `it.failing` **con la condición escrita** de qué hace falta para
arreglarlos, que es lo que pide la #49. Sus aserciones afirman el invariante que cualquier
arreglo correcto cumple — no se pierde cantidad; no se compra de menos — y no la forma
del resultado, porque BUG-8 depende de una decisión de diseño que aún no está tomada.

**Lo demás que trajo la revisión:**

- El test del NULL en la base comprobaba el **metadato** de Drizzle, no que SQLite
  aceptara el NULL. Añadido el `insert` de verdad. Y quedó escrito, en #49 y en el
  propio test, que la base devuelve `null` y el motor usa `undefined`: el repositorio de
  Fase 1 tiene que normalizar. No hay riesgo en ejecución porque todo el motor compara
  con `== null`, pero no estaba dicho en ninguna parte.
- El registro de BUG-2 no contaba su radio de daño real. Con la clave `(ingrediente,
  unidad)` que introdujo el arreglo de BUG-4, **hoy ningún líquido visto en la foto
  descuenta de la lista de mercado**. Es conservador y se acepta, pero es lo que decide
  su prioridad, y ahora está escrito.
- Un ítem registrado en 0 que la cámara ve se borra igual. Chocan dos reglas y no había
  test que dijera cuál gana. Añadido, fijando que gana «0 significa que se acabó».
- `fase-1-motor-y-datos.md` § 1.1 seguía diciendo que había que arreglar los siete, y
  describía BUG-1 y BUG-4 de una forma que ya no es la real. Reescrito. La #49 no decía
  qué archivos de `fases/` cambiaba, como pide la cabecera de `decisiones.md`; añadido.
- «Nunca dos bugs en un commit» es inútil tal cual en este repo: todos los PR se cierran
  con squash y los commits intermedios desaparecen. La granularidad que sobrevive es un
  PR por bug. Corregido en el plan y anotado en #49.
- La tabla «Tareas tomadas» de `estado.md` estaba vacía con la tarea viva. Añadida.

**Lo que el revisor miró y encontró bien**, por dejarlo dicho: los cinco `it.failing`
convertidos existían en `72a0d1a`, o sea antes del arreglo, con el mismo cuerpo — no
reescritos para encajar. La clave `${id}|${unidad}` no puede colisionar con `Unidad`
cerrado a `'g'|'ml'`, y lo probó con el id malicioso `'a|g'`. Los tres `.failing` que
quedaban siguen reproduciendo su bug, uno por uno. Y ninguna aserción de las nuevas es
trivialmente cierta salvo dos que están a propósito, como guardias contra el
sobrearreglo.

Corrido, tal cual: `npm run gates` verde · 171 tests, 8 suites · cobertura 100 % en
`engine`, `db` y `ai` · `npm run knip` limpio · `npx prettier --check .` limpio ·
`npm run reglas` las nueve disparan.

Decisiones nuevas: ninguna. **#49 ampliada** con la regla de que una función de seguridad
no tiene parámetros de seguridad opcionales, la normalización `null → undefined`, y la
corrección de la granularidad de commits.

Avances de Luciano: ninguno en esta vuelta.

Pendiente: **Luciano:** mergear el PR. Decidir si se arreglan BUG-8 y BUG-9, que son los
dos más baratos que quedan. D4 sigue esperando presentación y «adelante».

Para la siguiente sesión: **el revisor encontró en el arreglo el mismo defecto que el
arreglo decía cerrar.** No basta con arreglar el bug: hay que comprobar que el arreglo no
se puede saltar por descuido. La pregunta concreta que lo destapó fue «¿qué pasa si
alguien llama a esto y se olvida de este argumento?». En D4 la misma pregunta se traduce
en «¿qué pasa si alguien crea una tabla y se olvida de la política RLS?» — y la
respuesta no puede ser «pasa».

---

## 2026-09-09 · S-20260909-g · BUG-9: la lista de mercado ya no manda a comprar de menos

Tarea: arreglo de BUG-9 · Rama: `fix/F1-bug9-redondeo-mercado` · Resultado: **186 tests**,
cobertura 100 %, quinto bug cerrado.

**Qué pasaba.** Había un solo redondeo amable, `redondear`, al más cercano, y se usaba
para todo. Para una receta está bien: nadie mide 137 g de cebolla. Para la lista de
mercado no: necesitar 12 salía como «compra 10».

**El razonamiento, que es lo que hay que conservar.** Los dos errores del redondeo no
cuestan lo mismo. Comprar de más deja medio paquete en la despensa; comprar de menos manda
a la persona de vuelta a la tienda, que es justo lo que la app promete evitar. Cuando un
sesgo es asimétrico, la función va en la dirección barata, no en la neutra. Quedó como
**decisión #50**.

**Qué se hizo.** Función nueva `redondearParaComprar`, mismos escalones con `Math.ceil`.
**Dos funciones y no una con un booleano**: un parámetro se olvida, dos nombres distintos
obligan a elegir. Es la misma leccción que dejó el revisor con `comensales` en #49.

Y de paso, lo que no estaba en el registro original del bug: **`cantidadNecesaria` deja de
redondearse.** Redondearla al más cercano era la misma mentira en el otro campo, y rompía
la resta que ve el usuario. Ahora «necesitas 137, tienes 100, compra 40»: los dos primeros
son verdad y solo el último, el que va a la tienda, lleva el redondeo amable. Se le quita
el ruido de la coma flotante con `toFixed(2)`, igual que en `totalEstimado`.

**Comprobado rompiéndolo:** con los tres `Math.ceil` devueltos a `Math.round`, caen ocho
tests, entre ellos las dos propiedades nuevas. Revertido y comprobado con `git diff` que
el archivo quedó con el cambio previsto y nada más.

**Lo que encontró fast-check solo.** La propiedad «nunca se pasa más de un escalón»
falló al primer intento con `x = 5e-324`, el double más pequeño que existe: el resultado
es 0,5 y la resta da 0,5 clavado, porque la x se pierde en la precisión. Es un artefacto
de la coma flotante y no un fallo del redondeo, así que el límite quedó en `<=` con el
porqué escrito encima. Vale la pena anotarlo: la propiedad hizo su trabajo a la primera.

Corrido, tal cual: `npm run gates` verde · 186 tests, 8 suites · cobertura 100 % en
`engine`, `db` y `ai` · `npm run knip` limpio · `npx prettier --check .` limpio ·
`npm run reglas` las nueve disparan · `gitleaks git` sin hallazgos.

Decisiones nuevas: **#50**.

Avances de Luciano: aprobó BUG-9 y delegó la ejecución de los merges. Mergeados por Claude
los PR #4 (D3), #5 (cuatro bugs) y #6 (corrección del diagnóstico de gitleaks).

Pendiente: **Luciano:** mergear el PR de esta rama, y aprobar **D4**, que se presenta a
continuación. Queda **BUG-8** como único bug barato pendiente; necesita antes decidir la
forma del inventario.

Para la siguiente sesión: de los nueve bugs conocidos del motor quedan cuatro, y los
cuatro esperan un dato o una decisión que aún no existe — no esperan tiempo. Están en
`bugs.test.ts` con la condición escrita al lado. El siguiente paso del roadmap es D4.

---
