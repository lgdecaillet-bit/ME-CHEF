# Fase 2 · La nevera de punta a punta

> **Semanas 5–7 · No necesita licencia de Apple** hasta el último paso (vincular cuenta).
>
> Al terminar, la función central existe: una foto → lo reconocido marcado sobre la foto
> → tres recetas con lo que hay, en menos de 8 segundos, con **más del 95 % de precisión**
> en lo que la app marca como seguro, medido contra 200 fotos reales.

---

## En una frase

Se le ponen ojos a un sistema que ya funciona. La Fase 1 dejó el filtro, la fusión, la
despensa y las recetas; esta fase solo añade la interpretación de la foto — y la mide.

## Criterio de entrada

- Fase 1 cerrada entera.
- **Las 200 fotos etiquetadas existen** en `eval/fotos/` con su `etiquetas.json`. Esto es trabajo de campo (tu nevera, la de tu mamá, amigos; distintas luces, llenuras, países) y **empieza en la semana 3, en paralelo a la Fase 1**. Sin las 200 fotos la fase no puede cerrar.
- Keys de Gemini y Anthropic creadas y guardadas **solo** como secretos de la Edge Function (`supabase secrets set`).

## Criterio de salida — se verifica cada punto

- [ ] **Precisión de `seguro` > 95 %** sobre las 200 fotos, en el harness de Promptfoo. Anotado con fecha, modelo y versión del prompt en `eval/resultados/` (fuera de git) y el número en `decisiones.md`.
- [ ] **p95 foto → tres recetas < 8 s**, con lo reconocido visible en < 3 s. Medido en 20 fotos reales desde el iPhone por Wi-Fi y por 4G.
- [ ] La foto **no existe en ningún sitio** después de confirmar: ni en el teléfono (test: el directorio de caché está vacío), ni en Storage de Supabase (test: bucket inexistente), ni en logs del proxy (test: el log no contiene base64).
- [ ] `ai-proxy` rechaza sin JWT, aplica rate limit (test: la llamada 31 en un minuto devuelve `429`), cachea el mapeo (test: la segunda llamada idéntica no toca el modelo), y loguea tokens y coste por request.
- [ ] Ninguna receta mostrada contiene un ingrediente fuera de `seguro ∪ despensa`. Propiedad ya probada en Fase 1; ahora se prueba también en E2E con una foto fija.
- [ ] Corregir un ítem sobre la foto **persiste** y recalcula las recetas sin llamada al proxy.
- [ ] Guía de cámara bloquea fotos oscuras o desenfocadas **sin llamar a ningún modelo** (análisis on-device).
- [ ] Nevera vacía o foto inútil → mensaje honesto, **cero recetas de relleno**.
- [ ] `flags.nevera` controla la función en remoto (PostHog) — apagarlo oculta el botón de foto sin build.
- [ ] Maestro: `nevera.yaml` con una foto de fixture y el proxy en modo replay pasa en EAS.
- [ ] Coste medio por foto medido y anotado (objetivo: 0,006–0,05 USD).

---

## Stack que entra en esta fase

| Capa | Herramienta | Para qué | ¿Expo Go? |
|---|---|---|---|
| Cámara | `expo-camera` (SDK 57) | Tomar la foto, vista previa con guía | ✅ (solo dispositivo real, no simulador) |
| | `expo-image-manipulator` | Redimensionar a ≤ 1.536 px lado largo y comprimir antes de enviar | ✅ |
| Análisis on-device | `expo-image-manipulator` + cálculo propio | Luminancia media y varianza de Laplaciano (desenfoque) sobre una miniatura | ✅ |
| Proxy | Supabase Edge Functions (Deno 2) | El único punto que habla con modelos | ✅ (es red) |
| Visión | **Gemini 3 Flash** vía API | Pasada 1 (lista) y pasada 2 (verificación). Salida JSON estructurada | — |
| Texto | **Claude Haiku 4.5** vía API | Mapeo texto → ingrediente canónico, solo cuando la caché falla | — |
| Caché | tabla `cache_modelo` (ya existe) | Toda respuesta de mapeo | — |
| Rate limit | tabla `rate_limit (user_id, ventana, n)` en Supabase | 30 llamadas/min, 200/día por usuario | — |
| Evals | **Promptfoo** (local) | Precisión contra las 200 fotos | — |
| Flags remotos | PostHog feature flags | `nevera` on/off sin build | ✅ |
| Overlay | `react-native-reanimated` + `gesture-handler` | Etiquetas tocables sobre la foto | ✅ |
| E2E | Maestro + proxy en modo `replay` (fixture JSON) | Flujo sin tocar modelos reales en CI | — |

**Cambia el fingerprint:** `expo-camera`, `expo-image-manipulator`. Se añaden en el primer
PR de la fase para que el build de simulador los compile de inmediato.

**Lo que NO entra:** ningún SDK de modelos en la app (`depcruise` lo impide). OCR clásico.
Almacenamiento de imágenes. Detector on-device (v2).

---

## Qué se construye, paso a paso

Sigue las ocho piezas de "La función central" en `producto.html`, en orden de dependencia.

### 2.1 · `feat/ai-proxy` — el proxy de verdad

Sustituye el esqueleto de Fase 0. Un solo archivo de entrada, módulos por tarea.

```
supabase/functions/ai-proxy/
  index.ts          router: auth → rate limit → tarea → cache → modelo → log
  auth.ts           verifica JWT con supabase.auth.getUser(); acepta anónimos
  rate-limit.ts     ventana deslizante por user_id en tabla rate_limit
  cache.ts          get/set en cache_modelo; clave = sha256(tarea + entrada normalizada + país)
  log.ts            inserta en tabla uso_modelo (sin user_id: solo tarea, modelo, tokens, ms, cache_hit, coste)
  tareas/
    nevera-pasada1.ts   Gemini · imagen → [{ nombre, cantidad?, bbox }]
    nevera-pasada2.ts   Gemini · imagen + lista → [{ nombre, confirmado: bool }]
    mapeo.ts            cache → Haiku · texto + país → ingrediente_id + confianza
    ticket.ts           (Fase 3) 501
    objetivo.ts         (Fase 3) 501
    porque.ts           (Fase 3) 501
    asistente.ts        (Fase 5) 501
  proveedores/
    gemini.ts           fetch a la API; responseSchema JSON obligatorio; sin SDK
    anthropic.ts        fetch a la API; tool_use para forzar JSON; sin SDK
  modo.ts             'real' | 'replay' — replay lee de tests/fixtures/*.json (para CI y Maestro)
```

Reglas del proxy, cada una con test en `supabase/functions/tests/`:

1. **La imagen no se persiste.** Llega en el body como base64, se pasa al modelo, se descarta. No hay `Storage.upload`. Test: grep del código fuente del proxy por `storage` → 0 resultados (test estático), y test dinámico: tras una llamada, el bucket no existe.
2. **Salida JSON obligatoria.** Gemini con `responseSchema`; Anthropic con `tool_use`. Si el modelo devuelve algo que no valida contra el esquema zod de la tarea → `502 { error: 'respuesta_invalida' }` y se loguea. Nunca se pasa basura al cliente.
3. **Caché de mapeo, siempre.** `mapeo` primero mira `producto` por `formas_ticket`/sinónimos del país (gratis), luego `cache_modelo`, y solo al final el modelo. La respuesta del modelo se escribe en las dos. Test: segunda llamada idéntica → `cache_hit: true`, sin llamada al proveedor (mock cuenta invocaciones).
4. **Las pasadas de nevera no se cachean** (cada foto es única). Sí se cachea el mapeo de cada nombre detectado.
5. **Rate limit** por `user_id`: 30/min, 200/día. `429` con `Retry-After`.
6. **Log de coste** por request en `uso_modelo`: `tarea, modelo, tokens_in, tokens_out, ms, cache_hit, coste_usd`. Coste calculado con una tabla de precios en `precios-modelos.ts` **con fecha** — se revisa cada mes (los precios de 2026 son volátiles).
7. **Sin identidad en lo que queda.** `uso_modelo` no tiene `user_id`. `rate_limit` sí (lo necesita) y se purga cada hora.
8. **Modo replay.** `MODO=replay` hace que cada tarea lea `tests/fixtures/<tarea>/<hash>.json`. Es lo que corre en CI y en Maestro. Un fixture por foto de prueba.

Migración `20260922000001_proxy.sql`: tablas `rate_limit`, `uso_modelo`; RLS sin acceso de cliente.

### 2.2 · `feat/camara-guia` — guía de cámara sin modelo

**Qué pasa.** La calidad de la foto explica más de la mitad de los errores. Se detecta en
el teléfono, antes de gastar una llamada.

1. `src/nevera/camara.tsx` — `CameraView` a pantalla completa con un **marco** dibujado
   («Abre la puerta completa y aléjate hasta que quepa en el marco»).
2. `src/nevera/calidad.ts` — funciones puras (¡van en tests unitarios!):
   - `luminancia(miniatura: Uint8Array): number` — media de gris. < 60/255 → «Muy oscuro».
   - `nitidez(miniatura): number` — varianza del Laplaciano. Por debajo de un umbral calibrado con las 200 fotos → «Está borroso».
   - `evaluar(miniatura): { ok: boolean, motivo?: 'oscuro' | 'borroso' }`.
3. Cada 500 ms se toma una miniatura de 128 px de la vista previa y se evalúa. El marco
   cambia de color (rojo → verde) y el texto guía dice qué falta.
4. El botón de disparo **no se activa** hasta `ok`. Si el usuario insiste (mantiene pulsado 1 s), dispara igual: la app avisa, no impide.
5. Tras la foto: `expo-image-manipulator` → lado largo 1.536 px, JPEG 0,8 → base64. Es lo que va al proxy. La foto original **se borra del caché de la cámara inmediatamente**.
6. Las tomas adicionales (cajones, puerta) son opcionales y vienen **después** del primer resultado, nunca antes.

**Cómo se siente.** Apuntas, el marco se pone verde, disparas. Si está oscuro, te lo dice
antes, no después de esperar 8 segundos.

### 2.3 · `feat/deteccion-dos-pasadas` — el cliente de visión

`src/ai/nevera.ts` (es `src/ai`: puede hablar con el proxy, nunca con un modelo):

1. `pasada1(imagenB64)` → lista con nombre, cantidad opcional, bbox normalizado (0–1).
2. `pasada2(imagenB64, lista)` → misma lista con `confirmado`.
3. `certeza`: confirmado en las dos → `seguro`; solo en la primera → `posible`.
4. Lo que el modelo no reconoce entra como `{ nombre: 'algo en un tupper', certeza: 'posible' }`. **Nunca se inventa.**
5. Las dos pasadas se lanzan **en paralelo con el mapeo de la primera**: en cuanto llega la pasada 1, se muestran las etiquetas (< 3 s) mientras la pasada 2 y el mapeo terminan.

Prompts en `supabase/functions/ai-proxy/prompts/` con versión en el nombre (`nevera-p1.v3.md`).
**Cada cambio de prompt es un PR** que corre el harness y adjunta el número.

### 2.4 · `feat/mapeo-cache` — nombre → ingrediente canónico

Reutiliza el mismo mapeador que usarán las facturas en Fase 3.

1. `src/ai/mapeo.ts` — envía `{ nombres: string[], pais }` al proxy en **una** llamada por foto (batch), recibe `[{ nombre, ingredienteId, confianza, resueltoPor: 'cache' | 'base' | 'modelo' }]`.
2. Lo que no mapea con confianza ≥ 0,7 entra como `posible` aunque las dos pasadas lo confirmaran: ver algo no es saber qué es.
3. Cada corrección del usuario (toca una etiqueta y elige otro ingrediente) se guarda en `item_detectado.corregidoA` **y** se envía al proxy como `{ texto, ingredienteIdCorrecto, pais }` **sin identidad**, para mejorar sinónimos. Con consentimiento (una vez, en la primera corrección, explicando qué se envía: el nombre de un ingrediente, nada más).

### 2.5 · `feat/fusion-inventario` — ya existe; se conecta

`fusionarEscaneo` está arreglada desde Fase 1 (BUG-1, BUG-2). Aquí:

1. `src/nevera/flujo.ts` orquesta: foto → calidad → pasada 1 → etiquetas → pasada 2 + mapeo → `fusionarEscaneo(inventarioActual, detectado)` → guardar en `inventario` y `escaneo`/`item_detectado` → `recetasConLoQueHay(...)`.
2. Todo lo que sigue a la fusión es **local y síncrono**. Quitar una etiqueta → recalcular → nuevas recetas, sin red.
3. `porVencerse(inventario, perecibilidad)` corre tras la fusión y produce la alerta «Esto se te va a dañar» si hay algo a ≤ 2 días.

### 2.6 · `feat/overlay-tactil` — la foto con lo reconocido encima

Ver UX abajo. Técnicamente: `Image` con la foto (en memoria, nunca en disco) + etiquetas
absolutas en las coordenadas del bbox + `Pressable` por etiqueta. Al confirmar, la imagen
en memoria se libera.

### 2.7 · `feat/tres-recetas-foto` — reutiliza la pantalla de Fase 1

La pantalla `recetas/index.tsx` ya existe. Se le añade el origen «desde tu foto» y el
contador de visibles usados. Si el catálogo (semilla de 20 + lo que haya) no da tres
recetas: **no se genera en vivo en esta fase**. Se muestran las que haya (1 o 2) con el
texto «Con lo que veo, esto es lo que hay. ¿Añades algo?» y los chips de inventario
manual. La generación bajo demanda es Fase 5.

### 2.8 · `feat/harness-200` — medir antes de creer

1. `eval/promptfooconfig.yaml`: provider = el proxy en modo real (con las keys de local), tests = las 200 fotos, assert = script que compara `seguro` contra `etiquetas.json` y calcula precisión.
2. `eval/precision.ts` — la métrica exacta: `precision = |seguro ∩ etiquetado| / |seguro|`. Se reporta también recall (informativo, no bloqueante) y una matriz de errores por condición de luz.
3. `npm run eval` — pide confirmación (cuesta 2–20 USD), corre, escribe `eval/resultados/<fecha>-<prompt-version>.json`.
4. `.github/workflows/eval.yml` (`workflow_dispatch`) — corre el harness con las fotos **subidas como artefacto cifrado por el usuario**, nunca en git. Publica el número como comentario. Se usa solo para cambios de prompt/modelo.
5. **Si no llega al 95 %**, en orden: (1) guía de cámara — recalibrar umbrales con las fotos que fallan; (2) prompt de la pasada 2 — es la que filtra alucinaciones; (3) subir de modelo. En esta función el coste no se negocia.

### 2.9 · `feat/vincular-cuenta` — el login, al tocar «Cocinar» (requiere licencia)

Es el único paso de la fase que necesita development build.

**El momento:** el usuario ya vio la foto reconocida y las tres recetas. Toca **«Cocinar
esto»** en una. Ahí — y solo ahí, la primera vez — la app pide la cuenta. Es el único punto
del flujo donde hay una acción concreta que la justifica: «para guardar tu nevera y lo que
cocinas». Ver las recetas no la pide. Corregir etiquetas no la pide. Abrir la app no la pide.

**Cocinar requiere cuenta. No hay «cocinar sin cuenta».** Ver la foto reconocida y las tres
recetas es gratis y anónimo; cruzar a cocinar es el punto donde la app pasa a recordar cosas
del usuario (lo cocinado, el inventario descontado, las reseñas) y por eso pide identidad.

1. Al tocar «Cocinar esto» sin cuenta vinculada: una **hoja** (no una pantalla nueva, no un modal que tape las recetas) con: título «Guarda tu cocina», una línea «Para recordar tu nevera, tus recetas y lo que cocinas», dos botones del mismo tamaño: **Apple**, **Google**. Debajo, un enlace pequeño «Ahora no» que **cierra la hoja y vuelve a las recetas** — no entra a cocinar. Sin preseleccionar. Sin X escondida.
2. `linkIdentity` sobre la sesión anónima. Todo lo local (inventario, escaneos, hogar) **ya está en SQLite** y no se toca: vincular no migra nada, solo asocia el `user.id`. Al terminar, la hoja se cierra y **entra directo a cocinar** — el usuario no pierde el hilo.
3. «Ahora no»: vuelve a la pantalla de recetas con todo intacto. Puede seguir viendo, corrigiendo, tomando otra foto. La próxima vez que toque «Cocinar esto» la hoja vuelve a aparecer — cada vez, porque cocinar requiere cuenta. Sin contador, sin «tercera vez».
4. Si `linkIdentity` falla (red, cancelación de Apple): mensaje corto en la hoja, botón «Reintentar», y «Ahora no» sigue disponible. Nunca un bucle de login (research: queja nº1 de Google Health).
5. Con `flags.auth_apple` apagado (Expo Go, Fase 1): «Cocinar esto» entra directo, porque la hoja no puede existir sin licencia. Es el único caso, y es de desarrollo, no de producto.
6. Ajustes tiene «Crear cuenta» siempre disponible para quien quiera hacerlo antes.
7. Tests de componente: sin sesión vinculada → «Cocinar esto» abre la hoja y **no navega**; «Ahora no» → cierra y **no navega**; vincular OK → navega a cocinar; vincular falla → hoja sigue con «Reintentar»; con flag apagado → navega directo. Test E2E en `nevera.yaml` con flag apagado.

---

## Cómo se ve y cómo se siente

**Flujo de diseño:** [`../diseno.md`](../diseno.md) §3, con énfasis en el paso 2 (boceto
de **todos** los estados: la cámara con marco rojo/verde, la carga sobre la foto, el
resultado, y los cuatro «cuando no funciona»). Es la pantalla más importante de la app:
el boceto se hace en Claude Design canvas, no en ASCII. Componentes nuevos: `Hoja` (el panel base
que sube desde abajo, viene de Fase 0 por la decisión #58: `@expo/ui` si cubre, si no
`@gorhom/bottom-sheet`), `MarcoCamara`,
`EtiquetaFlotante`, `ChipPregunta`, `TarjetaCuenta` — primero en la galería.

Fuentes: `producto.html` §La función central, y research §3 (P1: resultado en tres capas,
corrección que persiste, contador, cadena de respaldo).

### 1 · La cámara

Pantalla completa. Un marco con esquinas redondeadas. Arriba, un texto que cambia: «Abre
la puerta completa» → «Aléjate un poco» → «Muy oscuro, enciende la luz» → «Listo». Abajo,
el botón de disparo, que pasa de gris a blanco cuando el marco está verde. Nada más. Ni
menú, ni ajustes, ni flash manual: el flash lo decide `evaluar()`.

Esquina superior derecha: «Mejor con chips» → vuelve al inventario manual. Es la **cadena
de respaldo** (research P2): la foto fallará con nevera llena o poca luz, y sin plan B el
usuario se va.

### 2 · Mientras carga (los primeros 3 segundos)

La foto que acabas de tomar, a pantalla completa, ligeramente oscurecida. En cuanto llega
la pasada 1 (< 3 s), aparecen las **etiquetas flotantes sobre la propia foto** (Cal AI),
cada una en la posición de lo que nombra: «huevos», «tomate», «leche». Las que están en
verificación tienen un punto que late. Texto abajo: «Mirando bien…».

Nunca un spinner a solas sobre fondo blanco. La foto **es** la pantalla de carga.

### 3 · El resultado (a los ~6 segundos)

**Capa 1 — lo grande e inmediato:** el número. «Veo 7 cosas» arriba, y debajo «Con esto:
3 recetas». Grande.

**Capa 2 — el desglose editable, sobre la foto:**
- Etiquetas **verdes** = `seguro`. «huevos · 8».
- Etiquetas **ámbar con borde punteado** = `posible`. «¿yogur?». Son **chips de pregunta**:
  tocar = «Sí, hay» (pasa a verde) o «No» (desaparece). **Nunca se asumen.**
- Etiqueta gris «algo en un tupper» = no reconocido. Tocar = escribir qué es.
- Tocar cualquier etiqueta verde: «¿No es esto?» → buscador → elegir el correcto → la
  etiqueta cambia **y las recetas se recalculan al instante**, sin red. La corrección
  **persiste** (`corregidoA`) — Lifesum es el contraejemplo documentado: correcciones que
  no persisten, quejas repetidas.
- Debajo de la foto, una fila con la **despensa básica**: «Supongo que tienes: sal, aceite,
  ajo, cebolla…» con un toque para quitar. Etiqueta visual distinta: es *supuesto*, no
  *visto* (research P2, adaptado de Fitatu).

**Capa 3 — una sola confirmación:** botón «Ver las 3 recetas». Opcional: se puede tocar
sin corregir nada. **Modo "dame algo ya"**: si el usuario no toca nada en 2 s, el botón
late suavemente.

### 4 · Las tres recetas

La misma pantalla de Fase 1 con dos añadidos:
- Cada tarjeta dice «Usa 5 de lo que vi» — el **contador de aprovechamiento** (SuperCook,
  Fridgely). Es la métrica de orden: visibles usados × 10 + ranking.
- Si hay algo por vencerse, la primera receta que lo usa lleva la etiqueta «Aprovecha los
  tomates antes de que se dañen».

**Nada de cuenta en esta pantalla.** Ni tarjeta, ni banner, ni aviso. La pantalla de
recetas es solo recetas. La cuenta se pide al tocar «Cocinar esto» (§2.9), como una hoja
que aparece y desaparece sin sacar al usuario de donde estaba.

### 5 · Cuando no funciona

- **Foto oscura o borrosa:** no se dispara; el texto guía lo dice. Si insiste y el modelo
  no ve nada: «No logro ver bien. ¿Probamos con más luz, o me dices qué hay?» + dos botones.
- **Nevera vacía de verdad:** «Veo la nevera casi vacía. ¿Tienes huevos, pasta o arroz en
  la despensa?» → chips. **Cero recetas de relleno.**
- **Sin red:** el botón de foto muestra un aviso antes de abrir la cámara: «Sin conexión no
  puedo leer la nevera, pero puedo mostrarte tus recetas guardadas». No abre la cámara para
  luego fallar.
- **Proxy caído o flag apagado:** el botón de foto **no aparece**. Solo chips.

### Cómo se siente

Tomas la foto y **antes de que dudes** ya ves etiquetas encima. Es la sensación de que la
app «entendió». Corregir una etiqueta es un toque y ves las recetas cambiar. Y cuando no
puede, te lo dice en la cara, sin hacerte esperar.

---

## Qué debe funcionar

- Foto → etiquetas < 3 s → recetas < 8 s (p95).
- > 95 % de lo verde estaba de verdad.
- Corregir persiste y recalcula sin red.
- `posible` nunca genera recetas hasta que el usuario confirma.
- La despensa básica se confirma en un toque y se recuerda.
- «Se te va a dañar» aparece cuando corresponde.
- La foto desaparece de todas partes al confirmar.
- Apagar `flags.nevera` en PostHog quita el botón en < 1 min sin build.
- Con licencia: tocar «Cocinar esto» sin cuenta abre la hoja; vincular Apple sobre la sesión anónima conserva todo lo local y entra directo a cocinar. «Ahora no» vuelve a las recetas sin cocinar. **No se puede cocinar sin cuenta.**

## Qué NO debe funcionar todavía

- **Generación de recetas en vivo.** Si el catálogo no alcanza, se dice. Fase 5.
- **Facturas.** El mapeador está listo para ellas; la pantalla es Fase 3.
- **Lista de mercado visible.** Fase 3.
- **Tomas adicionales fusionadas de forma inteligente.** En Fase 2 cada toma adicional se procesa igual que la primera y se fusiona por reglas. Sin deduplicación por bbox entre tomas (v2).
- **Detección de cantidades exacta.** Se muestran cuando el modelo las da; si no, «huevos» sin número. El punto ciego universal de las IAs de comida es la cantidad (research); no se promete lo que no se tiene.
- **Detector on-device.** v2.
- **Imágenes de recetas.** Fase 5.

---

## Prohibiciones de `CLAUDE.md` que se hacen mecánicas aquí

| Regla | Mecanismo |
|---|---|
| Ninguna API key en la app | Keys solo en `supabase secrets`. `depcruise` prohíbe SDKs. `secrets:bundle` grepea |
| Las fotos se procesan y se descartan | Sin `Storage` en el proxy (test estático). Caché de cámara borrada (test). Logs sin base64 (test) |
| Nunca inventar un ingrediente | Propiedad del motor (Fase 1) + E2E con fixture: la receta mostrada ⊆ seguro ∪ despensa |
| Lo `posible` se pregunta con un chip | Test de componente: un ítem `posible` renderiza como chip de pregunta y no cuenta para recetas hasta confirmar |
| Cachea toda respuesta de modelo | Test del proxy: `mapeo` idéntico dos veces → una sola llamada al proveedor |
| Nada personal sale del teléfono | El body al proxy es `{ tarea, imagen, pais }`. Test: el body no contiene `hogar`, `comensal`, `objetivo` |
| Salida JSON obligatoria | zod en el proxy; `502` si no valida |

---

## Cómo se protege (tests)

| Área | Tests |
|---|---|
| Calidad on-device | `luminancia` y `nitidez` con 10 miniaturas de fixture (oscura, borrosa, ok). Umbrales calibrados y anotados |
| Proxy | 401 sin JWT · 429 al exceder · cache hit en mapeo · 502 con respuesta inválida · sin Storage · log sin `user_id` · modo replay lee fixtures |
| Cliente de IA | `src/ai/nevera.ts` con `fetch` mockeado: dos pasadas en paralelo, `certeza` correcta, tupper como `posible` |
| Motor | Ya cubierto. Se añade: `fusionarEscaneo` con ítems sin cantidad los conserva (BUG-1 verde) |
| Pantallas | Overlay: etiqueta `posible` es chip; tocar verde abre buscador; corregir recalcula (mock del motor cuenta llamadas). Estados: cargando (foto oscurecida + etiquetas parciales), sin red, vacío, error de proxy |
| E2E | `maestro/flows/nevera.yaml`: el simulador no tiene cámara → el flujo usa «elegir de la galería» con una foto de fixture y el proxy en `replay`. Verifica: etiquetas → confirmar → 3 recetas → ninguna con ingrediente fuera del fixture |
| Evals | Promptfoo, 200 fotos, > 95 %. Manual, con coste, antes de cada cambio de prompt |
| Rendimiento | Script `scripts/medir-nevera.ts` que corre 20 fotos desde el iPhone y escribe p50/p95 |

---

## Riesgos y mitigación

| Riesgo | Prob. | Mitigación |
|---|---|---|
| No se llega al 95 % con Gemini 3 Flash | media | Escalera documentada: guía de cámara → prompt pasada 2 → Gemini 3.1 Pro / GPT-5.6. El coste por foto sube a ~0,05 USD y se acepta |
| Las 200 fotos no están listas a tiempo | alta | Empieza en semana 3. Se acepta cerrar la fase con 120 si la distribución de luces/países es razonable, y se anota como deuda |
| Gemini 2.5 Flash se deprecia el 16-oct-2026 | cierta | Se usa 3 Flash desde el inicio. `precios-modelos.ts` con fecha obliga a revisar |
| `expo-camera` no funciona en el simulador → Maestro no puede probar la cámara | cierta | El E2E usa galería + fixture. La cámara real se prueba a mano en el iPhone (checklist en el PR) |
| Latencia > 8 s por 4G | media | Imagen ≤ 1.536 px y JPEG 0,8. Pasadas en paralelo con mapeo. Se mide con 4G, no solo Wi-Fi |
| Una nevera con medicamentos o alcohol: privacidad | cierta | La foto nunca se guarda. El prompt instruye ignorar lo que no es comida. Se documenta en la pantalla de «cuánto guardamos» (Fase 6) |
| El cupo de EAS con builds de simulador por cada cambio de plugin | media | Los dos plugins nativos entran en el primer PR; el resto de la fase no cambia el fingerprint |

---

## Decisiones que se toman en esta fase

- **Umbrales de calidad de foto** (luminancia, nitidez): calibrados con las 200 fotos. Se anotan.
- **Modelo de visión definitivo** para v1, con el número del harness.
- **Versión del prompt** que pasó el 95 %. Congelada: cambiarla exige volver a correr el harness.
- **Consentimiento de correcciones:** texto exacto de la pregunta.

---

## Referencias

- `producto.html` → Backend → La función central (las 8 piezas) y Pipelines → «La primera foto».
- `eval/README.md`.
- expo-camera: https://docs.expo.dev/versions/latest/sdk/camera/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Promptfoo: https://www.promptfoo.dev/docs/intro/
- Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- Research §3 «Foto de la nevera».
