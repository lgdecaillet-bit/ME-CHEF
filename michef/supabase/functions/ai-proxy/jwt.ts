/**
 * Verificacion de un JWT de Supabase Auth (HS256), con Web Crypto y sin
 * dependencias.
 *
 * Por que a mano y no con una libreria: son cuarenta lineas, se leen enteras, y
 * es el unico punto donde se decide si alguien puede gastar dinero en modelos.
 * Una dependencia aqui es una dependencia dentro del control de acceso.
 *
 * Lo que se comprueba, y por que cada cosa:
 *   · `alg` tiene que ser exactamente HS256. El ataque clasico contra un
 *     verificador escrito a la ligera es mandar `alg: "none"` y que se acepte
 *     un token sin firma. Aqui la cabecera se compara antes de tocar nada mas.
 *   · La firma, con el secreto del proyecto. Sin esto, cualquiera se fabrica un
 *     token con el rol que quiera.
 *   · `exp`, si viene. Un token caducado no vale, aunque su firma sea buena.
 *
 * Lo que NO se comprueba todavia, a proposito: `aud`, `iss` y el rol. Este es el
 * esqueleto de D4 y aun no hay tareas que autorizar. Cuando las haya, el rate
 * limiting y la autorizacion por rol entran aqui, con sus tests.
 */

/**
 * Decodifica base64url. Los JWT no usan base64 normal: cambian + / por - _.
 *
 * El tipo de retorno es `Uint8Array<ArrayBuffer>` y no `Uint8Array` a secas
 * porque desde TypeScript 5.7 el generico por defecto es `ArrayBufferLike`, que
 * incluye `SharedArrayBuffer`, y `crypto.subtle.verify` no lo acepta.
 */
function deBase64Url(texto: string): Uint8Array<ArrayBuffer> {
  const normal = texto.replaceAll('-', '+').replaceAll('_', '/');
  const relleno = normal.padEnd(normal.length + ((4 - (normal.length % 4)) % 4), '=');
  const binario = atob(relleno);
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
}

function comoTexto(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export interface ResultadoJwt {
  valido: boolean;
  /** Por que no vale. Se registra en el servidor; NUNCA se devuelve al cliente. */
  motivo?: string;
  carga?: Record<string, unknown>;
}

/** Un JSON que no sea un objeto no puede ser una cabecera ni una carga. */
function objetoONada(texto: string): Record<string, unknown> | null {
  const v: unknown = JSON.parse(texto);
  return typeof v === 'object' && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

export async function verificarJwt(
  token: string,
  secreto: string
): Promise<ResultadoJwt> {
  // TODO el cuerpo va dentro del try. Un token es texto que manda un
  // desconocido: cualquier cosa que lance aqui sale de la funcion, `Deno.serve`
  // la convierte en un 500 con traza en el log, y eso rompe la promesa de que
  // el 401 sea siempre igual. Pasaba con dos entradas que encontro el revisor:
  // una firma que no era base64 valida (`atob` lanza) y una cabecera `null`
  // (leer `.alg` de null lanza). Hay tres tests que lo fijan.
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return { valido: false, motivo: 'no tiene tres partes' };
    const [cabeceraB64, cargaB64, firmaB64] = partes as [string, string, string];

    const cabecera = objetoONada(comoTexto(deBase64Url(cabeceraB64)));
    const carga = objetoONada(comoTexto(deBase64Url(cargaB64)));
    if (!cabecera || !carga) {
      return { valido: false, motivo: 'cabecera o carga no son objetos' };
    }

    // Antes que nada. Un `alg: "none"` no llega ni a comprobarse la firma.
    if (cabecera.alg !== 'HS256') {
      return { valido: false, motivo: `alg no soportado: ${String(cabecera.alg)}` };
    }

    const clave = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secreto),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const firmaOk = await crypto.subtle.verify(
      'HMAC',
      clave,
      deBase64Url(firmaB64),
      new TextEncoder().encode(`${cabeceraB64}.${cargaB64}`)
    );
    if (!firmaOk) return { valido: false, motivo: 'firma invalida' };

    const exp = carga.exp;
    if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
      return { valido: false, motivo: 'caducado' };
    }

    return { valido: true, carga };
  } catch (e) {
    return { valido: false, motivo: `token ilegible: ${(e as Error).name}` };
  }
}
