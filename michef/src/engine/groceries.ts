/**
 * La lista de mercado es una VISTA CALCULADA, no una tabla.
 * Si cambias una receta de la semana, se recalcula sola.
 *
 *   necesario = Σ ingredientes de la semana × porciones
 *   a comprar = necesario − inventario confiable
 */
import type { ItemInventario, LineaMercado, Receta } from './types';
import { UMBRAL_CONFIABLE } from './inventory';
import { redondear } from './portions';

export interface PrecioConocido {
  ingredienteId: string;
  /** precio por unidad base (g o ml) en la moneda del hogar */
  precioPorUnidad: number;
  fuente: 'estimado' | 'dato_abierto' | 'factura';
}

export function listaDeMercado(
  recetasDeLaSemana: { receta: Receta; porciones: number }[],
  inventario: ItemInventario[],
  precios: PrecioConocido[] = []
): LineaMercado[] {
  const necesario = new Map<string, { cantidad: number; unidad: 'g' | 'ml' }>();

  for (const { receta, porciones } of recetasDeLaSemana) {
    for (const ing of receta.ingredientes) {
      const actual = necesario.get(ing.ingredienteId);
      const suma = ing.cantidadPorPorcion * porciones;
      if (actual) actual.cantidad += suma;
      else necesario.set(ing.ingredienteId, { cantidad: suma, unidad: ing.unidad });
    }
  }

  // Solo cuenta como "ya lo tengo" lo que es confiable. Un posible no resta.
  //
  // Arreglo de BUG-4: las filas repetidas se SUMAN. El inventario tiene una fila
  // por origen (escaneo, factura, manual), así que el mismo ingrediente dos
  // veces es lo normal, no el caso raro. Antes `new Map(...)` se quedaba con la
  // última y la app te mandaba a comprar lo que ya tenías.
  //
  // La clave lleva la unidad: dos filas del mismo ingrediente en unidades
  // distintas NO se suman. Convertir entre gramos y mililitros necesita la
  // densidad del ingrediente, que es dato que aún no existe (BUG-3). Mientras
  // tanto, lo que no se puede comparar cuenta como cero y se compra: quedarse
  // corto de mercado es peor que comprar de más.
  const enCasa = new Map<string, number>();
  for (const i of inventario) {
    if (i.confianza < UMBRAL_CONFIABLE) continue;
    // Sin cantidad conocida no hay nada que restar: cuenta como cero.
    if (i.cantidad == null) continue;
    const clave = `${i.ingredienteId}|${i.unidad}`;
    enCasa.set(clave, (enCasa.get(clave) ?? 0) + i.cantidad);
  }
  const preciosPorId = new Map(precios.map((p) => [p.ingredienteId, p]));

  const lineas: LineaMercado[] = [];
  for (const [ingredienteId, { cantidad, unidad }] of necesario) {
    const tengo = enCasa.get(`${ingredienteId}|${unidad}`) ?? 0;
    const comprar = redondear(Math.max(0, cantidad - tengo), unidad);
    if (comprar === 0) continue;

    const precio = preciosPorId.get(ingredienteId);
    lineas.push({
      ingredienteId,
      cantidadNecesaria: redondear(cantidad, unidad),
      cantidadEnCasa: tengo,
      cantidadAComprar: comprar,
      unidad,
      precioEstimado: precio ? +(precio.precioPorUnidad * comprar).toFixed(2) : undefined,
      fuentePrecio: precio?.fuente,
    });
  }
  return lineas;
}

export function totalEstimado(lineas: LineaMercado[]): {
  total: number;
  todoConPrecioReal: boolean;
} {
  const total = lineas.reduce((t, l) => t + (l.precioEstimado ?? 0), 0);
  return {
    total: +total.toFixed(2),
    todoConPrecioReal: lineas.every((l) => l.fuentePrecio === 'factura'),
  };
}
