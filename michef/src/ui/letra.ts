/**
 * La letra de un estilo, con Dynamic Type. La comparten `Texto` y `Campo`, que
 * son los dos sitios donde se escribe letra.
 *
 * - Sin escala simulada, manda el iPhone: `allowFontScaling` encendido, y
 *   `maxFontSizeMultiplier` para que el estilo no pase del tope que iOS le da.
 * - Con escala simulada (solo la galería), el tamaño lo calcula esto, recortado
 *   al mismo tope, y se apaga la del iPhone para que no se multipliquen las dos.
 */
import type { Tema } from './tema';
import type { tipografia } from './tokens';

export type VarianteDeTexto = keyof typeof tipografia;

export function letra(tema: Tema, variante: VarianteDeTexto) {
  const { escalaMaxima, ...estilo } = tema.tipografia[variante];
  const simulada = tema.escalaDeLetra;
  const escala = simulada == null ? 1 : Math.min(simulada, escalaMaxima);
  return {
    allowFontScaling: simulada == null,
    maxFontSizeMultiplier: escalaMaxima,
    style: {
      ...estilo,
      fontSize: estilo.fontSize * escala,
      lineHeight: estilo.lineHeight * escala,
    },
  };
}
