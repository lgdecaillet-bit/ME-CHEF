/**
 * Tipos del motor determinista.
 * Este módulo es puro: no importa nada de src/ai/ ni hace red. Ver CLAUDE.md.
 */

export type IngredienteId = string;
export type RecetaId = string;

/** Cantidades siempre en gramos o mililitros. Las unidades caseras son presentación. */
export type Unidad = 'g' | 'ml';

export interface Comensal {
  id: string;
  /** 1.0 adulto · 1.4 adolescente · 0.7 niño · 1.8 intake alto */
  factorPorcion: number;
  noCome?: IngredienteId[];
}

export interface RecetaIngrediente {
  ingredienteId: IngredienteId;
  /** cantidad para UNA porción */
  cantidadPorPorcion: number;
  unidad: Unidad;
}

export interface Receta {
  id: RecetaId;
  titulo: string;
  minutos: number;
  ingredientes: RecetaIngrediente[];
  equipo: string[];
  tipo: 'desayuno' | 'almuerzo' | 'comida' | 'in_the_middle';
  /** puntaje global del catálogo: terminadas, repetidas, estrellas, menos regeneraciones */
  ranking: number;
}

export interface ItemInventario {
  ingredienteId: IngredienteId;
  cantidad: number;
  unidad: Unidad;
  /** 0..1 — nunca se presenta como exacto */
  confianza: number;
  origen: 'escaneo' | 'factura' | 'manual';
  entroEn: Date;
  vistoEn: Date;
}

export type TipoRestriccion =
  'excluir_ingrediente' | 'tiempo_max' | 'mas_variedad' | 'mas_calorias' | 'sin_equipo';

export interface Restriccion {
  tipo: TipoRestriccion;
  valor: string;
}

/** Lo que devuelve el sistema de la nevera tras las dos pasadas de visión. */
export interface ItemDetectado {
  ingredienteId: IngredienteId;
  cantidad?: number;
  /** seguro = pasó las dos pasadas · posible = pasó una */
  certeza: 'seguro' | 'posible';
}

export interface LineaMercado {
  ingredienteId: IngredienteId;
  cantidadNecesaria: number;
  cantidadEnCasa: number;
  cantidadAComprar: number;
  unidad: Unidad;
  precioEstimado?: number;
  fuentePrecio?: 'estimado' | 'dato_abierto' | 'factura';
}
