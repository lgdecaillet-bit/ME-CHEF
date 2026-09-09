# ai-proxy

La única puerta entre la app y los modelos. Aquí viven las API keys, en las
variables de entorno de la Edge Function — nunca en el bundle de la app.

Responsabilidades:

1. Verificar el JWT de Supabase Auth (quién llama).
2. Rate limiting por usuario.
3. Enrutar la tarea al modelo correcto:
   - `nevera_pasada1` / `nevera_pasada2` → Gemini Flash (visión, salida JSON)
   - `ticket` → Gemini Flash (visión, 1 llamada)
   - `mapeo` → Claude Haiku 4.5, **con caché previa en `cache_modelo`**
   - `objetivo` → Sonnet 5 (poco frecuente)
   - `porque` → Haiku 4.5
   - `asistente` → Haiku con function calling, contexto corto
4. Guardar en `cache_modelo` toda respuesta cacheable antes de devolverla.
5. Loguear tokens y costo por request (para PostHog).

Reglas:
- Salida estructurada JSON obligatoria en todas las tareas.
- La foto se procesa y se descarta: no se guarda en Storage.
- Nada de lo que llega aquí se persiste asociado al usuario.

Desplegar: `supabase functions deploy ai-proxy`
