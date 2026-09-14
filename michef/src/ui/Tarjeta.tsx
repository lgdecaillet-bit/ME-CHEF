/**
 * Tarjeta · agrupa lo que va junto sobre una superficie. Es la base de
 * `TarjetaReceta` (Fase 1).
 *
 * Estados: normal, pulsable y con etiqueta.
 * - Pulsable, es un botón: VoiceOver lee todo lo que tiene dentro como su
 *   nombre, que es lo que se ve (WCAG 2.5.3), y se atenúa al tocarla.
 * - Con etiqueta, la `Etiqueta` va arriba, antes que el contenido.
 */
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Etiqueta, type TipoDeEtiqueta } from './Etiqueta';
import { useTema } from './tema';

type Props = {
  children: ReactNode;
  /** Si se le pasa, la tarjeta entera es un botón. */
  onPress?: () => void;
  /** Lo que VoiceOver añade después de leerla, si es pulsable. */
  pista?: string;
  etiqueta?: { tipo: TipoDeEtiqueta; texto: string };
  testID?: string;
};

export function Tarjeta({ children, onPress, pista, etiqueta, testID }: Props) {
  const tema = useTema();
  const estilo = {
    gap: tema.espacio.s,
    padding: tema.espacio.l,
    borderRadius: tema.radio.l,
    backgroundColor: tema.color.superficie,
  };
  const contenido = (
    <>
      {etiqueta != null ? <Etiqueta tipo={etiqueta.tipo} texto={etiqueta.texto} /> : null}
      {children}
    </>
  );
  if (onPress == null) {
    return (
      <View testID={testID} style={estilo}>
        {contenido}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={pista}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [estilo, pressed && { opacity: tema.opacidad.pulsado }]}
    >
      {contenido}
    </Pressable>
  );
}
