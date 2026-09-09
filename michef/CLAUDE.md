@AGENTS.md

# ME CHEF — reglas del proyecto

Lee este archivo completo antes de escribir código. Estas no son preferencias:
son decisiones ya tomadas. Si una tarea parece requerir romper una de estas
reglas, **para y pregunta** en vez de buscar un atajo.

## Qué es ME CHEF

App nativa iOS (Expo/React Native) que resuelve la fatiga de decidir qué comer.
La función central es **la foto de la nevera**: una foto basta para obtener tres
recetas con lo que hay. Alrededor de eso hay tres módulos más: planear y mercar,
cocinar acompañado, y perfil/memoria.

Primeros usuarios: una mamá que cocina para tres en Suiza, y un estudiante que
cocina para sí mismo con intake calórico alto. Mismo modelo de datos: un hogar
con comensales, cada uno con su factor de porción.

## La regla de arquitectura

> **La IA interpreta y genera. La base de datos recuerda y calcula.**

Un modelo entra solo en tres momentos:
1. Interpretar lo desordenado: fotos, texto libre, objetivos vagos, porqués.
2. Generar una receta que no existe todavía en el catálogo.
3. Redactar con tono — y esto se pregenera en lotes, nunca en vivo.

Todo lo demás es determinista: porciones, lista de mercado, presupuesto,
"no repetir", ranking, timers, patrones de horario, disponibilidad por país.
**Si puedes resolverlo con una tabla y una suma, no llames a un modelo.**

## Prohibiciones duras

- **Ninguna API key de un modelo en la app.** Todas las llamadas pasan por el
  proxy en `supabase/functions/ai-proxy`. Si necesitas un modelo desde el
  cliente, añade un endpoint al proxy; nunca una key en el bundle.
- **`src/engine/` no importa nada de `src/ai/`.** El motor determinista es puro
  y testeable sin red. Si una función del engine parece necesitar un modelo, el
  diseño está mal.
- **Nada personal sale del teléfono**, con una sola excepción: líneas de factura
  ya mapeadas (producto × tienda × precio × fecha), sin identidad y con
  consentimiento explícito. El objetivo físico y los comensales nunca salen.
- **Las fotos se procesan y se descartan.** Se guardan ítems y líneas, nunca
  imágenes. Ninguna imagen de nevera llega al servidor compartido.
- **Nunca inventar un ingrediente.** Una receta sugerida a partir de una foto
  solo puede usar ingredientes marcados como `seguro` más la despensa básica del
  hogar. Lo `posible` se pregunta con un chip; no se asume.
- **Los números nutricionales vienen de tablas** (USDA y bases nacionales), nunca
  de un modelo. Si falta un valor, se marca como estimado con confianza baja.
- **Los datos de Open Food Facts viven en tablas separadas** (prefijo `off_`) y
  no se mezclan con el catálogo canónico. Licencia ODbL con share-alike: no
  redistribuir bases derivadas.
- **Sin claims médicos.** Los objetivos calóricos son orientativos y se muestran
  como aproximados.

### Cuenta

La primera foto y las tres recetas ocurren **sin cuenta**, con sesión anónima de
Supabase. El login (Apple/Google) se pide **al tocar «Cocinar»**, en una hoja que
explica qué se guarda, y se vincula con `linkIdentity`. **Cocinar requiere cuenta.**
No existe «cocinar sin cuenta»: «Ahora no» vuelve a las recetas. Nunca se pide antes:
ni al abrir, ni al ver las recetas (decisión #29).

## Cómo se guarda cada cosa

**Personal — SQLite cifrado en el teléfono** (`src/db/schema.ts`):
hogar, comensales, objetivo (versionado), planes, semanas, comidas planificadas,
facturas y sus líneas, inventario, restricciones, escaneos, eventos.
Se exporta y se borra entero, verificable.

**Compartido — Postgres en Supabase** (`supabase/schema.sql`):
ingredientes canónicos, nombres por idioma, nutrición, productos por país,
tiendas, precios, recetas, pasos, textos por idioma, señales agregadas, vectores.
**Ninguna fila lleva identidad de usuario.**

**Nunca se guarda, siempre se calcula:**
- la lista de mercado (= Σ ingredientes de la semana × porciones − inventario)
- las macros de una receta (= Σ nutrición × cantidades)
- las pills derivadas (vegetariano, una olla, menos de 20 min, sin lactosa…)

Si te ves creando una columna para uno de estos tres, para.

## Las tres vueltas que hacen que escale

1. **Catálogo de recetas:** una receta se genera una vez y sirve a todos. El
   selector primero elige del catálogo; solo pide generar cuando no alcanza.
2. **Mapeo y precios:** cada línea de factura nueva se resuelve una vez y se
   guarda como Producto. La factura 100 de un país casi no llama al modelo.
3. **Restricciones:** cada "por qué" de un rechazo se vuelve un filtro permanente.
   La app no recuerda con un modelo: aplica reglas que el usuario escribió con
   sus rechazos.

Cachea **toda** respuesta de modelo. Sin excepción.

## Stack

- **App:** Expo SDK **57** (RN 0.86, React 19.2, TS 6; corregido de «54+» por decisión
  #26), React Native, TypeScript, iOS-only. Se desarrolla en Windows; los builds los
  hace EAS Build en la nube. No hay Mac para compilar. Expo Go sirve para desarrollar
  hasta la Fase 2 (decisión #27).
- **Local:** `expo-sqlite` con SQLCipher + Drizzle ORM.
- **Backend:** Supabase (Postgres + pgvector, Auth Apple/Google, Storage,
  Edge Functions).
- **Modelos:** Gemini Flash para visión (nevera y tickets), Claude Haiku 4.5 para
  texto barato, Sonnet 5 vía Batch API para el pipeline de recetas,
  Nano Banana para imágenes.
- **Lotes:** Trigger.dev.
- **Evals:** Promptfoo contra el set de 200 fotos.
- **Observabilidad:** PostHog (eventos sin PII) + Sentry.

## Estado y orden de trabajo

El estado vivo está en `docs/estado.md` (fase, paso, tareas tomadas, siguiente paso).
El roadmap completo en `docs/roadmap.md`; el detalle de cada fase, con criterio de
salida verificable, en `docs/fases/`. Regla de avance: **todo lo determinista va
primero**; una fase no empieza hasta que la anterior cumple su criterio de salida.

Diferido a después del TestFlight: sync CloudKit multi-dispositivo, francés y
alemán, Colombia, RevenueCat, detector on-device.

## Convenciones de código

- TypeScript estricto. Nada de `any` sin comentario que lo justifique.
- El engine es funciones puras: entra un objeto, sale un objeto. Sin efectos.
- Cantidades siempre en gramos o mililitros internamente. Las unidades caseras
  son formato de presentación.
- Nombres de dominio en español (`hogar`, `comensal`, `receta`, `inventario`),
  código y tipos en inglés donde sea idiomático. Consistencia sobre pureza.
- Todo lo que dependa de país o idioma es un valor de columna, nunca una rama
  del código.

## Protocolo de sesión

La memoria del proyecto vive en el repo, no en la conversación (decisión #36). Estos
pasos no son opcionales: son lo que hace que una sesión nueva retome sin que Luciano
explique nada, y que varias sesiones no se pisen.

**Antes de D1** no hay ramas, gates ni PRs todavía. Hasta entonces, los cambios de solo
documentos van directo a `main`, commiteados, con su entrada en `bitacora.md`. `npm run
gates` y el revisor aplican desde el primer PR de código (D1).

**Al abrir una sesión, antes de hablar:**
1. Leer este archivo entero.
2. Leer `docs/estado.md` entero.
3. Leer las últimas 3 entradas de `docs/bitacora.md`.
4. Leer `docs/decisiones.md` desde la última que conocías hasta la vigente (el número
   está en `estado.md`).
5. Decir en una frase dónde está el proyecto y qué toca. Si Luciano no está de acuerdo,
   se corrige ahí, antes de tocar nada.
6. Si `estado.md` muestra una tarea tomada por otra sesión sin cerrar, **no la retomes ni
   la dupliques**: pregunta a Luciano si se retoma o se descarta.

**Al tomar una tarea:**
- Una tarea = una rama = un PR. Nombre: `tipo/ID-descripcion` (ej. `test/F0-D3-motor`).
- Escribir la fila en «Tareas tomadas» de `estado.md` con rama y sesión. Desde D1, la
  rama en `origin` es el candado: si ya existe, la tarea está tomada por otro.
- Presentar el paso a Luciano y esperar «adelante» (ver «Cómo trabajar conmigo»).

**Al cerrar una tarea, en el mismo PR que el código:**
1. `npm run gates` verde.
2. Invocar al subagente `revisor` (`.claude/agents/revisor.md`) sobre el diff. Solo con
   `APROBADO` se abre el PR. El veredicto se pega en la descripción del PR.
3. Entrada en `docs/bitacora.md` con todos los campos. Actualizar `docs/estado.md`:
   progreso, quitar la fila de tareas tomadas, «Siguiente paso concreto».
4. Si se tomó una decisión nueva con Luciano, añadirla a `docs/decisiones.md` con número
   y subir el «vigentes hasta» de `estado.md`.
5. Reportar a Luciano qué se corrió y qué salió.

**Si Luciano cambia la visión:** se añade la decisión nueva en `decisiones.md` (número,
fecha, «reemplaza a #N»), se marca la vieja como reemplazada, se actualizan los archivos
de `docs/fases/` afectados y el número en `estado.md`. Un solo sitio, siempre fechado.

**Identificador de sesión:** `S-AAAAMMDD-x`. Para elegir la letra: mira la última
entrada de `bitacora.md` y la tabla «Sesiones de hoy» de `estado.md`; toma la letra
siguiente y anótala en esa tabla **antes** de hacer nada más. Así dos ventanas el mismo
día no chocan.

**Varias ventanas a la vez:** en Fase 0 no (decisión #38). Cuando se abra la segunda,
se construye el sistema de coordinación descrito en la bitácora del 2026-09-09 antes de
trabajar en paralelo.

## Cómo trabajar conmigo

- **Todo paso se aprueba antes de ejecutarse.** Ninguna tarea del roadmap
  (`docs/fases/`), ningún PR, ninguna instalación de dependencia, ninguna
  migración, ningún cambio de configuración empieza sin que Luciano haya dicho
  «adelante» a ese paso concreto. Aprobar un paso no aprueba el siguiente.
  Si un paso aprobado revela que hace falta otro no previsto, se para y se
  pregunta.
- Antes de cada paso, presenta: qué se va a tocar (archivos), qué se va a
  instalar (con versión), qué test lo protege, y cómo se verifica. Después del
  paso, reporta qué se corrió y qué salió — tal cual, sin adornar.
- Cuando una decisión no esté en este archivo ni en `docs/decisiones.md`,
  pregunta en vez de asumir. Si la decides conmigo, añádela a `decisiones.md`.
- Sé honesto sobre lo que no funciona. No digas que algo está listo si no lo has
  corrido. Si un gate falló y lo saltaste, dilo en la primera línea.
- Corre `npm run gates` antes de decir que algo está listo. Si no lo corriste, dilo.
- **Prohibido `--no-verify`.** Si un hook estorba, se arregla el hook.
- Una feature = una rama = un PR. Nunca refactor y feature en el mismo PR.
- Las instalaciones globales de npm (`npm i -g`) las corre Luciano, no el agente.

## Cómo se verifica

Los gates están en `docs/protocolos-calidad.md`: editor → pre-commit → pre-push → CI →
EAS Workflows → release. Un PR sin CI verde no se mergea. Un PR sin veredicto
`APROBADO` del revisor y sin entrada en `docs/bitacora.md` no cumple el Definition of
Done.

## Seguridad del código

La calidad no es una fase: es una condición de cada PR. Reglas vivas en
`docs/protocolos-calidad.md`; estas son las que no se negocian.

- **Buscar bugs es parte de escribir código.** Antes de dar por terminada una
  función: casos límite (vacío, cero, negativo, NaN, unidad distinta, duplicado,
  fecha inválida), y una propiedad que siempre debe cumplirse (ej. «la lista de
  mercado nunca tiene cantidades negativas»). Si no se te ocurre una propiedad,
  el diseño de la función probablemente está mal.
- **Un bug encontrado se registra como test antes de arreglarse.** Primero el
  test que lo reproduce (rojo), después el arreglo (verde). Nunca al revés.
- **Nada se mergea en rojo.** Sin `--no-verify`, sin `.skip` sin issue y fecha,
  sin `.only`, sin bajar un umbral de cobertura para que pase.
- **Todo input externo se valida en la frontera** con `zod`: respuestas del
  proxy, filas de Supabase, variables de entorno, JSON de modelos. El motor
  nunca recibe un `unknown`.
- **Revisión de seguridad en cada PR que toque** `src/ai/`, `supabase/`,
  `app.config.ts` o dependencias: ¿sale algo personal del teléfono? ¿hay una key
  al alcance del bundle? ¿una tabla sin RLS? ¿una dependencia nueva con
  instalación (`postinstall`) o sin mantenimiento? Se responde por escrito en el
  PR.
- **Dependencias:** solo con versión fijada, solo si `npm audit` no reporta
  alta/crítica, solo si el paquete se necesita de verdad (`knip` lo confirma).
  Una dependencia nativa nueva obliga a build de simulador + Maestro verdes.
- **Secretos:** ninguna key de modelo en `src/`, en `app.config.ts`, en `.env`
  con prefijo `EXPO_PUBLIC_`, ni en ningún commit. `gitleaks` corre en
  pre-commit y en CI; el bundle exportado se grepea antes de mergear.
