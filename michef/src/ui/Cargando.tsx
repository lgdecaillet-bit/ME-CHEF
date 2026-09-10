/**
 * Cargando · lo que se ve mientras algo llega: bloques grises con la forma de lo
 * que va a aparecer, que laten despacio. Nunca una ruedita sola, que no dice qué
 * viene (diseno.md § 2.2).
 *
 * Estados:
 * - `linea`: tres líneas de texto, dentro de una pantalla;
 * - `pantalla`: un bloque grande y tres líneas debajo, para una pantalla entera.
 *
 * VoiceOver dice qué se está cargando (`descripcion`) y que está ocupado. Con
 * «Reducir movimiento», los bloques no laten. Solo es la forma: qué hacer si
 * tarda o si falla lo dice la pantalla, que es quien lo sabe.
 */
import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { useTema } from './tema';
import { useMovimientoReducido } from './useMovimientoReducido';

type Props = {
  modo?: 'linea' | 'pantalla';
  /** Qué se está cargando, para VoiceOver. Viene de `t()`. */
  descripcion: string;
  testID?: string;
};

// Tres líneas de largo distinto, como un párrafo de verdad.
const LINEAS = ['100%', '85%', '60%'] as const;

export function Cargando({ modo = 'linea', descripcion, testID }: Props) {
  const tema = useTema();
  const reducido = useMovimientoReducido();
  // El mismo valor animado durante toda la vida del componente.
  const [latido] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reducido) {
      latido.setValue(1);
      return undefined;
    }
    const paso = (hasta: number) =>
      Animated.timing(latido, {
        toValue: hasta,
        duration: tema.movimiento.lento,
        useNativeDriver: true,
      });
    const bucle = Animated.loop(Animated.sequence([paso(tema.opacidad.latido), paso(1)]));
    bucle.start();
    return () => bucle.stop();
  }, [reducido, latido, tema.movimiento.lento, tema.opacidad.latido]);

  const bloque = { backgroundColor: tema.color.superficie2 };
  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={descripcion}
      accessibilityState={{ busy: true }}
      testID={testID}
      style={{
        opacity: latido,
        gap: tema.espacio.s,
        ...(modo === 'pantalla' ? { flex: 1, padding: tema.espacio.l } : null),
      }}
    >
      {modo === 'pantalla' ? (
        <View
          testID={testID && `${testID}.bloque`}
          style={[
            bloque,
            {
              height: tema.espacio.xxxl * 4,
              borderRadius: tema.radio.l,
              marginBottom: tema.espacio.s,
            },
          ]}
        />
      ) : null}
      {LINEAS.map((ancho) => (
        <View
          key={ancho}
          testID={testID && `${testID}.linea`}
          style={[
            bloque,
            {
              width: ancho,
              height: tema.tipografia.cuerpo.lineHeight,
              borderRadius: tema.radio.s,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}
