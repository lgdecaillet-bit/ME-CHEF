/**
 * Único punto por el que la app habla con modelos.
 *
 * REGLA DURA (CLAUDE.md): ninguna API key de un modelo vive en la app.
 * Todo pasa por la Edge Function `ai-proxy`, que tiene las keys en sus
 * variables de entorno y aplica rate limiting por usuario.
 *
 * src/engine/ NUNCA importa este archivo.
 */
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export type TareaIA =
  | 'nevera_pasada1'
  | 'nevera_pasada2'
  | 'ticket'
  | 'mapeo'
  | 'objetivo'
  | 'porque'
  | 'asistente';

export async function llamarModelo<T>(
  tarea: TareaIA,
  entrada: unknown,
  token: string
): Promise<T> {
  const res = await fetch(`${URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tarea, entrada }),
  });
  if (!res.ok) throw new Error(`ai-proxy ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
