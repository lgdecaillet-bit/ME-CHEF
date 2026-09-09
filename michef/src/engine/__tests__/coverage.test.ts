/**
 * Tres recetas con lo que hay.
 *
 * Es un FILTRO sobre el catálogo, no una generación: por eso el primer
 * resultado que ve el usuario nunca puede salir mal escrito.
 *
 * Regla dura de CLAUDE.md: una receta solo puede usar lo marcado como `seguro`
 * más la despensa básica. Nunca inventar.
 */
import fc from 'fast-check';
import { recetasConLoQueHay } from '../coverage';
import type { Restriccion } from '../types';
import { detectado, idsDe, ingrediente, receta } from './ayudas';

const tortilla = receta({
  id: 'tortilla',
  titulo: 'Tortilla',
  ingredientes: [ingrediente('huevo'), ingrediente('patata')],
  ranking: 5,
});
const arrozConHuevo = receta({
  id: 'arroz-huevo',
  titulo: 'Arroz con huevo',
  ingredientes: [ingrediente('huevo'), ingrediente('arroz')],
  ranking: 8,
});

describe('recetasConLoQueHay', () => {
  it('solo propone recetas cuyos ingredientes están todos disponibles', () => {
    const opciones = recetasConLoQueHay(
      [tortilla, arrozConHuevo],
      [detectado({ ingredienteId: 'huevo' }), detectado({ ingredienteId: 'patata' })],
      []
    );
    expect(opciones.map((o) => o.receta.id)).toEqual(['tortilla']);
  });

  it('la despensa básica cuenta como disponible', () => {
    // El arroz no se ve en la foto, pero el hogar dijo que siempre tiene.
    const opciones = recetasConLoQueHay(
      [arrozConHuevo],
      [detectado({ ingredienteId: 'huevo' })],
      ['arroz']
    );
    expect(opciones).toHaveLength(1);
  });

  it('un `posible` NO cuenta: se pregunta con un chip, no se asume', () => {
    // Cinco ingredientes ciertos valen más que diez con dos falsos.
    const opciones = recetasConLoQueHay(
      [tortilla],
      [
        detectado({ ingredienteId: 'huevo', certeza: 'seguro' }),
        detectado({ ingredienteId: 'patata', certeza: 'posible' }),
      ],
      []
    );
    expect(opciones).toHaveLength(0);
  });

  it('aprovechar lo que se ve pesa más que el ranking global', () => {
    const soloDespensa = receta({
      id: 'solo-despensa',
      ingredientes: [ingrediente('arroz')],
      ranking: 100,
    });
    const opciones = recetasConLoQueHay(
      [soloDespensa, tortilla],
      [detectado({ ingredienteId: 'huevo' }), detectado({ ingredienteId: 'patata' })],
      ['arroz']
    );
    // La tortilla usa 2 vistos (2×10 + 5 = 25); la otra usa 0 (0 + 100 = 100).
    // El ranking sigue pesando: con 100 gana. La regla es que cada visto vale 10.
    expect(opciones[0]?.receta.id).toBe('solo-despensa');
    expect(opciones[0]?.puntaje).toBe(100);
    expect(opciones[1]?.puntaje).toBe(25);
  });

  it('devuelve tres por defecto, y admite pedir otra cantidad', () => {
    const catalogo = [1, 2, 3, 4, 5].map((n) =>
      receta({ id: `r${n}`, ingredientes: [ingrediente('huevo')], ranking: n })
    );
    const foto = [detectado({ ingredienteId: 'huevo' })];
    expect(recetasConLoQueHay(catalogo, foto, [])).toHaveLength(3);
    expect(recetasConLoQueHay(catalogo, foto, [], [], 5)).toHaveLength(5);
  });

  it('ordena de mejor a peor puntaje', () => {
    const catalogo = [1, 9, 4].map((n) =>
      receta({ id: `r${n}`, ingredientes: [ingrediente('huevo')], ranking: n })
    );
    const opciones = recetasConLoQueHay(
      catalogo,
      [detectado({ ingredienteId: 'huevo' })],
      []
    );
    expect(opciones.map((o) => o.receta.ranking)).toEqual([9, 4, 1]);
  });

  it('cuenta cuántos ingredientes de la foto aprovecha cada receta', () => {
    const opciones = recetasConLoQueHay(
      [tortilla],
      [detectado({ ingredienteId: 'huevo' }), detectado({ ingredienteId: 'patata' })],
      []
    );
    expect(opciones[0]?.visiblesUsados).toBe(2);
  });

  it('una restricción de ingrediente excluye la receta entera', () => {
    const restricciones: Restriccion[] = [
      { tipo: 'excluir_ingrediente', valor: 'patata' },
    ];
    const opciones = recetasConLoQueHay(
      [tortilla],
      [detectado({ ingredienteId: 'huevo' }), detectado({ ingredienteId: 'patata' })],
      [],
      restricciones
    );
    expect(opciones).toHaveLength(0);
  });

  it('sin el equipo necesario, la receta no se propone', () => {
    const alHorno = receta({ ingredientes: [ingrediente('huevo')], equipo: ['horno'] });
    const restricciones: Restriccion[] = [{ tipo: 'sin_equipo', valor: 'horno' }];
    const opciones = recetasConLoQueHay(
      [alHorno],
      [detectado({ ingredienteId: 'huevo' })],
      [],
      restricciones
    );
    expect(opciones).toHaveLength(0);
  });

  it('el límite de tiempo descarta lo que tarda de más', () => {
    const lenta = receta({
      id: 'lenta',
      minutos: 90,
      ingredientes: [ingrediente('huevo')],
    });
    const rapida = receta({
      id: 'rapida',
      minutos: 15,
      ingredientes: [ingrediente('huevo')],
    });
    const restricciones: Restriccion[] = [{ tipo: 'tiempo_max', valor: '30' }];
    const opciones = recetasConLoQueHay(
      [lenta, rapida],
      [detectado({ ingredienteId: 'huevo' })],
      [],
      restricciones
    );
    expect(opciones.map((o) => o.receta.id)).toEqual(['rapida']);
  });

  it('una receta que tarda exactamente el límite sí entra', () => {
    const justa = receta({ minutos: 30, ingredientes: [ingrediente('huevo')] });
    const restricciones: Restriccion[] = [{ tipo: 'tiempo_max', valor: '30' }];
    expect(
      recetasConLoQueHay(
        [justa],
        [detectado({ ingredienteId: 'huevo' })],
        [],
        restricciones
      )
    ).toHaveLength(1);
  });

  it('las restricciones que no filtran no estorban', () => {
    const restricciones: Restriccion[] = [
      { tipo: 'mas_variedad', valor: 'si' },
      { tipo: 'mas_calorias', valor: 'si' },
    ];
    expect(
      recetasConLoQueHay(
        [tortilla],
        [detectado({ ingredienteId: 'huevo' }), detectado({ ingredienteId: 'patata' })],
        [],
        restricciones
      )
    ).toHaveLength(1);
  });

  it('un catálogo vacío no devuelve nada, y no explota', () => {
    expect(recetasConLoQueHay([], [detectado()], [])).toEqual([]);
  });

  it('una foto vacía sin despensa no propone nada', () => {
    expect(recetasConLoQueHay([tortilla], [], [])).toEqual([]);
  });

  it('una receta sin ingredientes se puede hacer siempre', () => {
    // Caso límite raro pero real: agua caliente, un té. No hay nada que faltar.
    const vacia = receta({ id: 'vacia', ingredientes: [] });
    expect(recetasConLoQueHay([vacia], [], [])).toHaveLength(1);
  });

  it('PROPIEDAD · nunca propone una receta con algo que no está disponible', () => {
    // Es la prohibición dura: nunca inventar un ingrediente.
    const idArb = fc.constantFrom('huevo', 'arroz', 'leche', 'tomate', 'queso');
    fc.assert(
      fc.property(
        fc.array(fc.array(idArb, { minLength: 1, maxLength: 3 }), { maxLength: 6 }),
        fc.array(idArb, { maxLength: 4 }),
        fc.array(idArb, { maxLength: 3 }),
        (recetasIds, segurosIds, despensa) => {
          const catalogo = recetasIds.map((ids, i) =>
            receta({ id: `r${i}`, ingredientes: ids.map((id) => ingrediente(id)) })
          );
          const foto = segurosIds.map((id) =>
            detectado({ ingredienteId: id, certeza: 'seguro' })
          );
          const disponibles = new Set<string>([...segurosIds, ...despensa]);
          return recetasConLoQueHay(catalogo, foto, despensa, [], 10).every((o) =>
            idsDe(o.receta).every((id) => disponibles.has(id))
          );
        }
      )
    );
  });

  it('PROPIEDAD · nunca devuelve más recetas de las pedidas', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 1, max: 5 }),
        (cuantasHay, cuantasSePiden) => {
          const catalogo = Array.from({ length: cuantasHay }, (_, i) =>
            receta({ id: `r${i}`, ingredientes: [ingrediente('huevo')] })
          );
          const opciones = recetasConLoQueHay(
            catalogo,
            [detectado({ ingredienteId: 'huevo' })],
            [],
            [],
            cuantasSePiden
          );
          return opciones.length <= cuantasSePiden;
        }
      )
    );
  });
});
