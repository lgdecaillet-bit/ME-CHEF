/**
 * Campo · la entrada de texto. Estados: vacío, con valor, error y deshabilitado.
 *
 * - La etiqueta está dentro del campo mientras está vacío, y sube a la esquina
 *   al tocarlo o al escribir («etiqueta flotante»): siempre se sabe qué se está
 *   escribiendo. Con «Reducir movimiento», sube sin animarse.
 * - VoiceOver lee la etiqueta como el nombre del campo, y el error como pista.
 *   Cuando aparece un error, además lo dice en voz alta.
 * - El error va debajo, en rojo y con un icono: no depende solo del color.
 * - La letra sigue Dynamic Type, como `Texto`, y el sitio de la etiqueta crece
 *   con ella. La etiqueta va en una sola línea, y si no cabe se corta con «…»:
 *   así, con la letra que sea, la de arriba no tapa lo escrito. VoiceOver la oye
 *   entera, porque es el nombre del campo.
 */
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { Icono } from './Icono';
import { letra } from './letra';
import { useTema } from './tema';
import { Texto } from './Texto';
import { useMovimientoReducido } from './useMovimientoReducido';

type Props = {
  /** El nombre del campo: lo que se ve y lo que dice VoiceOver. Viene de `t()`. */
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  /** Qué está mal y cómo se arregla. Viene de `t()`. */
  error?: string;
  /** Lo que VoiceOver añade después del nombre, si no hay error. */
  pista?: string;
  deshabilitado?: boolean;
  testID?: string;
};

export function Campo({
  etiqueta,
  valor,
  alCambiar,
  error,
  pista,
  deshabilitado = false,
  testID,
}: Props) {
  const tema = useTema();
  const { fontScale } = useWindowDimensions();
  const reducido = useMovimientoReducido();
  const [enfocado, setEnfocado] = useState(false);
  const arriba = enfocado || valor.length > 0;
  // El mismo valor animado durante toda la vida del campo: 0 abajo, 1 arriba.
  const [posicion] = useState(() => new Animated.Value(arriba ? 1 : 0));

  useEffect(() => {
    if (reducido) {
      posicion.setValue(arriba ? 1 : 0);
      return undefined;
    }
    const animacion = Animated.timing(posicion, {
      toValue: arriba ? 1 : 0,
      duration: tema.movimiento.rapido,
      useNativeDriver: true,
    });
    animacion.start();
    return () => animacion.stop();
  }, [arriba, reducido, posicion, tema.movimiento.rapido]);

  useEffect(() => {
    if (error != null) AccessibilityInfo.announceForAccessibility(error);
  }, [error]);

  const { style: estiloDeLetra, ...escala } = letra(tema, 'cuerpo');
  const pequena = tema.tipografia.nota.fontSize / tema.tipografia.cuerpo.fontSize;
  // El alto de una línea del cuerpo con la letra de ahora (la que simula la
  // galería o la del iPhone, con el tope del estilo). Arriba del todo va la
  // etiqueta encogida, y debajo lo que se escribe: así no se tocan nunca.
  const crece = Math.min(
    tema.escalaDeLetra ?? fontScale,
    tema.tipografia.cuerpo.escalaMaxima
  );
  const linea = tema.tipografia.cuerpo.lineHeight * crece;
  const arribaDelTexto = tema.espacio.xs + linea * pequena + tema.espacio.xs;
  const borde = error != null ? 'rojo' : enfocado ? 'acento' : 'borde';

  return (
    <View style={{ gap: tema.espacio.xs }}>
      <View
        testID={testID && `${testID}.caja`}
        style={[
          estilos.caja,
          {
            minHeight: tema.tactil.minimo + tema.espacio.l,
            paddingHorizontal: tema.espacio.l,
            paddingTop: arribaDelTexto,
            paddingBottom: tema.espacio.s,
            borderRadius: tema.radio.m,
            borderColor: tema.color[borde],
            backgroundColor: tema.color[deshabilitado ? 'superficie2' : 'superficie'],
          },
        ]}
      >
        {/* VoiceOver no la lee aparte: ya es el nombre del campo. */}
        <Animated.View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          testID={testID && `${testID}.etiqueta`}
          style={[
            estilos.etiqueta,
            {
              left: tema.espacio.l,
              // Sin borde derecho, una etiqueta larga crecería hasta partirse en
              // dos líneas, y la de arriba volvería a tapar lo escrito.
              right: tema.espacio.l,
              // Abajo, en la línea donde se escribe; arriba, pegada al borde.
              top: arribaDelTexto,
              transform: [
                {
                  translateY: posicion.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, tema.espacio.xs - arribaDelTexto],
                  }),
                },
                {
                  scale: posicion.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, pequena],
                  }),
                },
              ],
            },
          ]}
        >
          <Texto color={error != null ? 'rojo' : 'texto2'} numberOfLines={1}>
            {etiqueta}
          </Texto>
        </Animated.View>
        <TextInput
          value={valor}
          onChangeText={alCambiar}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          editable={!deshabilitado}
          accessibilityLabel={etiqueta}
          accessibilityHint={error ?? pista}
          accessibilityState={{ disabled: deshabilitado }}
          selectionColor={tema.color.acento}
          testID={testID}
          {...escala}
          style={[
            estiloDeLetra,
            { color: tema.color[deshabilitado ? 'texto3' : 'texto'] },
          ]}
        />
      </View>
      {error != null ? (
        <View style={[estilos.fila, { gap: tema.espacio.xs }]}>
          <Icono
            nombre="exclamationmark.circle"
            tamano="s"
            color="rojo"
            testID={testID && `${testID}.error.icono`}
          />
          <Texto variante="nota" color="rojo" testID={testID && `${testID}.error`}>
            {error}
          </Texto>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { borderWidth: 1 },
  // Encogida desde su esquina de arriba a la izquierda: al subir no se va hacia
  // el centro, y su borde de arriba queda donde se le dice.
  etiqueta: { position: 'absolute', transformOrigin: 'left top' },
  fila: { flexDirection: 'row', alignItems: 'center' },
});
