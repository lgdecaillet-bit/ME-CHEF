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

import { letra, type VarianteDeTexto } from './letra';
import { useTema } from './tema';
import type { Colores } from './tokens';

export type { VarianteDeTexto };

export type ColorDeTexto = Extract<
  keyof Colores,
  'texto' | 'texto2' | 'texto3' | 'acento' | 'sobreAcento' | 'ambar' | 'rojo'
>;

const TITULOS: ReadonlySet<VarianteDeTexto> = new Set(['titulo1', 'titulo2', 'titulo3']);

type Props = {
  children: ReactNode;
  variante?: VarianteDeTexto;
  color?: ColorDeTexto;
  numberOfLines?: number;
  /** Centrado, para un texto que va solo en medio (`EstadoVacio`). */
  centrado?: boolean;
  testID?: string;
};

export function Texto({
  children,
  variante = 'cuerpo',
  color = 'texto',
  numberOfLines,
  centrado,
  testID,
}: Props) {
  const tema = useTema();
  const { style, ...escala } = letra(tema, variante);
  return (
    <Text
      accessibilityRole={TITULOS.has(variante) ? 'header' : undefined}
      {...escala}
      numberOfLines={numberOfLines}
      testID={testID}
      style={{
        ...style,
        color: tema.color[color],
        ...(centrado ? { textAlign: 'center' } : null),
      }}
    >
      {children}
    </Text>
  );
}
