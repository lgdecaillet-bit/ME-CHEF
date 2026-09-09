/**
 * Los tests del proxy.
 *
 * Igual que con RLS (decision #47): un control de acceso que no deniega nada se
 * ve identico a uno que funciona. Aqui eso significa que **no basta con probar
 * que un token bueno pasa**. Hay que probar, uno por uno, que los malos no
 * pasan — y sobre todo los que un verificador escrito a la ligera dejaria
 * colar: el `alg: "none"`, el firmado con otro secreto, y el caducado.
 *
 * Los tokens se fabrican aqui, con Web Crypto, para que los tests corran sin
 * red y sin Supabase levantado.
 */
// Version exacta, no un rango, y por eso no hace falta lockfile: el resto del
// proyecto tambien fija sus dependencias exactas. Un `@1` traeria una version
// distinta el mes que viene sin que nadie lo decidiera.
import { assertEquals } from 'jsr:@std/assert@1.0.19';
import { manejar, TAREAS } from '../ai-proxy/handler.ts';

// Repetida a proposito, y no una cadena con pinta de clave. gitleaks marco la
// primera version como `generic-api-key` por su entropia y bloqueo el commit,
// que es exactamente lo que tiene que hacer: no sabe distinguir un secreto de
// pruebas de uno de verdad, y no deberia. Bajar la entropia es mejor que
// silenciar la regla, porque una excepcion escrita hoy es una regla apagada
// manana. HMAC no pide longitud minima; los 32+ caracteres eran cosmeticos.
const SECRETO = 'prueba-prueba-prueba-prueba-prueba';

function base64Url(datos: Uint8Array | string): string {
  const bytes = typeof datos === 'string' ? new TextEncoder().encode(datos) : datos;
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

/** Fabrica un JWT. `alg` y `secreto` se pueden torcer para los casos malos. */
async function token(
  carga: Record<string, unknown>,
  opciones: { alg?: string; secreto?: string; firmar?: boolean } = {}
): Promise<string> {
  const { alg = 'HS256', secreto = SECRETO, firmar = true } = opciones;
  const cabeza = base64Url(JSON.stringify({ alg, typ: 'JWT' }));
  const cuerpo = base64Url(JSON.stringify(carga));
  if (!firmar) return `${cabeza}.${cuerpo}.`;
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const firma = await crypto.subtle.sign(
    'HMAC',
    clave,
    new TextEncoder().encode(`${cabeza}.${cuerpo}`)
  );
  return `${cabeza}.${cuerpo}.${base64Url(new Uint8Array(firma))}`;
}

const DENTRO_DE_UNA_HORA = Math.floor(Date.now() / 1000) + 3600;
const HACE_UNA_HORA = Math.floor(Date.now() / 1000) - 3600;

function peticion(ruta: string, cabeceras: HeadersInit = {}, metodo = 'POST'): Request {
  return new Request(`http://localhost/ai-proxy${ruta}`, {
    method: metodo,
    headers: cabeceras,
  });
}

/** Corre algo con el secreto puesto y lo quita despues, pase lo que pase. */
async function conSecreto(fn: () => Promise<void>, valor: string | null = SECRETO) {
  const antes = Deno.env.get('AI_PROXY_JWT_SECRET');
  if (valor === null) Deno.env.delete('AI_PROXY_JWT_SECRET');
  else Deno.env.set('AI_PROXY_JWT_SECRET', valor);
  try {
    await fn();
  } finally {
    if (antes === undefined) Deno.env.delete('AI_PROXY_JWT_SECRET');
    else Deno.env.set('AI_PROXY_JWT_SECRET', antes);
  }
}

// ── El latido ───────────────────────────────────────────────────────────────

Deno.test('GET /health responde 200 sin pedir credenciales', async () => {
  await conSecreto(async () => {
    const res = await manejar(peticion('/health', {}, 'GET'));
    assertEquals(res.status, 200);
    assertEquals(await res.json(), { ok: true });
  });
});

Deno.test('el latido responde aunque el proxy no este configurado', async () => {
  // Sirve justamente para saber si la funcion esta viva. Si dependiera del
  // secreto, una mala configuracion se veria como una funcion caida.
  await conSecreto(async () => {
    const res = await manejar(peticion('/health', {}, 'GET'));
    assertEquals(res.status, 200);
  }, null);
});

Deno.test('el latido no acepta otros metodos', async () => {
  await conSecreto(async () => {
    assertEquals((await manejar(peticion('/health'))).status, 405);
  });
});

// ── Lo que NO puede pasar ───────────────────────────────────────────────────

Deno.test('sin cabecera Authorization: 401', async () => {
  await conSecreto(async () => {
    assertEquals((await manejar(peticion('/'))).status, 401);
  });
});

Deno.test('con una cabecera que no es Bearer: 401', async () => {
  await conSecreto(async () => {
    const res = await manejar(peticion('/', { Authorization: 'Basic abc' }));
    assertEquals(res.status, 401);
  });
});

Deno.test('con un token que no es un JWT: 401', async () => {
  await conSecreto(async () => {
    const res = await manejar(peticion('/', { Authorization: 'Bearer no-es-un-jwt' }));
    assertEquals(res.status, 401);
  });
});

Deno.test('con alg "none" y sin firma: 401', async () => {
  // El ataque clasico. Un verificador que se fie del `alg` de la cabecera
  // acepta este token tal cual.
  await conSecreto(async () => {
    const t = await token(
      { sub: 'u1', exp: DENTRO_DE_UNA_HORA },
      {
        alg: 'none',
        firmar: false,
      }
    );
    assertEquals(
      (await manejar(peticion('/', { Authorization: `Bearer ${t}` }))).status,
      401
    );
  });
});

Deno.test('con la cabecera diciendo HS512 pero firmado con HS256: 401', async () => {
  // Este es el caso que aisla la comprobacion de `alg`, y el de arriba no.
  // Un token con `alg: "none"` y sin firma lo rechaza igual cualquier
  // verificador, porque la firma vacia no cuadra. Este no: la firma ES valida
  // para HS256, asi que sin la comprobacion de la cabecera pasaria. Comprobado
  // quitandola: el test de arriba seguia verde y este se ponia rojo.
  await conSecreto(async () => {
    const t = await token({ sub: 'u1', exp: DENTRO_DE_UNA_HORA }, { alg: 'HS512' });
    assertEquals(
      (await manejar(peticion('/', { Authorization: `Bearer ${t}` }))).status,
      401
    );
  });
});

Deno.test('firmado con otro secreto: 401', async () => {
  await conSecreto(async () => {
    const t = await token(
      { sub: 'u1', exp: DENTRO_DE_UNA_HORA },
      { secreto: 'otro-secreto-completamente-distinto-y-largo' }
    );
    assertEquals(
      (await manejar(peticion('/', { Authorization: `Bearer ${t}` }))).status,
      401
    );
  });
});

Deno.test('caducado, aunque la firma sea buena: 401', async () => {
  await conSecreto(async () => {
    const t = await token({ sub: 'u1', exp: HACE_UNA_HORA });
    assertEquals(
      (await manejar(peticion('/', { Authorization: `Bearer ${t}` }))).status,
      401
    );
  });
});

Deno.test('con la carga cambiada despues de firmar: 401', async () => {
  // Se coge un token bueno y se le cambia el cuerpo dejando la firma vieja.
  await conSecreto(async () => {
    const bueno = await token({
      sub: 'u1',
      role: 'authenticated',
      exp: DENTRO_DE_UNA_HORA,
    });
    const [cabeza, , firma] = bueno.split('.');
    const cargaFalsa = base64Url(
      JSON.stringify({ sub: 'u1', role: 'service_role', exp: DENTRO_DE_UNA_HORA })
    );
    const t = `${cabeza}.${cargaFalsa}.${firma}`;
    assertEquals(
      (await manejar(peticion('/', { Authorization: `Bearer ${t}` }))).status,
      401
    );
  });
});

// Los tres de abajo son de un mismo fallo que encontro el revisor: habia
// entradas que no devolvian 401 sino que **reventaban la funcion**, y
// `Deno.serve` las convertia en 500 con traza en el log. No es un bypass —
// nadie entra — pero rompe la promesa escrita de que el 401 es siempre igual,
// ensucia los logs y da una forma barata de gastar invocaciones. Se escribieron
// en rojo antes de arreglar nada.

Deno.test('una firma que no es base64 valida: 401, no un 500', async () => {
  await conSecreto(async () => {
    const bueno = await token({ sub: 'u1', exp: DENTRO_DE_UNA_HORA });
    const [cabeza, cuerpo] = bueno.split('.');
    for (const firmaRota of ['!!!!', 'a', 'con espacio']) {
      const t = `${cabeza}.${cuerpo}.${firmaRota}`;
      const res = await manejar(peticion('/', { Authorization: `Bearer ${t}` }));
      assertEquals(res.status, 401);
    }
  });
});

Deno.test('una cabecera que no es un objeto: 401, no un 500', async () => {
  // `JSON.parse('null')` devuelve null, y leer `.alg` de null lanza. El
  // atacante controla la cabecera sin saber el secreto, asi que llega aqui
  // cualquiera. Igual con un array o un numero.
  await conSecreto(async () => {
    for (const cabeceraRara of ['null', '[]', '123', '"texto"']) {
      const cabeza = base64Url(cabeceraRara);
      const cuerpo = base64Url(JSON.stringify({ sub: 'u1' }));
      const t = `${cabeza}.${cuerpo}.firma`;
      const res = await manejar(peticion('/', { Authorization: `Bearer ${t}` }));
      assertEquals(res.status, 401, `con cabecera ${cabeceraRara}`);
    }
  });
});

Deno.test('una carga que no es un objeto tampoco revienta: 401', async () => {
  await conSecreto(async () => {
    const cabeza = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    for (const cargaRara of ['null', '[]', '5']) {
      const t = `${cabeza}.${base64Url(cargaRara)}.firma`;
      const res = await manejar(peticion('/', { Authorization: `Bearer ${t}` }));
      assertEquals(res.status, 401, `con carga ${cargaRara}`);
    }
  });
});

Deno.test('sin secreto configurado NO se deja pasar un token bueno: 500', async () => {
  // Falla cerrado. Un proxy mal configurado que aceptara todo seria peor que
  // uno caido, porque no se notaria hasta la factura.
  const t = await token({ sub: 'u1', exp: DENTRO_DE_UNA_HORA });
  await conSecreto(async () => {
    const res = await manejar(peticion('/', { Authorization: `Bearer ${t}` }));
    assertEquals(res.status, 500);
  }, null);
});

// ── Lo que SI pasa, y hasta donde ───────────────────────────────────────────

Deno.test('con un token valido: 501, porque todavia no hay tarea', async () => {
  await conSecreto(async () => {
    const t = await token({ sub: 'u1', role: 'authenticated', exp: DENTRO_DE_UNA_HORA });
    const res = await manejar(peticion('/', { Authorization: `Bearer ${t}` }));
    assertEquals(res.status, 501);
    assertEquals(await res.json(), { error: 'tarea no implementada' });
  });
});

Deno.test('un token sin exp, bien firmado, tambien vale', async () => {
  await conSecreto(async () => {
    const t = await token({ sub: 'u1', role: 'authenticated' });
    assertEquals(
      (await manejar(peticion('/', { Authorization: `Bearer ${t}` }))).status,
      501
    );
  });
});

Deno.test('el 401 no dice por que, para no servir de oraculo', async () => {
  await conSecreto(async () => {
    const caducado = await token({ sub: 'u1', exp: HACE_UNA_HORA });
    const malFirmado = await token(
      { sub: 'u1' },
      { secreto: 'otro-secreto-larguisimo-aqui' }
    );
    const a = await (
      await manejar(peticion('/', { Authorization: `Bearer ${caducado}` }))
    ).json();
    const b = await (
      await manejar(peticion('/', { Authorization: `Bearer ${malFirmado}` }))
    ).json();
    const c = await (await manejar(peticion('/'))).json();
    assertEquals(a, { error: 'no autorizado' });
    assertEquals(b, a);
    assertEquals(c, a);
  });
});

// ── El contrato con la app ──────────────────────────────────────────────────

Deno.test('la lista de tareas del proxy queda fijada', () => {
  // OJO con lo que este test hace y lo que NO hace. Fija la lista del servidor,
  // nada mas. **No** compara con `src/ai/client.ts`, aunque una version anterior
  // de este comentario deciase que si: no puede, porque ese archivo es de otro
  // runtime y desde aqui no se importa. Tal como estaba, solo fallaba si
  // editabas `handler.ts` y te olvidabas de editar este test dos lineas mas
  // abajo. Lo encontro el revisor en D4.
  //
  // Quien compara de verdad las dos listas es
  // `src/ai/__tests__/contrato-proxy.test.ts`, que lee los dos archivos como
  // texto porque es la unica forma de cruzar la frontera entre los runtimes.
  assertEquals(
    [...TAREAS],
    [
      'nevera_pasada1',
      'nevera_pasada2',
      'ticket',
      'mapeo',
      'objetivo',
      'porque',
      'asistente',
    ]
  );
});
