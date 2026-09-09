/**
 * Fusión: escaneo de nevera y facturas contra el inventario.
 *
 * Este es el corazón de la función central y NO es IA: son reglas.
 * La foto nunca da un inventario completo (cosas tapadas, cajones, tuppers),
 * así que lo que no se ve NO se borra: baja de confianza.
 */
import type { ItemDetectado, ItemInventario } from './types';

/** Confianza que se le da a lo detectado según cuántas pasadas superó. */
const CONFIANZA = { seguro: 0.9, posible: 0.4 } as const;

/** Cuánto baja la confianza de algo que la foto no vio, pero estaba registrado. */
const PENALIZACION_NO_VISTO = 0.5;

/** Umbral a partir del cual una línea deja de contar para recetas y lista. */
export const UMBRAL_CONFIABLE = 0.6;

export function fusionarEscaneo(
  inventarioActual: ItemInventario[],
  detectado: ItemDetectado[],
  ahora: Date = new Date()
): ItemInventario[] {
  const porId = new Map(inventarioActual.map((i) => [i.ingredienteId, { ...i }]));
  const vistos = new Set<string>();

  for (const d of detectado) {
    vistos.add(d.ingredienteId);
    const existente = porId.get(d.ingredienteId);
    if (existente) {
      // La foto manda sobre lo registrado: si dice 8 huevos, son 8.
      if (d.cantidad != null) existente.cantidad = d.cantidad;
      existente.confianza = CONFIANZA[d.certeza];
      existente.vistoEn = ahora;
      existente.origen = 'escaneo';
    } else {
      porId.set(d.ingredienteId, {
        ingredienteId: d.ingredienteId,
        // Sin `?? 0`: lo que la foto no cuenta entra SIN cantidad, no con cero.
        // La lista de mercado ya sabe tratar una cantidad desconocida.
        cantidad: d.cantidad,
        unidad: 'g',
        confianza: CONFIANZA[d.certeza],
        origen: 'escaneo',
        entroEn: ahora,
        vistoEn: ahora,
      });
    }
  }

  // Lo que estaba registrado y la foto no vio: probablemente está detrás de algo.
  for (const [id, item] of porId) {
    if (!vistos.has(id) && item.origen !== 'manual') {
      item.confianza = item.confianza * PENALIZACION_NO_VISTO;
    }
  }

  // El filtro mira la CONFIANZA, no la cantidad. Un ingrediente sin cantidad
  // conocida sigue estando en la nevera y sigue sirviendo para hacer recetas;
  // uno con cantidad 0 sí se va, porque eso significa que se acabó.
  return [...porId.values()].filter(
    (i) => (i.cantidad == null || i.cantidad > 0) && i.confianza > 0.1
  );
}

/** Al terminar de cocinar, lo usado sale del inventario. */
export function descontarCocinado(
  inventario: ItemInventario[],
  usados: { ingredienteId: string; cantidad: number }[]
): ItemInventario[] {
  const porId = new Map(inventario.map((i) => [i.ingredienteId, { ...i }]));
  for (const u of usados) {
    const item = porId.get(u.ingredienteId);
    if (!item) continue;
    // Si no se sabía cuánto había, cocinar no lo convierte en un número: sigue
    // sin saberse. Restar sobre un cero inventado daría un inventario falso.
    if (item.cantidad == null) continue;
    item.cantidad = Math.max(0, item.cantidad - u.cantidad);
  }
  return [...porId.values()].filter((i) => i.cantidad == null || i.cantidad > 0);
}

/**
 * "Esto se te va a dañar." Sale gratis del mismo dato: perecibilidad del
 * ingrediente más la fecha en que entró. Sin modelo.
 */
export function porVencerse(
  inventario: ItemInventario[],
  perecibilidadDias: Record<string, number>,
  ahora: Date = new Date(),
  avisarConDias = 2
): ItemInventario[] {
  return inventario
    .filter((i) => {
      const dias = perecibilidadDias[i.ingredienteId];
      if (dias == null) return false;
      const transcurridos = (ahora.getTime() - i.entroEn.getTime()) / 86_400_000;
      return dias - transcurridos <= avisarConDias;
    })
    .sort((a, b) => a.entroEn.getTime() - b.entroEn.getTime());
}
