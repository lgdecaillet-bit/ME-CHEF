/**
 * Escalar una receta al hogar. Es una multiplicación: esto es exactamente el
 * tipo de cosa que NUNCA debe llamar a un modelo.
 *
 * Resuelve el problema de "cocino para tres" sin IA: cada comensal tiene su
 * factor y las cantidades se escalan por la suma.
 */
import type { Comensal, IngredienteEscalado, Receta } from './types';

/** Porciones del hogar = suma de los factores de sus comensales. */
export function porcionesDelHogar(comensales: Comensal[]): number {
  if (comensales.length === 0) return 2; // usuario nuevo sin perfil
  const suma = comensales.reduce((t, c) => t + c.factorPorcion, 0);
  return Math.round(suma * 10) / 10; // evita ruido de coma flotante
}

/**
 * Cantidades para TODO el hogar. Devuelve `IngredienteEscalado`, con el total en
 * un campo que se llama `cantidadTotal`: antes devolvía `RecetaIngrediente` con
 * el total metido en `cantidadPorPorcion`, y encadenar dos escalados
 * multiplicaba dos veces sin que el tipo dijera nada (BUG-7).
 */
export function escalarReceta(receta: Receta, porciones: number): IngredienteEscalado[] {
  return receta.ingredientes.map((i) => ({
    ingredienteId: i.ingredienteId,
    cantidadTotal: redondear(i.cantidadPorPorcion * porciones, i.unidad),
    unidad: i.unidad,
  }));
}

/**
 * Redondeo amable **al más cercano**: nadie mide 137 g de cebolla.
 * Bajo 10 al medio, bajo 100 al múltiplo de 5, sobre 100 al de 10.
 *
 * Es el de las RECETAS, donde da igual pasarse o quedarse corto por dos gramos.
 * Para la lista de mercado no sirve: ver `redondearParaComprar`.
 */
export function redondear(cantidad: number, _unidad: 'g' | 'ml'): number {
  if (cantidad < 10) return Math.round(cantidad * 2) / 2;
  if (cantidad < 100) return Math.round(cantidad / 5) * 5;
  return Math.round(cantidad / 10) * 10;
}

/**
 * El mismo redondeo amable, pero **siempre hacia arriba**. Es el de la LISTA DE
 * MERCADO (arreglo de BUG-9).
 *
 * Por qué hacen falta dos: los dos errores del redondeo no cuestan lo mismo.
 * Comprar de más deja medio paquete en la despensa; comprar de menos obliga a
 * volver a la tienda, que es justo lo que la app promete evitar. Con el redondeo
 * al más cercano, necesitar 12 salía como «compra 10».
 *
 * El sesgo va siempre en la dirección barata. Es la misma regla que hace que un
 * ingrediente sin cantidad conocida cuente como cero y se compre (BUG-1).
 */
export function redondearParaComprar(cantidad: number, _unidad: 'g' | 'ml'): number {
  if (cantidad < 10) return Math.ceil(cantidad * 2) / 2;
  if (cantidad < 100) return Math.floor(cantidad / 5) * 5;
  return Math.ceil(cantidad / 10) * 10;
}
