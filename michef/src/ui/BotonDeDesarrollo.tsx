/**
 * Botón de desarrollo · PROVISIONAL, solo para herramientas de desarrollo.
 *
 * Existe porque, desde D6.5a, ESLint prohíbe `Pressable` fuera de `src/ui/`, y
 * la pantalla inicial tiene dos botones que solo salen en desarrollo: el que
 * prueba Sentry y el que abre la galería. El `Boton` de verdad llega en D6.5b,
 * con sus seis estados y el háptico, y entonces este se borra.
 *
 * Aun siendo provisional, cumple lo que se le pide a cualquier control:
 * - la etiqueta de VoiceOver es obligatoria: sin `descripcion` no compila;
 * - mide al menos 44 pt de alto, lo mínimo tocable de Apple;
 * - colores y medidas salen del tema.
 */
import { Pressable, StyleSheet } from 'react-native';

import { useTema } from './tema';
import { Texto } from './Texto';

type Props = {
  /** Lo que se lee en el botón. Viene de `t()`. */
  etiqueta: string;
  /** Lo que dice VoiceOver: qué hace el botón. Viene de `t()`. */
  descripcion: string;
  onPress: () => void;
  testID: string;
  /** `peligro`, para lo que rompe algo a propósito. */
  tono?: 'normal' | 'peligro';
  /** En un grupo de opciones, si esta es la elegida. VoiceOver lo dice. */
  seleccionado?: boolean;
};

export function BotonDeDesarrollo({
  etiqueta,
  descripcion,
  onPress,
  testID,
  tono = 'normal',
  seleccionado,
}: Props) {
  const tema = useTema();
  const color = tono === 'peligro' ? 'rojo' : 'acento';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={descripcion}
      accessibilityState={seleccionado == null ? undefined : { selected: seleccionado }}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        estilos.base,
        {
          minHeight: tema.tactil.minimo,
          paddingHorizontal: tema.espacio.l,
          borderRadius: tema.radio.m,
          borderColor: tema.color[color],
          backgroundColor: seleccionado ? tema.color[color] : tema.color.superficie,
        },
        pressed && estilos.pulsado,
      ]}
    >
      <Texto color={seleccionado ? 'sobreAcento' : color}>{etiqueta}</Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  pulsado: { opacity: 0.6 },
});
