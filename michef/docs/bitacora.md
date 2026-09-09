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
