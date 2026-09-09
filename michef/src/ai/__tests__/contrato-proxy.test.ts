/**
 * El contrato entre la app y el proxy, comprobado de verdad.
 *
 * La lista de tareas vive en dos sitios que **ningún compilador puede comparar
 * entre sí**: `src/ai/client.ts` (el tipo `TareaIA`, que compila con el
 * TypeScript de la app) y `supabase/functions/ai-proxy/handler.ts` (la constante
 * `TAREAS`, que compila con Deno y está fuera de este tsconfig a propósito).
 * Son dos runtimes distintos. Si una lista cambia sin la otra, la app pide algo
 * que el servidor no sabe hacer, y no lo dice nadie hasta que un usuario lo ve.
 *
 * Hubo un test en el lado de Deno que decía vigilar esto y no podía: comparaba
 * la lista del proxy con una copia literal escrita tres líneas más abajo, en el
 * propio test. Solo fallaba si editabas el proxy y te olvidabas de editar el
 * test al lado. Lo encontró el revisor en D4.
 *
 * Este test lee los dos archivos como texto, que es la única forma de cruzar la
 * frontera entre los dos runtimes. Es frágil ante un cambio de formato, y esa
 * fragilidad es aceptable: si alguien reescribe cómo se declara la lista, que
 * este test se queje es exactamente lo que se quiere.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const raiz = resolve(__dirname, '../../..');

function leer(relativa: string): string {
  return readFileSync(resolve(raiz, relativa), 'utf8');
}

/** Los literales de cadena que hay entre dos marcas del archivo. */
function cadenasEntre(texto: string, desde: string, hasta: string): string[] {
  const inicio = texto.indexOf(desde);
  if (inicio < 0) throw new Error(`no encuentro «${desde}»; ¿se renombró?`);
  const fin = texto.indexOf(hasta, inicio + desde.length);
  if (fin < 0) throw new Error(`no encuentro el final «${hasta}» tras «${desde}»`);
  const trozo = texto.slice(inicio + desde.length, fin);
  return [...trozo.matchAll(/'([^']+)'/g)].map((m) => m[1] as string);
}

describe('la lista de tareas es la misma en la app y en el proxy', () => {
  const deLaApp = cadenasEntre(leer('src/ai/client.ts'), 'export type TareaIA =', ';');
  const delProxy = cadenasEntre(
    leer('supabase/functions/ai-proxy/handler.ts'),
    'export const TAREAS = [',
    ']'
  );

  it('las dos listas existen y no están vacías', () => {
    // Si el formato cambia, `cadenasEntre` lanza y este test lo dice claro,
    // en vez de comparar dos listas vacías y pasar en verde.
    expect(deLaApp.length).toBeGreaterThan(0);
    expect(delProxy.length).toBeGreaterThan(0);
  });

  it('coinciden exactamente, y en el mismo orden', () => {
    expect(delProxy).toEqual(deLaApp);
  });

  it('son las siete de la visión, sin más ni menos', () => {
    // Escrito aquí también porque añadir una tarea es una decisión de producto,
    // no un detalle de implementación: cada una cuesta dinero por llamada.
    expect(deLaApp).toEqual([
      'nevera_pasada1',
      'nevera_pasada2',
      'ticket',
      'mapeo',
      'objetivo',
      'porque',
      'asistente',
    ]);
  });
});
