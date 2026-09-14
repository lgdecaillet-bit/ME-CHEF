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
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTema } from './tema';
import { useMovimientoReducido } from './useMovimientoReducido';

type Props = {
  modo?: 'linea' | 'pantalla';
  /** Qué se está cargando, para VoiceOver. Viene de `t()`. */
  descripcion: string;
  testID?: string;
};

export function Cargando({ modo = 'linea', descripcion, testID }: Props) {
  const tema = useTema();
  const reducido = useMovimientoReducido();
  // La opacidad de los bloques. Vive en el hilo de la interfaz (Reanimated,
  // decisión #60.2): el latido no se para aunque la app esté ocupada.
  const latido = useSharedValue(1);

  useEffect(() => {
    if (reducido) {
      cancelAnimation(latido);
      latido.set(1);
      return undefined;
    }
    const paso = (hasta: number) =>
      withTiming(hasta, { duration: tema.movimiento.lento });
    // -1: sin fin. Baja hasta el latido y vuelve, una y otra vez.
    latido.set(withRepeat(withSequence(paso(tema.opacidad.latido), paso(1)), -1));
    return () => cancelAnimation(latido);
  }, [reducido, latido, tema.movimiento.lento, tema.opacidad.latido]);

  const estiloDelLatido = useAnimatedStyle(() => ({ opacity: latido.get() }));

  const bloque = { backgroundColor: tema.color.superficie2 };
  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={descripcion}
      accessibilityState={{ busy: true }}
      testID={testID}
      style={[
        {
          gap: tema.espacio.s,
          ...(modo === 'pantalla' ? { flex: 1, padding: tema.espacio.l } : null),
        },
        estiloDelLatido,
      ]}
    >
      {modo === 'pantalla' ? (
        <View
          testID={testID && `${testID}.bloque`}
          style={[
            bloque,
            {
              height: tema.cargando.bloque,
              borderRadius: tema.radio.l,
              marginBottom: tema.espacio.s,
            },
          ]}
        />
      ) : null}
      {tema.cargando.lineas.map((ancho) => (
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
