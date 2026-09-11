/**
 * Icono · el único sitio de la app con iconos: los SF Symbols de iOS, con
 * `expo-symbols`. ESLint prohíbe `expo-symbols` fuera de `src/ui/`.
 *
 * - El color es un color de texto del tema, nunca un hex.
 * - Crece con el tamaño de letra del iPhone, como los iconos de las apps de
 *   Apple, hasta el doble (`icono.escalaMaxima` en tokens.ts).
 * - Sin `descripcion`, VoiceOver lo salta: casi siempre va junto a un texto que
 *   ya dice lo mismo, y leerlo dos veces estorba. Con `descripcion`, es una
 *   imagen con nombre.
 */
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useWindowDimensions } from 'react-native';

import { useTema } from './tema';
import type { ColorDeTexto } from './Texto';
import type { icono } from './tokens';

/** El nombre de un SF Symbol, como sale en la app «SF Symbols» de Apple. */
export type NombreDeIcono = Extract<SymbolViewProps['name'], string>;

type Props = {
  nombre: NombreDeIcono;
  tamano?: keyof typeof icono.tamano;
  color?: ColorDeTexto;
  /** Lo que dice VoiceOver. Solo si el icono va solo, sin texto al lado. */
  descripcion?: string;
  testID?: string;
};

export function Icono({
  nombre,
  tamano = 'm',
  color = 'texto',
  descripcion,
  testID,
}: Props) {
  const tema = useTema();
  const { fontScale } = useWindowDimensions();
  // La escala de la galería si la hay; si no, la del iPhone. Con tope.
  const escala = Math.min(tema.escalaDeLetra ?? fontScale, tema.icono.escalaMaxima);
  return (
    <SymbolView
      name={nombre}
      size={tema.icono.tamano[tamano] * escala}
      tintColor={tema.color[color]}
      testID={testID}
      {...(descripcion == null
        ? {
            accessible: false,
            accessibilityElementsHidden: true,
            importantForAccessibility: 'no-hide-descendants' as const,
          }
        : {
            accessible: true,
            accessibilityRole: 'image' as const,
            accessibilityLabel: descripcion,
          })}
    />
  );
}
