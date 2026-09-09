/**
 * Escalar una receta al hogar. Es una multiplicación: esto es exactamente el
 * tipo de cosa que NUNCA debe llamar a un modelo.
 *
 * Resuelve el problema de "cocino para tres" sin IA: cada comensal tiene su
 * factor y las cantidades se escalan por la suma.
 */
import type { Comensal, Receta, RecetaIngrediente } from './types';

/** Porciones del hogar = suma de los factores de sus comensales. */
export function porcionesDelHogar(comensales: Comensal[]): number {
  if (comensales.length === 0) return 2; // usuario nuevo sin perfil
  const suma = comensales.reduce((t, c) => t + c.factorPorcion, 0);
  return Math.round(suma * 10) / 10; // evita ruido de coma flotante
}

export function escalarReceta(receta: Receta, porciones: number): RecetaIngrediente[] {
  return receta.ingredientes.map((i) => ({
    ...i,
    cantidadPorPorcion: redondear(i.cantidadPorPorcion * porciones, i.unidad),
  }));
}

/**
 * Redondeo amable: nadie mide 137 g de cebolla.
 * Bajo 10 al entero, bajo 100 al múltiplo de 5, sobre 100 al de 10.
 */
export function redondear(cantidad: number, _unidad: 'g' | 'ml'): number {
  if (cantidad < 10) return Math.round(cantidad * 2) / 2;
  if (cantidad < 100) return Math.round(cantidad / 5) * 5;
  return Math.round(cantidad / 10) * 10;
}
