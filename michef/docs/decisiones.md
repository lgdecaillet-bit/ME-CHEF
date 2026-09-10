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

Vigentes: **#1–#3, #5–#54**. Reemplazadas: #4 (por #29).

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


### #53 · Lo que encontró el primer CI, y por qué se arregló así
Fecha: 2026-09-10 · **vigente**
El primer CI encontró tres cosas que llevaban días en el repo sin que nada las dijera. Es
exactamente para lo que existe: una máquina limpia no tiene el PATH de nadie, ni sus
enganches, ni sus herramientas a medio instalar.

**1 · `depcruise` y `knip` como nombres de script chocaban con `node_modules/.bin`.**
`npm run depcruise` ejecutaba un script que invoca un binario que se llama igual. Funciona
— por eso nadie lo había visto — pero es un nombre sombreando a otro, esperando a que
alguien cambie uno y crea haber cambiado el otro. Pasan a llamarse **`arquitectura`** y
**`codigo-muerto`**, que además dicen qué hacen. Actualizados `gates`, el CI, `COMANDOS.md`
y `protocolos-calidad.md`.

**2 · jest 30.5.1 frente al `~29.7` que espera el SDK 57.** Todo funciona: 189 tests con
`jest-expo@57.0.5`. Se declara la excepción en `expo.install.exclude` en vez de fingir que
no existe o de bajar a jest 29 sin motivo. **Se revisa en cada subida de SDK**, junto con
#44, #46 y #48 — ya son cuatro cesiones al ecosistema de Expo, todas con su condición de
revisión escrita.

**3 · gitleaks fallaba con «Resource not accessible by integration».** La acción pide la
lista de commits del PR para saber qué rango escanear, y el workflow solo daba
`contents: read`. Añadido `pull-requests: read`. Un permiso de menos no se ve en local
porque en local no hay permisos.

**Dos desviaciones del plan de D5, las dos deliberadas:**
- **Sin `paths-ignore`.** El plan ponía `['research/**', '**.md']`. Un check que no se
  ejecuta queda **pendiente para siempre**, y el día que sea obligatorio bloquea el PR sin
  forma de desbloquearlo salvo saltándose la regla. Dos minutos en un PR de documentación
  cuestan menos que esa trampa. `research/` ni siquiera está en el repo.
- **`reglas-de-rama.js` en Node, no `branch-rules.sh`.** Luciano trabaja en PowerShell;
  `node scripts/...` le funciona igual que los otros dos scripts del repo, y un `.sh` le
  pediría abrir otra terminal.

**Archivos de `fases/` que cambian:** `fase-0-fundaciones.md` § D5.

### #54 · `main` protegida, y el repositorio pasa a ser público
Fecha: 2026-09-10 · **resuelta el mismo día**

> **RESUELTA.** Luciano eligió la opción 2: hacer el repositorio público. `main` quedó
> protegida el 2026-09-10 con `npm run reglas:rama`, y la prueba del gate rojo se completó
> entera (`protocolos-calidad.md § 8`): un push directo a `main` se rechaza, y un PR en
> rojo no se puede mergear.
>
> **Lo que hay que tener presente ahora que el repositorio es público**, porque no es
> gratis del todo:
> - **Todo `docs/` es legible por cualquiera**: el roadmap entero, las 54 decisiones, la
>   estrategia de producto y las conclusiones de la investigación. Es una decisión de
>   negocio, no técnica, y está tomada a sabiendas.
> - **Ningún secreto está expuesto.** Comprobado con `gitleaks git` sobre el historial
>   completo después del cambio: sin hallazgos. Los tokens viven en GitHub Secrets, que
>   siguen siendo privados; la `anon key` sigue solo en el `.env` local, ignorado.
> - **Los PR de forks también disparan el CI**, y por diseño de GitHub no reciben los
>   secretos del repositorio. El job `supabase` funciona igual porque levanta su propio
>   Postgres.
> - **Los minutos de Actions pasan a ser ilimitados** en repos públicos.
> - Si algún día vuelve a ser privado, **la protección de rama se pierde** con el plan
>   gratuito y hay que volver a esta decisión.

Lo de abajo es el análisis original, que se conserva porque explica por qué hacía falta
decidir.

---

**GitHub no permite proteger ramas en repositorios privados con cuenta gratuita.**
Comprobado, no supuesto: tanto `repos/.../rulesets` como la protección clásica devuelven
`403 Upgrade to GitHub Pro or make this repository public`.

Consecuencia concreta, y conviene no maquillarla: **el CI ya dice rojo o verde, pero hoy
nada impide mergear en rojo ni hacer `git push` directo a `main` saltándose el CI entero.**
La última barrera sigue siendo la disciplina de una persona, que es justo lo que la Fase 0
existe para no necesitar.

Dos salidas, las dos de Luciano:
1. **GitHub Pro**, unos 4 USD al mes. Es lo recomendado.
2. **Repo público**, gratis. Probablemente no es lo que quiere para el producto.

`scripts/reglas-de-rama.js` está escrito, probado hasta donde llega y es idempotente: el
día que haya plan, `npm run reglas:rama` lo aplica. Falla con una explicación en castellano
y código 2, no con un error críptico, precisamente para que dentro de tres meses nadie
tenga que averiguar por qué no funcionó.

**Mientras tanto:** el flujo de un PR por tarea se mantiene por convenio y el revisor sigue
pasando antes de cada PR. **No se mergea nada en rojo**, aunque se pueda.

---

### #55 · Ningún merge en rojo, y `--admin` no es una salida

Fecha: 2026-09-10 · **vigente, sin fecha de revisión** · la fija Luciano, en estos términos

> «No tienes permiso jamás para sobrepasarte el PR si los tests no están en verde.»

**La regla, sin matices.** Ningún agente y ninguna sesión de Claude mete nada en `main`
que no sea un PR con **los tres checks en verde**. Queda prohibido, en concreto:

- `gh pr merge --admin`, en cualquier forma y por cualquier motivo.
- `git push` directo a `main`, con o sin `--no-verify`.
- Desactivar, relajar o borrar el ruleset «main protegida» para dejar pasar algo.
- Sacar un check de la lista de obligatorios, aunque sea «un momento».
- Poner un `.skip`, bajar un umbral de cobertura o añadir una excepción a gitleaks
  **para que un PR concreto pase**.

**Qué se hace cuando el CI está rojo.** Se arregla lo que está rojo. Si lo rojo es el
gate y no el código, se arregla el gate en su propio PR, que también tiene que ponerse
verde. Y si no se sabe cómo, **se para y se le dice a Luciano** — con el check que falla
y lo que dice, tal cual — en vez de buscar la forma de rodearlo.

**Por qué hace falta escribirla, si ya está la protección de rama.** Porque la protección
**no lo impide**: Luciano es dueño del repositorio, y GitHub deja que un administrador se
salte sus propias reglas (decisión #54). El candado técnico se acaba justo ahí. A partir
de ese punto solo hay una regla escrita, y esta es esa regla. Es de Luciano, no una
preferencia del agente: **no existe la circunstancia en la que un agente decida por su
cuenta que este PR sí merece pasar en rojo.**

**Y por qué importa más de lo que parece.** Un gate que se salta una vez «porque este
caso era distinto» deja de ser un gate y pasa a ser una sugerencia. Todo lo que costó la
Fase 0 — los 189 tests, los 22 candados de RLS, los tres checks, la prueba del gate rojo
hecha dos veces — vale exactamente lo que valga el día que menos ganas haya de
respetarlo. Es la lección de la #47 vista desde el otro lado: **un gate que nunca bloquea
y un gate que se puede saltar cuando molesta son, en la práctica, el mismo gate.**

**Lo único que queda fuera, y es solo de Luciano:** si algún día decide mergear en rojo,
lo hace él, con su mano, y escribe por qué en el PR. No se le pide al agente, y el agente
no lo ofrece.

---

### #56 · La identidad de la app: `com.mechef.app`, nombre corto `mechef`, dueño `lucogav8`

Fecha: 2026-09-10 · **vigente** · la eligió Luciano, sobre la recomendación de Claude

- **`ios.bundleIdentifier`: `com.mechef.app`.** Es el nombre de la app ante Apple y es
  **permanente**: si cambia después de publicar, para Apple es otra app distinta. Neutro
  entre Suiza y Colombia, y con el nombre del producto. El plan proponía `ch.michef.app`,
  que ataba la app a Suiza y usaba la ortografía vieja.
- **`slug` y `scheme`: `mechef`**, alineados con Sentry (`mechef`) **antes** de
  `eas init`, que era cuando cambiarlo todavía era gratis. Después de `eas init` el
  `slug` es el nombre del proyecto en expo.dev, y el `scheme` es el de los enlaces que
  abren la app (`mechef://`). La carpeta del proyecto se queda como `michef`: no la ve
  nadie y renombrarla solo movería rutas.
- **`owner: 'lucogav8'`, fijado en `app.config.ts`.** La sesión de `eas` de Luciano tiene
  dos cuentas, `lucogav8` y `tes0` (TESO). Sin el `owner`, el proyecto podía acabar
  registrado bajo la de TESO. Resultado: **`@lucogav8/mechef`**, ID
  `5360a08d-118b-4dc0-a012-c1955bedf59c` (no es secreto).

### #57 · Lo que D6 cambió respecto al plan escrito, y por qué

Fecha: 2026-09-10 · **vigente**

1. **`@supabase/supabase-js` pasa a Fase 1.** Aprobado por Luciano. Es JavaScript puro:
   no cambia la huella del build, así que meterla después cuesta lo mismo que hoy.
   Instalarla sin usarla la dejaba sin test y marcada por `codigo-muerto` desde el primer
   día. Entra con la sesión anónima, que es su primer uso, y con el test que la prueba.
2. **El botón de prueba lanza un error de JavaScript, no `Sentry.nativeCrash()`.** Expo Go
   no incluye el código nativo de Sentry. Comprobado en el código del SDK instalado
   (`sdk.js`: «native errors features are not available in Expo Go»). El crash nativo se
   prueba con un build de desarrollo, cuando haya licencia de Apple.
3. **`ThemeProvider` pasa a D6.5.** El tema claro/oscuro es parte del sistema de diseño;
   ponerlo ahora obligaba a decidir colores dos veces.
4. **`SENTRY_AUTH_TOKEN` en EAS pasa a D7.** En D6 nada lo usa: Expo Go no sube mapas de
   código. Y hay un problema conocido que conviene resolver en D7 con el primer build
   delante: los **tokens de organización** de Sentry creados en organizaciones de la
   **región EU** llevan dentro la dirección de EE. UU., y `sentry-cli` la usa por encima
   de `SENTRY_URL`, así que la subida falla con `401 Invalid org token`
   (getsentry/sentry-cli#3385, cerrado). La salida reconocida es un **token personal**
   con `SENTRY_URL=https://de.sentry.io`. El token que hay hoy en GitHub Secrets es de
   organización, así que **probablemente habrá que reemplazarlo en D7**.
5. **`platforms: ['ios']`, explícito.** Sin él, Expo deducía `ios, android, web` de las
   librerías instaladas, en contra de lo decidido en D1.
6. **El DSN de Sentry es opcional; un interruptor mal escrito no.** Sin DSN la app arranca
   sin avisos, para poder trabajar sin cuenta de Sentry. Un interruptor con un valor que
   no se entiende **para la app al arrancar** en vez de quedarse apagado: uno que se apaga
   en silencio es un error que cuesta una tarde encontrar.
7. **`expo-system-ui` queda ignorada en `codigo-muerto`**, no borrada. Viene del scaffold y
   Expo la usa para el tema en Android. Quitar una dependencia es su propio paso: se
   decide en D6.5, junto con el tema.

Añadido tras la revisión, que devolvió CAMBIOS y tenía razón en cada punto:

8. **Las variables de entorno en EAS pasan a D7** (fila 0.10 de D0, decisión #39). El
   plan las cargaba en D6, y se cayeron sin registrarse: lo cazó el revisor. Nada de D6
   las necesita, porque Expo Go lee el `.env` del PC. El primer build de D7 sí: `.env`
   está ignorado por git y un build de EAS no lo ve, así que sin ellas `env.ts` para la
   app al arrancar y el smoke de Maestro falla. Se cargan en D7 con `eas env:create`,
   junto con el token de Sentry.
9. **El plugin de `expo-secure-store` no entra hasta su primer uso (Fase 1).**
   `npx expo install` lo añadió solo a la configuración, y sin opciones mete en el build
   un permiso de Face ID —en inglés— para una función que no existe. El **paquete** sí se
   queda: entró con las nativas para que la huella cambie una sola vez. El **plugin**, que
   solo escribe permisos, entra con su primer uso, con el texto en castellano o con
   `faceIDPermission: false`.
10. **Una dependencia con script de instalación, declarada.** `@sentry/react-native` trae
    `@sentry/cli` 2.58.4, cuyo `postinstall` descarga el programa `sentry-cli` de
    `downloads.sentry-cdn.com`. Es el mecanismo oficial de Sentry y es lo que sube los
    mapas de código en D7. Además `npm audit` pasa de las 18 moderadas de la #46 a
    **19**: la nueva es `@sentry/react-native`, vía `expo`. Cero altas, cero críticas. Se
    acepta con la misma condición de revisión que la #46: al subir de SDK.
11. **`eas.json`.** `appVersionSource: "remote"`: el número de build lo lleva EAS y no el
    repo, así que dos builds no pueden chocar por un número que alguien olvidó subir ·
    `node` fijado en 22.23.2, el mismo que `.node-version` · canales `simulator` y
    `development` además de los del plan, uno por perfil, para que un update nunca
    llegue a un build al que no va · `submit.production` vacío, se rellena en Fase 6.
12. **El filtro de Sentry solo cubre los errores de JavaScript.** El SDK le quita
    `beforeSend` y `beforeBreadcrumb` a las opciones de la parte nativa
    (`@sentry/react-native/dist/js/wrapper.js:158`, comprobado): un crash nativo se envía
    sin pasar por `limpiarEvento`. Y `setUser`, `setTag` y `setExtra` se copian a la parte
    nativa sin filtrar. En Expo Go no hay parte nativa, así que hoy no aplica. En el build
    de D7 sí: aviso en `estado.md`. Mientras tanto, la regla es no llamar a
    `setUser`/`setTag`/`setExtra` con nada personal.

Añadido tras la **segunda** revisión, que volvió a devolver CAMBIOS, esta vez por cosas
nuevas:

13. **Las reglas del filtro de Sentry.**
    - **Un texto de más de 2.000 caracteres se quita entero, sin revisarlo.** Suele ser
      un JSON o una imagen en base64, y una foto no puede salir del teléfono. Además,
      revisarlo congelaba la app: la expresión de correos era **cuadrática** (3,4 s con
      50.000 caracteres, medido), y este filtro corre con cada error y con cada miga.
      Todas las repeticiones de las expresiones llevan ahora tope, y hay un test de
      tiempo que lo vigila aunque algún día se quite el de 2.000.
    - **Lo que CLAUDE.md prohíbe sacar —el objetivo físico y los comensales— se quita
      también por el nombre del campo:** `objetivo`, `comensal`, `restriccion`, `peso`,
      `edad`, `fechaNacimiento`, `alergias`… Solo como palabra entera: los `pesos` de un
      precio no son el `peso` de nadie.
    - **Y su límite, dicho tal cual, porque la primera versión de este punto prometía
      más:** las columnas reales de esas tablas (`src/db/schema.ts`) se llaman `tipo`,
      `valor`, `unidad`, `factorPorcion`, `noCome`. Esos nombres no delatan nada, y no
      pueden estar en la lista sin borrar media app. Así que **una fila solo se protege
      si va dentro de un campo llamado `objetivo`, `comensal` o `restriccion`**. La regla
      que de verdad protege es otra: **nunca se pasa una fila de la base local a `log` ni
      a Sentry.** Lo encontró el revisor pasando por el filtro todas las columnas del
      esquema.
    - **Los contextos que rellena el SDK** —una lista cerrada: `os`, `device`, `app`,
      `runtime`, `culture`, `trace`, `replay`, `ota_updates`, `react_native_context`— se
      limpian con una regla relajada, porque ahí `name` es «iOS» y `height` es la
      pantalla. **Cualquier otro contexto** —uno propio, puesto con `setContext`— se
      limpia en estricto. La primera versión aceptaba además todo lo que empezara por
      `expo`: un `setContext('exportacion', …)` se habría saltado el modo estricto, y el
      SDK no pone ningún contexto con ese nombre.
    - **`calle` solo como palabra entera**, no como principio de otra: por esa regla,
      `caller` y `callee` —palabras técnicas en inglés— caían por empezar por «calle».
    - **Lo que ningún filtro atrapa:** un nombre propio suelto en un texto («Ana Pérez»).
      La regla es no pasar nada personal a `log`, `setContext`, `setUser`, `setTag` ni
      `setExtra`.

### #58 · D6.5 se parte en dos, y lo que cambia del plan del sistema de diseño

Fecha: 2026-09-10 · **vigente** · los puntos 1 a 3 los decidió Luciano; el 4 lo propuso
Claude y Luciano lo aprobó; los 5 a 11 los decidió Claude al construir y **Luciano los
confirmó todos** el 2026-09-10, antes del merge

1. **Dos PRs.** **D6.5a**, la base: tokens, tema, `Texto`, `es.ts`, la galería, las reglas
   de ESLint de interfaz, el contraste y la pantalla inicial. **D6.5b**, los once
   componentes restantes, con `expo-symbols` y `expo-haptics`. Doce componentes con todos
   sus estados en un solo PR eran demasiado para revisarlos bien, y la base tiene que
   verse en el iPhone antes de construir encima.
2. **`Hoja` pasa a Fase 2.** Su primer uso es la hoja de cuenta al tocar «Cocinar»
   (`fase-2-nevera.md` § 2.9). Construirla ahora obligaba a elegir entre `@expo/ui` y
   `@gorhom/bottom-sheet` sin un caso real que la probara. Queda en la lista de
   componentes de Fase 2 (`diseno.md` § 5).
3. **Las capturas de la galería con Maestro (`galeria.yaml`) pasan a D7**, que es el paso
   donde entra Maestro. Hasta entonces la galería se revisa a ojo en el iPhone, que es lo
   que el DoD pide de todas formas.
4. **`eslint-plugin-react-native-a11y` no entra.** Su versión 3.5.1 declara compatibilidad
   solo hasta ESLint 8 (`peerDependencies: eslint ^3 … ^8`), y el proyecto usa ESLint 9
   (#44). Instalarlo exigía `--legacy-peer-deps`, que es forzar lo que el paquete dice que
   no soporta. La accesibilidad básica la exigen, en su lugar, tres cosas:
   - **los tipos:** las piezas de `src/ui/` piden la etiqueta de VoiceOver como prop
     obligatoria; sin ella, `npm run typecheck` falla;
   - **ESLint:** `Text`, `Pressable` y los demás controles —los de `react-native`, los de
     `react-native-gesture-handler`, el `Link` de expo-router y `Animated.Text`— solo se
     usan dentro de `src/ui/`; y un texto para VoiceOver escrito a mano
     (`accessibilityLabel="…"`, también dentro de un condicional o de una suma) no pasa;
   - **los tests RNTL**, que buscan cada control por su rol y su nombre, como lo hace
     VoiceOver.

   Se revisa si el plugin publica soporte para ESLint 9, junto con la #44.

   **Lo que ninguna regla ve, dicho tal cual.** La primera versión de este punto decía
   que nadie podía dibujar un botón sin pasar por `src/ui/`, y era falso: el revisor de
   D6.5a probó a saltarse las reglas y lo consiguió con un `Pressable` de
   gesture-handler, con un texto dentro de un condicional y con un color con nombre.
   Esos huecos se cerraron, cada uno con su línea en un fixture. En la segunda vuelta
   encontró tres más, también cerrados: un token bajo una clave `color`
   (`{ color: 'texto2' }`) saltaba como color, un `rgb()` dentro de una plantilla pasaba,
   y en los atributos una suma de dos niveles pasaba. Quedan estos:
   - un texto o un color guardados antes en una variable (`const s = 'Hola'` y después
     `{s}`), o montados por una función;
   - una suma larga con el texto al principio (`'Hay ' + a + b + c`): las sumas se
     miran hasta dos niveles;
   - un color que no sea hex, `rgb()`, `hsl()` o uno de los 148 nombres de CSS;
   - un control de una librería que no esté en la lista de `eslint.config.js`;
   - un `require()` en lugar de un `import`.

   Eso lo cubre la revisión del PR. Y las reglas de interfaz se aplican solo a `src/app/`
   y `src/ui/`: fuera de ahí, un `gap` del motor o una cadena `'#abc'` no son estilo.

Añadido al construir D6.5a. Estos los decidió Claude sobre la marcha, y Luciano los
confirmó al revisar el PR (2026-09-10):

5. **`BotonDeDesarrollo`, provisional.** Desde D6.5a, `Pressable` no se puede importar
   fuera de `src/ui/`, y la pantalla inicial tiene dos botones de desarrollo: el de Sentry
   y el que abre la galería. Hacía falta una pieza en `src/ui/` para ellos, y `Boton` es de
   D6.5b. Cumple lo mínimo de cualquier control (rol, etiqueta de VoiceOver obligatoria,
   44 pt, colores del tema) y **se borra en D6.5b**, cuando llegue `Boton`.
6. **El contraste es un test, no un script.** Vive en `src/ui/__tests__/contraste.test.ts`,
   con la fórmula en `src/ui/contraste.ts`, en vez de `scripts/contraste.ts`. Los scripts
   del repo son JavaScript y no pueden leer `tokens.ts` sin una herramienta más; como test
   corre igual dentro de `npm run gates`, del pre-push y del CI. Revisa cada color de texto
   sobre cada fondo (4,5:1) y, además, el borde sobre cada fondo (3:1, WCAG 1.4.11).
7. **Dynamic Type con tope por estilo.** React Native multiplica todos los estilos por
   igual (hasta ×3,571 con la letra más grande), y un título pasaría de 100 pt. Cada estilo
   lleva un tope (`escalaMaxima`): el tamaño que iOS le da con la letra más grande, 60 pt el
   título grande y 53 el cuerpo. La galería simula ×1,353 (la mayor antes de Accesibilidad)
   y ×3,571; «Del iPhone» deja que mande el ajuste real.
8. **Los valores de los tokens son una primera propuesta**, cerca de los grises de iOS. Dos
   se movieron para llegar a AA: el acento claro se oscureció a `#1A6B35` (el verde de iOS
   da 2,2:1 sobre blanco), y en oscuro el texto sobre el acento es negro. Hay un color que
   el plan no tenía, `sobreAcento`, porque el texto de un botón principal necesita el suyo.
   **Se deciden viendo la galería en el iPhone**: cambiar uno es cambiar una línea, y el
   test de contraste dice si sigue llegando a AA. **Decidido el 2026-09-10:** Luciano los
   vio en el iPhone y se quedan tal cual («así la tenía pensada»).
9. **Jest.** `src/app/` entra en la cobertura, como anunciaba `jest.config.js`, con tests de
   pantalla y de navegación. `src/ui/` y `src/i18n/` tienen umbral propio del 100 %. Y Jest
   transforma ahora `@sentry/*` y `standard-navigation` (la usa expo-router desde el SDK
   57): se publican como módulos ES, y sin eso cualquier test que cargue expo-router falla
   antes de empezar.
10. **`t()` no rompe la pantalla.** Una clave que no es un texto (solo posible forzando el
    tipo) se ve tal cual y se registra como error; un hueco sin valor se queda a la vista
    (`{n}`) y avisa. Un fallo que se ve, en vez de una app que se cierra.
11. **`expo-system-ui` se queda, por ahora.** El tema claro/oscuro no la necesita en iOS,
    pero es la que pinta el fondo de la vista raíz. Se decide al ver el modo oscuro en el
    iPhone; si sobra, quitarla es un cambio de dependencias con su propio «adelante».

### #59 · Lo que D6.5b decidió al construir los componentes

Fecha: 2026-09-10 · **vigente** · el plan lo aprobó Luciano («hagale manito»); estos puntos
los decidió Claude al construir, y quedan escritos para que Luciano los confirme o los
cambie al revisar el PR

1. **`Aviso` sin cola global.** Se construye con sus tres tipos, sus 3 s y el anuncio de
   VoiceOver; dónde se pone lo decide quien lo muestra. La pieza que los pone en cola y los
   dibuja encima de cualquier pantalla llega con su primer uso (Fase 1), cuando se sepa qué
   avisos hay. Y un error que pide hacer algo **no** va en un `Aviso`, que se va solo: va
   en la pantalla, junto a lo que hay que arreglar (WCAG 2.2.1, tiempo suficiente).
2. **Las animaciones, con `Animated` de React Native, no con Reanimated.** Son dos: el
   latido de `Cargando` y la etiqueta de `Campo`, las dos en el hilo nativo
   (`useNativeDriver`). Reanimated está instalada (la trae el scaffold), pero en Jest pide
   montar su propio entorno, y para dos animaciones no compensa. Se revisa cuando llegue
   una que la necesite: los gestos de la Fase 4.
3. **«Reducir movimiento» cuenta como activado mientras iOS no contesta**
   (`useMovimientoReducido`): es mejor no animar durante un instante que animar a quien
   pidió que no.
4. **Los iconos crecen con la letra del iPhone, hasta el doble** (`icono.escalaMaxima`).
   Como los de las apps de Apple; sin tope, uno de 48 pt con la letra más grande pasaría
   de 170 pt.
5. **`Boton` destructivo: rojo sobre gris, no relleno de rojo**, como el «Eliminar» de iOS.
   Lo que borra algo no debe ser lo que más llama la atención, y así no hace falta el par
   `sobreAcento` sobre `rojo`, que el test de contraste no mide.
6. **`Chip` mide 44 pt de alto**, como todo lo tocable, aunque un chip suela verse más bajo.
   Seleccionado manda sobre el tipo (una pregunta respondida ya no es duda), y
   deshabilitado manda sobre todo.
7. **`Tarjeta` pulsable no pide etiqueta de VoiceOver**: lee lo que tiene dentro, que es lo
   que se ve (WCAG 2.5.3).
8. **`Stepper` es un solo control ajustable para VoiceOver**, que sube y baja deslizando el
   dedo; los botones − y + son para el dedo. Redondea a los decimales del paso, porque en
   coma flotante 0,1 + 0,2 no da 0,3.
9. **`t()` escribe los números con coma decimal** («1,5 porciones»). Sin separador de
   miles todavía: llega con los precios, en Fase 3, con su test.
10. **Dos reglas de ESLint nuevas: `expo-symbols` y `ActivityIndicator`, solo en
    `src/ui/`.** La primera estaba en el plan («único lugar con iconos»). La segunda no: es
    «nunca una rueda sola» de `diseno.md` § 2.2 convertida en error de lint. Cada una con su
    línea en un fixture y su mutación.
11. **Los tokens crecen**: `icono` (tamaños y tope), `opacidad` (pulsado 0,6, latido 0,4,
    sombra 0,15), `duracion.aviso` (3 s) y `cargando` (el bloque de 192 pt y el largo de
    las tres líneas). Siguen siendo el único archivo con valores, salvo el grosor de borde
    de 1 pt, que ya se escribía así en D6.5a. La primera versión de este punto dejaba las
    medidas de `Cargando` fuera y decía lo mismo: lo vio el revisor.
12. **En la galería, el modo y el tamaño de letra se eligen con `Chip`**, y
    `BotonDeDesarrollo` se borró (#58.5). La pantalla inicial usa `Boton`: VoiceOver lee
    «Galería» y «Provocar error», y lo que hacen va como pista.
13. **Archivos que no estaban en la lista presentada**, cada uno por algo concreto:
    - `src/ui/letra.ts` saca de `Texto` el cálculo de Dynamic Type, para que `Campo`
      escriba con la misma letra. Es un refactor pequeño dentro de un PR de feature, que
      CLAUDE.md desaconseja; se hizo aquí porque sin él `Campo` copiaba la cuenta. Los
      tests de `Texto` no cambiaron y siguen pasando.
    - `Texto` gana `centrado` (lo pide `EstadoVacio`) y exporta `ColorDeTexto` (lo usan
      las piezas que colorean un icono).
    - `src/ui/useMovimientoReducido.ts` (punto 3).
    - `src/ui/__tests__/dibujar.tsx`: ayudas de los tests (el tema como `wrapper`, el
      estilo aplanado y un dedo que toca sin soltar).
    - `knip.config.js`: `expo-font` sale de las excepciones, porque ahora la importa
      `expo-symbols`. Lo avisó knip.
14. **Las dos dependencias nativas se prueban en Expo Go, no en un build.**
    `protocolos-calidad.md` pide build de simulador y Maestro cuando entra una dependencia
    nativa, y esa tubería llega con D7. `expo-symbols` y `expo-haptics` vienen dentro de
    Expo Go, así que la prueba del iPhone las usa de verdad; el build de simulador las verá
    por primera vez en D7.
15. **La etiqueta de `Campo` se coloca con la letra de ahora.** El sitio de arriba crece
    con Dynamic Type (la escala de la galería o la del iPhone, con el tope del cuerpo), y
    así la etiqueta encogida nunca tapa lo escrito. La primera versión la subía siempre
    16 pt, y con la letra más grande tapaba 36 pt del texto: lo vio el revisor, con la
    cuenta hecha sobre los tokens.

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

## Por verificar antes de depender de ello

- Precio de embeddings 2026
- Términos de CIQUAL, BEDCA y la base suiza de valores nutritivos
- Costos y términos de Google Places frente a Apple Maps
- Existencia de datos abiertos de precios en Suiza y Colombia
- Plan Production de EAS ($199/mes viene de fuente secundaria)
