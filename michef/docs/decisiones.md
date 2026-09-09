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

Vigentes: **#1–#3, #5–#52**. Reemplazadas: #4 (por #29).

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


### #44 · ESLint se queda en la línea 9 hasta que Expo actualice sus plugins
Fecha: 2026-09-09 · **vigente**
Se instaló ESLint 10.10.0 y `npm ls eslint` devolvió cuatro dependencias `invalid`:
`eslint-plugin-import` declara `<= ^9`, `eslint-plugin-react` `<= ^9.7`, y
`eslint-plugin-expo` se trajo su propia copia anidada de la 9.39.5. La declaración
`eslint >=8.10` de `eslint-config-expo@57` es engañosa: sus plugins son más estrictos que
ella. Se fijó **9.39.5**, con la que hay cero conflictos. npm avisa de que esa versión
«ya no tiene soporte»; es cierto, y es lo que hay mientras el ecosistema de Expo no
suba. **Se revisa en cada subida de SDK de Expo**, no antes: subir ESLint por su cuenta
rompe el linter entero.

### #45 · Los documentos quedan fuera de Prettier
Fecha: 2026-09-09 · **vigente**
`prettier --write .` reformateó 16 archivos `.md` de golpe: 556 líneas insertadas y 481
borradas, solo por añadir líneas en blanco tras los títulos y realinear tablas. Los
documentos son la memoria del proyecto (decisión #36) y se leen en diffs: ese ruido
ahogaría el cambio real cada vez que se añade una decisión o una entrada de bitácora.
El formato de la prosa no es un problema de corrección. `*.md` va en `.prettierignore`,
junto con `assets/` (generado por Expo) y `docs/producto.html` (1 MB escrito a mano).
Consecuencia: el formato de los documentos se cuida a mano. Es aceptable porque los lee
gente, no un compilador.

### #46 · Se aceptan las vulnerabilidades moderadas de las dependencias de Expo
Fecha: 2026-09-09 · **vigente**
`npm audit` reporta 18 moderadas y ninguna alta ni crítica. Todas viven en dependencias
internas de Expo: `decode-uri-component` vía `expo-router`, `uuid` vía
`@expo/config-plugins`. El arreglo que ofrece npm es `--force` y **degrada `expo-router`
a la versión 5**, lo que rompe la app. El gate corta en alta y crítica, no en moderada:
`npm audit --audit-level=high`. **Se revisa en cada subida de SDK de Expo**, y antes del
lanzamiento (Fase 6). Si alguna sube a alta, se para y se replantea.

### #47 · Cada regla de arquitectura necesita un fixture que la viole
Fecha: 2026-09-09 · **vigente**
En D2 se escribieron cinco reglas de dependency-cruiser y **dos no podían dispararse
jamás**: el patrón decía `^react-native` cuando un paquete se resuelve a
`node_modules/react-native/…`, y `node_modules` estaba en `exclude`, lo que lo borraba
del grafo entero. Además, el override de ESLint para `src/engine/**` redefinía
`no-restricted-imports` y, como ESLint **reemplaza** las opciones de una regla en vez de
fusionarlas, borraba la prohibición de los SDK de modelos: `import OpenAI from 'openai'`
dentro del motor pasaba los gates enteros. Los gates salían verdes y la prohibición dura
número uno de `CLAUDE.md` no estaba protegida por nada.
Lo encontró el revisor, no los gates, porque **una regla que nunca ha visto una
violación parece igual de sana que una que funciona**. Desde ahora: toda regla de
arquitectura tiene un fixture en `src/engine/__fixtures__/` que la viola a propósito, y
`npm run reglas` (dentro de `npm run gates`) falla si la regla no se queja. Es el control
positivo del sistema de calidad. Una regla nueva sin fixture no se mergea.


### #48 · Siete reglas `import/*` de ESLint quedan apagadas
Fecha: 2026-09-09 · **vigente**
`eslint-config-expo@57` trae su propia copia anidada de `eslint-plugin-import`, y su
interfaz no encaja con `eslint-import-resolver-typescript@3.10.1`. El síntoma empezó
siendo avisos («typescript with invalid interface loaded as resolver») y pasó a ser una
caída completa de ESLint (`EslintPluginImportResolveError`) en cuanto un test usó
`import * as x`. **No es que las reglas encontraran algo: es que no pueden correr.**
Apagadas: `import/namespace`, `import/no-unresolved`, `import/named`, `import/default`,
`import/no-named-as-default`, `import/no-named-as-default-member`, `import/no-duplicates`.
Las cuatro primeras las cubre TypeScript, y mejor: un import inexistente da `TS2307` en
`npm run typecheck`, que corre **antes** que el lint dentro de `npm run gates`
(comprobado). Las tres últimas son de estilo y **no las cubre nadie**: se pierden a
sabiendas, porque el coste de tener el linter caído es mayor.
**Se revisa en cada subida de SDK de Expo**, junto con la decisión #44. Si el resolvedor
se arregla, se vuelven a encender de una en una.
Misma familia que #44 y #46: tres cesiones al ecosistema de Expo, todas con su condición
de revisión escrita.


### #49 · Un bug se arregla en cuanto se registra, si tiene una sola respuesta correcta
Fecha: 2026-09-09 · **vigente**
El plan decía que los siete bugs del motor se registraban en D3 y se arreglaban en Fase 1.
Luciano preguntó para qué servía dejarlos ahí puestos, y la respuesta honesta partió los
siete en dos grupos.

**Lo que sí se sostiene del plan:** el test se escribe ANTES del arreglo, siempre. Un test
escrito a la vez que el arreglo toma la forma de lo que se acaba de hacer, sea correcta o
no, y no puede desmentirlo. El rojo del día del arreglo es el recibo. Esta parte no cambia.

**Lo que no se sostenía:** esperar a una fase futura no añade nada cuando el bug tiene una
única respuesta correcta y **ningún llamador que romper**. Al contrario, cuesta: cambiar la
firma de `escalarReceta` hoy es gratis y con pantallas encima será caro; y mientras tanto
`main` contiene una función de recetas que ignora las alergias.

**El criterio que queda, para el resto del proyecto.** Un bug registrado se arregla en el
acto si se cumplen las tres:
1. tiene una sola respuesta correcta, sin decisión de diseño pendiente;
2. no hay que inventarse ningún dato que aún no exista;
3. no hay llamadores cuya rotura sea cara.
Si falla alguna, el bug se queda como `it.failing` **con la condición escrita** de qué tiene
que existir para poder arreglarlo. Nunca «para luego» a secas.

**Aplicado:** BUG-1, BUG-4, BUG-5 y BUG-7 arreglados. BUG-2 y BUG-3 esperan al catálogo de
ingredientes (unidad canónica y densidad); BUG-6 espera a la frontera de validación.

**Archivos de `fases/` que cambian:** `fase-1-motor-y-datos.md` § 1.1, reescrito para
describir el arreglo real y no el planeado, y para incorporar BUG-8 y BUG-9.

**Efectos colaterales aceptados en este arreglo, todos deliberados:**
- `ItemInventario.cantidad` pasa a opcional. `undefined` es «está, no sé cuánto» y `0` es
  «no queda»: confundirlos era BUG-1. La columna `inventario.cantidad` deja de ser
  NOT NULL para poder guardarlo, con dos tests que lo vigilan (el metadato de Drizzle y
  un `insert` real con NULL sobre SQLite).
  **La frontera normaliza:** al leer de la base vuelve `null` y el motor usa `undefined`.
  Los dos significan lo mismo y el motor compara con `== null`, así que no hay riesgo en
  ejecución; pero el repositorio que llegue en Fase 1 § 1.3 tiene que convertir
  `null → undefined` al construir un `ItemInventario`. Se eligió `?: number` y no
  `number | null` — que era lo que decía el plan — por ser lo idiomático en TypeScript.
- Al sumar el inventario, la clave lleva la unidad. Dos filas del mismo ingrediente en
  unidades distintas no se suman: eso necesita densidades (BUG-3). Lo que no se puede
  comparar cuenta como cero y se compra. Quedarse corto de mercado es peor que comprar
  de más, y es la lectura conservadora de «nunca inventar».
- `escalarReceta` devuelve `IngredienteEscalado`, tipo nuevo. Encadenar dos escalados
  ya no compila.
- `recetasConLoQueHay` recibe `comensales` **obligatorio y en cuarto lugar**. El primer
  intento lo dejó opcional al final, y el revisor lo tumbó con razón: un valor por
  defecto deja el mismo agujero que dice cerrar, porque basta olvidar el argumento para
  volver al comportamiento roto y el compilador no dice nada. Un hogar sin comensales
  registrados pasa `[]`, que es una afirmación explícita. **Regla general que se lleva
  de aquí:** una función de seguridad no tiene parámetros de seguridad opcionales.

**Corrección al plan que esta decisión obliga a hacer.** `fase-1-motor-y-datos.md` § 1.1
decía «nunca dos bugs en un commit». Sigue siendo buena idea, pero es inútil tal cual:
todos los PR de este repo se cierran con **squash**, así que los commits intermedios
desaparecen al mergear. La granularidad que sobrevive es **un PR por bug**. Cuando varios
arreglos comparten PR — como aquí — se dice en el PR y se acepta que el historial de
`main` los vea como uno.

**Bugs que este criterio deja registrados sin arreglar**, cada uno con su condición:
- BUG-2, BUG-3: falta el catálogo de ingredientes con unidad canónica y densidad.
- BUG-6: falta la frontera donde validar.
- BUG-8 (`new Map` en `fusionarEscaneo` y `descontarCocinado`, el mismo de BUG-4): falta
  decidir si el inventario se normaliza a una fila por (ingrediente, unidad, origen).
- BUG-9 (`redondear` hacia abajo en la lista de mercado): no falta nada técnico, falta
  el «adelante» de Luciano porque cambia números que ve el usuario.


### #50 · El redondeo de la lista de mercado va siempre hacia arriba
Fecha: 2026-09-09 · **vigente**
Había un solo redondeo amable, `redondear`, al más cercano, y se usaba para todo. Está
bien para una receta — «nadie mide 137 g de cebolla» — y está mal para la lista de
mercado: necesitar 12 salía como «compra 10» (BUG-9).

**Los dos errores del redondeo no cuestan lo mismo.** Comprar de más deja medio paquete en
la despensa. Comprar de menos obliga a volver a la tienda, que es justo lo que la app
promete evitar. Cuando un sesgo es asimétrico, la función tiene que ir en la dirección
barata, no en la neutra.

Quedan **dos funciones**, no una con un parámetro: `redondear` (al más cercano, para
recetas) y `redondearParaComprar` (hacia arriba, para la lista). Un booleano en la firma
se olvida; dos nombres distintos obligan a elegir. Es la misma regla que llevó a hacer
`comensales` obligatorio en #49.

**Y `cantidadNecesaria` deja de redondearse.** Es lo que las recetas piden de verdad;
redondearla al más cercano era la misma mentira en el otro campo, y además rompía la
resta que ve el usuario. Ahora `necesaria − en casa` es exactamente lo que falta, y el
redondeo amable se aplica solo al último paso, el de comprar. Solo se le quita el ruido de
la coma flotante con `toFixed(2)`, igual que en `totalEstimado`.

Misma familia que el arreglo de BUG-1 (un ingrediente sin cantidad conocida cuenta como
cero y se compra): ante la duda, la app prefiere que sobre comida a que falte.

**Archivos de `fases/` que cambian:** `fase-1-motor-y-datos.md` § 1.1, fila de BUG-9.


### #51 · Los candados del catálogo: RLS como único mecanismo, y probado por rotura
Fecha: 2026-09-09 · **vigente**
Hasta D4 las quince tablas del catálogo estaban abiertas. No es una forma de hablar: se
comprobó antes de escribir nada, y como `anon` se pudo insertar una fila en `precio` y
leer `cache_modelo` entero. `anon` es el rol de la clave que viaja **dentro** del bundle
de la app, o sea que la tenía cualquiera.

**El modelo.** Los clientes solo leen el catálogo publicado, y no escriben nada. Todo lo
que escribe pasa por el proxy o por un job, con `service_role`, que se salta RLS por
definición. Cuatro tablas quedan sin ninguna política de lectura: `precio` (es el activo
del proyecto, construido con facturas reales y consultas pagadas a modelos),
`cache_modelo` (leerlo es leer todo lo que se pagó; escribirlo es envenenar lo que la app
cree saber), `off_producto` (licencia ODbL con share-alike, no se reexpone) y
`receta_vector` (los embeddings permiten reconstruir el catálogo por similitud).

**Un solo mecanismo para lo que RLS cubre, y la excepción que hay que entender.** Para
`select`, `insert`, `update` y `delete`, la tentación era poner RLS *y* revocar los
permisos de tabla. Sería más seguro y sería peor: con los dos puestos, ningún test podría
decir cuál está trabajando, y si RLS se rompiera, el `revoke` lo taparía y el gate
seguiría verde. Es la decisión #47 aplicada al servidor. Así que ahí el mecanismo es uno
y se comprueba de dos maneras independientes: por comportamiento (sembrando filas y viendo
que `anon` no las ve) y por estructura (que RLS sigue activo y que las cuatro cerradas
siguen sin políticas).

**La excepción es `TRUNCATE`, y la primera versión de esta decisión la ignoraba.** Lo
encontró el revisor: PostgreSQL trata `truncate` como DDL, **RLS no se le aplica**, y
Supabase concede `ALL` sobre el esquema público a `anon` y `authenticated` — y `ALL`
incluye `TRUNCATE`, `TRIGGER` y `REFERENCES`. O sea que la migración afirmaba por escrito
que ningún cliente podía escribir, el test lo respaldaba, **y `anon` podía vaciar `precio`
y `cache_modelo` de un golpe**. Comprobado: se hizo, y las filas desaparecieron.

El argumento de «un solo mecanismo» no aplicaba ahí, y por una razón concreta: no había
dos mecanismos solapados, había **cero**. Revocar `TRUNCATE` no oculta un RLS roto, porque
RLS nunca llegó a ese verbo. Se revocan los tres a `anon` y `authenticated`, también por
`alter default privileges` para las tablas que aún no existen, y hay un test que cuenta
las concesiones de esos tres verbos en todo el esquema y exige cero — así una tabla creada
mañana tampoco se cuela. Los cuatro verbos que RLS sí cubre no se tocan.

**La regla que queda:** antes de escribir que un mecanismo cubre algo, hay que saber
**qué no cubre**. RLS no cubre DDL. Una frase absoluta en un comentario («para nadie») es
una promesa que alguien va a creerse.

**La trampa concreta que hay que recordar.** Con RLS activado y sin política de lectura,
un `select` **no da error: devuelve cero filas**. Sobre una tabla vacía eso pasa igual con
candado que sin él. Un test que consulte una tabla vacía pasa en verde con RLS roto. Por
eso `rls.test.sql` siembra filas primero. Si alguien quita la siembra «porque no hace
falta», los tests dejan de probar nada.

**Dos cosas que no estaban en el plan y sí hacían falta:**
- **`security_invoker` en las dos vistas.** Una vista de Postgres corre, por defecto, con
  los permisos de quien la creó — aquí `postgres` — y no con los de quien la consulta.
  Sin esa línea, las vistas se saltan todo lo demás: el candado puesto y la ventana
  abierta al lado. Hay un test que lo caza; se comprobó apagándolo.
- **Las tablas hijas de `receta` heredan la condición de «publicada».** El plan ponía
  lectura abierta en `receta_paso`, `receta_texto`, `receta_ingrediente` y `receta_senal`.
  Así, el contenido de un borrador seguía siendo legible aunque su fila en `receta` no lo
  fuera, y el candado principal no servía de nada.

**Comprobado rompiéndolo**, cinco veces: quitar RLS de `precio`, añadir una política
permisiva a `cache_modelo`, apagar `security_invoker` en una vista, devolverle `TRUNCATE`
a `anon`, y **crear una vista nueva sin `security_invoker`**. Las cinco ponen los tests en
rojo. La última no lo hacía al principio: el test contaba las vistas que SÍ tenían
`security_invoker` y exigía 2, así que el revisor añadió una tercera vista que exponía
`precio` entero y los veinte tests siguieron en verde. **Un test de inventario no es un
test de invariante.** Ahora cuenta las que NO lo tienen y exige cero, igual que el de RLS,
que estaba bien escrito desde el principio por ese mismo motivo. Una cuarta comprobación, del lado del proxy, dejó una lección aparte que
está en la #52.

**Archivos de `fases/` que cambian:** `fase-0-fundaciones.md` § D4.

### #52 · El proxy verifica la firma él mismo, falla cerrado, y su test no puede ser complaciente
Fecha: 2026-09-09 · **vigente**
`verify_jwt = false` en `config.toml` **no** significa que la función sea pública:
significa que la verificación la hace la función y no la plataforma. Hace falta porque
`GET /health` tiene que responder sin credenciales — es el latido, y si dependiera del
token no serviría para saber si la función está viva.

La verificación HS256 está escrita a mano con Web Crypto, sin dependencias: son cuarenta
líneas que se leen enteras, y es el único punto donde se decide si alguien puede gastar
dinero en modelos. Una dependencia ahí es una dependencia dentro del control de acceso.

**Falla cerrado.** Sin `AI_PROXY_JWT_SECRET` configurado, el proxy responde 500 y no
atiende nada. Un proxy mal configurado que aceptara todo sería peor que uno caído: no se
notaría hasta la factura. Y el `401` es siempre idéntico — no dice si el token está
caducado, mal firmado o ausente — porque distinguirlos sería un oráculo para quien quiera
fabricar uno. El motivo se registra en el servidor.

**Dos caminos sin autenticar que reventaban la función**, encontrados por el revisor y
arreglados con sus tests escritos antes: una firma que no era base64 válida (`atob` lanza)
y una cabecera `null` (leer `.alg` de `null` lanza). Las dos salían de `verificarJwt`,
`Deno.serve` las convertía en un **500 con traza en el log**, y eso rompe la promesa de
arriba: había un tercer resultado observable, alcanzable por cualquiera sin credenciales.
No era un bypass, pero sí una forma barata de ensuciar los logs y gastar invocaciones.
Ahora el cuerpo entero de `verificarJwt` va dentro de un `try`, porque **un token es texto
que manda un desconocido** y cualquier cosa que lance ahí sale a la superficie.

**La lección del día, y es fina.** Se escribió un test del ataque clásico, `alg: "none"`
sin firma. Al comprobarlo por rotura — quitando la comprobación de `alg` — ese test
**siguió en verde**: un token sin firma lo rechaza igual cualquier verificador, porque la
firma vacía no cuadra. O sea que el test del ataque famoso no estaba probando la defensa
que decía probar. El que sí la aísla es otro: una cabecera que dice `HS512` sobre una
firma HS256 válida. Sin la comprobación de `alg`, ese pasa.
**Generalizando: un test contra un ataque con nombre no prueba la defensa; hay que
comprobar cuál es la línea de código que, al quitarla, lo pone rojo.**

**Archivos de `fases/` que cambian:** `fase-0-fundaciones.md` § D4.

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
