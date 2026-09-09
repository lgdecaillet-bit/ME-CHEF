# Fase 6 · Endurecimiento y beta externa

> **Semanas 14–15 · Requiere licencia de Apple.**
>
> Al terminar, la app cumple lo que promete de forma verificable (privacidad, exportar,
> borrar), pasa la revisión de Apple, y llega a personas fuera de la familia por
> TestFlight externo con un rollout gradual y umbrales que lo detienen.

---

## En una frase

Nada nuevo. Todo lo que ya existe, hecho a prueba de personas que no son tú.

## Criterio de entrada

- Fase 5 cerrada. La mamá usó TestFlight interno y sus hallazgos están priorizados.
- ≥ 2 semanas de datos de Sentry y PostHog del uso interno.

## Criterio de salida

- [ ] **`PrivacyInfo.xcprivacy`** completo y correcto: tipos de datos, motivos de API (UserDefaults, file timestamp, etc.), sin tracking. Verificado con `expo-doctor` y con la validación de App Store Connect.
- [ ] **Disclosure de IA** en la ficha y en la app: qué se envía a modelos (foto de nevera, foto de ticket, texto del objetivo, porqués libres, preguntas al asistente) y que **no se guarda**.
- [ ] **Consentimiento explícito antes de enviar una foto a terceros**, la primera vez, con el texto exacto en `es.ts`. Test: sin consentimiento, el proxy no recibe imágenes.
- [ ] **Exportar** produce un archivo legible que contiene **todo** (test compara contra el esquema). **Borrar** deja la DB vacía, la clave destruida, la sesión cerrada, y **no hay nada que borrar en el servidor** (test: ninguna tabla compartida tiene identidad — ya probado; aquí se documenta en la pantalla).
- [ ] Pantalla **«Qué guardamos y qué no»** en ajustes y enlazada desde el onboarding. Research §11: nadie en el corpus lo usa como argumento de confianza; es un hueco gratis.
- [ ] **Precios locales para Colombia fijados a mano** (aunque el paywall no exista aún, el tier de precio del país se decide y anota). Research #9.
- [ ] Accesibilidad: **VoiceOver completa el flujo central** (foto → recetas → cocinar) sin ayuda. Dynamic Type mayor no rompe ninguna pantalla. Contraste AA en todos los pares (script). «Reducir movimiento» respetado.
- [ ] Rendimiento en iPhone 11 o equivalente: **arranque en frío p95 < 2,5 s**, foto → recetas p95 < 8 s por 4G, memoria < 200 MB en la cámara. Medido y anotado.
- [ ] Sin red: plan, lista, receta en curso, inventario funcionan. Las tres funciones con red lo dicen honestamente.
- [ ] `knip` bloqueante y verde. Cobertura global ≥ 75 %. Engine 100/95.
- [ ] Sentry: **crash-free users ≥ 99,8 %** en las 2 semanas internas. Cero crashes abiertos de prioridad alta.
- [ ] Screenshots de App Store (6,7" y 6,1"), texto de la ficha, keywords, política de privacidad publicada (URL).
- [ ] **Beta App Review** aprobada. TestFlight externo con **rollout gradual**: 10 → 30 → 100 usuarios, con 48 h entre pasos y los umbrales de `roadmap.md §6` como freno.
- [ ] Runbook de incidentes en `docs/incidentes.md`: cómo apagar la nevera por flag, cómo hacer rollback de un update, a quién avisar (a ti), qué mirar primero.

---

## Stack que entra

| Capa | Herramienta | Para qué |
|---|---|---|
| Privacidad | `PrivacyInfo.xcprivacy` vía `app.config.ts` (`ios.privacyManifests`) | Requisito de App Store desde 2024 |
| Revisión | App Store Connect, TestFlight external groups | Beta App Review |
| Rollout | EAS `testflight` job con grupos; EAS `update` con `rollout_percentage` | Gradual y reversible |
| Flags | PostHog feature flags (ya existen) | Kill switch de cada función con red |
| Rendimiento | React Native DevTools + Sentry Performance | Cold start, pantallas lentas |
| A11y | VoiceOver, Accessibility Inspector (en el iPhone), script de contraste | |
| Precios | App Store Connect → Pricing → por país | Colombia a mano |
| Docs | `docs/incidentes.md`, `docs/privacidad.md` (la política, en lenguaje llano) | |

**No cambia el fingerprint** salvo el privacy manifest (una vez).

---

## Qué se construye, paso a paso

### 6.1 · `fix/hallazgos-testflight` — lo que la mamá encontró

Primero. Cada hallazgo → issue → test de caracterización → fix → PR. Nada de esta fase
sigue hasta que los de prioridad alta están cerrados.

### 6.2 · `feat/privacidad-verificable`

- Pantalla «Qué guardamos y qué no» — ver UX.
- Consentimiento de fotos a terceros (primera foto de nevera **y** primera de ticket, por separado; son datos distintos).
- Exportar: `exportarTodo()` ya existe; aquí se le da formato (JSON + un `README.txt` dentro del zip explicando cada archivo) y se comparte con la hoja nativa.
- Borrar: confirmación de dos pasos; el segundo paso **lista** lo que se borra; tras borrar, la app vuelve al estado de primera apertura (sesión anónima nueva).
- `docs/privacidad.md` → se publica como página (la política de la ficha). En lenguaje llano, sin abogado: las cinco reglas de `CLAUDE.md` traducidas.

### 6.3 · `chore/privacy-manifest`

- `ios.privacyManifests` en `app.config.ts`: `NSPrivacyTracking: false`, `NSPrivacyCollectedDataTypes` (ninguno vinculado a identidad; eventos de uso no vinculados), `NSPrivacyAccessedAPITypes` con los motivos de cada librería (expo-file-system, Sentry, etc.).
- Se valida subiendo un build a App Store Connect y leyendo el correo de «missing API declaration» si llega.

### 6.4 · `feat/accesibilidad`

- Pasada completa con VoiceOver del flujo central. Cada hallazgo → fix.
- Dynamic Type: se abre cada pantalla en el tamaño mayor de accesibilidad desde la galería (`galeria.yaml` ya lo captura); se corrigen cortes.
- `scripts/contraste.ts` bloqueante en CI.
- Objetivos táctiles: auditoría con Accessibility Inspector.

### 6.5 · `perf/arranque-y-memoria`

- Medir arranque en frío con `Sentry.startSpan` desde `_layout` hasta primer render útil.
- Diferir lo no crítico (PostHog init, sync del índice) a después del primer frame.
- Cámara: liberar la imagen en memoria al confirmar (ya debía; aquí se verifica con el profiler).
- Índice del catálogo: si > 3 MB, comprimir o paginar mejor.

### 6.6 · `chore/app-store`

- Ficha en español (CH: también FR/DE de la ficha, no de la app — se anota). Sin claims médicos. Sin «IA» como promesa mágica: «Le tomas una foto a la nevera y te dice qué cocinar».
- Screenshots reales de la app (no mockups con texto inventado).
- Keywords desde el research (`app-store-optimization` skill como apoyo).
- Precios por país: aunque la app sea gratis en v1, se fija el tier de Colombia para el futuro paywall (research #9).
- URL de política de privacidad. URL de soporte (un correo).

### 6.7 · `release/beta-externa`

- Tag `v0.2.0` → `release.yml` → production → TestFlight interno → **`require-approval`** → externo grupo «beta-10».
- 48 h. Mirar: crash-free, p95 arranque, error rate del proxy, coste de IA por usuario, y las **reseñas de TestFlight** (se leen todas).
- Si todo dentro de umbral → grupo «beta-30» → 48 h → «beta-100».
- Si algo cruza umbral: **no se avanza**; se decide entre flag, rollback de update, o fix + nuevo build.

### 6.8 · `docs/incidentes`

Runbook corto. Para cada función con red: síntoma → qué mirar (Sentry/PostHog/logs del proxy) → cómo apagar (flag) → cómo revertir (update anterior) → cómo comunicar (nota en la app vía flag de mensaje).

---

## Cómo se ve y cómo se siente

### «Qué guardamos y qué no»

Una pantalla, cinco bloques, cada uno con un icono SF y dos líneas:

1. **Tus fotos.** «Se procesan y se borran. Ni nosotros ni nadie las guarda. Nunca.»
2. **Tu nevera, tus comensales, tu objetivo.** «Viven en tu teléfono, cifrados. No salen.»
3. **Los precios de tus facturas.** «Solo si dices que sí: producto, tienda, precio y fecha. Nunca quién eres.»
4. **Lo que le preguntas al asistente.** «Ve tus números un momento para responder. No los guarda.»
5. **Exportar y borrar.** «Todo, en un toque, cuando quieras.» → dos botones.

Debajo, en gris: «Esto no es una promesa: está construido así. [Cómo lo verificamos →]»
enlaza a `privacidad.md`.

### Consentimiento de foto (primera vez)

Antes de abrir la cámara por primera vez, una hoja: «Para reconocer lo que hay, la foto se
envía a un servicio de visión y se borra en cuanto responde. ¿De acuerdo?» — «Sí, enviar» ·
«Mejor con chips». Sin preseleccionar. Se recuerda.

### Rollout

El usuario de beta no ve nada distinto. Si hay que apagar la nevera por flag, el botón de
foto desaparece y Time to cook muestra una línea: «La lectura de nevera está en pausa un
rato. Los chips funcionan igual.» Honesto, sin drama.

### Cómo se siente

Que la app **es de fiar**. No porque lo diga, sino porque cada afirmación tiene un botón al
lado que la demuestra: exportar, borrar, ver qué se envía.

---

## Qué debe funcionar

- Todo lo anterior, en manos de 100 personas que no te conocen.
- Apagar cualquier función con red en < 1 min sin build.
- Rollback de un update en < 5 min.
- Exportar y borrar, de verdad.

## Qué NO debe funcionar todavía

- **Paywall.** No hay. Todo gratis en beta. RevenueCat es fast-follow, y cuando llegue: nunca sobre la foto, cupo visible, acceso de lectura a lo propio si caduca (research §10, §11).
- FR/DE en la app (solo en la ficha).
- Colombia como país activo: el tier de precio se fija; la despensa y los precios estimados de CO son fast-follow.
- Sync multi-dispositivo.
- Compartir hogar (research #8: el elogio más repetido; es la primera feature post-beta).
- Pedir valoración en App Store: se activa solo tras **3 recetas terminadas** y **nunca** en un flujo de cocina o de foto. `StoreReview.requestReview()` una vez cada 4 meses como máximo.

---

## Prohibiciones de `CLAUDE.md` — aquí se verifican todas, en una lista

| Regla | Evidencia que se adjunta al PR de release |
|---|---|
| Ninguna API key en la app | `secrets:bundle` sobre el bundle de producción: 0 |
| Engine no importa ai | `depcruise` en producción: 0 |
| Nada personal sale, salvo líneas de factura con consentimiento | Captura de red de una sesión completa (Proxyman/Charles en el iPhone): solo `ai-proxy` y `catalogo`, bodies revisados |
| Fotos procesadas y descartadas | Test de caché + inspección del bucket + logs |
| Nunca inventar un ingrediente | Harness > 95 % + propiedad del motor |
| Números nutricionales de tablas | Test: `nutricion.fuente` ∈ {usda, suiza, ciqual, bedca, estimado}, y «aprox.» en UI |
| OFF separado | pgTAP |
| Sin claims médicos | Revisión de `es.ts` línea a línea; checklist en el PR |
| Lista, macros, pills nunca se guardan | `schema.test.ts` |

---

## Cómo se protege

| Área | Tests / evidencia |
|---|---|
| Privacidad | Consentimiento → proxy no recibe imagen sin él. Export completo. Borrado a cero. Captura de red |
| Manifest | Validación de App Store Connect (correo o silencio) |
| A11y | Pasada manual VoiceOver anotada. `contraste.ts` en CI. Dynamic Type en `galeria.yaml` |
| Rendimiento | Spans de Sentry con umbrales. Script `medir-nevera.ts` por 4G |
| Release | `release.yml` con `require-approval`. Umbrales en `roadmap.md §6` revisados a mano cada 48 h |
| E2E | Toda la suite de Maestro verde sobre el build de producción (perfil `simulator` con misma config) |

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Beta App Review rechaza (privacy manifest, disclosure de IA, permisos) | Se sube un build a review **en la semana 14**, no al final. Los motivos de rechazo son públicos y se corrigen en un día |
| Crash en un modelo de iPhone que no tienes | Sentry lo dice con el modelo. Los 10 primeros beta se eligen con variedad de iPhone |
| El coste de IA por usuario se dispara con 100 personas | `uso_modelo` por día; umbral de alerta en 0,50 USD/usuario/mes; el rate limit ya existe |
| Reseñas de TestFlight negativas por onboarding | Se leen todas en 48 h. El onboarding ya está en el percentil más ligero (2 preguntas, sin cuenta) |
| Alguien intenta que la app dé consejo médico | Copy revisado; el objetivo dice «orientativo»; el asistente no responde preguntas de salud (regla en el router: sin herramienta → «No puedo con eso») |

---

## Decisiones que se toman aquí

- **Tier de precio para Colombia** (para el futuro).
- **Grupos de beta** y criterio de selección.
- **Fecha de la primera revisión de precios de modelos** (cada mes desde aquí).
- **Qué entra en fast-follow 1:** compartir hogar (research #8) y FR/DE, en ese orden.
