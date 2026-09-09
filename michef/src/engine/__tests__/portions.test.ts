/**
 * Porciones y redondeo.
 *
 * Es la función que resuelve el dolor del primer usuario («cocino para tres»)
 * y es una multiplicación: exactamente lo que nunca debe pedirle a un modelo.
 */
import fc from 'fast-check';
import {
  escalarReceta,
  porcionesDelHogar,
  redondear,
  redondearParaComprar,
} from '../portions';
import { comensal, ingrediente, receta } from './ayudas';

describe('porcionesDelHogar', () => {
  it('un hogar sin comensales asume 2 porciones', () => {
    // Usuario nuevo que aún no ha contestado las dos preguntas del onboarding.
    expect(porcionesDelHogar([])).toBe(2);
  });

  it('suma los factores de cada comensal', () => {
    const familia = [
      comensal({ id: 'mama', factorPorcion: 1 }),
      comensal({ id: 'papa', factorPorcion: 1 }),
      comensal({ id: 'nino', factorPorcion: 0.7 }),
    ];
    expect(porcionesDelHogar(familia)).toBe(2.7);
  });

  it('un estudiante con intake alto cuenta como 1,8', () => {
    expect(porcionesDelHogar([comensal({ factorPorcion: 1.8 })])).toBe(1.8);
  });

  it('no arrastra ruido de coma flotante', () => {
    // 0.1 + 0.2 = 0.30000000000000004 en coma flotante. Aquí no.
    const dos = [comensal({ factorPorcion: 0.1 }), comensal({ factorPorcion: 0.2 })];
    expect(porcionesDelHogar(dos)).toBe(0.3);
  });

  it('un factor cero no rompe: da cero', () => {
    expect(porcionesDelHogar([comensal({ factorPorcion: 0 })])).toBe(0);
  });

  it('PROPIEDAD · el resultado es la suma de los factores, con un decimal', () => {
    // Con dientes: comprobado que `return 0` la rompe. La versión anterior solo
    // pedía «no negativo», que la cumple cualquier función que devuelva cero.
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.1, max: 5, noNaN: true }), {
          minLength: 1,
          maxLength: 12,
        }),
        (factores) => {
          const comensales = factores.map((f, i) =>
            comensal({ id: `c${i}`, factorPorcion: f })
          );
          const suma = factores.reduce((t, f) => t + f, 0);
          return Math.abs(porcionesDelHogar(comensales) - suma) <= 0.05;
        }
      )
    );
  });

  it('PROPIEDAD · añadir un comensal nunca reduce las porciones', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.1, max: 5, noNaN: true }), { maxLength: 8 }),
        fc.double({ min: 0.1, max: 5, noNaN: true }),
        (factores, nuevo) => {
          if (factores.length === 0) return true; // el hogar vacío asume 2 aparte
          const antes = factores.map((f, i) =>
            comensal({ id: `c${i}`, factorPorcion: f })
          );
          const despues = [...antes, comensal({ id: 'nuevo', factorPorcion: nuevo })];
          return porcionesDelHogar(despues) >= porcionesDelHogar(antes) - 0.05;
        }
      )
    );
  });

  it('un factor NaN contamina el resultado, y hoy nadie lo impide', () => {
    // Caracterización de un caso límite real: `Comensal.factorPorcion` viene de
    // SQLite, donde una fila corrupta da NaN. El motor no lo valida. Cuando
    // Fase 1 meta zod en la frontera, esto debe dejar de ser posible y este test
    // cambiará con ello.
    expect(porcionesDelHogar([comensal({ factorPorcion: NaN })])).toBeNaN();
  });

  it('un factor negativo también pasa tal cual', () => {
    expect(porcionesDelHogar([comensal({ factorPorcion: -2 })])).toBe(-2);
  });
});

describe('redondear', () => {
  // «Nadie mide 137 g de cebolla.» Bajo 10 al medio, bajo 100 al múltiplo de 5,
  // sobre 100 al de 10.
  it.each([
    [0, 0],
    [0.4, 0.5],
    [3.2, 3],
    [7.3, 7.5],
    [9.9, 10],
    [37, 35],
    [42, 40],
    [99, 100],
    [137, 140],
    [1234, 1230],
  ])('redondear(%p) da %p', (entrada, esperado) => {
    expect(redondear(entrada, 'g')).toBe(esperado);
  });

  it('la unidad no cambia el resultado: es formato, no cálculo', () => {
    expect(redondear(137, 'g')).toBe(redondear(137, 'ml'));
  });

  it('PROPIEDAD · redondear dos veces da lo mismo que redondear una', () => {
    // Si no fuera idempotente, dos pasos del cálculo que redondean darían
    // cantidades distintas para la misma receta.
    fc.assert(
      fc.property(fc.float({ min: 0, max: 10000, noNaN: true }), (x) => {
        const una = redondear(x, 'g');
        return redondear(una, 'g') === una;
      })
    );
  });

  it('PROPIEDAD · es monótona: más cantidad nunca da menos redondeada', () => {
    // La pide fase-0 § D3 explícitamente. Sin ella, dos cantidades cercanas
    // podrían cruzarse al redondear y una receta más grande saldría más pequeña
    // en la lista de mercado.
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10000, noNaN: true }),
        fc.double({ min: 0, max: 500, noNaN: true }),
        (x, extra) => redondear(x + extra, 'g') >= redondear(x, 'g')
      )
    );
  });

  it('redondear(NaN) devuelve NaN, y hoy nadie lo impide', () => {
    // Caracterización. Un NaN que entre por aquí llega hasta la lista de
    // mercado y produce una línea con cantidades NaN. Fase 1 lo corta con zod
    // en la frontera; hasta entonces queda escrito que pasa.
    expect(redondear(NaN, 'g')).toBeNaN();
  });

  it('PROPIEDAD · una cantidad no negativa nunca se vuelve negativa', () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 10000, noNaN: true }), (x) => {
        return redondear(x, 'g') >= 0;
      })
    );
  });
});

describe('escalarReceta', () => {
  it('multiplica cada ingrediente por las porciones', () => {
    const r = receta({
      ingredientes: [ingrediente('arroz', 80), ingrediente('leche', 200, 'ml')],
    });
    const escalada = escalarReceta(r, 3);
    expect(escalada.map((i) => i.cantidadTotal)).toEqual([240, 600]);
  });

  it('conserva el ingrediente y su unidad', () => {
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('leche', 200, 'ml')] }),
      2
    );
    expect(escalada[0]?.ingredienteId).toBe('leche');
    expect(escalada[0]?.unidad).toBe('ml');
  });

  it('redondea el resultado: 137 no es una cantidad que nadie mida', () => {
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('cebolla', 45.7)] }),
      3
    );
    expect(escalada[0]?.cantidadTotal).toBe(140);
  });

  it('escalar por cero deja cero, no negativo', () => {
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('arroz', 80)] }),
      0
    );
    expect(escalada[0]?.cantidadTotal).toBe(0);
  });

  it('una receta sin ingredientes devuelve lista vacía', () => {
    expect(escalarReceta(receta({ ingredientes: [] }), 4)).toEqual([]);
  });

  it('escalar por un número negativo da cantidades negativas: nadie lo valida', () => {
    // Caracterización de un caso límite. `porciones` viene de
    // `porcionesDelHogar`, que hoy acepta factores negativos. Fase 1 lo cierra.
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('arroz', 100)] }),
      -2
    );
    expect(escalada[0]?.cantidadTotal).toBe(-200);
  });

  it('PROPIEDAD · conserva un ingrediente por cada uno de la receta, con su unidad', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.constantFrom('arroz', 'leche', 'huevo'),
            cantidad: fc.integer({ min: 0, max: 900 }),
            unidad: fc.constantFrom<'g' | 'ml'>('g', 'ml'),
          }),
          { maxLength: 8 }
        ),
        fc.integer({ min: 0, max: 12 }),
        (ings, porciones) => {
          const r = receta({
            ingredientes: ings.map((i) => ingrediente(i.id, i.cantidad, i.unidad)),
          });
          const escalada = escalarReceta(r, porciones);
          if (escalada.length !== ings.length) return false;
          return escalada.every(
            (e, i) => e.ingredienteId === ings[i]!.id && e.unidad === ings[i]!.unidad
          );
        }
      )
    );
  });
});

describe('redondearParaComprar', () => {
  // La diferencia con `redondear` es toda la función: mismo escalón, otra
  // dirección. Si algún día las dos hacen lo mismo, este bloque lo dice.
  it.each([
    [12, 15],
    [11, 15],
    [15, 15],
    [101, 110],
    [100, 100],
    [3.1, 3.5],
    [2.5, 2.5],
    [98, 100],
  ])('%d se compra como %d', (entra, sale) => {
    expect(redondearParaComprar(entra, 'g')).toBe(sale);
  });

  it('cero sigue siendo cero: no manda a comprar lo que no falta', () => {
    expect(redondearParaComprar(0, 'g')).toBe(0);
  });

  it('PROPIEDAD · nunca devuelve menos de lo que entra', () => {
    // El invariante del arreglo de BUG-9, sobre la función sola.
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10000, noNaN: true }),
        (x) => redondearParaComprar(x, 'g') >= x
      )
    );
  });

  it('PROPIEDAD · nunca se pasa más de un escalón', () => {
    // Comprar de más es barato, pero no gratis: el sesgo tiene tope.
    // El límite es `<=` y no `<` por un caso real que encontró fast-check:
    // con x = 5e-324 (el double más pequeño que existe) el resultado es 0,5 y la
    // resta da 0,5 clavado, porque x se pierde en la precisión. Es un artefacto
    // de la coma flotante, no un fallo del redondeo.
    fc.assert(
      fc.property(fc.double({ min: 0, max: 10000, noNaN: true }), (x) => {
        const escalon = x < 10 ? 0.5 : x < 100 ? 5 : 10;
        return redondearParaComprar(x, 'g') - x <= escalon;
      })
    );
  });

  it('PROPIEDAD · nunca devuelve menos que el redondeo al más cercano', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10000, noNaN: true }),
        (x) => redondearParaComprar(x, 'g') >= redondear(x, 'g')
      )
    );
  });
});
