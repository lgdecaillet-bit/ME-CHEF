/**
 * Tres recetas con lo que hay. Es un FILTRO sobre el catálogo, no una
 * generación: por eso el primer resultado nunca puede salir mal escrito.
 *
 * Regla dura (CLAUDE.md): una receta solo puede usar ingredientes marcados
 * como `seguro` más la despensa básica del hogar. Nunca inventar.
 */
import type { Comensal, ItemDetectado, Receta, Restriccion } from './types';

export interface OpcionReceta {
  receta: Receta;
  /** cuántos de los ingredientes vistos en la foto aprovecha */
  visiblesUsados: number;
  puntaje: number;
}

export function recetasConLoQueHay(
  catalogo: Receta[],
  detectado: ItemDetectado[],
  despensaBasica: string[],
  /**
   * Arreglo de BUG-5. **Obligatorio y en cuarto lugar a propósito.** Una alergia
   * es una restricción DURA, y el comportamiento por defecto de una función de
   * seguridad no puede ser «inseguro salvo que quien llama se acuerde». Antes,
   * `Comensal.noCome` existía en el modelo y en la base de datos, pero esta
   * función no lo veía: había que traducirlo a mano a una restricción
   * `excluir_ingrediente`, y nada obligaba a hacerlo.
   *
   * Con un valor por defecto seguiría escapándose: bastaría olvidar el argumento
   * para volver al comportamiento roto, y el compilador callaría. Un hogar sin
   * comensales registrados pasa `[]`, que es una afirmación explícita, no un
   * descuido.
   */
  comensales: Comensal[],
  restricciones: Restriccion[] = [],
  cuantas = 3
): OpcionReceta[] {
  const seguros = new Set(
    detectado.filter((d) => d.certeza === 'seguro').map((d) => d.ingredienteId)
  );
  const disponibles = new Set([...seguros, ...despensaBasica]);

  // Lo que el usuario pide en la sesión MÁS lo que no come nadie del hogar.
  // Lo segundo no es negociable ni depende de quién llame a esta función.
  const excluidos = new Set([
    ...restricciones.filter((r) => r.tipo === 'excluir_ingrediente').map((r) => r.valor),
    ...comensales.flatMap((c) => c.noCome ?? []),
  ]);
  const sinEquipo = new Set(
    restricciones.filter((r) => r.tipo === 'sin_equipo').map((r) => r.valor)
  );
  const tiempoMax = restricciones.find((r) => r.tipo === 'tiempo_max');
  const limiteMinutos = tiempoMax ? Number(tiempoMax.valor) : Infinity;

  return catalogo
    .filter((r) => {
      // TODOS sus ingredientes deben estar disponibles. Sin excepciones.
      if (!r.ingredientes.every((i) => disponibles.has(i.ingredienteId))) return false;
      if (r.ingredientes.some((i) => excluidos.has(i.ingredienteId))) return false;
      if (r.equipo.some((e) => sinEquipo.has(e))) return false;
      if (r.minutos > limiteMinutos) return false;
      return true;
    })
    .map((receta) => {
      const visiblesUsados = receta.ingredientes.filter((i) =>
        seguros.has(i.ingredienteId)
      ).length;
      return {
        receta,
        visiblesUsados,
        // Aprovechar lo que se ve pesa más que el ranking global.
        puntaje: visiblesUsados * 10 + receta.ranking,
      };
    })
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, cuantas);
}
