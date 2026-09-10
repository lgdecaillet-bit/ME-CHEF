/**
 * Texto · el único sitio de la app donde vive `<Text>`.
 *
 * ESLint prohíbe importar `Text` fuera de `src/ui/`, así que todo texto en
 * pantalla pasa por aquí, y hereda tres cosas sin que nadie tenga que
 * acordarse:
 * - el estilo de la escala de iOS y el color del modo, claro u oscuro;
 * - Dynamic Type: crece con el tamaño de letra de los Ajustes del iPhone, hasta
 *   el tope que iOS le da a ese estilo;
 * - los títulos se anuncian como encabezado en VoiceOver, que es como se salta
 *   de sección en sección.
 *
 * Lo que dice el texto no se escribe aquí: viene de `t()` (src/i18n).
 */
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { useTema } from './tema';
import type { Colores, tipografia } from './tokens';

export type VarianteDeTexto = keyof typeof tipografia;

type ColorDeTexto = Extract<
  keyof Colores,
  'texto' | 'texto2' | 'texto3' | 'acento' | 'sobreAcento' | 'ambar' | 'rojo'
>;

const TITULOS: ReadonlySet<VarianteDeTexto> = new Set(['titulo1', 'titulo2', 'titulo3']);

type Props = {
  children: ReactNode;
  variante?: VarianteDeTexto;
  color?: ColorDeTexto;
  numberOfLines?: number;
  testID?: string;
};

export function Texto({
  children,
  variante = 'cuerpo',
  color = 'texto',
  numberOfLines,
  testID,
}: Props) {
  const tema = useTema();
  const { escalaMaxima, ...estilo } = tema.tipografia[variante];
  // Con una escala simulada (solo en la galería) el tamaño lo calcula el tema,
  // y se apaga el del iPhone para que no se multipliquen los dos.
  const simulada = tema.escalaDeLetra;
  const escala = simulada == null ? 1 : Math.min(simulada, escalaMaxima);
  return (
    <Text
      accessibilityRole={TITULOS.has(variante) ? 'header' : undefined}
      allowFontScaling={simulada == null}
      maxFontSizeMultiplier={escalaMaxima}
      numberOfLines={numberOfLines}
      testID={testID}
      style={{
        ...estilo,
        fontSize: estilo.fontSize * escala,
        lineHeight: estilo.lineHeight * escala,
        color: tema.color[color],
      }}
    >
      {children}
    </Text>
  );
}
