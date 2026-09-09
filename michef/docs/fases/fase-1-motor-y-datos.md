# Fase 1 · El motor y los datos personales

> **Semanas 3–4 · No necesita licencia de Apple** (dos piezas quedan detrás de flag hasta que la haya).
>
> Al terminar, un usuario nuevo abre la app, dice qué tiene en la nevera con chips, y ve
> tres recetas del catálogo que puede cocinar — **sin que se haya llamado a un modelo ni
> una vez**. Todo lo que resuelve el dolor del primer usuario (porcionar para tres, no
> gastar de más) ya funciona.

---

## En una frase

Es la regla de arquitectura aplicada al orden de trabajo: **todo lo que se resuelve con
una tabla y una suma se construye antes que cualquier cosa que necesite un modelo.**

## Criterio de entrada

- Fase 0 cerrada entera (checklist verificada).
- Los 7 bugs del motor están registrados como `test.failing`.

## Criterio de salida — se verifica cada punto

- [ ] Los 7 `test.failing` del motor **pasaron a verdes** y se quitó el `.failing`. Cobertura del engine **100 % líneas, 95 % ramas**.
- [ ] `Comensal.noCome` es restricción dura: un test de propiedad demuestra que ninguna receta devuelta contiene un ingrediente que algún comensal no come.
- [ ] Las migraciones de Drizzle aplican sobre una DB vacía **y** sobre una DB con datos de la migración anterior (test en Node).
- [ ] Exportar produce un JSON legible con **todas** las tablas personales; borrar deja la DB **vacía**, verificado por test.
- [ ] La app arranca con sesión anónima de Supabase sin pedir nada. El `user.id` anónimo se guarda en Secure Store.
- [ ] Flujo completo en Expo Go: abrir → (sin preguntas) → inventario manual con chips → **tres recetas** del catálogo semilla → elegir una → ver cantidades escaladas al hogar.
- [ ] Onboarding de dos preguntas aparece **después** del primer resultado, con "saltar" visible; si se salta, el hogar queda con 2 porciones y 30 min.
- [ ] `flags.cifrado` existe y su rama está escrita; el test de cifrado está como `test.todo` con nota "requiere development build".
- [ ] PostHog recibe `app_abierta`, `inventario_manual {n_items}`, `recetas_mostradas {n}`, `receta_elegida {posicion}` — y **ninguno lleva nombres de ingredientes ni datos del hogar**.
- [ ] Maestro: `onboarding.yaml` e `inventario-manual.yaml` pasan en EAS.
- [ ] Cero llamadas de red a modelos. `depcruise` y un test del proxy (`501` en todas las tareas) lo garantizan.

---

## Stack que entra en esta fase

| Capa | Herramienta | Versión | Para qué | ¿Expo Go? |
|---|---|---|---|---|
| Datos locales | `expo-sqlite` | SDK 57 | SQLite en el teléfono | ✅ sin cifrar |
| | `expo-sqlite` + `useSQLCipher: true` | SDK 57 | Cifrado AES-256 del archivo | ❌ dev build · **detrás de flag** |
| | Drizzle ORM + `drizzle-kit` | 0.4x / 0.3x | Esquema tipado, migraciones, consultas | ✅ |
| | `expo-secure-store` | SDK 57 | Clave de cifrado, id de sesión, en el Keychain | ✅ |
| Backend | `@supabase/supabase-js` | 2.x | Sesión anónima, lectura del catálogo | ✅ |
| | Supabase Auth · anonymous sign-ins | — | `signInAnonymously()`. Se activa en el panel | ✅ |
| | `expo-apple-authentication` | SDK 57 | `linkIdentity` con Apple | ❌ contra Supabase real · **detrás de flag** |
| Validación | `zod` | 4.x | Entradas del motor, env, respuestas del catálogo | ✅ |
| UI | `expo-router` | v7 | Navegación por archivos | ✅ |
| | `react-native-reanimated`, `gesture-handler` | 4.5 / 2.32 | Ya en el scaffold | ✅ |
| Analítica | `posthog-react-native` | 4.x | Eventos sin PII | ✅ |
| Tests | `fast-check`, `better-sqlite3`, RNTL | — | Ya instalados en Fase 0 | — |

**Nada de esto cambia el fingerprint salvo `expo-sqlite` con SQLCipher y
`expo-apple-authentication`.** Los dos entran en `app.config.ts` desde el principio de la
fase (para que el build de simulador los compile y verifique que la configuración es
válida), pero su rama de código queda apagada por flag hasta que haya development build.

---

## Qué se construye, paso a paso

### 1.1 · Los bugs del motor — **cuatro hechos, cinco pendientes**

> **Actualizado el 2026-09-09 por la decisión #49.** Este paso ya no empieza de cero.
> BUG-1, BUG-4, BUG-5 y BUG-7 se arreglaron el mismo día que se registraron, en la rama
> `fix/F1-motor-cuatro-bugs`, porque tenían una sola respuesta correcta y ningún llamador
> que romper. Sus tests ya no son `.failing`. Lo de abajo describe **el arreglo real**, que
> en dos casos no coincide con lo que este documento planeaba; donde difiere, manda el
> código y aquí queda dicho por qué.
>
> Aparecieron además **BUG-8 y BUG-9**, registrados y sin arreglar, esperando el
> «adelante» de Luciano.

Cada bug: primero se quita `.failing` del test (queda rojo) → se arregla → verde → commit.
Nunca dos bugs en un commit. **Salvedad de la #49:** cuando varios arreglos van en un solo
PR, ese PR se cierra con squash y los commits intermedios desaparecen, así que la
granularidad útil es de un PR por bug, no de un commit por bug. Si se quiere la traza,
se abren PRs separados.

| Id | Arreglo |
|---|---|
| BUG-1 | ✅ **hecho.** Como se planeó, salvo que el tipo quedó `cantidad?: number` (opcional) y no `number \| null`: es lo idiomático en TypeScript y todo el motor compara con `== null`, que cubre los dos. La columna `inventario.cantidad` dejó de ser NOT NULL, con un test que la vigila. **Consecuencia pendiente:** al leer de la base vuelve `null`, así que el repositorio de 1.3 tiene que normalizar `null → undefined`. |
| BUG-2 | `fusionarEscaneo` recibe `unidadDe: (id) => Unidad` (viene del catálogo). Si no la sabe, `'g'` **y** confianza × 0,8 — no se calla el problema. |
| BUG-3 | `listaDeMercado`: si dos recetas piden el mismo ingrediente en unidades distintas, lanza `UnidadIncoherenteError` con los dos ids. El motor no adivina conversiones: el catálogo canónico tiene una `unidad_base` por ingrediente y la receta tiene que respetarla. Es un dato mal formado, no un caso de negocio. |
| BUG-4 | ✅ **hecho**, y con más de lo planeado: la clave del acumulador es `(ingrediente, unidad)`, no solo el ingrediente. Sumar gramos con mililitros necesita densidades que aún no existen (BUG-3), así que lo que no se puede comparar cuenta como cero y se compra. Es la lectura conservadora de «nunca inventar». |
| BUG-5 | ✅ **hecho.** `comensales: Comensal[]` es **obligatorio y va en cuarto lugar**, delante de `restricciones` y `cuantas`. El primer intento lo dejó opcional al final y el revisor lo tumbó: con un valor por defecto bastaba olvidar el argumento para volver al comportamiento roto, y el compilador callaba. Ahora no compila. |
| BUG-6 | `Restriccion.valor` para `tiempo_max` se parsea con zod (`z.coerce.number().positive()`). Si no parsea: la restricción se ignora **y se loguea** `restriccion_invalida`. Nunca silencio. |
| BUG-7 | ✅ **hecho**, tal cual. Hay además un test de ejecución que comprueba que `cantidadPorPorcion` no reaparece: la causa original era un `...i`, y **TypeScript no avisa de las propiedades de más que llegan por un spread** — comprobado rompiéndolo. |
| BUG-8 | ⏳ registrado, sin arreglar. `fusionarEscaneo` y `descontarCocinado` tienen el mismo `new Map` con claves repetidas que tenía BUG-4: seis huevos de factura más seis de escaneo quedan en seis al sacar una foto. **Antes de arreglarlo hay que decidir** si el inventario se normaliza a una fila por (ingrediente, unidad, origen) o si estas funciones agrupan como hace `listaDeMercado`. |
| BUG-9 | ✅ **hecho** (decisión #50). Función nueva `redondearParaComprar`, hacia arriba, solo para la lista; `redondear` sigue al más cercano para las recetas. Dos nombres en vez de un booleano, para que haya que elegir. `cantidadNecesaria` deja de redondearse: es lo que las recetas piden, y así `necesaria − en casa` cuadra con lo que falta. |

Además, en este PR:

- Todos los tipos de `types.ts` ganan un esquema zod en `src/engine/schemas.ts`. Las funciones públicas del motor validan su entrada con `parse` **solo en `__DEV__`** (en producción confían en el tipo; el coste de zod en cada cálculo no se paga).
- `src/engine/index.ts` exporta también los esquemas.

### 1.2 · `feat/engine-completo` — lo que falta del motor

Todo determinista. Todo con tests de ejemplo y de propiedad antes de la implementación.

1. **Ranking global** — `ranking.ts`. Fórmula explícita, pesos en un objeto exportado:
   ```
   ranking = 0.35·terminadas_norm + 0.25·repeticiones_norm + 0.20·estrellas_media_norm
           + 0.10·(1 − |minutos_reales − minutos_prometidos| / minutos_prometidos)
           − 0.10·regeneraciones_norm
   ```
   Con `_norm` = valor / máximo del catálogo. Es una decisión pendiente en `decisiones.md` ("Fórmula y pesos del ranking"); se toma aquí con estos pesos iniciales **y se anota**. Se recalcula en lote en Fase 5; en Fase 1 es una función pura que recibe `receta_senal`.
2. **Afinidad personal** — `afinidad.ts`. Puntaje por receta desde `evento` local: +1 elegida, +2 terminada, −2 regenerada, −3 rechazada con porqué. Decae ×0,9 por semana.
3. **No repetir** — `variedad.ts`. Recibe el historial de `comidaPlanificada` de las últimas N semanas y penaliza recetas cocinadas hace < 14 días y proteínas principales repetidas en la misma semana. Devuelve un multiplicador, no una exclusión (salvo restricción `mas_variedad`, que endurece a exclusión de 7 días).
4. **Selector de semana v0** — `selector.ts`. Recibe hogar, comensales, restricciones, historial, catálogo, y devuelve 7 × comidas_por_dia slots llenos. Algoritmo: filtrar (restricciones duras, tiempo, equipo) → ordenar (ranking × afinidad × variedad) → asignar por slot con una regla de presupuesto blanda (suma de precios estimados ≤ presupuesto; si no hay precios, ignora). **Sin modelo.** Si tras filtrar quedan menos recetas que slots, devuelve `{ slots, faltan: n }` — en Fase 5 eso dispara el pipeline.
5. **Macros de receta** — `nutricion.ts`. `macrosDeReceta(receta, nutricionPorIngrediente)` = Σ nutrición × cantidades / 100. Devuelve también `confianza` = mínima de las fuentes, y marca `estimado` si alguna fuente es `estimado`. **Nunca se guarda**: se calcula al mostrar.
6. **Pills derivadas** — `pills.ts`. `vegetariano` (ningún ingrediente de categoría proteína animal), `una_olla` (equipo de longitud 1), `rapida` (< 20 min), `sin_lactosa`, `sin_gluten` (por categoría del ingrediente). **Nunca se guardan.**
7. **Despensa básica por país** — `despensa.ts`. Tabla `{ CH: [...], CO: [...], ES: [...] }` con ids canónicos. Es una decisión pendiente ("Qué incluye la despensa básica por país"); se toma aquí con: sal, pimienta, aceite, ajo, cebolla, arroz, pasta, huevos, y por país: CH + mantequilla, caldo; CO + panela, maíz para arepa, plátano; ES + aceite de oliva, tomate frito. Se anota en `decisiones.md`.

### 1.3 · `feat/datos-locales` — SQLite, Drizzle, migraciones, cifrado detrás de flag

1. `drizzle.config.ts` (dialect `sqlite`, driver `expo`, `out: './drizzle'`).
2. `npm run db:generate` → `drizzle/0000_inicial.sql` + `drizzle/migrations.js`. **Las migraciones se commitean.** Nunca se editan a mano; si el esquema cambia, se genera una nueva.
3. `src/db/client.ts`:
   ```ts
   const db = openDatabaseSync('michef.db');
   if (flags.cifrado) {
     const clave = await obtenerOCrearClave();   // Secure Store, 32 bytes aleatorios
     db.execSync(`PRAGMA key = '${clave}'`);
   }
   ```
   `obtenerOCrearClave` está en `src/db/clave.ts` y tiene test: dos llamadas devuelven la misma clave; tras `borrarTodo()` la clave se destruye.
4. `src/db/migrar.ts` con `useMigrations` de Drizzle en `_layout.tsx`. Mientras migra, splash. Si falla: pantalla de error honesta con botón "Exportar y reiniciar".
5. `src/db/exportar.ts` — `exportarTodo(): Promise<string>` devuelve JSON con todas las tablas de `schema.ts`, ordenadas, con versión del esquema. Test: el JSON contiene exactamente las tablas del esquema, ni una más ni una menos (se compara contra `Object.keys(schema)`).
6. `src/db/borrar.ts` — `borrarTodo()`: borra filas de todas las tablas **en orden inverso de FK**, destruye la clave, borra el `user.id` de Secure Store, cierra sesión. Test: tras borrar, `select count(*)` de cada tabla es 0.
7. Repositorios finos en `src/db/repos/`: `hogar.ts`, `comensales.ts`, `inventario.ts`, `restricciones.ts`, `eventos.ts`. Cada uno: funciones que reciben `db` y devuelven tipos del motor. **El motor no sabe que existe una base de datos**; los repos traducen.
8. `src/db/__tests__/migraciones.test.ts`: aplica `0000` en `better-sqlite3` vacía → inserta datos → aplica (futuro) `0001` → los datos siguen. En Fase 1 solo hay `0000`, así que el test verifica el mecanismo con una migración de prueba temporal.

**Sobre el flag de cifrado.** El código de la rama `cifrado: true` se escribe **completo** en esta fase. Solo no se puede ejecutar en Expo Go. El día que llegue el development build: `EXPO_PUBLIC_FLAG_CIFRADO=true`, y se corre a mano el test manual documentado en `docs/fases/fase-1-motor-y-datos.md §Verificación del cifrado`.

### 1.4 · `feat/sesion-anonima` — Supabase Auth sin fricción

1. Activar **Anonymous sign-ins** en el panel de Supabase (Authentication → Providers).
2. `src/lib/supabase.ts` — cliente con `AsyncStorage`… **no**: con un storage adapter sobre `expo-secure-store` (la sesión es un token; va al Keychain).
3. Al arrancar (`_layout.tsx`): si no hay sesión → `signInAnonymously()`. Sin pantalla, sin pregunta. El usuario no sabe que pasó.
4. `src/lib/auth.ts` — `vincularConApple()` y `vincularConGoogle()` usando `linkIdentity`. Detrás de `flags.auth_apple`. Se llama desde el botón **«Cocinar esto»** (primera vez, Fase 2 con licencia) y desde ajustes. En Fase 1, con el flag apagado, «Cocinar esto» no pide nada.
5. RLS: las políticas de la Fase 0 ya permiten `authenticated` (un anónimo es `authenticated` con `is_anonymous = true`). No hay nada personal en Supabase, así que un anónimo no puede hacer daño: solo lee catálogo.
6. Test contra Supabase local: `signInAnonymously` devuelve sesión; `select` de `ingrediente` funciona; `insert` en `precio` falla.

### 1.5 · `feat/pantallas-base` — lo que se ve

Ver sección "Cómo se ve y cómo se siente" abajo para la UX. Aquí el mapa de archivos:

```
src/app/
  _layout.tsx            Stack raíz · migraciones · sesión · Sentry · PostHog
  index.tsx              Time to cook (vacío en Fase 1: solo CTA "¿Qué tienes?")
  inventario/
    manual.tsx           chips por categoría + buscador + "Ver recetas"
  recetas/
    index.tsx            las tres tarjetas
    [id].tsx             detalle: ingredientes escalados, pasos (texto plano)
  onboarding/
    preguntas.tsx        dos preguntas · saltables · después del primer resultado
  hogar/
    index.tsx            comensales con factor, país, despensa básica
  ajustes/
    index.tsx            exportar · borrar todo · (Fase 2: vincular cuenta, si aún no lo hizo al cocinar)
src/components/
  Chip.tsx · TarjetaReceta.tsx · ContadorRecetas.tsx · Pregunta.tsx · EstadoVacio.tsx
```

Cada pantalla tiene su test RNTL con los cuatro estados (vacío, cargando, error, ok).

### 1.6 · `feat/catalogo-semilla` — 20 recetas de verdad

1. `supabase/seed.sql` con **20 recetas** reales, de 4 a 7 ingredientes comunes, escritas a mano (no por modelo, todavía), con pasos, tiempos y equipo. Ingredientes canónicos (≈ 60) con nombres en `es`, categoría, `unidad_base`, `perecibilidad_dias`, y nutrición de USDA copiada a mano para esos 60.
2. `supabase db reset` aplica el seed en local; en producción se aplica una vez con `supabase db push` + seed.
3. `src/catalogo/` — descarga el catálogo publicado al arrancar (o cada 24 h) y lo guarda en una tabla local `catalogo_cache` (id, json, actualizado_en). **Es caché, no datos personales**: se puede borrar y volver a bajar. Sin red, se usa la copia.
4. Test: el catálogo descargado valida contra el esquema zod de `Receta`. Una receta mal formada en Supabase **no rompe la app**: se descarta y se loguea.

### 1.7 · `feat/analitica` — PostHog sin PII

1. `src/lib/analitica.ts` — `track(evento, props)` con **lista blanca de eventos y de propiedades**, tipada. Un evento fuera de la lista no compila.
2. Eventos de Fase 1: `app_abierta`, `onboarding_pregunta {n, saltada}`, `inventario_manual {n_items}`, `recetas_mostradas {n, ms}`, `receta_elegida {posicion}`, `receta_abierta`, `exportado`, `borrado_todo`.
3. Test: `track` con una propiedad que contenga un id de ingrediente **lanza** en `__DEV__`. La lista blanca es la garantía.

---

## Cómo se ve y cómo se siente

**Flujo de diseño:** cada pantalla de esta lista pasa por los cinco pasos de
[`../diseno.md`](../diseno.md) §3 (brief → boceto de todos los estados → revisión →
construcción con `src/ui/` → verificación en el iPhone) **antes** de escribir código de
pantalla. Componentes nuevos de esta fase: `TarjetaReceta`, `ContadorRecetas`, `Pregunta`,
`FilaComensal` — primero en la galería, después en la pantalla.

Principios que mandan sobre cualquier detalle visual, todos con fuente en el informe de
research:

- **Valor antes de la segunda pregunta.** El usuario ve recetas antes de que la app le pregunte nada. (research §1, P1)
- **Preguntas visuales, saltables, con salida explícita.** Barra de progreso, "2 de 2", botón "Saltar" siempre visible. (Grity, Hungryroot)
- **Nunca repetir el cuestionario** a quien vuelve. (Lose It!, Yazio como contraejemplo)
- **Contador de lo que desbloquea cada ingrediente.** «Con esto puedes hacer 4 recetas» y crece con cada chip. (SuperCook)
- **En cada receta: "tienes todo" o "te faltan 2".** (Fridgely)

### Pantalla 1 · Time to cook (índice)

Fase 1 la deja casi vacía a propósito: un saludo sin nombre («Hola» — no hay cuenta, no hay
nombre), y **un solo botón grande**: «¿Qué tienes en la nevera?». Debajo, en gris: «Tómale
una foto o dime qué hay». La foto no funciona todavía (flag `nevera` apagado): el botón de
foto **no se muestra**, no se muestra deshabilitado. Un botón deshabilitado es una promesa;
uno ausente, no.

### Pantalla 2 · Inventario manual

- Chips agrupados por categoría (proteína, verdura, lácteo, grano, condimento), los más
  comunes primero. Tocar = seleccionar. Buscador arriba para lo que no está a la vista.
- La **despensa básica** del país aparece preseleccionada en una fila aparte, con el texto
  «Damos por hecho que tienes esto. Toca para quitar.» Un toque quita. Se guarda para siempre.
- Abajo, fijo, el **contador**: «Con esto: 3 recetas» → cambia en vivo al tocar chips. Es
  un filtro del catálogo local: cero latencia.
- Botón «Ver recetas» activo desde que hay ≥ 1 receta posible.
- **Vacío honesto:** con 0 recetas posibles, el contador dice «Con esto todavía nada.
  ¿Tienes huevos o pasta?» — sugiere los dos ingredientes que más recetas desbloquearían.
  Nunca muestra recetas de relleno.

### Pantalla 3 · Tres recetas

- Tres tarjetas verticales. Cada una: título, minutos, «usa 4 de lo que tienes», y la
  etiqueta **«Tienes todo»** o **«Te falta: cebolla»** (nunca más de 2 faltantes — si
  faltan 3, la receta no debería estar aquí y es un bug del filtro).
- Sin imágenes en Fase 1 (llegan en Fase 5 con Nano Banana). Se deja el espacio con un
  color plano por tipo de comida. No se ponen fotos de stock: presentar una imagen que no
  es el plato es un antipatrón documentado (Hungryroot).
- Tocar una tarjeta abre el detalle.

### Pantalla 4 · Detalle de receta

- Ingredientes **ya escalados al hogar** (2 porciones por defecto). Un stepper de porciones
  arriba: cambiarlo recalcula al instante. (Samsung Food: la cascada de porciones es lo
  más citado; Mealime topa en 6 y recibe quejas — el stepper llega hasta 12, con medias.)
- Cantidades en unidades caseras cuando el catálogo las tiene («1 cebolla mediana») con
  los gramos en pequeño. Internamente siempre gramos.
- Pasos en texto plano, numerados. El "así debe verse" y los timers son Fase 4.
- Botón «Cocinar esto» → en Fase 1 solo registra `receta_elegida` y muestra un mensaje:
  «Guardado. El paso a paso llega pronto.» Honesto. **Este botón es donde vivirá el login**
  (Fase 2, con licencia): tocar «Cocinar» sin cuenta abre la hoja de cuenta; **cocinar
  requiere cuenta**. Antes de ese toque, nunca se pide.

### Pantalla 5 · Las dos preguntas (después del primer resultado)

Aparecen **una vez**, al volver de la primera receta elegida. Nunca antes.

1. «¿Cuánto tiempo sueles tener para cocinar?» — cuatro chips: 15–20 · 25–30 · 35–40 · «Otro». Saltar → 30.
2. «¿Para cuántas personas cocinas?» — chips: «Yo solo» · «2» · «3» · «4+» → si ≥ 2, aparece «¿Quieres decirme quién come cuánto?» con una fila por comensal y un selector de apetito (niño 0,7 · normal 1 · mucho 1,4 · muchísimo 1,8). Saltar → 2 porciones iguales.

**Esto resuelve la decisión pendiente «Porciones para varias personas»:** cada comensal
tiene su factor, y la respuesta se guarda como `comensal.factorPorcion`. Se anota en
`decisiones.md`.

Research P2 sugiere que la pregunta de **equipamiento** discrimina más que la de gustos.
Se deja para el momento de generar el primer plan (Fase 3), no aquí: dos preguntas son dos.

### Pantalla 6 · Ajustes

Mínima: «Exportar mis datos» (comparte un JSON), «Borrar todo» (confirmación de dos pasos,
y la segunda dice exactamente qué se borra). Country selector. Nada más.

### Cómo se siente

Rápido y sin preguntas. Abres, tocas seis chips, ves tres recetas. Veinte segundos.
Ninguna pantalla te pide nada que no necesites para lo que estás haciendo. Cuando
aparecen las dos preguntas, ya viste que la app sirve, así que responderlas tiene sentido.

---

## Qué debe funcionar

- Todo el flujo de arriba, en Expo Go, **sin red** después de la primera descarga del catálogo.
- Cambiar porciones recalcula cantidades al instante.
- Quitar un chip recalcula las recetas al instante (es un filtro local).
- Exportar y borrar, verificables.
- Sesión anónima invisible.
- Un comensal con `noCome: ['huevo']` **nunca** ve una receta con huevo.

## Qué NO debe funcionar todavía

- **Ninguna foto.** El botón no existe.
- **Ninguna llamada a un modelo.** El proxy responde `501`. `depcruise` lo garantiza estructuralmente.
- Ningún plan semanal visible (el selector existe como función, sin pantalla).
- Ninguna lista de mercado visible (la función existe; la pantalla es Fase 3).
- Sin precios.
- Sin facturas.
- Sin imágenes de recetas.
- Sin timers ni paso a paso.
- Sin login con Apple/Google (flag apagado; la pantalla de vincular no se muestra).
- Sin cifrado ejecutándose (flag apagado; código escrito).

---

## Prohibiciones de `CLAUDE.md` que aplican aquí

| Regla | Cómo se verifica |
|---|---|
| Nunca guardar lista de mercado, macros ni pills | pgTAP y el test de `schema.ts` fallan si aparece una columna con esos nombres |
| Cantidades siempre en g o ml internamente | Tipo `Unidad = 'g' \| 'ml'` + zod. Las unidades caseras solo existen en `src/components` |
| País e idioma son valores de columna, no ramas | `despensa.ts` es una tabla. ESLint prohíbe `if (pais === 'CH')` con una regla `no-restricted-syntax` sobre comparaciones con literales de país |
| Nada personal sale del teléfono | PostHog: lista blanca tipada. Supabase: no hay tablas personales |
| Sin claims médicos | Copy revisado: «aproximado» junto a cualquier número nutricional |

---

## Cómo se protege (tests que se escriben en esta fase)

| Área | Tests |
|---|---|
| Motor | Los 7 bugs (verdes). Propiedades nuevas: `noCome` nunca aparece; `selector` nunca repite receta en la misma semana; `macrosDeReceta` con una fuente `estimado` marca `estimado`; `pills` de una receta sin proteína animal incluye `vegetariano` |
| Datos | Migración en vacío y con datos. Export contiene todas las tablas. Borrar deja 0 filas. Clave: estable entre llamadas, destruida al borrar |
| Auth | Anónimo puede leer catálogo, no puede escribir nada |
| Pantallas | 4 estados por pantalla. Inventario: tocar chip actualiza contador. Detalle: stepper recalcula |
| Analítica | Evento fuera de lista blanca no compila; propiedad con PII lanza en dev |
| E2E | `maestro/flows/onboarding.yaml`: abrir → chips → recetas → elegir → dos preguntas → saltar → volver al inicio. `inventario-manual.yaml`: contador sube al tocar |
| Arquitectura | `depcruise` sigue en 0 violaciones con el motor ampliado |

---

## Verificación del cifrado (manual, cuando haya development build)

1. `EXPO_PUBLIC_FLAG_CIFRADO=true`, `eas build --profile development`.
2. Instalar, abrir, crear un hogar con un comensal.
3. Con Xcode no disponible, se usa `expo-file-system` desde el menú dev para copiar `michef.db` a Compartir → abrirlo en el PC con DB Browser for SQLite → **debe pedir clave o mostrar ruido**.
4. Anotar fecha y resultado en `decisiones.md`.

---

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Drizzle + Metro: las migraciones `.sql` no se empaquetan | `metro.config.js` ya trata `.sql` como asset (Fase 0). Test de arranque en Maestro lo cubre |
| `expo-sqlite` en Expo Go con `useSQLCipher` en el plugin: ¿arranca? | El plugin solo afecta a prebuild; Expo Go ignora plugins. Verificar el día 1 de la fase |
| 20 recetas a mano tardan más de lo previsto | Se aceptan 12 como mínimo para cerrar la fase; el criterio de salida dice "tres recetas" con inventarios razonables, no 20 |
| Anonymous sign-ins generan usuarios fantasma en Supabase | Se activa la limpieza automática de anónimos > 30 días sin actividad (panel de Supabase) |
| El selector v0 es lento con catálogos grandes | Con 20 recetas no importa. Se mide con 5.000 recetas sintéticas en un test de rendimiento marcado `slow` |

---

## Decisiones que se toman en esta fase (y se anotan en `decisiones.md`)

- **Porciones para varias personas:** cada comensal con su factor. Resuelto por la pregunta 2.
- **Despensa básica por país:** la tabla de `despensa.ts`. Editable por el usuario.
- **Fórmula y pesos del ranking:** los de `ranking.ts`. Revisables con datos en Fase 5.
- **Granularidad del catálogo:** fina donde afecta precio o macros (`pechuga_pollo` ≠ `muslo_pollo`), gruesa en el resto (`cebolla`). Se aplica al escribir los 60 ingredientes del seed.

---

## Referencias

- Drizzle + Expo SQLite: https://orm.drizzle.team/docs/connect-expo-sqlite
- expo-sqlite (SQLCipher): https://docs.expo.dev/versions/latest/sdk/sqlite/
- Supabase anonymous sign-ins: https://supabase.com/docs/guides/auth/auth-anonymous
- Supabase link identity: https://supabase.com/docs/reference/javascript/auth-linkidentity
- Informe de research: `../../research/reports/me-chef-recomendaciones.md` §1, §2, §3, §11
