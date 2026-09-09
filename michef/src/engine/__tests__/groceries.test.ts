/**
 * La lista de mercado es una VISTA CALCULADA, no una tabla (CLAUDE.md).
 *
 *   necesario = Σ ingredientes de la semana × porciones
 *   a comprar = necesario − inventario confiable
 *
 * Si alguna vez ves una columna «lista_de_mercado» en el esquema, algo se rompió.
 */
import fc from 'fast-check';
import { listaDeMercado, totalEstimado, type PrecioConocido } from '../groceries';
import { ingrediente, item, receta } from './ayudas';

describe('listaDeMercado', () => {
  it('multiplica por porciones y resta lo que ya hay', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 80)] }), porciones: 3 },
    ];
    const inventario = [item({ ingredienteId: 'arroz', cantidad: 100 })];
    const lineas = listaDeMercado(semana, inventario);
    // 80 × 3 = 240 necesarios, hay 100, faltan 140.
    expect(lineas[0]).toMatchObject({
      ingredienteId: 'arroz',
      cantidadNecesaria: 240,
      cantidadEnCasa: 100,
      cantidadAComprar: 140,
    });
  });

  it('lo que ya alcanza no aparece en la lista', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 80)] }), porciones: 1 },
    ];
    const inventario = [item({ ingredienteId: 'arroz', cantidad: 500 })];
    expect(listaDeMercado(semana, inventario)).toHaveLength(0);
  });

  it('un `posible` no cuenta como que lo tienes', () => {
    // Confianza 0,4: por debajo del umbral. Si contara, te quedarías sin arroz.
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 80)] }), porciones: 1 },
    ];
    const inventario = [item({ ingredienteId: 'arroz', cantidad: 500, confianza: 0.4 })];
    expect(listaDeMercado(semana, inventario)[0]?.cantidadAComprar).toBe(80);
  });

  it('suma el mismo ingrediente de varias recetas de la semana', () => {
    const semana = [
      {
        receta: receta({ id: 'r1', ingredientes: [ingrediente('cebolla', 50)] }),
        porciones: 2,
      },
      {
        receta: receta({ id: 'r2', ingredientes: [ingrediente('cebolla', 30)] }),
        porciones: 2,
      },
    ];
    // (50 + 30) × 2 = 160
    expect(listaDeMercado(semana, [])[0]?.cantidadNecesaria).toBe(160);
  });

  it('con inventario vacío hay que comprarlo todo', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('huevo', 60)] }), porciones: 4 },
    ];
    expect(listaDeMercado(semana, [])[0]?.cantidadAComprar).toBe(240);
  });

  it('una semana sin recetas da una lista vacía', () => {
    expect(listaDeMercado([], [item()])).toEqual([]);
  });

  it('conserva la unidad del ingrediente', () => {
    const semana = [
      {
        receta: receta({ ingredientes: [ingrediente('leche', 200, 'ml')] }),
        porciones: 2,
      },
    ];
    expect(listaDeMercado(semana, [])[0]?.unidad).toBe('ml');
  });

  it('calcula el precio y dice de dónde salió', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 100)] }), porciones: 2 },
    ];
    const precios: PrecioConocido[] = [
      { ingredienteId: 'arroz', precioPorUnidad: 0.004, fuente: 'factura' },
    ];
    const linea = listaDeMercado(semana, [], precios)[0];
    expect(linea?.precioEstimado).toBe(0.8);
    expect(linea?.fuentePrecio).toBe('factura');
  });

  it('sin precio conocido, la línea existe pero sin importe', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 100)] }), porciones: 1 },
    ];
    const linea = listaDeMercado(semana, [])[0];
    expect(linea?.precioEstimado).toBeUndefined();
    expect(linea?.fuentePrecio).toBeUndefined();
  });

  it('PROPIEDAD · ninguna cantidad sale negativa, pase lo que pase', () => {
    // Una lista con un número negativo es peor que no tener lista: manda a
    // comprar cosas que no existen.
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            cantidad: fc.integer({ min: 0, max: 500 }),
            porciones: fc.integer({ min: 0, max: 10 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.integer({ min: 0, max: 5000 }),
        (recetas, enCasa) => {
          const semana = recetas.map((r, i) => ({
            receta: receta({
              id: `r${i}`,
              ingredientes: [ingrediente('arroz', r.cantidad)],
            }),
            porciones: r.porciones,
          }));
          const inventario = [item({ ingredienteId: 'arroz', cantidad: enCasa })];
          return listaDeMercado(semana, inventario).every(
            (l) =>
              l.cantidadAComprar >= 0 && l.cantidadNecesaria >= 0 && l.cantidadEnCasa >= 0
          );
        }
      )
    );
  });

  it('PROPIEDAD · nunca aparece un ingrediente que ninguna receta pide', () => {
    const idArb = fc.constantFrom('arroz', 'huevo', 'leche');
    fc.assert(
      fc.property(fc.array(idArb, { maxLength: 5 }), (ids) => {
        const semana = ids.map((id, i) => ({
          receta: receta({ id: `r${i}`, ingredientes: [ingrediente(id, 100)] }),
          porciones: 2,
        }));
        const pedidos = new Set<string>(ids);
        // Con inventario poblado a propósito: con inventario vacío la propiedad
        // no podía detectar que un ítem del inventario se colara en la lista.
        const inventario = ['arroz', 'huevo', 'leche', 'caviar'].map((id) =>
          item({ ingredienteId: id, cantidad: 50 })
        );
        return listaDeMercado(semana, inventario).every((l) =>
          pedidos.has(l.ingredienteId)
        );
      })
    );
  });
});

describe('totalEstimado', () => {
  it('suma los importes de las líneas', () => {
    const semana = [
      {
        receta: receta({ id: 'r1', ingredientes: [ingrediente('arroz', 100)] }),
        porciones: 1,
      },
      {
        receta: receta({ id: 'r2', ingredientes: [ingrediente('huevo', 100)] }),
        porciones: 1,
      },
    ];
    const precios: PrecioConocido[] = [
      { ingredienteId: 'arroz', precioPorUnidad: 0.01, fuente: 'factura' },
      { ingredienteId: 'huevo', precioPorUnidad: 0.02, fuente: 'factura' },
    ];
    expect(totalEstimado(listaDeMercado(semana, [], precios)).total).toBe(3);
  });

  it('avisa cuando algún precio no viene de una factura real', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 100)] }), porciones: 1 },
    ];
    const precios: PrecioConocido[] = [
      { ingredienteId: 'arroz', precioPorUnidad: 0.01, fuente: 'estimado' },
    ];
    expect(totalEstimado(listaDeMercado(semana, [], precios)).todoConPrecioReal).toBe(
      false
    );
  });

  it('con todos los precios de factura, lo dice', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 100)] }), porciones: 1 },
    ];
    const precios: PrecioConocido[] = [
      { ingredienteId: 'arroz', precioPorUnidad: 0.01, fuente: 'factura' },
    ];
    expect(totalEstimado(listaDeMercado(semana, [], precios)).todoConPrecioReal).toBe(
      true
    );
  });

  it('una lista vacía suma cero', () => {
    expect(totalEstimado([])).toEqual({ total: 0, todoConPrecioReal: true });
  });

  it('PROPIEDAD · el total es la suma de los importes, y «todo real» implica facturas', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            precio: fc.integer({ min: 0, max: 5000 }),
            fuente: fc.constantFrom<'estimado' | 'dato_abierto' | 'factura'>(
              'estimado',
              'dato_abierto',
              'factura'
            ),
          }),
          { maxLength: 8 }
        ),
        (datos) => {
          const lineas = datos.map((d, i) => ({
            ingredienteId: `ing${i}`,
            cantidadNecesaria: 100,
            cantidadEnCasa: 0,
            cantidadAComprar: 100,
            unidad: 'g' as const,
            precioEstimado: d.precio / 100,
            fuentePrecio: d.fuente,
          }));
          const { total, todoConPrecioReal } = totalEstimado(lineas);
          const esperado = +datos.reduce((t, d) => t + d.precio / 100, 0).toFixed(2);
          const facturasSolo = datos.every((d) => d.fuente === 'factura');
          return Math.abs(total - esperado) < 0.011 && todoConPrecioReal === facturasSolo;
        }
      )
    );
  });

  it('una línea sin precio no rompe la suma', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 100)] }), porciones: 1 },
    ];
    expect(totalEstimado(listaDeMercado(semana, [])).total).toBe(0);
  });
});
