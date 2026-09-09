/**
 * La frontera pública del motor.
 *
 * `index.ts` es lo único que el resto de la app puede importar del motor. Este
 * test existe por un motivo concreto: cuando se añade un módulo al motor y se
 * olvida re-exportarlo aquí, no falla nada. Simplemente la función no existe
 * para nadie, y el error aparece semanas después como «undefined is not a
 * function» en una pantalla.
 *
 * También es lo que hace que knip pueda mirar dentro del motor: mientras el
 * barril sea `export *`, quien vigila lo que sobra es la cobertura.
 */
import * as motor from '../index';

describe('la frontera pública del motor', () => {
  it.each([
    'porcionesDelHogar',
    'escalarReceta',
    'redondear',
    'fusionarEscaneo',
    'descontarCocinado',
    'porVencerse',
    'recetasConLoQueHay',
    'listaDeMercado',
    'totalEstimado',
  ])('exporta %s', (nombre) => {
    expect(typeof (motor as Record<string, unknown>)[nombre]).toBe('function');
  });

  it('exporta el umbral de confianza, que la interfaz necesita para los chips', () => {
    expect(motor.UMBRAL_CONFIABLE).toBe(0.6);
  });

  it('todo lo exportado es función o constante, nunca un objeto con estado', () => {
    // El motor es puro. Si un día aparece aquí una clase o un objeto mutable,
    // el diseño se torció y este test lo dice.
    for (const valor of Object.values(motor)) {
      expect(['function', 'number', 'string', 'boolean']).toContain(typeof valor);
    }
  });
});
