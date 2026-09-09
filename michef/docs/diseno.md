# ME CHEF · Flujo de diseño de interfaz

> La interfaz es lo único que el usuario toca. Un motor perfecto detrás de una pantalla
> confusa es una app que se desinstala. Este documento define **cómo se diseña cada
> pantalla antes de construirla, con qué piezas se construye, y cómo se verifica que
> quedó bien** — con la misma seriedad que los gates de código.

Última revisión: 2026-09-09

---

## 1 · Principios (vienen del producto y del research; no se discuten pantalla a pantalla)

| # | Principio | De dónde sale |
|---|---|---|
| 1 | **Valor antes de preguntas.** El usuario ve algo útil antes de que la app le pida nada | research §1 P1; decisión de onboarding |
| 2 | **Honestidad en los vacíos.** Un estado vacío dice la verdad y ofrece el siguiente paso. Nunca relleno, nunca recetas falsas, nunca «cargando» eterno | `producto.html` §7 Confirmación mínima |
| 3 | **Un toque, no un formulario.** Chips, no listas. Saltar siempre visible. Máximo dos toques para confirmar | research §1 (Grity, Hungryroot) |
| 4 | **Lo estimado se ve distinto de lo medido.** Precio estimado ≠ leído de factura. Ingrediente visto ≠ supuesto. Distinción **visual**, no solo textual | research §5 (Clue: Tracked vs Predicted) |
| 5 | **Tono de amigo, nunca de profesor.** Sin culpa, sin exclamaciones, sin «¡No olvides…!». Calm 0,4 % de quejas vs Headspace 1,4 % con el mismo recordatorio | research §7 |
| 6 | **Nativo de iOS.** Se siente como una app de Apple, no como una web. SF Symbols, hápticos, navegación con gesto, safe areas, Dynamic Type | HIG; decisión Expo iOS-only |
| 7 | **Accesible por defecto.** Contraste AA, objetivos táctiles ≥ 44 pt, etiquetas para VoiceOver, respeta «reducir movimiento» | HIG; WCAG 2.2 |
| 8 | **Modo oscuro desde el día uno.** No es un tema; es la mitad de los usuarios a la hora de cenar | HIG |
| 9 | **Nunca una imagen que no es el plato.** Sin fotos de stock. Sin espacio, o color plano, hasta que exista la imagen real (Fase 5) | research §3 Evitar (Hungryroot) |
| 10 | **La foto es la pantalla de carga.** Mientras se procesa, el usuario ve su propia foto con etiquetas apareciendo, no un spinner | `fase-2-nevera.md` §UX |

---

## 2 · El sistema de diseño (se construye en Fase 0, paso D6.5)

Todo lo visual sale de **un solo archivo de tokens**. Ninguna pantalla tiene un color, un
tamaño o un radio escrito a mano. ESLint lo impide.

### 2.1 · Tokens — `src/ui/tokens.ts`

```
color       fondo · superficie · superficie2 · texto · texto2 · texto3
            acento (el verde de «seguro») · ambar (el de «posible») · rojo (error, «se daña»)
            borde · sombra
            → cada uno con variante light y dark. Semánticos, no «verde500».

tipografia  titulo1 (34/41 · bold) · titulo2 (28/34) · titulo3 (22/28)
            cuerpo (17/22) · cuerpoFuerte · secundario (15/20) · nota (13/18)
            → escala de iOS. Fuente del sistema (SF Pro). Soporta Dynamic Type.

espacio     xs 4 · s 8 · m 12 · l 16 · xl 24 · xxl 32 · xxxl 48      (rejilla de 4 pt)
radio       s 8 · m 12 · l 16 · xl 24 · circulo 999
movimiento  rapido 150 ms · normal 250 ms · lento 400 ms · curva estándar de iOS
tactil      minimo 44 (pt)
```

`src/ui/tema.tsx` — `ProveedorTema` lee `useColorScheme()` y expone `useTema()`. Cada
componente consume tokens vía el hook; nunca importa `tokens.ts` directamente para color.

### 2.2 · Componentes base — `src/ui/`

Los únicos ladrillos. Si una pantalla necesita algo que no está aquí, **primero se añade
aquí** (con sus estados y su test), luego se usa.

| Componente | Estados obligatorios | Notas |
|---|---|---|
| `Texto` | variantes de tipografía | Único lugar donde vive `<Text>`. Aplica Dynamic Type |
| `Boton` | primario · secundario · terciario · destructivo · deshabilitado · cargando | Háptico `light` al pulsar. Altura ≥ 44 |
| `Chip` | normal · seleccionado · pregunta (ámbar, punteado) · supuesto (gris) · deshabilitado | Es el componente más usado de la app |
| `Tarjeta` | normal · pulsable · con etiqueta | Base de `TarjetaReceta` |
| `Etiqueta` | seguro · posible · supuesto · estimado · real · aviso | **La distinción visual del principio 4 vive aquí** |
| `Campo` | vacío · con valor · error · deshabilitado | Entrada de texto. Etiqueta flotante |
| `Stepper` | mín · normal · máx | Porciones. Soporta medias |
| `Hoja` | — | Bottom sheet nativo (`@expo/ui` si cubre, si no `@gorhom/bottom-sheet`) |
| `EstadoVacio` | con acción · sin acción | Icono SF + título + texto + botón. **Siempre honesto** |
| `Cargando` | inline · pantalla | Skeleton, nunca spinner a solas |
| `Aviso` | info · exito · error | Toast no bloqueante, 3 s, accesible |
| `Icono` | — | Envuelve `expo-symbols` (SF Symbols). Único lugar con iconos |
| `Progreso` | — | Barra «2 de 2» del onboarding |

Cada componente: archivo, test RNTL con **todos** sus estados, y entrada en la galería.

### 2.3 · La galería — `src/app/(dev)/galeria.tsx`

Un Storybook de bolsillo que corre en Expo Go. Solo en `__DEV__`. Renderiza **cada
componente en cada estado**, en claro y en oscuro, con Dynamic Type en tres tamaños.

- Es donde se diseña un componente antes de que exista la pantalla que lo usa.
- Maestro le hace capturas en cada PR que toque `src/ui/` (`galeria.yaml`) → las capturas
  se adjuntan al PR → **se revisan a ojo**. Un cambio visual no intencionado se ve.
- Es la primera pantalla que se abre para comprobar que el tema oscuro no rompió nada.

### 2.4 · Textos — `src/i18n/es.ts`

**Ningún texto visible vive en un componente.** Todos en `es.ts` desde el día uno, con
clave semántica (`nevera.vacio.titulo`), porque FR y DE llegan después y porque el tono se
revisa en un solo archivo. Función `t('clave', { n })`. ESLint prohíbe strings literales
en JSX (`react/jsx-no-literals` con excepciones para símbolos).

Guía de tono en la cabecera del archivo:
- Tú, cercano, frases cortas. «Veo 7 cosas.» No «Se han detectado 7 elementos.»
- Sin exclamaciones. Sin culpa. Sin urgencia artificial.
- Los números nutricionales llevan «aprox.» siempre. Los precios llevan su origen.
- Los errores dicen qué pasó y qué puede hacer el usuario. Nunca «Algo salió mal».

---

## 3 · El flujo por pantalla

Cada pantalla nueva sigue estos cinco pasos, en este orden. Los pasos 1–3 ocurren **antes**
de escribir código de pantalla.

### Paso 1 · Brief (10 min)

En el PR, antes de nada, se escribe:

```
Pantalla: nevera/resultado
Usuario llega desde: cámara, tras la foto
Lo que tiene que lograr: ver qué se reconoció y llegar a 3 recetas en ≤ 2 toques
Estados: cargando (foto + etiquetas parciales) · ok · vacío (nevera vacía) · sin red · error de proxy
Principios que más aplican: 2, 4, 10
Texto clave: «Veo 7 cosas» · «Con esto: 3 recetas» · «¿Es esto?»
Fuente: fase-2-nevera.md §UX · research §3
```

Si el brief no cabe en diez líneas, la pantalla hace demasiado: se parte.

### Paso 2 · Boceto (30–60 min)

Baja fidelidad. **Los cinco estados**, no solo el feliz. Herramientas, de menos a más:

1. **ASCII en el PR** — para pantallas simples (ajustes, una lista). Suficiente y rápido.
2. **Claude Design canvas** (skill `design` de Claude Code) — para pantallas con layout
   real. Genera artboards editables con los tokens de `tokens.ts`; se exporta PNG al PR.
3. **Figma** — solo si hay que compartir con alguien externo. No es el flujo por defecto.

Los skills `mobile-design` y `ui-ux-pro-max` de Claude Code se usan para revisar el boceto
contra HIG y contra los principios de arriba antes de aprobarlo.

### Paso 3 · Revisión del boceto (15 min)

Checklist, en el PR, con ✓ explícito:

- [ ] ¿Se puede llegar al objetivo en ≤ 2 toques?
- [ ] ¿El estado vacío dice qué hacer?
- [ ] ¿Lo estimado se distingue de lo medido a simple vista?
- [ ] ¿Hay algún texto que suene a profesor o a culpa?
- [ ] ¿Funciona con Dynamic Type en el tamaño más grande? (los textos largos, ¿se cortan?)
- [ ] ¿Cada elemento tocable mide ≥ 44 pt?
- [ ] ¿En oscuro se lee todo?
- [ ] ¿Usa solo componentes de `src/ui/`? Si no, ¿qué componente nuevo hace falta?

### Paso 4 · Construcción

- Solo componentes de `src/ui/`. Solo tokens. Solo textos de `es.ts`.
- Los cuatro/cinco estados existen en código **y** en el test RNTL.
- Cada `Pressable` tiene `accessibilityLabel` y `accessibilityRole`. ESLint lo exige.
- Cada elemento que Maestro necesita tocar tiene `testID` estable (`nevera.confirmar`).

### Paso 5 · Verificación en dispositivo (la parte que no automatiza nadie)

Antes de pedir merge, **en el iPhone**, y se anota en el PR qué se miró:

- [ ] Modo claro y oscuro.
- [ ] Dynamic Type: tamaño por defecto y el mayor de accesibilidad.
- [ ] VoiceOver recorre la pantalla en orden lógico y cada botón dice qué hace.
- [ ] «Reducir movimiento» activado: nada parpadea, nada se anima de forma esencial.
- [ ] Gesto de volver atrás funciona.
- [ ] La pantalla se ve bien en un iPhone SE (pantalla pequeña) — o al menos en el tamaño de fuente mayor, que aprieta igual.

---

## 4 · Gates automáticos de interfaz

Se suman a los de `protocolos-calidad.md`.

| Gate | Herramienta | Qué bloquea |
|---|---|---|
| Sin colores ni tamaños a mano | ESLint `no-restricted-syntax` sobre literales hex y sobre `fontSize:`, `padding:` numéricos fuera de `src/ui/tokens.ts` | commit |
| Sin texto literal en JSX | `react/jsx-no-literals` (excepciones: `·`, `%`, números) | commit |
| Accesibilidad básica | `eslint-plugin-react-native-a11y`: `has-valid-accessibility-props`, `has-accessibility-hint` en acciones destructivas, `touchable-has-alt` | commit |
| Un `<Text>` solo en `Texto` | `no-restricted-imports` de `react-native.Text` fuera de `src/ui/Texto.tsx` | commit |
| Estados cubiertos | Test RNTL por pantalla con los estados del brief. Sin test, el PR no cumple DoD | merge |
| Regresión visual | Maestro `galeria.yaml` + `takeScreenshot` en cada PR que toque `src/ui/` → capturas en el PR | revisión humana |
| Contraste | Script `scripts/contraste.ts` que verifica cada par texto/fondo de `tokens.ts` ≥ 4,5:1 (AA) en claro y oscuro | CI |

---

## 5 · Qué se diseña en cada fase

| Fase | Pantallas | Componentes nuevos | Documento |
|---|---|---|---|
| 0 | Sistema de diseño, galería, pantalla inicial vacía | todos los base | `fase-0-fundaciones.md` D6.5 |
| 1 | Time to cook (v0) · inventario manual · 3 recetas · detalle · dos preguntas · hogar · ajustes | `TarjetaReceta`, `ContadorRecetas`, `Pregunta`, `FilaComensal` | `fase-1-motor-y-datos.md` §UX |
| 2 | Cámara con guía · carga sobre la foto · resultado con overlay · hoja de cuenta al tocar «Cocinar» | `MarcoCamara`, `EtiquetaFlotante`, `ChipPregunta`, `HojaCuenta` | `fase-2-nevera.md` §UX |
| 3 | Lista de mercado · foto de factura · confirmación de líneas · plan semanal · Time to cook completo | `LineaMercado`, `TotalPresupuesto`, `LineaFactura`, `SlotComida` | `fase-3-mercado.md` §UX |
| 4 | Paso a paso · timers · pantalla de cierre con estrellas | `PasoCocina`, `Timer`, `Estrellas` | `fase-4-cocina.md` §UX |
| 5 | Búsqueda del catálogo con pills · asistente · importar link | `Pill`, `BurbujaAsistente`, `CampoLink` | `fase-5-catalogo.md` §UX |
| 6 | Pantalla de privacidad · exportar · consentimientos · onboarding pulido | — (revisión de todo) | `fase-6-lanzamiento.md` |

---

## 6 · Lo que NO se hace

- No se diseña «bonito» antes de diseñar «claro». Primero el brief y los estados; el
  acabado visual viene con los tokens, no con cada pantalla.
- No se copia el look de otra app. Se copian **patrones probados** (el resultado en tres
  capas, el contador de recetas, la unidad real de compra), no estilos.
- No se usan librerías de componentes de terceros para lo básico (botón, chip, texto).
  `src/ui/` es pequeño a propósito y es nuestro. `@expo/ui` se usa donde da un control
  **nativo** que no se puede imitar (pickers, hojas, glass).
- No se anima nada que no comunique algo. Una etiqueta que aparece sobre la foto comunica
  «te entendí». Un botón que rebota no comunica nada.
- No se pide valoración en la App Store desde ninguna pantalla hasta Fase 6, y nunca
  antes de que el usuario haya cocinado algo.

---

## Referencias

- Apple Human Interface Guidelines (iOS): https://developer.apple.com/design/human-interface-guidelines/
- SF Symbols en Expo: https://docs.expo.dev/versions/latest/sdk/symbols/
- `@expo/ui`: https://docs.expo.dev/versions/latest/sdk/ui/
- Hápticos: https://docs.expo.dev/versions/latest/sdk/haptics/
- WCAG 2.2 (contraste, objetivos táctiles): https://www.w3.org/TR/WCAG22/
- eslint-plugin-react-native-a11y: https://github.com/FormidableLabs/eslint-plugin-react-native-a11y
- Research: `../../research/reports/me-chef-recomendaciones.md` §1, §3, §5, §7, y patrones `01-onboarding.md`, `03-flujo-principal.md`, `05-cocina-guiada.md`, `06-notificaciones.md`
