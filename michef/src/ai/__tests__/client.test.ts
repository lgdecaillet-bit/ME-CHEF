/**
 * El único punto por el que la app habla con modelos.
 *
 * Lo que estos tests protegen no es el código, es una prohibición dura de
 * CLAUDE.md: **ninguna API key de un modelo vive en la app**. Todo pasa por la
 * Edge Function `ai-proxy`, que tiene las keys en sus variables de entorno.
 *
 * Si alguien alguna vez «arregla» esto llamando directo a un proveedor, aquí
 * se rompe algo.
 */
import { llamarModelo, type TareaIA } from '../client';

const fetchOriginal = global.fetch;

function responder(cuerpo: unknown, ok = true, status = 200): jest.Mock {
  const mock = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => cuerpo,
    text: async () => JSON.stringify(cuerpo),
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

afterEach(() => {
  global.fetch = fetchOriginal;
});

describe('llamarModelo', () => {
  it('llama al proxy de Supabase, nunca a un proveedor de modelos', async () => {
    const mock = responder({ ok: true });
    await llamarModelo('nevera_pasada1', { foto: 'x' }, 'token');

    const url = String(mock.mock.calls[0]?.[0]);
    expect(url).toContain('/functions/v1/ai-proxy');
    // La lista negra: si alguna de estas aparece, la key está en el bundle.
    expect(url).not.toMatch(/googleapis|anthropic|openai|generativelanguage/i);
  });

  it('manda el token del usuario para que el proxy limite por persona', async () => {
    const mock = responder({ ok: true });
    await llamarModelo('mapeo', {}, 'token-del-usuario');

    const opciones = mock.mock.calls[0]?.[1] as RequestInit;
    expect((opciones.headers as Record<string, string>).Authorization).toBe(
      'Bearer token-del-usuario'
    );
  });

  it('manda la tarea y la entrada en el cuerpo', async () => {
    const mock = responder({ ok: true });
    await llamarModelo('ticket', { lineas: 3 }, 'token');

    const opciones = mock.mock.calls[0]?.[1] as RequestInit;
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(String(opciones.body))).toEqual({
      tarea: 'ticket',
      entrada: { lineas: 3 },
    });
  });

  it('devuelve lo que responde el proxy', async () => {
    responder({ items: ['huevo', 'tomate'] });
    const r = await llamarModelo<{ items: string[] }>('nevera_pasada2', {}, 'token');
    expect(r.items).toEqual(['huevo', 'tomate']);
  });

  it('lanza un error con el código cuando el proxy rechaza', async () => {
    // Un 401 tiene que llegar arriba tal cual: es lo que dispara la hoja de
    // cuenta. Tragárselo dejaría al usuario mirando una pantalla vacía.
    responder({ error: 'sin sesión' }, false, 401);
    await expect(llamarModelo('objetivo', {}, 'token-caducado')).rejects.toThrow(/401/);
  });

  it('un fallo de red no se disfraza de respuesta vacía', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('sin conexión')) as unknown as typeof fetch;
    await expect(llamarModelo('porque', {}, 'token')).rejects.toThrow(/sin conexión/);
  });

  it.each([
    'nevera_pasada1',
    'nevera_pasada2',
    'ticket',
    'mapeo',
    'objetivo',
    'porque',
    'asistente',
  ] satisfies TareaIA[])('la tarea %s llega al proxy tal cual', async (tarea) => {
    // Cada tarea que la app sabe pedir tiene que existir en el proxy: la lista
    // es el contrato entre los dos. El `satisfies` hace que quitar una tarea del
    // tipo rompa la compilación; este test comprueba además que cada una viaja
    // sin transformarse. (La versión anterior era un `toHaveLength(7)` sobre un
    // array escrito tres líneas antes: no podía fallar nunca.)
    const mock = responder({ ok: true });
    await llamarModelo(tarea, {}, 'token');
    const opciones = mock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(opciones.body)).tarea).toBe(tarea);
  });
});
