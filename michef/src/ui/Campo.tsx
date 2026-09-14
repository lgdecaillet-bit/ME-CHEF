/**
 * Campo · la entrada de texto. Estados: vacío, con valor, error y deshabilitado.
 *
 * - La etiqueta va encima de la caja y siempre a la vista, como en los
 *   formularios de iOS (decisión #60.15). No se mueve y no tapa nada: con la
 *   letra grande crece, y si hace falta ocupa dos líneas.
 * - VoiceOver lee la etiqueta como el nombre del campo, y el error como pista.
 *   Cuando aparece un error, además lo dice en voz alta.
 * - El error va debajo, en rojo y con un icono: no depende solo del color.
 * - Lo que se escribe sigue Dynamic Type, con la misma letra que `Texto`.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, TextInput, View } from 'react-native';

import { Icono } from './Icono';
import { letra } from './letra';
import { useTema } from './tema';
import { Texto } from './Texto';

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
  const [enfocado, setEnfocado] = useState(false);

  useEffect(() => {
    if (error != null) AccessibilityInfo.announceForAccessibility(error);
  }, [error]);

  const { style: estiloDeLetra, ...escala } = letra(tema, 'cuerpo');
  const borde = error != null ? 'rojo' : enfocado ? 'acento' : 'borde';

  return (
    <View style={{ gap: tema.espacio.xs }}>
      {/* VoiceOver no la lee aparte: ya es el nombre del campo. */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID={testID && `${testID}.etiqueta`}
      >
        <Texto variante="secundario" color={error != null ? 'rojo' : 'texto2'}>
          {etiqueta}
        </Texto>
      </View>
      <View
        testID={testID && `${testID}.caja`}
        style={[
          estilos.caja,
          {
            minHeight: tema.tactil.minimo,
            paddingHorizontal: tema.espacio.l,
            paddingVertical: tema.espacio.s,
            borderRadius: tema.radio.m,
            borderColor: tema.color[borde],
            backgroundColor: tema.color[deshabilitado ? 'superficie2' : 'superficie'],
          },
        ]}
      >
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
  caja: { borderWidth: 1, justifyContent: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center' },
});
