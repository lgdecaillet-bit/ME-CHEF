# Fase 4 · Cocinar acompañado

> **Semanas 10–11 · Requiere licencia de Apple** (Live Activities exige entitlements).
>
> Al terminar, cocinar una receta es un paso por pantalla, con «así debe verse», timers
> que suenan aunque el teléfono esté bloqueado, un toque en el hombro si te distraes, y
> al final el inventario se descuenta solo y la app pregunta qué tal, una vez.

---

## En una frase

Quien no sabe cocinar necesita saber cómo debe verse cada etapa y cuándo suena el timer;
quien sabe, necesita que no le estorben. Las dos cosas, sin modelo, sin internet.

## Criterio de entrada

- Fase 3 cerrada.
- Recetas del catálogo con `receta_paso` completo: instrucción, `asi_debe_verse`, `timer_segundos`, `equipo`. Las 20 del seed se completan en la semana 9 (trabajo de contenido, en paralelo).

## Criterio de salida

- [ ] Flujo completo **sin red**: receta → pasos → timers → cierre → inventario descontado.
- [ ] Timers son **notificaciones locales con sonido**: suenan con la app cerrada y con el teléfono bloqueado (test manual en iPhone, anotado).
- [ ] **Live Activity** muestra el timer activo en pantalla bloqueada y Dynamic Island (iOS 16.2+). Test manual.
- [ ] Inactividad: a los 3 minutos sin tocar la pantalla en un paso, notificación local suave. Se **cancela** al avanzar de paso (test: avanzar cancela la programada).
- [ ] `descontarCocinado` corre al terminar y solo descuenta lo usado (test de propiedad: nunca queda negativo).
- [ ] Pantalla de cierre: estrellas (1 toque) + reseña opcional + «Saltar». Nunca bloqueante.
- [ ] Eventos de cocina en `evento`: inicio, paso, duración por paso, inactividad, abandono, fin. Sirven para `minutos_reales_media` y para la hora aprendida.
- [ ] Notificación «hora de comer» a la **hora aprendida** (mediana de `evento` tipo `inicio_cocina` por tipo de comida) con texto **pregenerado** de `receta_texto.linea_notificacion`. Sin modelo en vivo.
- [ ] Modo compacto para quien sabe cocinar: todos los pasos en una pantalla, timers igual. Un toggle recordado.
- [ ] Maestro: `cocinar.yaml` (pasos → fin → estrellas → saltar).

---

## Stack que entra

| Capa | Herramienta | Para qué | Nota |
|---|---|---|---|
| Notificaciones | `expo-notifications` (SDK 57) | Timers y recordatorios **locales** | Local funciona en Expo Go; pero esta fase ya va en dev build |
| Live Activities | `expo-live-activity` o módulo propio con `expo-modules` + ActivityKit | Timer en pantalla bloqueada / Dynamic Island | Requiere entitlement `com.apple.developer.ActivityKit` → **licencia**. Widget extension en Swift: se escribe una vez, se compila en EAS |
| Hápticos | `expo-haptics` | Al avanzar paso, al terminar timer | |
| Pantalla | `expo-keep-awake` | La pantalla no se apaga mientras cocinas | |
| Motor | `cocina.ts`, `horario.ts` | Secuencia de pasos, timers, mediana de horas | Puro |
| Datos | `evento` (ya existe), `resena` (ya existe), `comidaPlanificada.estado` | | |
| Audio | sonido de timer propio (`assets/sonidos/timer.caf`) | Un sonido, reconocible, no agresivo | |

**Cambia el fingerprint:** `expo-notifications`, `expo-keep-awake`, `expo-haptics`, el módulo de Live Activity (widget extension). Un PR al inicio.

**Límites reales de iOS (de `producto.html`):** no hay ejecución arbitraria en segundo
plano. Los timers **son** notificaciones programadas, no procesos. La inactividad de 3 min
**es** una notificación programada que se cancela. Live Activities cubre lo visible.

---

## Qué se construye, paso a paso

### 4.1 · `feat/motor-cocina` — la secuencia, pura

`src/engine/cocina.ts`:
- `secuencia(receta, porciones)` → `PasoUI[]` con instrucción, «así debe verse», timer (segundos), equipo, ingredientes de ese paso escalados.
- `estado` de la sesión: `{ pasoActual, timers: { pasoId, finEn }[], inicio, eventos }`. Reducer puro: `avanzar`, `retroceder`, `iniciarTimer`, `terminar`, `abandonar`.
- `usadosAlTerminar(receta, porciones)` → lo que `descontarCocinado` recibe.

`src/engine/horario.ts`:
- `horaAprendida(eventos, tipoComida)` → mediana de la hora de `inicio_cocina` de ese tipo en las últimas 4 semanas. Sin datos → por defecto por tipo (desayuno 8:00, almuerzo 12:30, comida 19:30, in_the_middle 16:30). **Decisión pendiente «qué es in the middle»** se toma aquí: es la comida entre almuerzo y comida, para el perfil 2 donde caben calorías; se planifica como slot opcional.

### 4.2 · `feat/notificaciones-locales`

`src/notificaciones/`:
- `permiso.ts` — se pide **en el primer paso con timer**, no antes, con contexto: «Para avisarte cuando el arroz esté listo, aunque bloquees el teléfono». Research §1: permiso en el momento de uso (Yuka), nunca en la pantalla 3.
- `timer.ts` — `programar(pasoId, segundos, titulo)` / `cancelar(pasoId)`. Sonido propio, categoría con acción «Siguiente paso».
- `inactividad.ts` — `programar(3 min)` al entrar en un paso; `cancelar()` al salir. Texto: «¿Sigues ahí? El [paso] te espera». Tono de amigo.
- `horaDeComer.ts` — programa una notificación diaria por tipo de comida planificada, a la hora aprendida, con `linea_notificacion` de la receta del día. Se reprograma al cambiar el plan. **Nunca** si no hay plan.

Reglas de tono (research §7, antipatrón MyFitnessPal): sin «¡No olvides!», sin «Llevas 3
días sin…», sin racha, sin culpa. Los textos viven en `receta_texto` (pregenerados en Fase
5) y en `es.ts`.

### 4.3 · `feat/live-activity`

- Widget extension en Swift (`targets/TimerActivity/`) con `expo-modules` config plugin. Muestra: nombre del paso, cuenta atrás, botón «Siguiente». Compacta en Dynamic Island.
- Se inicia al arrancar un timer, se actualiza cada segundo desde el sistema (no desde JS), se cierra al terminar o abandonar.
- Es la pieza más «nativa» del proyecto y la que más puede fallar en EAS: **PR aislado**, build de simulador primero, dev build después.

### 4.4 · `feat/pantallas-cocina` — ver UX

### 4.5 · `feat/cierre-y-descuento`

- Al «Terminar»: `descontarCocinado(inventario, usadosAlTerminar(...))` → guardar. `comidaPlanificada.estado = 'cocinada'` si venía del plan.
- **Decisión pendiente «receta puntual teniendo plan»** se toma aquí: si se cocina algo fuera del plan en un día con slot pendiente, la app pregunta una vez: «¿Esto reemplaza la [comida] de hoy?» Sí → `reemplazada` y la lista de la semana se recalcula; No → se suma y el conteo calórico del día lo incluye. Se anota.
- Pantalla de estrellas. `resena` local. `receta_senal` compartida se actualiza vía proxy con contadores **sin identidad** (`terminadas +1`, `estrellas_suma +n`).

---

## Cómo se ve y cómo se siente

Fuentes: `producto.html` módulo C; research §6 (un paso por pantalla, «así debe verse», timers nativos, modo compacto para quien sabe) y §7 (tono).

### Antes de empezar

Pantalla «Listo para cocinar»: ingredientes escalados con checks (mise en place), equipo
necesario con iconos SF, tiempo total, y un toggle «Modo rápido» (todos los pasos en una
pantalla) que se recuerda. Botón «Empezar». La pantalla **no se apaga** desde aquí.

### Un paso por pantalla

- Arriba: «Paso 3 de 7» y una barra de progreso fina.
- Centro: **la instrucción**, en `titulo2`, una frase. Debajo, en `cuerpo` y un color de
  superficie distinto: **«Así debe verse: dorado por fuera, no oscuro»**. Es el texto que
  diferencia a alguien que no sabe cocinar de alguien que sí.
- Si el paso tiene timer: un **círculo grande** con la cuenta atrás y un botón «Iniciar».
  Al iniciar: háptico, la Live Activity aparece, el círculo se anima (respeta «reducir
  movimiento»: sin animación, solo números).
- Ingredientes de este paso, en chips pequeños con cantidad escalada («200 g arroz»).
- Abajo: **flecha grande** «Siguiente» ocupando el ancho. «Atrás» en texto pequeño. El
  gesto de deslizar también avanza.
- Nada más. Sin menú, sin chat, sin anuncios, sin «valora la app».

### Timers

- Cuando suena: notificación con sonido propio + acción «Siguiente paso». Si la app está
  abierta, el círculo se pone en acento y vibra dos veces.
- Varios timers a la vez (arroz + salsa): una fila de mini-círculos arriba; tocar uno lo
  trae al frente.

### Inactividad

A los 3 min: notificación «¿Sigues ahí? La cebolla te espera». Al volver, nada cambia —
sin regaño, sin «llevas 5 minutos». Solo el paso donde estabas.

### Modo rápido

Una pantalla con todos los pasos como lista numerada, «así debe verse» colapsado, timers
inline. Para quien sabe cocinar (perfil 1). Se recuerda por usuario.

### Cierre

- Pantalla limpia: «Listo» en grande, la receta, el tiempo real («28 min, dijimos 25»).
- **Cinco estrellas** en fila, un toque. Debajo, campo opcional «¿Algo que cambiarías?».
  Botón «Saltar» del mismo tamaño que «Enviar». Sin presión.
- Última línea: «Tu nevera ya sabe que usaste esto.» y, si algo se agotó: «Te quedaste
  sin arroz — ¿lo añado a la lista?» con un toque.
- **Nunca** se pide valoración en App Store aquí (research §1 Evitar). Eso es Fase 6 y
  solo tras varias recetas terminadas.

### Notificación «hora de comer»

A la hora aprendida: «Esos huevitos te están esperando» (línea de `receta_texto`). Tocar
abre «Listo para cocinar». Si no hay plan, no hay notificación. Si el usuario no ha
cocinado en 2 semanas, **tampoco**: se apaga sola (research §7: el tono se mide en quejas).

### Cómo se siente

Como tener a alguien al lado que te dice «ahora sí, dale la vuelta» sin mirarte mal por
tardar. Cuando suena el timer con el teléfono bloqueado y ves el paso en la pantalla,
confías. Al terminar, la app te felicita en una línea y te deja ir.

---

## Qué debe funcionar

- Todo sin red.
- Timers con la app cerrada y el teléfono bloqueado.
- Live Activity visible.
- Inactividad se cancela al avanzar.
- Inventario descontado; lo agotado ofrece ir a la lista.
- Estrellas opcionales.
- Hora aprendida ajusta la notificación tras 3+ eventos.

## Qué NO debe funcionar todavía

- Textos de notificación generados en vivo. Solo pregenerados (Fase 5) o el genérico de `es.ts`.
- Vídeo o imagen por paso. Solo texto («así debe verse»). Imágenes son Fase 5 y solo una por receta.
- Comandos de voz («siguiente»). v2.
- Compartir la sesión de cocina con otro miembro del hogar. v2.
- Ajuste automático de timers por altitud/equipo. Nunca en v1.

---

## Prohibiciones de `CLAUDE.md`

| Regla | Mecanismo |
|---|---|
| Redactar con tono se pregenera, nunca en vivo | El cliente de notificaciones no importa `src/ai` (`depcruise`). Solo lee `receta_texto` o `es.ts` |
| Patrones de horario son deterministas | `horario.ts` es una mediana. Test |
| Nada personal sale | `receta_senal` recibe contadores, no eventos. Test del proxy: el body es `{ receta_id, campo, delta }` |

---

## Cómo se protege

| Área | Tests |
|---|---|
| Motor | Reducer de sesión: propiedades (avanzar/retroceder son inversas; terminar descuenta exactamente `usadosAlTerminar`; nunca negativo). `horaAprendida` con 0, 1, 3, 20 eventos |
| Notificaciones | Con `expo-notifications` mockeado: programar/cancelar por paso; inactividad cancelada al avanzar; hora de comer no se programa sin plan |
| Pantallas | Paso: con y sin timer, con «reducir movimiento». Cierre: saltar no escribe `resena`. Modo rápido recuerda |
| E2E | `cocinar.yaml`: empezar → 3 pasos → iniciar timer (fixture corto de 3 s) → terminar → 4 estrellas → inicio |
| Manual (anotado en el PR) | Timer con app cerrada; Live Activity; VoiceOver en el paso; Dynamic Type mayor en «así debe verse» |

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Live Activity en Expo: módulo inmaduro o build que falla | PR aislado. Si no compila en 2 intentos: se lanza sin Live Activity (flag) y con notificación normal; se anota como deuda. **No bloquea la fase** |
| El sonido del timer no suena en silencio | Es comportamiento de iOS. Se documenta en la pantalla de permiso: «Con el teléfono en silencio verás la notificación pero no sonará» |
| Notificaciones percibidas como spam | Máximo 1 «hora de comer» por comida planificada, apagado automático tras 2 semanas sin uso, sin rachas |
| Recetas del seed sin `asi_debe_verse` | Contenido en semana 9. Sin él, el paso muestra solo la instrucción — nunca un placeholder |

---

## Decisiones que se toman aquí

- **«In the middle»:** comida entre almuerzo y comida; slot opcional; por defecto 16:30.
- **Receta puntual teniendo plan:** pregunta única «¿reemplaza?».
- **«Después» en la receta puntual** (pendiente): programa una notificación local a la hora aprendida de esa comida con «¿Cocinamos [receta]?». No guarda borrador; no vuelve atrás.
