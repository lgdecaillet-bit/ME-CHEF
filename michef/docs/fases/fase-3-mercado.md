# Fase 3 · El ciclo del mercado

> **Semanas 8–9 · Requiere licencia de Apple** (development build ya en uso).
>
> Al terminar, el círculo se cierra: plan → lista de mercado con cantidades reales y
> precio estimado → foto de la factura → inventario actualizado y precios reales → «8,60
> CHF por debajo del presupuesto». Es la pantalla más importante para el primer usuario.

---

## En una frase

La lista de mercado es una vista calculada que resta lo que la nevera ya tiene, y la
factura es lo que convierte precios estimados en hechos — sin integración con ningún
supermercado.

## Criterio de entrada

- Fase 2 cerrada (harness > 95 %).
- Development build instalado en el iPhone. Cifrado (`flags.cifrado`) **encendido y verificado**.
- Sign in with Apple funcionando contra Supabase.

## Criterio de salida

- [ ] Lista de mercado = Σ ingredientes de la semana × porciones − inventario confiable, agrupada por pasillo, con **unidad de compra** («8 dientes → 1 cabeza de ajo»). Test de propiedad: nunca pide lo que ya hay con confianza ≥ 0,6.
- [ ] Total vivo contra presupuesto, con cada línea marcada **estimado / leído de tu factura** de forma visual.
- [ ] Ítems manuales en la lista («detergente») desde el primer día.
- [ ] Foto de factura → tienda, fecha, moneda, total y líneas con texto original, cantidad y precio, en **una** llamada de visión.
- [ ] Mapeo en cascada: caché → código de barras (Open Food Facts, tablas `off_`) → modelo. Test: la segunda factura de la misma tienda tiene ≥ 80 % de líneas resueltas sin modelo.
- [ ] Confirmación de líneas: solo las dudosas piden atención; dos toques máximo; **la foto se descarta al confirmar** (test: caché vacío).
- [ ] Inventario suma lo comprado con confianza alta y con `entroEn` = fecha de la factura.
- [ ] Subida de precios **sin identidad** y **con consentimiento explícito** (pgTAP: la fila en `precio` no tiene ninguna columna que pueda identificar; test: sin consentimiento no se sube nada).
- [ ] Plan semanal v0 visible: primera semana detallada desde el selector determinista, con **presupuesto como restricción dura** (test: el selector nunca devuelve una semana cuyo estimado supere el presupuesto si existen precios).
- [ ] Time to cook completo: hoy · esta semana · «¿Qué tienes?» · lista · factura.
- [ ] «Objetivo vago → medible» funciona con Sonnet 5 vía proxy, **una vez por objetivo**, y la app **no acepta** un objetivo vago tal cual.
- [ ] «Cada no tiene un porqué»: rechazar una receta del plan pide el porqué (chips fijos sin modelo; texto libre con Haiku una vez) y crea una `restriccion` que el selector respeta **para siempre** (test: la receta rechazada por «no me gusta el cilantro» no vuelve a aparecer y ninguna con cilantro tampoco).
- [ ] Maestro: `lista.yaml`, `factura.yaml` (con fixture y proxy en replay).

---

## Stack que entra

| Capa | Herramienta | Para qué |
|---|---|---|
| Visión | Gemini 3 Flash (vía proxy, tarea `ticket`) | Leer cualquier ticket de cualquier país. 1 llamada |
| Texto | Haiku 4.5 (tarea `mapeo`, ya existe; tarea `porque`) | Mapear líneas nuevas; porqué libre → restricción |
| Texto | Sonnet 5 (tarea `objetivo`) | Objetivo vago → medible. Muy poco frecuente |
| Datos abiertos | Open Food Facts API (lectura) | Código de barras → producto. Se guarda en `off_producto`, **separado** (ODbL) |
| Cámara | `expo-camera` (ya está) + `launchScanner` para código de barras (iOS 16+) | Ticket y barcode |
| Motor | `groceries.ts` (ya arreglado), nuevo `compra.ts` (unidad de compra), `selector.ts` con presupuesto duro, `presupuesto.ts` | Todo determinista |
| Supabase | tablas `precio`, `producto`, `tienda` (ya existen); vista agregada `precio_reciente` para lectura de cliente | RLS: lectura de la vista, escritura solo vía proxy |
| Mapas | Apple Maps (`expo-location` + `MapKit` vía `react-native-maps`) — **opcional**, solo si el usuario activa «tiendas cercanas» | La ubicación sale de la dirección impresa en el ticket; GPS solo con permiso |

**Cambia el fingerprint:** `expo-location`, `react-native-maps` (si entra). Un PR.

---

## Qué se construye, paso a paso

### 3.1 · `feat/lista-mercado` — la vista calculada

1. `src/engine/compra.ts` — `aUnidadDeCompra(linea, productoConocido?)`: si hay un `Producto` con `gramos_envase`, convierte («1,2 kg → 3 bandejas de 400 g»); si no, deja gramos con redondeo amable. Test con los ejemplos de research (mise): «8 dientes → 1 cabeza», «1 zanahoria → bolsa de 500 g».
2. `src/engine/pasillos.ts` — agrupa por `categoria` del ingrediente en orden de supermercado (verdura → proteína → lácteo → grano → condimento → otros). Reordenable por tienda: el orden se guarda como preferencia local por `tienda_id`.
3. `src/engine/presupuesto.ts` — `totalConFuentes(lineas)` devuelve `{ total, porFuente: { factura, dato_abierto, estimado }, todoReal: boolean }`.
4. Ítems manuales: tabla local `item_manual (id, texto, marcado, creadoEn)`. No pasan por el motor; se muestran en un grupo «Otros».
5. Pantalla `mercado/index.tsx` — ver UX.
6. Precios: la app baja `precio_reciente` (vista: último precio por producto × tienda × fuente, últimos 90 días) para el país del hogar. Se guarda en `catalogo_cache`.

### 3.2 · `feat/lector-tickets` — la factura

1. Proxy: tarea `ticket` en `tareas/ticket.ts`. Gemini con `responseSchema` = `{ tienda, direccion?, fecha, moneda, total, lineas: [{ texto, cantidad?, precioUnitario?, precioTotal }] }`. No sabe de países: lee.
2. `src/ai/ticket.ts` — cliente. Misma reducción de imagen que la nevera.
3. Pantalla `factura/camara.tsx` — reutiliza `MarcoCamara` con guía «Estira el ticket y que quepa entero». Recorte por partes si es largo (patrón Recipe Keeper): tomas sucesivas que se concatenan.
4. Pantalla `factura/confirmar.tsx` — ver UX. **Al confirmar, la foto se descarta.**

### 3.3 · `feat/mapeo-cascada` — el componente que hace barato un país nuevo

Extiende `tareas/mapeo.ts` del proxy:

```
1. Producto por texto exacto o formas_ticket del país          → gratis
2. cache_modelo                                                 → gratis
3. Código de barras → off_producto (local) → OFF API si no está → barato
4. Haiku con los 5 candidatos más parecidos del catálogo        → caro
→ el resultado se guarda como Producto (mapeado_por = 'modelo', confianza)
```

Cada línea resuelta por el modelo **crea un `Producto`**; la siguiente factura con esa línea
es paso 1. Test: 20 líneas sintéticas de Migros → primera pasada N llamadas, segunda 0.

Métrica en `uso_modelo`: `resueltoPor` por línea. Se grafica en PostHog: la curva de
`producto.html` («1 factura ~20 líneas nuevas · 100 facturas ~0–1») tiene que verse.

### 3.4 · `feat/inventario-desde-factura`

1. Cada línea `mapeada` → `ItemInventario { cantidad: gramos_envase × cantidad, confianza: 0,9, origen: 'factura', entroEn: fecha }`.
2. `fusionarFactura(inventario, lineas)` en `inventory.ts`: **suma** (no reemplaza — la factura dice qué entró, no qué hay). Test de propiedad: tras fusionar, cada ingrediente tiene ≥ la cantidad que tenía.
3. Líneas `dudosas` no entran al inventario hasta que el usuario confirma. `ignoradas` nunca.

### 3.5 · `feat/precios-compartidos` — lo único que cruza

1. Consentimiento: **una vez**, en la primera factura, pantalla propia (ver UX). Se guarda `hogar.consienteCompartirPrecios`.
2. Con consentimiento: por cada línea mapeada, `POST /ai-proxy/precio { producto_id, tienda_id, fecha, moneda, precio_por_unidad }`. **Sin `hogar_id`, sin `user_id`, sin nada más.** El proxy inserta con `fuente = 'factura', confianza = 1` y decae ×0,9 por semana en un job (Fase 5).
3. pgTAP: la tabla `precio` no tiene ninguna columna de identidad; el proxy rechaza bodies con campos extra (zod `strict`).
4. Test del cliente: sin consentimiento, `fetch` al endpoint de precio **no se llama** (mock cuenta 0).

### 3.6 · `feat/objetivo-medible` — de vago a número

1. Proxy: tarea `objetivo` → Sonnet 5 → `{ tipo, valor, unidad, descripcion, realista: bool, propuesta?: {...}, porque? }`.
2. Chips fijos primero (sin modelo): «Bajar grasa», «Ganar músculo», «Gastar menos», «Comer más verdura». Cada chip abre un campo numérico con unidad («kcal/día», «CHF/semana», «porciones/día»). Solo el texto libre pasa por el modelo.
3. Si `realista: false`, la app **propone** el alternativo y explica por qué; el usuario elige. Nunca acepta el irreal en silencio.
4. Se guarda como `objetivo` versionado. Todo plan apunta al `objetivo_id` con el que se generó.
5. **Sin claims médicos**: cada número lleva «aprox.» y la pantalla dice «Orientativo. No sustituye consejo profesional.»

### 3.7 · `feat/plan-semana-v0` — el selector con pantalla

1. `selector.ts` gana **presupuesto como restricción dura** cuando hay precios: si la mejor asignación supera el presupuesto, cambia recetas caras por baratas del mismo tipo antes de devolver; si no hay forma, devuelve `{ semana, sobrepasa: n }` y la UI lo dice. Nunca «se cuela» el sobrecoste (research §5 Evitar: Hungryroot).
2. Pantalla `plan/semana.tsx` — 7 columnas × comidas del día. Cada slot: receta, porciones, «cambiar». Ver UX.
3. Bloques de 4 semanas y boceto de proteínas: **v0 solo hace 1 semana**. El boceto llega en Fase 5.

### 3.8 · `feat/porque-restriccion` — el diferenciador

1. Al tocar «cambiar» o «no» en cualquier receta (plan o resultado de foto): hoja con chips: «Ya lo comí hace poco» · «No me gusta [ingrediente]» · «Muy largo» · «No tengo [equipo]» · «Quiero más variedad» · «Otro…».
2. Chips → `restriccion` directa, **sin modelo**. «Otro…» → texto libre → Haiku (tarea `porque`) → una o más restricciones estructuradas → **se muestran al usuario antes de guardar**: «Entendido: no te propongo nada con cilantro. ¿Correcto?».
3. Feedback visible: «Memoria actualizada» (patrón Ollie, el único competidor que lo hace; research #5). Una línea, dos segundos, sin modal.
4. El selector y `recetasConLoQueHay` ya respetan `restriccion` (Fase 1). Test E2E: rechazar por cilantro → regenerar → ninguna con cilantro.

### 3.9 · `feat/time-to-cook` — la pantalla principal completa

`index.tsx` deja de ser un botón:
- Arriba: «Hoy» — la comida planificada de hoy (si hay plan) con «Cocinar» / «Cambiar».
- «¿Qué tienes?» — foto o chips.
- «Tu semana» — mini vista del plan o «Planear la semana».
- «Lista de mercado» — con el total vs presupuesto y «Foto de la factura».
- Si hay algo por vencerse: banda suave arriba «Los tomates se dañan en 2 días → receta».

---

## Cómo se ve y cómo se siente

Fuentes: research §5 (P1: estructura canónica, unidad de compra, ítems manuales, último
precio, total vivo; Evitar: prometer presupuesto y no cumplirlo, precios como ciertos).

### Lista de mercado

- **Agrupada por pasillo**, con cabeceras. Cada línea: nombre · **unidad de compra** en
  grande («1 cabeza de ajo») · gramos en pequeño · precio con su **etiqueta de origen**:
  `Etiqueta real` (leído de tu factura, con la fecha) o `Etiqueta estimada` (gris, punteada).
  Debajo, en gris, «para: tortilla, pasta al ajo» — la receta de origen.
- Lo que **ya tienes** aparece en un grupo colapsado al final: «En casa (4)», tachado suave,
  con «Comprar igual» por si el inventario está mal.
- **Barra inferior fija**: «Estimado: 58 CHF · presupuesto 70». Si hay líneas estimadas:
  «(3 precios estimados)». Si todo es real: «Precios reales». Verde bajo presupuesto; ámbar
  si lo supera — **nunca rojo**: no es un error del usuario.
- Marcar una línea = comprada. Háptico. Se mueve abajo. El total se recalcula en vivo
  (MealBoard: «In Cart: $5.25 / $36.01»).
- «+ Añadir algo» siempre visible arriba (ítems manuales, innegociable).
- Botón grande al final: «Foto de la factura» — es el cierre del ciclo.

### Foto de factura → confirmación

- Cámara con marco vertical, guía «Que se vea entero. Si es largo, toma dos».
- Carga: la foto del ticket oscurecida con las líneas apareciendo encima según se leen.
- Confirmación: **solo las líneas dudosas** aparecen expandidas con «¿Qué es esto?» y tres
  candidatos como chips + «Otro». Las mapeadas están colapsadas en una sola línea: «17
  líneas reconocidas ✓ · ver». Dos toques máximo. Botón «Listo».
- Al pulsar «Listo»: la foto desaparece; pantalla de cierre: **«8,60 CHF por debajo de tu
  presupuesto»** en grande, y debajo «Tu nevera ya sabe que compraste esto». Una línea de
  comparación con la semana anterior cuando exista.
- **Primera vez, antes de subir nada**: pantalla de consentimiento. Título: «¿Compartes los
  precios?». Texto: «Solo el producto, la tienda, el precio y la fecha. Nunca quién eres ni
  qué más compraste. Así los siguientes usuarios de tu ciudad tienen precios reales.» Dos
  botones iguales: «Sí, compartir» · «No, gracias». Sin dark pattern, sin preseleccionar.

### Plan semanal (v0)

- Vista horizontal de 7 días. Cada día, sus slots. Cada slot: título de receta, porciones,
  minutos, precio estimado. Tocar = detalle. Deslizar = «Cambiar» → hoja del porqué.
- Cabecera: «Semana del 14 · estimado 62 CHF de 70». Si el selector devolvió `sobrepasa`:
  ámbar, «Con tus restricciones no llego a 70. ¿Subimos a 78 o quitamos una comida fuera?»
- Sin plan: `EstadoVacio` con «Planear la semana» y una línea: «Uso tu objetivo, tu
  tiempo y lo que ya tienes. Sin preguntas nuevas.»

### Objetivo

- Chips grandes. Al elegir uno, campo numérico con unidad y un ejemplo en gris.
- Texto libre: campo «O dímelo con tus palabras» → respuesta del modelo mostrada como
  propuesta: «Entiendo: 2.200 kcal/día y 5 porciones de verdura. ¿Lo fijamos?» con
  «Sí» / «Ajustar».
- Si es irreal: «3.500 kcal con 20 minutos por comida es difícil. ¿Probamos 3.000 y batch
  cooking el domingo?» Tono de amigo.

### Cómo se siente

La lista se puede **comprar de verdad**: cabezas de ajo, no dientes. El total te lo dice la
app antes de salir de casa, y te dice qué parte es estimada. La factura tarda diez
segundos y **cierra el círculo con un número**: cuánto ahorraste. Y cuando dices «no» a una
receta, la app pregunta por qué una vez y **nunca vuelve a fallar en eso**.

---

## Qué debe funcionar

- Todo lo del criterio de salida.
- La lista sin red (es local).
- Cambiar una receta de la semana recalcula la lista **al instante**.
- Cambiar porciones de un slot recalcula la lista.
- Una alergia de un comensal (`noCome`) nunca aparece en el plan ni en la lista.

## Qué NO debe funcionar todavía

- Bloques de 4 semanas y boceto de proteínas (Fase 5).
- Generación de recetas cuando el catálogo no alcanza (Fase 5). El selector dice «faltan N».
- Asistente («¿dónde hago mercado?») — Fase 5.
- Precios de datos abiertos: solo estimado (modelo, una vez por país, en Fase 5) y factura. En Fase 3, sin facturas, la lista muestra **sin precio** antes que un precio inventado.
- Decaimiento de confianza de precios en lote (Fase 5).
- Comparación con la semana anterior si no hay semana anterior.
- Recibos digitales (Lidl Plus, Coop, Migros): investigado como formato objetivo, no como integración. v2.

---

## Prohibiciones de `CLAUDE.md`

| Regla | Mecanismo |
|---|---|
| Lista de mercado nunca se guarda | No existe tabla. `schema.test.ts` falla si aparece |
| Solo líneas mapeadas, sin identidad, con consentimiento, salen del teléfono | pgTAP + zod `strict` en el proxy + test del cliente sin consentimiento |
| Fotos se procesan y se descartan | Test de caché vacío tras confirmar |
| Open Food Facts en tablas `off_` separadas | pgTAP: ninguna FK desde `producto` a `off_producto`; el mapeo copia el id, no enlaza |
| Sin claims médicos | Copy con «aprox.» y aviso en la pantalla de objetivo; revisado en el checklist de diseño |
| Presupuesto es restricción dura | Test de propiedad del selector |

---

## Cómo se protege

| Área | Tests |
|---|---|
| Motor | `compra.ts` ejemplos + propiedad (nunca pide menos de lo necesario). `presupuesto.ts`. `selector` con presupuesto duro. `fusionarFactura` monótona |
| Proxy | `ticket` con 5 fixtures (Migros, Coop, Aldi, Éxito, un ticket arrugado) → esquema válido. `mapeo` cascada: 20 líneas, segunda pasada 0 llamadas. `precio` rechaza campos extra. `objetivo` con respuesta `realista: false` |
| Datos | `item_manual` round-trip. `consienteCompartirPrecios` por defecto `null` (no `false`: null = no preguntado) |
| Pantallas | Lista: 4 estados + marcar recalcula total. Confirmación: solo dudosas expandidas. Consentimiento: ningún botón preseleccionado |
| E2E | `lista.yaml`, `factura.yaml` (galería + fixture + replay), `porque.yaml` (rechazar por cilantro → no vuelve) |

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Tickets suizos en FR/DE con abreviaturas (`PECH POLLO`, `poulet filet`) | `formas_ticket` en `ingrediente_nombre` se alimenta con cada corrección. Los 5 fixtures cubren FR y DE |
| OFF API con rate limit o caída | Se cachea todo en `off_producto`. Si falla, se salta al paso 4 (modelo) y se anota |
| Precios estimados «inexactos» (queja de TapCook) | No se muestran precios inventados: sin factura, sin precio. Cuando hay, siempre con etiqueta y fecha |
| El usuario no envía la factura (decisión pendiente) | Se decide aquí: **el plan sigue igual**; el inventario no cambia; la lista de la semana siguiente vuelve a pedirlo todo. Nada se asume comprado. Se anota |
| `react-native-maps` sube el tamaño de la app | Se pospone a Fase 5 con el asistente si no hace falta antes |

---

## Decisiones que se toman aquí

- **Si el usuario no envía la factura:** el plan sigue; nada se asume comprado.
- **Receta puntual teniendo plan:** se decide en Fase 4 (cuando exista «cocinar»).
- **Consentimiento de precios:** texto exacto, arriba.
- **Orden de pasillos por defecto** por país (CH: Migros/Coop; CO: Éxito/Carulla).
