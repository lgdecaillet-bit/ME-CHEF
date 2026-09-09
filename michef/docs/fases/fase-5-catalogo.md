# Fase 5 · El catálogo y el asistente

> **Semanas 12–13 · Requiere licencia de Apple** (TestFlight interno al cerrar).
>
> Al terminar, el catálogo deja de ser 20 recetas a mano y pasa a cientos generadas en
> lote, validadas, con imagen, texto por idioma y vector; el selector pide generar solo
> cuando no alcanza; el asistente responde con datos, no de memoria; y un TikTok pegado
> se vuelve receta. **TestFlight interno usable por la mamá.**

---

## En una frase

Una receta se genera una vez y sirve a todos. Esta fase construye la fábrica, fuera de
línea, y las dos puertas de entrada de recetas nuevas: el selector y el usuario.

## Criterio de entrada

- Fase 4 cerrada.
- Cuenta de Trigger.dev (free). Keys de Sonnet 5 (Batch API), Nano Banana, embeddings en `supabase secrets` (o en Trigger.dev env, nunca en la app).
- Corpus de ideas: una lista estructurada de ≥ 500 combinaciones (cocina, proteína, base, técnica, tiempo) — **no texto de nadie**.

## Criterio de salida

- [ ] ≥ 500 recetas `publicada` en el catálogo, generadas por el pipeline, cada una con: ingredientes canónicos por porción, pasos con «así debe verse»/timer/equipo, textos en `es`, imagen, vector.
- [ ] **Validación automática** rechaza (test con 10 recetas malas a propósito): ingrediente que no mapea · macros incoherentes con el tipo · tiempo que no suma con los timers · duplicado (coseno > 0,92 con una existente) · texto que coincide > 8 palabras seguidas con el corpus de ideas.
- [ ] Índice del catálogo (~3 MB) descargable en segundo plano; la app sigue sin red con el índice anterior.
- [ ] Selector: cuando `faltan > 0`, encola un pedido al pipeline («falta pasta vegetariana de 20 min») y usa lo que hay mientras tanto. Test: el pedido llega a la cola con los filtros correctos.
- [ ] Asistente: «¿Dónde hago mercado esta semana?» → router elige consultas → consultas locales → redactor devuelve una frase con datos reales + acción. **Contexto ≤ 20 líneas** (test: el body al proxy no supera 20 líneas). Nunca responde sin datos (test: sin lista, responde «No tienes lista esta semana. ¿La armamos?»).
- [ ] Importador: un link de TikTok/YouTube/web → receta en estructura ME CHEF, pasada por la **misma** validación. El vídeo no se guarda. Si es buena y no duplica, entra al catálogo **sin decir quién la trajo**.
- [ ] Ranking recalculado en lote (job diario) con la fórmula de `ranking.ts`. Decaimiento de confianza de precios (job semanal).
- [ ] Estimación de precios por ingrediente y país, **una vez por país** (Sonnet), guardada con `fuente = 'estimado', confianza = 0,3`.
- [ ] Bloques de hasta 4 semanas con boceto de proteínas sin repetir.
- [ ] Build `production` en **TestFlight interno**; la mamá lo instala y cocina una receta real.
- [ ] Coste del catálogo anotado (objetivo: 0,05–0,10 USD por receta).

---

## Stack que entra

| Capa | Herramienta | Para qué |
|---|---|---|
| Lotes | **Trigger.dev** (v4, TS) | Colas y jobs: generación, validación, textos, imagen, vector, ranking, decaimiento. Observabilidad incluida |
| Texto | **Sonnet 5 vía Batch API** (−50 %) | Generación de recetas en estructura. Prompt caching en el system prompt (−90 % en lecturas) |
| Texto | Haiku 4.5 en batch | Textos por idioma (título, subtítulo, pasos redactados, `linea_notificacion`) |
| Imagen | **Nano Banana** (Gemini 2.5 Flash Image) | Una imagen por receta, prompt maestro para consistencia. ≈ 0,04 USD |
| Embeddings | Modelo multilingüe 768–1536 dims (precio 2026 por confirmar — **verificar antes**) | `receta_vector` para búsqueda vaga y duplicados |
| Storage | Supabase Storage + CDN (o R2) | Imágenes de recetas. **Solo** imágenes generadas; nunca fotos de usuarios |
| Asistente | Haiku 4.5 con tool use (tarea `asistente`) | Router (qué consultar) + redactor (una frase) |
| Importador | Gemini 3 Flash (vídeo/página → estructura) → mismo pipeline | Tarea `importar` |
| Índice | `catalogo_indice` (tabla) + archivo JSON comprimido en Storage | Descarga incremental por `actualizado_en` |
| App | `expo-background-task` | Bajar el índice en segundo plano |
| Búsqueda | Filtros locales (pills) + vector de consulta vía proxy (tarea `vector`) | «algo calientico para la noche» |

**Cambia el fingerprint:** `expo-background-task`. Un PR.

---

## Qué se construye, paso a paso

### 5.1 · `feat/pipeline-recetas` — la fábrica (repo `pipeline/` dentro de `michef/`, corre en Trigger.dev)

```
idea (corpus | pedido del selector | link)
  → generar   Sonnet 5 batch · esquema zod de Receta · ingredientes por id canónico
  → validar   reglas puras (src/engine/validar-receta.ts, compartido con la app)
  → textos    Haiku batch · un job por idioma · guarda receta_texto
  → imagen    Nano Banana · prompt maestro + título · guarda en Storage
  → vector    embedding del título + ingredientes · guarda receta_vector
  → publicar  estado = 'publicada' · entra al índice
```

- `validar-receta.ts` vive en `src/engine/` (puro) y **se importa desde el pipeline**: la misma regla en los dos sitios. Es el único módulo del motor que el pipeline usa.
- Lo que falla la validación queda `borrador` con `motivo_rechazo`. Se revisa a mano en Studio; nunca se publica solo.
- Cada job es idempotente: reintentar no duplica.
- Coste por receta se registra en `uso_modelo` con `tarea = 'pipeline'`.

### 5.2 · `feat/indice-catalogo`

- Tabla `catalogo_indice (receta_id, json_compacto, actualizado_en)` regenerada por job al publicar.
- Endpoint público de solo lectura (RLS `select`) paginado por `actualizado_en > ?`.
- App: `src/catalogo/sync.ts` con `expo-background-task` cada 24 h + al abrir si > 24 h. Escribe en `catalogo_cache`. **Atómico**: o entra la página entera o no entra.
- Recetas completas (pasos, textos) se bajan **al abrir la receta** y se cachean. El índice solo tiene lo necesario para filtrar y mostrar tarjetas.

### 5.3 · `feat/selector-pide-generar`

- `selector.ts` ya devuelve `faltan`. Aquí: `src/catalogo/pedidos.ts` → `POST /ai-proxy/pedido { filtros }` → el proxy encola en Trigger.dev. Sin identidad.
- La app no espera: muestra lo que hay y un aviso «Estoy buscando 2 recetas más que encajen. Mañana las tienes».

### 5.4 · `feat/bloques-4-semanas`

- `selector.ts` gana `boceto(semanas: 1..4)`: proteínas y bases por semana sin repetir, coste estimado por semana. Aprobación del boceto → primera semana detallada → las siguientes se detallan al aprobar la anterior.
- Pantalla `plan/boceto.tsx`.

### 5.5 · `feat/asistente`

Proxy, tarea `asistente`, **dos llamadas cortas**:

1. **Router**: pregunta + lista de herramientas (`lista_semana`, `precios_por_tienda`, `tiendas_cercanas`, `inventario`, `plan_hoy`, `presupuesto`) → Haiku devuelve qué llamar con qué args. No devuelve texto.
2. La **app** ejecuta las consultas **en local** (son sus datos; el servidor no los ve) y envía al proxy solo los resultados, **máximo 20 líneas**.
3. **Redactor**: resultados → una frase + acción sugerida (`abrir_mapa`, `dividir_lista`, `cambiar_receta`).

Reglas: nunca ve el historial; nunca responde de memoria; si no hay datos, lo dice. Test:
con `inventario` vacío, el redactor recibe «sin datos» y la respuesta es la frase honesta.

### 5.6 · `feat/importador-links`

- Campo «Pega un link». Proxy tarea `importar`: Gemini lee el vídeo/página → estructura → **mismo `validar-receta.ts`** → si pasa: se guarda local como `origen = 'importada'`; si además no duplica, se ofrece «¿La compartimos con todos? Sin tu nombre».
- El vídeo/página no se guarda; solo la estructura.

### 5.7 · `feat/busqueda-catalogo`

- Pantalla `catalogo/index.tsx`: pills declaradas y derivadas (filtros locales sobre el índice), «con lo que tengo» como porcentaje contra inventario, campo de texto vago → tarea `vector` → coseno contra `receta_vector` (vía proxy, vectores no salen al cliente).

### 5.8 · `feat/jobs-mantenimiento`

- Ranking diario: `receta_senal` → `ranking.ts` → `ranking`.
- Decaimiento de precios semanal: `confianza × 0,9` para `fuente = 'factura'` con > 7 días.
- Estimación inicial de precios por país: job manual, una vez por país.
- Limpieza de anónimos > 30 días.

### 5.9 · `release/testflight-interno`

- Tag `v0.1.0` → `release.yml` → build production → TestFlight interno.
- Checklist manual de la mamá: instalar, foto de su nevera, cocinar una receta, foto de una factura. Se anota qué falló.

---

## Cómo se ve y cómo se siente

### Tarjetas con imagen

Por primera vez, las tres recetas tienen imagen. Consistentes entre sí (mismo estilo del
prompt maestro), **marcadas como «ilustración»** en pequeño: no es el plato real, y se dice
(research §3 Evitar: Hungryroot). Si una receta no tiene imagen aún, color plano — nunca
otra imagen.

### Búsqueda

Pills arriba, deslizables: «Vegetariano · Una olla · < 20 min · Sin lactosa · Con lo que
tengo (80 %)». Cada pill muestra su conteo. Campo de texto abajo: «¿Algo en concreto?» →
«algo calientico para la noche» → resultados. La búsqueda vaga tarda ~1 s (una llamada
pequeña); los filtros son instantáneos.

### Asistente

No es un chat. Es **un campo de una línea** en Time to cook: «Pregúntame sobre tu semana».
La respuesta es una tarjeta: la frase («Aldi Meyrin: 58 CHF, 12 min. Migros: 71 CHF pero
tiene todo. Te faltarían 2 cosas en Aldi.») y **un botón** con la acción. Sin burbujas,
sin historial visible, sin «escribiendo…». Si no sabe, lo dice y ofrece lo que sí puede.

### Importar

Campo «Pega un link de TikTok, YouTube o una web» → carga con el texto «Leyendo…» → la
receta en tu estructura, editable, con «Guardar» y, si pasó validación y no duplica, «¿La
compartimos? Sin tu nombre».

### Boceto de 4 semanas

Cuatro columnas, cada una con sus proteínas y bases como chips y un coste estimado. «Se
parece a lo que querías? » → aprobar o «cambiar» (porqué). Luego la semana 1 en detalle.

### Cómo se siente

El catálogo se siente **grande** y **tuyo**: cientos de recetas, pero las tres que ves usan
lo que hay en tu nevera y respetan cada «no» que dijiste. El asistente no charla: responde
con tus números y te da un botón.

---

## Qué debe funcionar

- Todo lo del criterio de salida.
- Sin red: índice anterior, recetas ya vistas, todo lo local.
- Con red: índice nuevo baja solo; nunca bloquea.

## Qué NO debe funcionar todavía

- Francés y alemán: la estructura los soporta; los lotes se corren en fast-follow.
- Marketplace visible (recetas de usuarios con nombre). Decisión pendiente; en v1 lo importado entra anónimo o no entra.
- Generación **en vivo** en la pantalla de la foto. Sigue siendo catálogo + pedido diferido.
- Reseñas con texto visibles para otros. Solo señales agregadas.
- Detector on-device.

---

## Prohibiciones de `CLAUDE.md`

| Regla | Mecanismo |
|---|---|
| Redactar con tono se pregenera en lotes | Los textos vienen de `receta_texto`. La app no tiene tarea «redactar» |
| Nunca copiar texto ajeno | Validación: coincidencia > 8 palabras seguidas con el corpus → rechazo. El corpus son ideas estructuradas, no textos |
| Cachear toda respuesta de modelo | El pipeline guarda cada salida; reintentar lee la caché. Vectores de consulta se cachean por texto normalizado |
| OFF separado | Sin cambios; el pipeline no toca `off_` |
| Nada personal al servidor | El asistente recibe ≤ 20 líneas de resultados, nunca el historial. Test de tamaño del body |

---

## Cómo se protege

| Área | Tests |
|---|---|
| Validación | `validar-receta.ts`: 10 recetas malas → 10 rechazos con motivo correcto; 10 buenas → pasan. Propiedad: una receta válida escalada sigue válida |
| Pipeline | Jobs en Trigger.dev con modo `dry-run` (proveedores mockeados) en CI. Idempotencia: correr dos veces = un registro |
| Asistente | Router con 6 preguntas fixture → herramientas esperadas. Redactor con «sin datos» → frase honesta. Body ≤ 20 líneas |
| Índice | Sync atómico: corte de red a mitad → caché anterior intacta |
| E2E | `catalogo.yaml` (pills + búsqueda con replay), `asistente.yaml`, `importar.yaml` (fixture) |
| Coste | `uso_modelo` por receta ≤ 0,10 USD en el batch de 50 de prueba |

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Precio de embeddings 2026 sin confirmar | **Verificar antes de encolar 500.** Si es caro, embeddings solo de título (más corto) |
| Nano Banana produce imágenes inconsistentes | Prompt maestro con estilo fijo; batch de 20 de prueba; se revisan a ojo antes de 500 |
| Duplicados que pasan el umbral 0,92 | Se ajusta con los 20 de prueba. Además, ranking detecta «malas» con el tiempo |
| Trigger.dev free tier insuficiente | Batch API ya reduce llamadas; si no alcanza, self-host (soportado) |
| La mamá encuentra algo roto en TestFlight | Es el objetivo. Se anota, se prioriza para Fase 6 |

---

## Decisiones que se toman aquí

- **Marketplace:** en v1, lo importado entra al catálogo compartido solo anónimo y validado. Recetas «publicadas por usuarios» con nombre: no en v1.
- **Panel «mezclador» de recetas antes de la lista** (pendiente): **no en v1**. El porqué por receta ya cubre el caso sin el riesgo de recetas parecidas que los bocetos señalaban.
- **Umbral de duplicado:** 0,92, revisable.
- **Modelo de embeddings y su coste.**
