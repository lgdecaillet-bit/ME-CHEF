# ai-proxy

La única puerta entre la app y los modelos. Aquí viven las API keys, en las
variables de entorno de la Edge Function — nunca en el bundle de la app, que se
abre con un editor de texto.

## Estado: esqueleto (D4)

Todavía no enruta ninguna tarea ni llama a ningún modelo. Lo que ya funciona, y
está probado en `../tests/ai-proxy.test.ts`, es el control de acceso:

| Petición | Respuesta |
|---|---|
| `GET /health` | `200 { ok: true }`, sin credenciales |
| cualquier otra sin JWT válido | `401 { error: 'no autorizado' }` |
| cualquier otra con JWT válido | `501 { error: 'tarea no implementada' }` |
| sin `AI_PROXY_JWT_SECRET` configurado | `500`, y no atiende nada |

Tres cosas del diseño que conviene no deshacer:

- **La lógica vive en `handler.ts`, no en `index.ts`.** Así los tests la llaman
  como una función, sin levantar un servidor ni abrir un puerto.
- **Primero se comprueba quién llama, después qué pide.** Un proxy que enruta
  antes de autorizar ya hizo medio trabajo cuando decide que no debía.
- **Falla cerrado.** Sin secreto configurado no se acepta nada. Un proxy mal
  configurado que aceptara todo sería peor que uno caído: no se notaría hasta
  la factura.

El `401` es siempre idéntico, diga lo que diga el token. Si distinguiera entre
«caducado», «mal firmado» y «ausente», sería un oráculo para quien quiera
fabricar uno. El motivo se registra en el servidor.

## Lo que falta, y en qué fase

1. Rate limiting por usuario. *(Fase 2)*
2. Enrutar la tarea al modelo correcto: *(Fase 2)*
   - `nevera_pasada1` / `nevera_pasada2` → Gemini Flash (visión, salida JSON)
   - `ticket` → Gemini Flash (visión, 1 llamada)
   - `mapeo` → Claude Haiku 4.5, **con caché previa en `cache_modelo`**
   - `objetivo` → Sonnet 5 (poco frecuente)
   - `porque` → Haiku 4.5
   - `asistente` → Haiku con function calling, contexto corto
3. Guardar en `cache_modelo` toda respuesta cacheable antes de devolverla.
4. Loguear tokens y costo por request (para PostHog).

Reglas que no cambian:

- Salida estructurada JSON obligatoria en todas las tareas.
- La foto se procesa y se descarta: no se guarda en Storage.
- Nada de lo que llega aquí se persiste asociado al usuario.

## Probar y desplegar

```
npm run supabase:test              # los tests de aquí, y los candados de la base
supabase functions deploy ai-proxy
supabase secrets set AI_PROXY_JWT_SECRET=<el JWT Secret del proyecto>
```

**`AI_PROXY_JWT_SECRET` no es un valor libre.** Tiene que ser exactamente el JWT
Secret del proyecto de Supabase (Settings → API → JWT Settings), porque los
tokens que se verifican aquí los firma Supabase Auth con ese secreto. Con
cualquier otro valor, el proxy rechaza todos los tokens buenos con un 401 que
— por diseño — no explica nada.

**Antes de escribir la primera tarea, comprobar qué firma usa el proyecto.**
Supabase emite JWT con claves asimétricas (ECC/RSA) en los proyectos nuevos, no
con el secreto HS256 heredado. Si `npswkfpomhinewxsmiic` es de esos, esta
verificación HS256 no sirve y hace falta JWKS. No se pudo comprobar en D4
porque no se enlazó con el proyecto real, a propósito.
