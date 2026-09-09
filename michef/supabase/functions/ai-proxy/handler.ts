/**
 * ai-proxy · el esqueleto.
 *
 * Esta es la unica puerta entre la app y los modelos, y la razon de que exista
 * es una sola: **las API keys de los modelos no pueden estar en la app.** Un
 * bundle de iOS se abre con un editor de texto. Aqui viven las keys, en las
 * variables de entorno de la Edge Function, y la app nunca las ve.
 *
 * En D4 no enruta ninguna tarea todavia. Lo que hace es lo que hay que tener
 * bien ANTES de que pase dinero por aqui:
 *   · `GET /health` responde 200 sin pedir nada. Es el latido.
 *   · Cualquier otra cosa sin un JWT valido responde 401.
 *   · Con un JWT valido responde 501: la tarea existe pero no esta hecha.
 *
 * El orden importa: primero se comprueba quien llama, y solo despues se mira
 * que pide. Un proxy que primero enruta y despues autoriza ya ha hecho la mitad
 * del trabajo cuando decide que no debia hacerlo.
 *
 * El handler se exporta aparte de `Deno.serve` a proposito: asi los tests lo
 * llaman como una funcion, sin levantar un servidor ni abrir un puerto.
 */
import { verificarJwt } from './jwt.ts';

/** Las siete tareas del contrato con la app (`src/ai/client.ts`). */
export const TAREAS = [
  'nevera_pasada1',
  'nevera_pasada2',
  'ticket',
  'mapeo',
  'objetivo',
  'porque',
  'asistente',
] as const;

function json(estado: number, cuerpo: unknown): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * El mismo cuerpo para toda negativa de autenticacion. Si el 401 dijera si el
 * token esta caducado, mal firmado o ausente, seria un oraculo para quien
 * quiera fabricar uno. El motivo se registra en el servidor, no se devuelve.
 */
function noAutorizado(motivo: string): Response {
  console.warn(`ai-proxy: 401 (${motivo})`);
  return json(401, { error: 'no autorizado' });
}

export async function manejar(req: Request): Promise<Response> {
  const ruta = new URL(req.url).pathname.replace(/^\/ai-proxy/, '') || '/';

  // El latido va antes de todo: tiene que responder aunque no haya secreto
  // configurado, porque sirve justamente para saber si la funcion esta viva.
  if (ruta === '/health') {
    if (req.method !== 'GET') return json(405, { error: 'metodo no permitido' });
    return json(200, { ok: true });
  }

  const cabecera = req.headers.get('Authorization') ?? '';
  const token = /^Bearer (.+)$/.exec(cabecera)?.[1];
  if (!token) return noAutorizado('sin cabecera Authorization');

  const secreto = Deno.env.get('AI_PROXY_JWT_SECRET');
  if (!secreto) {
    // Sin secreto NO se puede verificar nada, asi que no se deja pasar. Es la
    // diferencia entre fallar cerrado y fallar abierto: un proxy mal
    // configurado que aceptara todo seria peor que uno caido.
    console.error('ai-proxy: falta AI_PROXY_JWT_SECRET; no se atiende nada');
    return json(500, { error: 'el proxy no esta configurado' });
  }

  const resultado = await verificarJwt(token, secreto);
  if (!resultado.valido) return noAutorizado(resultado.motivo ?? 'desconocido');

  // A partir de aqui, quien llama esta identificado. Todavia no hay nada que
  // enrutar: las keys de modelo entran en Fase 2, no antes.
  return json(501, { error: 'tarea no implementada' });
}
