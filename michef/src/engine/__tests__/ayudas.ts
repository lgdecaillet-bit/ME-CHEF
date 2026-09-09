/**
 * Constructores de datos para los tests del motor.
 *
 * Existen para que cada test diga solo lo que le importa. Si un test escribe
 * `receta({ minutos: 60 })`, se lee que el test trata de los 60 minutos y que
 * todo lo demás da igual. Sin esto, cada caso arrastra veinte campos de ruido
 * y el lector no sabe cuál es el que importa.
 */
import type {
  Comensal,
  ItemDetectado,
  ItemInventario,
  Receta,
  RecetaIngrediente,
  Unidad,
} from '../types';

export const AHORA = new Date('2026-09-09T12:00:00Z');

export function diasAntes(dias: number, desde: Date = AHORA): Date {
  return new Date(desde.getTime() - dias * 86_400_000);
}

export function comensal(p: Partial<Comensal> = {}): Comensal {
  return { id: 'c1', factorPorcion: 1, ...p };
}

export function ingrediente(
  ingredienteId: string,
  cantidadPorPorcion = 100,
  unidad: Unidad = 'g'
): RecetaIngrediente {
  return { ingredienteId, cantidadPorPorcion, unidad };
}

export function receta(p: Partial<Receta> = {}): Receta {
  return {
    id: 'r1',
    titulo: 'Receta',
    minutos: 20,
    ingredientes: [ingrediente('huevo')],
    equipo: [],
    tipo: 'comida',
    ranking: 0,
    ...p,
  };
}

export function item(p: Partial<ItemInventario> = {}): ItemInventario {
  return {
    ingredienteId: 'huevo',
    cantidad: 100,
    unidad: 'g',
    confianza: 0.9,
    origen: 'escaneo',
    entroEn: AHORA,
    vistoEn: AHORA,
    ...p,
  };
}

export function detectado(p: Partial<ItemDetectado> = {}): ItemDetectado {
  return { ingredienteId: 'huevo', cantidad: 100, certeza: 'seguro', ...p };
}

/** Los ids de ingrediente que usa una receta. Para leer aserciones de un vistazo. */
export function idsDe(r: Receta): string[] {
  return r.ingredientes.map((i) => i.ingredienteId);
}
