# ME CHEF · Roadmap

> Cómo se construye ME CHEF, en qué orden, con qué se verifica cada paso, y en qué
> momento exacto hace falta pagar la licencia de Apple.
>
> Este archivo es el índice. El detalle de cada fase está en `docs/fases/`.

Última revisión: 2026-09-09 · Stack verificado contra la documentación oficial de esa fecha.

---

## 1 · El principio que ordena todo

`CLAUDE.md` dice:

> **La IA interpreta y genera. La base de datos recuerda y calcula.**

El roadmap es esa regla aplicada al calendario. **Todo lo determinista va primero.**
No porque sea más fácil, sino porque si el motor no es correcto, ninguna cantidad de
modelo lo arregla: una lista de mercado mal sumada sigue mal sumada aunque la haya
propuesto Sonnet.

Consecuencia práctica: al terminar la Fase 1 la app ya resuelve el problema del primer
usuario (porcionar para tres, no gastar de más) **sin haber llamado a un modelo ni una
vez**. La Fase 2 no añade la función central desde cero: le pone ojos a un sistema que
ya funciona.

---

## 2 · El bucle de desarrollo, en concreto

Se desarrolla **en Windows**. No hace falta Mac. El bucle es idéntico al de una app web.

```
Terminal 1   npx expo start          ← abierto todo el día
Terminal 2   npm run test:watch      ← abierto todo el día
iPhone       Expo Go (QR una vez al empezar la sesión)

guardas un archivo  →  ① el iPhone se actualiza      (~1 s)
                    →  ② los tests se re-ejecutan    (~2 s)
```

Al cerrar una tarea:

```
npm run gates    typecheck + lint + tests + reglas de arquitectura   (~40 s, local)
git commit       husky revalida lo mínimo sobre lo que tocaste
git push → PR    CI repite todo + compila de verdad en la nube
                 verde → mergeas · rojo → el merge está bloqueado
```

### Los tres espejos

No hay un solo sitio donde ves tu código. Hay tres, y **dos son gratis**.

| | Qué te muestra | Latencia | Coste |
|---|---|---|---|
| **① Expo Go** en tu iPhone | La app funcionando, con la cámara real | ~1 s | gratis |
| **② Build de simulador** en EAS, en cada PR | Que tu configuración **nativa compila de verdad** | 15–25 min, automático | gratis (los builds de simulador van sin firmar) |
| **③ Development build** en tu iPhone | Todo, sin límites | ~1 s tras compilar una vez | 99 USD/año |

El **②** es lo que hace seguro trabajar semanas en Expo Go: en cada PR, un Mac de Expo en
la nube compila tu app real y Maestro comprueba que arranca. Nunca estás a ciegas.

No existe simulador de iOS para Windows y no se puede fabricar. Es una pérdida menor:
vas a probar en un iPhone real, con una cámara real, contra una nevera real — que para
esta app es mejor que un simulador.

---

## 3 · Cuándo hace falta la licencia de Apple

Verificado módulo por módulo contra la documentación del SDK 57.

### Funciona dentro de Expo Go (gratis)

| Capacidad | Fase |
|---|---|
| Cámara — **la foto de la nevera** | 2 |
| SQLite + Drizzle + migraciones (sin cifrar) | 1 |
| Supabase: sesión anónima, Edge Functions, el proxy de IA | 1–2 |
| Motor determinista completo | 1 |
| Notificaciones **locales** (los timers de cocina) | 4 |
| Secure Store | 1 |
| PostHog, Sentry (con límites), red, todo el JS | 0 |

### Exige development build → exige licencia

| Capacidad | Fase | Cómo se pospone |
|---|---|---|
| **SQLCipher** (cifrado real del archivo) | 1 | Detrás de un flag. El código es idéntico; cambia una línea (`PRAGMA key`) |
| **Sign in with Apple** real contra Supabase | 1 | Ya pospuesto por diseño: la app corre con sesión anónima; la cuenta se pide al tocar «Cocinar»; cocinar requiere cuenta, ver recetas no |
| **Live Activities** (Dynamic Island) | 4 | No se pospone. Aquí ya hará falta |
| **TestFlight** | 5 | No se pospone |
| Push remoto (APNs) | — | **No se usa.** ME CHEF usa notificaciones locales |

### La conclusión

```
Semana   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
         ├───────────────────────────────┤
         Fases 0, 1 y 2 · GRATIS, en Expo Go
                                         ├──────────────────────────►
                                         Aquí sí o sí: 99 USD/año
```

**Máximo aplazamiento defendible: semana 7.** Es seguro solo porque el espejo ② te avisa
cada día si algo dejó de compilar.

**Recomendación: semana 3 o 4.** No por funciones, sino por riesgo acumulado. Firmar,
entitlements, provisioning y prebuild son la parte impredecible de iOS. Descubrir sus
problemas en la semana 7, todos juntos, con la Fase 2 encima, cuesta más que medio día
tranquilo en la semana 3.

**No negociable en ambas lecturas:** inicia el alta **una semana antes** de necesitarla.
Apple aprueba en 24–48 h, pero si pide verificación de identidad se va a varios días.

---

## 4 · Las fases

Cada fase tiene su documento con el detalle completo: pasos, UX, qué debe y qué no debe
funcionar, stack, tests y riesgos.

| Fase | Nombre | Semanas | Apple | Documento |
|---|---|---|---|---|
| **0** | Fundaciones y barreras | 1–2 | no | [fase-0-fundaciones.md](fases/fase-0-fundaciones.md) |
| **1** | El motor y los datos personales | 3–4 | no | [fase-1-motor-y-datos.md](fases/fase-1-motor-y-datos.md) |
| **2** | La nevera de punta a punta | 5–7 | no | [fase-2-nevera.md](fases/fase-2-nevera.md) |
| **3** | El ciclo del mercado | 8–9 | sí | [fase-3-mercado.md](fases/fase-3-mercado.md) |
| **4** | Cocinar acompañado | 10–11 | sí | [fase-4-cocina.md](fases/fase-4-cocina.md) |
| **5** | El catálogo y el asistente | 12–13 | sí | [fase-5-catalogo.md](fases/fase-5-catalogo.md) |
| **6** | Endurecimiento y beta | 14–15 | sí | [fase-6-lanzamiento.md](fases/fase-6-lanzamiento.md) |

### Regla de avance

**Una fase no empieza hasta que la anterior cumple su criterio de salida entero.**
El criterio de salida no es una sensación: es una lista de comprobaciones verificables,
y está al principio de cada documento.

Si una fase se alarga, **no se recorta su criterio de salida**: se recorta alcance de
una fase posterior. Lo que nunca se negocia es la barra de calidad de lo que ya entró.

---

## 5 · Lo que se difiere a propósito

Está decidido y no se discute durante la v1:

- **Sync multi-dispositivo (CloudKit).** Los módulos de Expo están en v0.1.x. La v1 va con SQLite local cifrado.
- **Francés y alemán.** La estructura los soporta (idioma es columna, no rama del código); los lotes de traducción se corren después.
- **Colombia.** Igual: es datos, no código. Con el aviso de que hay que fijar precios locales a mano (1,45× más caro con la tabla por defecto de Apple).
- **RevenueCat y el paywall.** Y cuando llegue, nunca sobre la foto de la nevera.
- **Detector on-device (Core ML).** Es optimización de coste, no función. Se entrena con las 200 fotos, que solo existen etiquetadas después de la Fase 2.
- **Android.** La app es iOS-only por decisión de producto.
- **Marketplace de recetas de usuarios.** La estructura lo soporta; la decisión no está tomada.

---

## 6 · Los umbrales que cambian el plan

Si alguno se cruza, se para y se replantea:

| Señal | Umbral | Qué se hace |
|---|---|---|
| Precisión del harness de 200 fotos | < 95 % con Gemini 3 Flash | Subir a Gemini 3.1 Pro o GPT-5.6 y aceptar más coste por foto |
| Builds de iOS al mes | > 15 | EAS Starter, 19 USD/mes |
| Usuarios activos, o molesta la pausa por inactividad | > 50 | Supabase Pro, 25 USD/mes |
| Crash-free users | < 99,8 % | Se detiene el rollout |
| p95 de arranque en frío | > 3 s | Se detiene el rollout |
| Error rate del proxy de IA | > 2 % | Se detiene el rollout |
| Foto → tres recetas (p95) | > 8 s | Bloquea el criterio de salida de la Fase 2 |
| El flujo de build por nube frena el ritmo a diario | — | Mac mini M1/M2 usado (~CHF 400) |

---

## 7 · Documentos relacionados

- [`estado.md`](estado.md) — **el tablero.** Fase, paso, tareas tomadas, siguiente paso. Se lee al abrir cualquier sesión, antes de hablar.
- [`bitacora.md`](bitacora.md) — **el historial.** Una entrada por sesión: qué se tocó, qué se corrió, qué salió, qué se decidió.
- [`../CLAUDE.md`](../CLAUDE.md) — las reglas del proyecto. Se lee entero antes de escribir código. Incluye el protocolo de sesión.
- [`protocolos-calidad.md`](protocolos-calidad.md) — cómo se impide que código roto llegue a `main`.
- [`diseno.md`](diseno.md) — cómo se diseña cada pantalla antes de construirla, el sistema de diseño, y los gates de interfaz.
- [`decisiones.md`](decisiones.md) — qué se decidió y por qué, con fechas.
- [`producto.html`](producto.html) — producto, backend y stack en detalle (v0.4, sept 2026).
- `../eval/README.md` — el harness de las 200 fotos.
