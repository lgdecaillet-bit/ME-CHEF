/**
 * Datos personales — viven cifrados en el teléfono (SQLCipher) y no salen de él.
 *
 * Única excepción de salida: las líneas de factura ya mapeadas se suben sin
 * identidad a la tabla compartida de precios, y solo con consentimiento.
 *
 * NO se guarda aquí (se calcula): lista de mercado, macros de receta,
 * pills derivadas. Ver CLAUDE.md.
 */
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/** Unidad de cocina. Una familia o una persona sola: mismo modelo. */
export const hogar = sqliteTable('hogar', {
  id: text('id').primaryKey(),
  pais: text('pais').notNull(), // ISO 3166-1 alfa-2: CH, CO, ES
  moneda: text('moneda').notNull(), // ISO 4217: CHF, COP, EUR
  idioma: text('idioma').notNull(), // es, fr, de
  minutosPorComida: integer('minutos_por_comida'), // null = 30 por defecto
  minutosDiarios: integer('minutos_diarios'),
  presupuestoSemanal: real('presupuesto_semanal'),
  comidasPorDia: integer('comidas_por_dia'),
  comeEnCasa: integer('come_en_casa', { mode: 'boolean' }),
  /** ids de ingredientes que se asumen presentes. Se confirma en un toque. */
  despensaBasica: text('despensa_basica', { mode: 'json' }).$type<string[]>(),
  creadoEn: integer('creado_en', { mode: 'timestamp' }).notNull(),
});

/** Quien come. El factor de porción resuelve las familias sin IA. */
export const comensal = sqliteTable('comensal', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  nombre: text('nombre'),
  /** 1.0 adulto · 1.4 adolescente · 0.7 niño · 1.8 intake alto */
  factorPorcion: real('factor_porcion').notNull().default(1),
  objetivoId: text('objetivo_id'),
  /** ids de ingredientes que no come (alergias, rechazos) */
  noCome: text('no_come', { mode: 'json' }).$type<string[]>(),
});

/**
 * Objetivo ya medible, nunca vago. Versionado: cambiarlo abre uno nuevo y el
 * anterior queda como historial. Todo plan referencia el objetivo con el que
 * se generó. Dato sensible: no sale del teléfono.
 */
export const objetivo = sqliteTable('objetivo', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  tipo: text('tipo').notNull().$type<'calorias' | 'macros' | 'habito' | 'gasto'>(),
  valor: real('valor'),
  unidad: text('unidad'), // kcal/dia, g/dia, porciones/dia, CHF/semana
  descripcion: text('descripcion').notNull(),
  vigenteDesde: integer('vigente_desde', { mode: 'timestamp' }).notNull(),
  vigenteHasta: integer('vigente_hasta', { mode: 'timestamp' }),
});

/** Un plan agrupa bloques de máximo 4 semanas. */
export const plan = sqliteTable('plan', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  objetivoId: text('objetivo_id')
    .notNull()
    .references(() => objetivo.id),
  bocetoAprobado: integer('boceto_aprobado', { mode: 'boolean' })
    .notNull()
    .default(false),
  creadoEn: integer('creado_en', { mode: 'timestamp' }).notNull(),
});

export const semana = sqliteTable('semana', {
  id: text('id').primaryKey(),
  planId: text('plan_id')
    .notNull()
    .references(() => plan.id),
  numero: integer('numero').notNull(), // 1..4 dentro del bloque
  detallada: integer('detallada', { mode: 'boolean' }).notNull().default(false),
  aprobada: integer('aprobada', { mode: 'boolean' }).notNull().default(false),
  activa: integer('activa', { mode: 'boolean' }).notNull().default(false),
});

/** Un slot. Es lo único que une el plan con el catálogo compartido. */
export const comidaPlanificada = sqliteTable('comida_planificada', {
  id: text('id').primaryKey(),
  semanaId: text('semana_id')
    .notNull()
    .references(() => semana.id),
  dia: integer('dia').notNull(), // 0 = lunes
  tipo: text('tipo')
    .notNull()
    .$type<'desayuno' | 'almuerzo' | 'comida' | 'in_the_middle'>(),
  recetaId: text('receta_id').notNull(), // → catálogo compartido
  porciones: real('porciones').notNull(), // Σ factores de los comensales
  estado: text('estado')
    .notNull()
    .$type<'pendiente' | 'cocinada' | 'saltada' | 'reemplazada'>(),
});

/** La foto se descarta al confirmar. Quedan las líneas. */
export const factura = sqliteTable('factura', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  tiendaId: text('tienda_id'), // → catálogo compartido
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  total: real('total'),
  moneda: text('moneda'),
  subidaAPrecios: integer('subida_a_precios', { mode: 'boolean' })
    .notNull()
    .default(false),
});

export const lineaFactura = sqliteTable('linea_factura', {
  id: text('id').primaryKey(),
  facturaId: text('factura_id')
    .notNull()
    .references(() => factura.id),
  textoOriginal: text('texto_original').notNull(),
  productoId: text('producto_id'), // → catálogo compartido; null = sin mapear
  cantidad: real('cantidad'),
  precio: real('precio'),
  estado: text('estado').notNull().$type<'mapeada' | 'dudosa' | 'ignorada'>(),
});

/**
 * Lo que probablemente hay. Siempre estimado, nunca se presenta como exacto.
 * Entra por escaneo o factura, sale al cocinar, decae con el tiempo.
 */
export const inventario = sqliteTable('inventario', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  ingredienteId: text('ingrediente_id').notNull(), // → catálogo compartido
  cantidad: real('cantidad').notNull(), // gramos o mililitros
  estado: text('estado').$type<'cerrado' | 'abierto' | 'resto'>(),
  confianza: real('confianza').notNull(), // 0..1
  origen: text('origen').notNull().$type<'escaneo' | 'factura' | 'manual'>(),
  entroEn: integer('entro_en', { mode: 'timestamp' }).notNull(), // para perecibilidad
  vistoEn: integer('visto_en', { mode: 'timestamp' }).notNull(),
});

/**
 * Un porqué ya estructurado. Es un filtro permanente del selector y del
 * catálogo: así funciona el "no repetir" sin memoria del modelo.
 */
export const restriccion = sqliteTable('restriccion', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  tipo: text('tipo')
    .notNull()
    .$type<
      | 'excluir_ingrediente'
      | 'tiempo_max'
      | 'mas_variedad'
      | 'mas_calorias'
      | 'sin_equipo'
    >(),
  valor: text('valor').notNull(),
  origen: text('origen'), // qué rechazó y cuándo
  permanente: integer('permanente', { mode: 'boolean' }).notNull().default(true),
  creadaEn: integer('creada_en', { mode: 'timestamp' }).notNull(),
});

/** Una sesión de foto de nevera. Las fotos NO se guardan. */
export const escaneo = sqliteTable('escaneo', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  tomas: integer('tomas').notNull().default(1),
  calidadLuz: real('calidad_luz'),
  calidadEnfoque: real('calidad_enfoque'),
});

export const itemDetectado = sqliteTable('item_detectado', {
  id: text('id').primaryKey(),
  escaneoId: text('escaneo_id')
    .notNull()
    .references(() => escaneo.id),
  ingredienteId: text('ingrediente_id'),
  cantidad: real('cantidad'),
  /** seguro = pasó las dos pasadas · posible = pasó una. Solo `seguro` genera recetas. */
  certeza: text('certeza').notNull().$type<'seguro' | 'posible'>(),
  x: real('x'),
  y: real('y'),
  corregidoA: text('corregido_a'), // qué dijo el usuario que era realmente
});

/** Timestamps. La materia prima de los patrones de horario. */
export const evento = sqliteTable('evento', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  tipo: text('tipo').notNull(),
  contexto: text('contexto', { mode: 'json' }),
  ocurridoEn: integer('ocurrido_en', { mode: 'timestamp' }).notNull(),
});

export const resena = sqliteTable('resena', {
  id: text('id').primaryKey(),
  hogarId: text('hogar_id')
    .notNull()
    .references(() => hogar.id),
  recetaId: text('receta_id').notNull(),
  estrellas: integer('estrellas'),
  texto: text('texto'),
  creadaEn: integer('creada_en', { mode: 'timestamp' }).notNull(),
});
