# Decisiones · ME CHEF

> **La visión, numerada.** Qué se decidió, por qué, y si sigue vigente. Cada decisión
> tiene un número estable. Una decisión no se borra ni se edita: si cambia, se añade una
> nueva que dice «reemplaza a #N» y la vieja se marca «reemplazada por #M». Así un agente
> que empezó con la #N ve que ya no aplica.
>
> `estado.md` dice hasta qué número están vigentes. Toda sesión lee desde la última que
> conocía hasta esa.
>
> Cómo se añade una: la decide Luciano (solo o con Claude). Formato:
> `### #N · Título` · fecha · estado · texto con el porqué · qué reemplaza · qué archivos
> de `fases/` cambian.

Vigentes: **#1–#3, #5–#43**. Reemplazadas: #4 (por #29).

---

## Producto

### #1 · El problema es la fatiga de decisión, no la falta de tiempo
Fecha: sept 2026 (starter) · **vigente**
«No tengo tiempo» y «no sé cocinar» son dos casos particulares. Casi nadie sabe el
domingo qué va a comer la semana ni qué le toca comprar, incluida gente que cocina muy bien.

### #2 · Visión amplia, primer usuario estrecho
Fecha: sept 2026 (starter) · **vigente**
Le sirve a casi todo el mundo, pero la v1 se diseña para dos personas concretas: una mamá
que cocina para tres en Suiza (le duele porcionar y gastar de más) y un estudiante que
cocina para uno con intake calórico alto. Familias e individuos son el mismo modelo: un
hogar con comensales, cada uno con su factor de porción.

### #3 · La foto de la nevera es la función central, en v1 completa
Fecha: sept 2026 (starter) · **vigente**
Es lo primero que alguien prueba y lo que decide si la app sirve. Guía de cámara, dos
pasadas de visión, fusión con inventario, despensa básica, recetas por cobertura y
perecibilidad: todo va en la v1. Se usa el mejor modelo de visión disponible sin mirar el
costo; el ahorro está en el resto del sistema.

### #4 · Onboarding mínimo con cuenta obligatoria
Fecha: sept 2026 (starter) · **reemplazada por #29**
Crear cuenta (Apple o Google) era lo único que no se saltaba. Las dos preguntas iniciales
(tiempo por comida, cuántas personas) con botón de saltar; si se saltan, 30 minutos y 2
porciones. La parte de las dos preguntas sigue vigente; la cuenta obligatoria al abrir, no.

### #5 · Una foto no da un inventario completo, y está bien
Fecha: sept 2026 (starter) · **vigente**
Cosas tapadas, cajones, tuppers. Lo que sí es posible y es mejor: reconocer lo visible sin
inventar, cruzar con lo que ya se sabía, preguntar solo lo dudoso y mostrar tres recetas
antes de que el usuario termine de dudar.

### #6 · Nunca inventar
Fecha: sept 2026 (starter) · **vigente**
Las recetas se arman solo con lo `seguro` más la despensa básica. Lo `posible` se pregunta
con un chip. Cinco ingredientes ciertos valen más que diez con dos falsos.

### #7 · Cada «no» tiene un porqué
Fecha: sept 2026 (starter) · **vigente**
Y ese porqué se vuelve una restricción permanente. Es como funciona el «no repetir» sin
memoria del modelo.

---

## Arquitectura

### #8 · La IA interpreta y genera; la base de datos recuerda y calcula
Fecha: sept 2026 (starter) · **vigente**
Un modelo entra solo para interpretar lo desordenado, generar una receta que no existe, y
redactar con tono (esto último pregenerado). Todo lo demás es determinista.

### #9 · Personal en el teléfono, compartido en el servidor
Fecha: sept 2026 (starter) · **vigente**
SQLite cifrado local para todo lo del usuario. Postgres en Supabase para el catálogo, sin
ninguna fila con identidad. Única cosa que cruza: líneas de factura mapeadas, sin
identidad, con consentimiento.

### #10 · Tres cosas no se guardan nunca porque se calculan
Fecha: sept 2026 (starter) · **vigente**
Lista de mercado, macros de receta, pills derivadas.

### #11 · Ingredientes desde bases abiertas + catálogo canónico propio
Fecha: sept 2026 (starter) · **vigente**
USDA (dominio público) como columna vertebral, base suiza y Open Food Facts para el primer
país. Los números nutricionales vienen de tablas, nunca de un modelo: un modelo da 165 hoy
y 160 mañana, y eso rompe un objetivo calórico.

### #12 · Open Food Facts en tablas separadas
Fecha: sept 2026 (starter) · **vigente**
Prefijo `off_`. Licencia ODbL con share-alike: usar su API no obliga a nada, pero
redistribuir una base derivada sí.

### #13 · Recetas: corpus público como ideas, pipeline propio, catálogo pregenerado
Fecha: sept 2026 (starter) · **vigente**
No se copia texto de nadie. El pipeline convierte ideas en recetas propias estructuradas,
validadas, con imagen y vector, en lotes y fuera de línea. Generar en vivo solo cuando el
catálogo no alcanza. El catálogo se sesga hacia recetas de 4 a 7 ingredientes comunes.

### #14 · Precios en tres niveles con confianza
Fecha: sept 2026 (starter) · **vigente**
Estimado por el modelo (una vez por país, para arrancar) → dato abierto → factura real
(decae con el tiempo). Cada factura reemplaza estimados por hechos. Se corrige solo.

### #15 · Reseñas de Google: no
Fecha: sept 2026 (starter) · **vigente**
No responden la pregunta de precio y va contra sus condiciones. Las facturas dan un dato
mucho más fuerte y es tuyo. Reseñas de recetas sí, dentro de la app, con las señales
implícitas (terminadas, repetidas, regeneradas) pesando más que las estrellas.

### #16 · Estructura internacional desde el día uno
Fecha: sept 2026 (starter) · **vigente**
País, moneda e idioma son valores de columna, no ramas del código. Un país nuevo es datos,
no código.

---

## Stack

### #17 · Expo / React Native, iOS-only. No Swift nativo
Fecha: sept 2026 (starter) · **vigente**
No por calidad: por máquina. El MacBook Air 2019 se queda en macOS Sonoma y no puede
correr Xcode 26, que Apple exige desde el 28 de abril de 2026. Además Claude Code es
bastante más fuerte en TypeScript que en SwiftUI. Puntajes de la matriz: Expo 8,75 ·
Expo+PowerSync 7,35 · Swift nativo 5,70.

### #18 · EAS Build compila y sube desde Windows
Fecha: sept 2026 (starter) · **vigente**
15 builds iOS al mes en el plan gratuito. El Air sirve como máquina de desarrollo local,
nunca para el binario final.

### #19 · No comprar Mac mini todavía
Fecha: sept 2026 (starter) · **vigente**
Solo si el flujo por nube frena de verdad (≈ CHF 400 usado, corre Sequoia y Xcode 26). No
usar OpenCore Legacy Patcher.

### #20 · Sync multi-dispositivo diferido
Fecha: sept 2026 (starter) · **vigente**
CloudKit es la respuesta correcta (privado, gratis, no toca tu servidor), pero los módulos
de Expo están en v0.1.x. La v1 va con SQLite local cifrado.

### #21 · Supabase sobre serverless puro
Fecha: sept 2026 (starter) · **vigente**
Auth, storage, pgvector y Edge Functions en un solo producto: máxima velocidad para una
persona sola.

### #22 · Modelos
Fecha: sept 2026 (starter) · **vigente**
Gemini Flash (visión), Haiku 4.5 (texto barato), Sonnet 5 en Batch para el pipeline, Nano
Banana para imágenes. Palancas: Batch API (−50 %), prompt caching (−90 % en lecturas),
salida JSON obligatoria, y caché de toda respuesta.

### #23 · Ninguna API key en la app
Fecha: sept 2026 (starter) · **vigente**
Todo por el proxy en Edge Functions.

### #24 · Precisión medida antes de lanzar
Fecha: sept 2026 (starter) · **vigente**
200 fotos reales etiquetadas, > 95 % de precisión en lo marcado como `seguro`. Con
Promptfoo, corriendo en local.

---

## Sesión de planificación · 2026-09-08/09

### #25 · Layout del repo: todo dentro de `michef/`
Fecha: 2026-09-09 · **vigente**
`michef-starter/` se migra a `michef/` en D1 y se borra. `research/` queda al lado, fuera
de CI. Un solo `package.json`, una sola fuente de verdad.

### #26 · Expo SDK 57, no 54
Fecha: 2026-09-09 · **vigente**
Es lo que `create-expo-app` generó: RN 0.86.3, React 19.2.3, TypeScript 6.0.3. New
Architecture obligatoria, sin opción legacy. `CLAUDE.md` se corrige en D1.

### #27 · Expo Go como entorno de desarrollo hasta Fase 2
Fecha: 2026-09-09 · **vigente**
Verificado contra la documentación del SDK 57: cámara, SQLite sin cifrar, Supabase
(sesión anónima, Edge Functions), notificaciones locales y Secure Store funcionan en Expo
Go. SQLCipher, Sign in with Apple real y Live Activities no. Se abandona Expo Go al entrar
cualquiera de esos tres. Nunca es el destino final.

### #28 · Licencia de Apple: recomendada semana 3–4, máximo semana 7
Fecha: 2026-09-09 · **vigente**
Los builds de simulador para E2E (Maestro en EAS) no la necesitan. Solo la exigen
SQLCipher, Apple auth, Live Activities y TestFlight. Iniciar el alta una semana antes de
necesitarla (24–48 h, a veces días). Cambia: `roadmap.md §3`.

### #29 · Onboarding sin cuenta; login al tocar «Cocinar»; cocinar requiere cuenta
Fecha: 2026-09-09 · **vigente** · **reemplaza a #4**
La primera foto y las tres recetas ocurren sin cuenta, con sesión anónima de Supabase. Al
tocar «Cocinar esto» aparece una hoja («Guarda tu cocina», Apple/Google, «Ahora no»). Se
vincula con `linkIdentity`, sin migrar datos. **No existe «cocinar sin cuenta»**: «Ahora
no» vuelve a las recetas sin cocinar y la hoja reaparece en cada «Cocinar». Motivo: el
informe de research (P1, ⚠ CONTRADICE): cuenta antes del valor no baja el rating pero
genera un flujo constante de 1★ evitables. Ver recetas es anónimo; cocinar recuerda.
Cambia: `fase-2-nevera.md §2.9`, `fase-1-motor-y-datos.md` (auth), `CLAUDE.md` (D1).

### #30 · jest-expo como único runner
Fecha: 2026-09-09 · **vigente**
No Vitest. Un solo runner, un solo mock de lo nativo. Propiedades con fast-check; SQLite
en Node con better-sqlite3.

### #31 · dependency-cruiser para la regla «engine no importa ai»
Fecha: 2026-09-09 · **vigente**
Además de ESLint. Dos herramientas, una regla: el editor avisa, CI bloquea. Reglas:
`engine-no-ai`, `engine-no-native`, `ai-only-proxy`, `no-circular`.

### #32 · Maestro en EAS Workflows para E2E
Fecha: 2026-09-09 · **vigente**
No Detox (necesita Mac local). Builds de simulador, gratis, desde el primer PR de Fase 0.

### #33 · Sentry desde Fase 0; PostHog desde Fase 1
Fecha: 2026-09-09 · **vigente**
Sentry Free, proyecto React Native, `sendDefaultPii: false`. PostHog EU cloud, sin PII.

### #34 · Todo paso se aprueba antes de ejecutarse
Fecha: 2026-09-09 · **vigente**
Ninguna tarea, PR, instalación, migración ni cambio de configuración empieza sin un
«adelante» de Luciano a ese paso concreto. Aprobar un paso no aprueba el siguiente. Antes
del paso: archivos, instalaciones con versión, test que lo protege, cómo se verifica.
Después: qué se corrió y qué salió, tal cual. Está en `CLAUDE.md`.

### #35 · La seguridad del código es condición de cada PR
Fecha: 2026-09-09 · **vigente**
Buscar bugs es parte de escribir código: casos límite y una propiedad invariante por
función. Un bug se registra como test antes de arreglarse. Nada se mergea en rojo. Todo
input externo se valida con `zod` en la frontera. Revisión de seguridad por escrito en
PRs que toquen `src/ai/`, `supabase/`, `app.config.ts` o dependencias. Está en `CLAUDE.md`.

### #36 · La memoria del proyecto vive en el repo
Fecha: 2026-09-09 · **vigente**
`docs/estado.md` (tablero), `docs/bitacora.md` (historial), `docs/decisiones.md`
(visión numerada). Toda sesión los lee al empezar y los escribe al terminar, por
obligación de `CLAUDE.md`. Objetivo: que una sesión nueva sepa qué se hizo, qué toca y
cómo, sin que Luciano explique nada. Motivo: Luciano trabajará en varias ventanas y
sesiones; sin esto, cada una empieza de cero y se pisan.

### #37 · Revisor por PR
Fecha: 2026-09-09 · **vigente**
Subagente `.claude/agents/revisor.md`, solo lectura, con lista fija: alcance, visión,
arquitectura, seguridad, bugs, continuidad. Veredicto `APROBADO` o `CAMBIOS`. Un PR sin
veredicto no se mergea. Atrapa lo que los gates automáticos no ven: código correcto pero
fuera de la visión.

### #38 · Coordinación multi-agente: diferida, por evento, con criterio
Fecha: 2026-09-09 · **vigente**
Fase 0 se hace con **un solo agente** (D1–D8 son secuenciales). El sistema de varias
ventanas (worktrees, carriles por carpeta, `coordinar.sh` + agente coordinador, tablero,
plantilla de PR) se construye cuando se abra la segunda ventana, no antes: hasta entonces
es complejidad sin valor. Cuando llegue: el coordinador corre **por evento** (tomar tarea,
push, PR, merge), no por reloj, y **con criterio** (un agente lee el informe de un script
y decide si el choque es real), porque un script detecta hechos pero no sabe si importan.
Canal entre agentes: comentarios del PR. Opción elegida: solo local (sin GitHub Action
con API key) hasta que haga falta. Diseño completo en la bitácora del 2026-09-09.

### #39 · Secretos de EAS (`eas env:create`) se hacen en D6, no en D0
Fecha: 2026-09-09 · **vigente**
`eas env:create` necesita el proyecto vinculado con `eas init`, que toca `app.json`. D0
solo guarda los valores; D6 los carga. Cambia: `fase-0-fundaciones.md § D0` fila 0.10.

### #40 · Sistema de diseño antes de cualquier pantalla real
Fecha: 2026-09-09 · **vigente**
Paso D6.5: tokens, tema claro/oscuro, componentes base con tests, galería en Expo Go,
gates de interfaz en ESLint (un `<Text>` suelto no pasa), `contraste.ts`. Ninguna pantalla
de producto se construye antes. Detalle en `diseno.md`.

### #41 · Supabase en `us-east-1`, no en Frankfurt
Fecha: 2026-09-09 · **vigente**
La razón que sostenía Frankfurt era residencia de datos en la UE. No aplica: por la
decisión #9, el servidor no guarda ninguna fila con identidad de usuario — lo personal
vive en SQLite cifrado en el teléfono, y `receta_senal` son contadores agregados. Sin
dato personal que resida, queda solo la latencia, y ahí `us-east-1` gana: es mejor
centroide para una audiencia global con sesgo América (Bogotá, EE. UU.) y deja el
`ai-proxy` junto al proveedor del modelo, en vez de cruzar el Atlántico en cada llamada
de IA. Suiza pierde ~80 ms en sincronizaciones de catálogo que nadie mira, porque la app
es offline-first y el motor calcula en local.
En el plan Free no hay read replicas y la región no se cambia en sitio: cambiarla es
proyecto nuevo más migración. Por eso se decide antes de crear el proyecto.
Cambia: `fase-0-fundaciones.md § D0` fila 0.3 y la viñeta de seguridad; `estado.md` 0.3.
PostHog (0.11) sigue en EU cloud: ese sí recibe eventos de usuario.

### #42 · Sentry en región EU, con Organization Token
Fecha: 2026-09-09 · **vigente**
Mismo criterio que #41, resultado contrario, porque los datos son de otra clase. Sentry
**sí** recibe dato personal (stack traces, breadcrumbs, modelo de dispositivo, y el user
id si se configura) y la latencia **no** importa: el envío es asíncrono y en lote. Sin
nada que ganar en velocidad y con dato personal de por medio, gana EU (Frankfurt).
Queda así la regla general: dato personal → EU; dato no personal en camino sensible a
latencia → la región más cerca del uso. Supabase `us-east-1`, Sentry EU, PostHog EU.
La región se elige al crear la organización y **es permanente**: cambiarla exige
organización nueva (doc oficial de Sentry). Si ya existe una org previa de otro proyecto,
su región ya está fijada — para ME CHEF se crea una organización aparte.
Segundo cambio: el token de CI es un **Organization Token**, no un Personal Token. La
doc de Sentry lo recomienda explícitamente para CI («designed to be used in CI
environments and have a limited set of permissions»); tiene permisos fijos, así que la
lista de scopes `project:releases` / `project:write` / `org:read` del plan original ya no
aplica. Consecuencia para D6: los endpoints de una org EU son `de.sentry.io`, no
`us.sentry.io` — `sentry-cli` necesita `SENTRY_URL` apuntando ahí.
Cambia: `fase-0-fundaciones.md § D0` fila 0.6; `estado.md` 0.6.

### #43 · `research/` no se sube a GitHub
Fecha: 2026-09-09 · **vigente**
La investigación es material de trabajo, no producto: 1.010 fichas, 930 screenshots y
`research/raw/` pesando 2,6 GB de respuestas crudas de la App Store. Al repo sube solo lo
que el proyecto necesita para construirse y para que otra sesión lo retome. Un repo con
gigabytes de datos crudos hace lento cada `clone` y cada CI, para siempre, y git no olvida
lo que se subió una vez.
Vive en local. Los docs de `michef/` que dependen de ella la citan por ruta relativa
(`../../research/reports/me-chef-recomendaciones.md`); esos enlaces no resuelven en la web
de GitHub y está bien: son notas para quien trabaja en la máquina.
Consecuencia: el `.gitignore` de la raíz excluye `research/` entero. Antes del primer
commit hay que verificar que ningún archivo de `michef/` dependa de `research/` para
compilar o pasar tests — hoy solo lo citan documentos.

---

## Pendientes de decidir

- Porciones para varias personas: ¿tres porciones iguales o cada comensal con su apetito?
  (afecta directo el dolor principal del primer usuario)
- Qué incluye la despensa básica por país
- Panel «mezclador» de recetas antes de la lista: ¿v1 o después?
- «Después» en la receta puntual: ¿notificación, borrador, o volver atrás?
- Qué es exactamente «in the middle»
- Qué pasa si el usuario no envía la factura
- Receta puntual teniendo plan: ¿reemplaza la comida planificada o se suma?
- Granularidad del catálogo: «pollo» vs «pechuga sin piel»
- Fórmula y pesos del ranking
- Marketplace: ¿catálogo con reseñas, o recetas publicadas por usuarios?
- `bundleIdentifier` (se decide en D6; es permanente)
- Tokens del sistema de diseño (se deciden en D6.5, viendo la galería en el iPhone)

## Por verificar antes de depender de ello

- Precio de embeddings 2026
- Términos de CIQUAL, BEDCA y la base suiza de valores nutritivos
- Costos y términos de Google Places frente a Apple Maps
- Existencia de datos abiertos de precios en Suiza y Colombia
- Plan Production de EAS ($199/mes viene de fuente secundaria)
