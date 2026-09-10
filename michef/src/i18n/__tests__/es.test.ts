// La guía de tono de la cabecera de es.ts, en lo que se puede comprobar solo.
// El resto (frases cortas, tú, sin culpa) se revisa leyendo el archivo.
import { es } from '../es';
import { t, type Clave } from '../index';

function hojas(nodo: object, prefijo = ''): [string, string][] {
  return Object.entries(nodo).flatMap(([clave, valor]) =>
    typeof valor === 'string'
      ? [[`${prefijo}${clave}`, valor] as [string, string]]
      : hojas(valor as object, `${prefijo}${clave}.`)
  );
}

const TODOS = hojas(es);

describe('es.ts', () => {
  it('tiene textos', () => {
    expect(TODOS.length).toBeGreaterThan(10);
  });

  it('sin exclamaciones', () => {
    expect(TODOS.filter(([, texto]) => /[!¡]/.test(texto))).toEqual([]);
  });

  it('ningún error dice «Algo salió mal»', () => {
    expect(TODOS.filter(([, texto]) => /algo sali[oó] mal/i.test(texto))).toEqual([]);
  });

  it('ningún texto vacío ni con espacios de más', () => {
    expect(
      TODOS.filter(
        ([, texto]) => texto.length === 0 || texto !== texto.trim() || /\s{2}/.test(texto)
      )
    ).toEqual([]);
  });

  it('los huecos están bien escritos: {nombre}, sin llaves sueltas', () => {
    expect(
      TODOS.filter(([, texto]) => /[{}]/.test(texto.replace(/\{\w+\}/g, '')))
    ).toEqual([]);
  });

  it('cada texto sin huecos sale entero por t()', () => {
    for (const [clave, texto] of TODOS.filter(([, x]) => !x.includes('{'))) {
      expect(t(clave as Clave)).toBe(texto);
    }
  });
});
