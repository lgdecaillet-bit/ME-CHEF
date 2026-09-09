/**
 * Fusión de la foto con el inventario, descuento al cocinar, y perecibilidad.
 *
 * Es el corazón de la función central y no es IA: son reglas. La foto nunca da
 * un inventario completo, así que lo que no se ve NO se borra: baja de confianza.
 */
import fc from 'fast-check';
import {
  UMBRAL_CONFIABLE,
  descontarCocinado,
  fusionarEscaneo,
  porVencerse,
} from '../inventory';
import { AHORA, detectado, diasAntes, item } from './ayudas';

describe('fusionarEscaneo', () => {
  it('la foto manda sobre lo registrado: si dice 8 huevos, son 8', () => {
    const antes = [item({ ingredienteId: 'huevo', cantidad: 3 })];
    const despues = fusionarEscaneo(
      antes,
      [detectado({ ingredienteId: 'huevo', cantidad: 8 })],
      AHORA
    );
    expect(despues[0]?.cantidad).toBe(8);
  });

  it('lo que la foto no vio no se borra: baja de confianza a la mitad', () => {
    const antes = [item({ ingredienteId: 'arroz', cantidad: 500, confianza: 0.9 })];
    const despues = fusionarEscaneo(antes, [], AHORA);
    // Puede estar detrás de otra cosa, en un cajón o en un tupper.
    expect(despues[0]?.cantidad).toBe(500);
    expect(despues[0]?.confianza).toBeCloseTo(0.45);
  });

  it('lo añadido a mano no se penaliza aunque la foto no lo vea', () => {
    const antes = [item({ ingredienteId: 'sal', origen: 'manual', confianza: 0.9 })];
    const despues = fusionarEscaneo(antes, [], AHORA);
    expect(despues[0]?.confianza).toBe(0.9);
  });

  it('algo `seguro` entra con confianza alta; algo `posible`, con baja', () => {
    const r = fusionarEscaneo(
      [],
      [
        detectado({ ingredienteId: 'huevo', certeza: 'seguro' }),
        detectado({ ingredienteId: 'tofu', certeza: 'posible' }),
      ],
      AHORA
    );
    const porId = new Map(r.map((i) => [i.ingredienteId, i]));
    expect(porId.get('huevo')?.confianza).toBe(0.9);
    expect(porId.get('tofu')?.confianza).toBe(0.4);
    // Un `posible` queda por debajo del umbral: no cuenta para recetas ni lista.
    expect(porId.get('tofu')!.confianza).toBeLessThan(UMBRAL_CONFIABLE);
  });

  it('lo que no se ve varias veces acaba desapareciendo', () => {
    let inv = [item({ ingredienteId: 'arroz', confianza: 0.9 })];
    // 0.9 → 0.45 → 0.225 → 0.1125 → 0.056, que ya está bajo el mínimo.
    for (let i = 0; i < 4; i++) inv = fusionarEscaneo(inv, [], AHORA);
    expect(inv).toHaveLength(0);
  });

  it('una cantidad de cero saca el ítem del inventario', () => {
    const antes = [item({ ingredienteId: 'huevo', cantidad: 6 })];
    const despues = fusionarEscaneo(
      antes,
      [detectado({ ingredienteId: 'huevo', cantidad: 0 })],
      AHORA
    );
    expect(despues).toHaveLength(0);
  });

  it('marca cuándo se vio por última vez y de dónde viene', () => {
    const antes = [
      item({ ingredienteId: 'huevo', origen: 'factura', vistoEn: diasAntes(5) }),
    ];
    const despues = fusionarEscaneo(
      antes,
      [detectado({ ingredienteId: 'huevo' })],
      AHORA
    );
    expect(despues[0]?.vistoEn).toEqual(AHORA);
    expect(despues[0]?.origen).toBe('escaneo');
  });

  it('no muta el inventario que recibe', () => {
    const antes = [item({ ingredienteId: 'huevo', cantidad: 3 })];
    fusionarEscaneo(antes, [detectado({ ingredienteId: 'huevo', cantidad: 8 })], AHORA);
    expect(antes[0]?.cantidad).toBe(3);
  });

  it('una foto vacía sobre un inventario vacío no inventa nada', () => {
    expect(fusionarEscaneo([], [], AHORA)).toEqual([]);
  });

  it('PROPIEDAD · nunca inventa un ingrediente que nadie mencionó', () => {
    // Es la prohibición dura de CLAUDE.md: cinco ingredientes ciertos valen más
    // que diez con dos falsos.
    const idArb = fc.constantFrom('huevo', 'arroz', 'leche', 'tomate', 'queso');
    fc.assert(
      fc.property(
        fc.array(fc.record({ id: idArb, cantidad: fc.integer({ min: 1, max: 900 }) }), {
          maxLength: 6,
        }),
        fc.array(
          fc.record({
            id: idArb,
            cantidad: fc.integer({ min: 1, max: 900 }),
            certeza: fc.constantFrom<'seguro' | 'posible'>('seguro', 'posible'),
          }),
          { maxLength: 6 }
        ),
        (inv, det) => {
          const inventario = inv.map((x) =>
            item({ ingredienteId: x.id, cantidad: x.cantidad })
          );
          const foto = det.map((x) =>
            detectado({ ingredienteId: x.id, cantidad: x.cantidad, certeza: x.certeza })
          );
          const conocidos = new Set<string>([
            ...inv.map((x) => x.id),
            ...det.map((x) => x.id),
          ]);
          return fusionarEscaneo(inventario, foto, AHORA).every((i) =>
            conocidos.has(i.ingredienteId)
          );
        }
      )
    );
  });

  it('PROPIEDAD · lo que la foto no ve pierde exactamente la mitad de confianza', () => {
    // Con dientes: comprobado que cambiar PENALIZACION_NO_VISTO la rompe. La
    // versión anterior solo pedía «no negativo», que es lo mismo que dice el
    // filtro final de la propia función: no podía fallar nunca.
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.3, max: 1, noNaN: true }), {
          minLength: 1,
          maxLength: 8,
        }),
        (confianzas) => {
          const inventario = confianzas.map((c, i) =>
            item({ ingredienteId: `ing${i}`, confianza: c, origen: 'escaneo' })
          );
          const despues = fusionarEscaneo(inventario, [], AHORA);
          return despues.every((d) => {
            const antes = confianzas[Number(d.ingredienteId.replace('ing', ''))]!;
            return Math.abs(d.confianza - antes * 0.5) < 1e-9;
          });
        }
      )
    );
  });

  it('PROPIEDAD · lo manual conserva su confianza pase lo que pase', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0.2, max: 1, noNaN: true }), {
          minLength: 1,
          maxLength: 8,
        }),
        (confianzas) => {
          const inventario = confianzas.map((c, i) =>
            item({ ingredienteId: `ing${i}`, confianza: c, origen: 'manual' })
          );
          const despues = fusionarEscaneo(inventario, [], AHORA);
          return despues.every((d) => {
            const antes = confianzas[Number(d.ingredienteId.replace('ing', ''))]!;
            return d.confianza === antes;
          });
        }
      )
    );
  });
});

describe('descontarCocinado', () => {
  it('lo usado sale del inventario', () => {
    const inv = [item({ ingredienteId: 'arroz', cantidad: 500 })];
    const despues = descontarCocinado(inv, [{ ingredienteId: 'arroz', cantidad: 200 }]);
    expect(despues[0]?.cantidad).toBe(300);
  });

  it('usar más de lo que hay deja cero, nunca negativo', () => {
    const inv = [item({ ingredienteId: 'arroz', cantidad: 100 })];
    const despues = descontarCocinado(inv, [{ ingredienteId: 'arroz', cantidad: 999 }]);
    expect(despues).toHaveLength(0);
  });

  it('descontar algo que no está no rompe nada', () => {
    const inv = [item({ ingredienteId: 'arroz', cantidad: 100 })];
    const despues = descontarCocinado(inv, [{ ingredienteId: 'caviar', cantidad: 10 }]);
    expect(despues[0]?.cantidad).toBe(100);
  });

  it('no muta el inventario que recibe', () => {
    const inv = [item({ ingredienteId: 'arroz', cantidad: 500 })];
    descontarCocinado(inv, [{ ingredienteId: 'arroz', cantidad: 200 }]);
    expect(inv[0]?.cantidad).toBe(500);
  });

  it('sin nada que descontar devuelve lo mismo', () => {
    const inv = [item({ ingredienteId: 'arroz', cantidad: 500 })];
    expect(descontarCocinado(inv, [])).toHaveLength(1);
  });

  it('PROPIEDAD · nunca aumenta una cantidad ni añade un ingrediente', () => {
    // Cocinar solo puede quitar. Si esta propiedad falla, el inventario crece
    // solo y la lista de mercado deja de pedir cosas que hacen falta.
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 900 }), { minLength: 1, maxLength: 6 }),
        fc.array(fc.integer({ min: 0, max: 900 }), { maxLength: 6 }),
        (enCasa, usados) => {
          const inventario = enCasa.map((c, i) =>
            item({ ingredienteId: `ing${i}`, cantidad: c })
          );
          const gasto = usados.map((c, i) => ({ ingredienteId: `ing${i}`, cantidad: c }));
          const despues = descontarCocinado(inventario, gasto);
          const antes = new Map(inventario.map((i) => [i.ingredienteId, i.cantidad]));
          return despues.every((d) => {
            const previo = antes.get(d.ingredienteId);
            // Todas las filas de esta propiedad entran con cantidad conocida, así
            // que salir sin ella también sería un fallo: la exigencia es que siga
            // siendo un número Y que no haya crecido.
            return previo != null && d.cantidad != null && d.cantidad <= previo;
          });
        }
      )
    );
  });
});

describe('porVencerse', () => {
  it('avisa de lo que se daña dentro de dos días', () => {
    const inv = [item({ ingredienteId: 'espinaca', entroEn: diasAntes(4) })];
    // La espinaca dura 5 días: le queda 1, y se avisa con 2 de margen.
    expect(porVencerse(inv, { espinaca: 5 }, AHORA)).toHaveLength(1);
  });

  it('no avisa de lo que todavía aguanta', () => {
    const inv = [item({ ingredienteId: 'zanahoria', entroEn: diasAntes(1) })];
    expect(porVencerse(inv, { zanahoria: 20 }, AHORA)).toHaveLength(0);
  });

  it('un ingrediente sin perecibilidad conocida no aparece', () => {
    // Mejor callar que inventar una fecha.
    const inv = [item({ ingredienteId: 'misterio', entroEn: diasAntes(90) })];
    expect(porVencerse(inv, {}, AHORA)).toHaveLength(0);
  });

  it('lo ya vencido también avisa', () => {
    const inv = [item({ ingredienteId: 'espinaca', entroEn: diasAntes(30) })];
    expect(porVencerse(inv, { espinaca: 5 }, AHORA)).toHaveLength(1);
  });

  it('ordena lo más viejo primero: eso se cocina antes', () => {
    const inv = [
      item({ ingredienteId: 'nuevo', entroEn: diasAntes(4) }),
      item({ ingredienteId: 'viejo', entroEn: diasAntes(9) }),
    ];
    const avisos = porVencerse(inv, { nuevo: 5, viejo: 5 }, AHORA);
    expect(avisos.map((i) => i.ingredienteId)).toEqual(['viejo', 'nuevo']);
  });

  it('PROPIEDAD · devuelve un subconjunto del inventario, del más viejo al más nuevo', () => {
    // Dos cosas a la vez: no puede inventar un ítem que no estaba, y el orden
    // importa porque es el que decide qué se cocina antes.
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 40 }), { maxLength: 8 }),
        (edades) => {
          const inventario = edades.map((d, i) =>
            item({ ingredienteId: `ing${i}`, entroEn: diasAntes(d) })
          );
          const perecibilidad = Object.fromEntries(edades.map((_, i) => [`ing${i}`, 5]));
          const avisos = porVencerse(inventario, perecibilidad, AHORA);
          const ids = new Set(inventario.map((i) => i.ingredienteId));
          const todosConocidos = avisos.every((a) => ids.has(a.ingredienteId));
          const ordenado = avisos.every(
            (a, i) => i === 0 || avisos[i - 1]!.entroEn.getTime() <= a.entroEn.getTime()
          );
          return todosConocidos && avisos.length <= inventario.length && ordenado;
        }
      )
    );
  });

  it('el margen de aviso se puede ajustar', () => {
    const inv = [item({ ingredienteId: 'leche', entroEn: diasAntes(2) })];
    expect(porVencerse(inv, { leche: 7 }, AHORA, 2)).toHaveLength(0);
    expect(porVencerse(inv, { leche: 7 }, AHORA, 6)).toHaveLength(1);
  });
});

describe('valores por defecto', () => {
  it('sin fecha explícita usa la de ahora', () => {
    // La rama del parámetro por defecto también se ejecuta en producción:
    // si no se prueba, nadie sabe si funciona.
    const despues = fusionarEscaneo([], [detectado({ ingredienteId: 'huevo' })]);
    expect(despues[0]?.vistoEn.getTime()).toBeGreaterThan(Date.now() - 5000);
  });

  it('porVencerse sin fecha explícita también funciona', () => {
    const inv = [item({ ingredienteId: 'espinaca', entroEn: diasAntes(4, new Date()) })];
    expect(porVencerse(inv, { espinaca: 5 })).toHaveLength(1);
  });

  it('si la foto ve algo ya registrado pero no dice cuánto, respeta la cantidad', () => {
    // La foto confirma que sigue ahí; no sabe cuánto queda. Lo que no sabe, no
    // lo cambia.
    const antes = [item({ ingredienteId: 'arroz', cantidad: 500 })];
    const despues = fusionarEscaneo(
      antes,
      [{ ingredienteId: 'arroz', certeza: 'seguro' }],
      AHORA
    );
    expect(despues[0]?.cantidad).toBe(500);
    expect(despues[0]?.confianza).toBe(0.9);
  });
});
