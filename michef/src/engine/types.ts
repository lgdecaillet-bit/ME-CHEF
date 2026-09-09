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

/**
 * Lo que devuelve `escalarReceta`: cantidades YA multiplicadas por las porciones
 * del hogar. Es un tipo aparte a propósito (arreglo de BUG-7). Antes devolvía
 * `RecetaIngrediente`, cuyo campo se llama `cantidadPorPorcion`, con el total
 * dentro. Encadenar dos escalados multiplicaba dos veces y el tipo no delataba
 * nada. Ahora encadenar por accidente ni siquiera compila.
 */
export interface IngredienteEscalado {
  ingredienteId: IngredienteId;
  cantidadTotal: number;
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
  /**
   * Gramos o mililitros. **Opcional a propósito** (arreglo de BUG-1): una foto
   * de nevera casi siempre dice QUÉ hay, no CUÁNTO. `undefined` significa
   * «está, no sé cuánto», que no es lo mismo que `0` («no queda»). Confundir
   * los dos borraba del inventario la mitad de lo que la cámara reconocía.
   */
  cantidad?: number;
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
