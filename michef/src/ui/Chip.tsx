/**
 * Chip · una opción de un toque. Es el componente más usado de la app
 * (diseno.md, principio 3: chips, no listas).
 *
 * Estados: normal, seleccionado, pregunta, supuesto y deshabilitado.
 * - `pregunta`: lo que la app pregunta en vez de asumir. Ámbar, con borde
 *   punteado y con un icono de interrogación: no depende solo del color.
 * - `supuesto`: lo que la app da por hecho sin haberlo visto. Gris.
 * - Seleccionado, se rellena con el acento y lleva una marca, y VoiceOver dice
 *   «seleccionado». Manda sobre el tipo: una pregunta respondida ya no es duda.
 * - Se ve de 36 pt de alto, pero responde al dedo en 44 × 44 como mínimo
 *   (decisión #60.6). Lo que se toca es una zona transparente de 44 que lleva
 *   dentro la píldora visible, centrada: 4 pt invisibles arriba y abajo. No es un
 *   `hitSlop`, que React Native recorta al borde del contenedor, así que cumple
 *   esté donde esté. Por eso, entre dos filas de chips no hace falta espacio: esos
 *   4 + 4 pt ya los separan.
 * - VoiceOver lee su texto.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { Icono, type NombreDeIcono } from './Icono';
import { useTema } from './tema';
import { Texto, type ColorDeTexto } from './Texto';
import type { Colores } from './tokens';

type TipoDeChip = 'normal' | 'pregunta' | 'supuesto';

type Props = {
  /** Lo que se lee en el chip, y lo que dice VoiceOver. Viene de `t()`. */
  etiqueta: string;
  onPress: () => void;
  tipo?: TipoDeChip;
  seleccionado?: boolean;
  deshabilitado?: boolean;
  /** Lo que VoiceOver añade después, si el texto no basta. */
  pista?: string;
  testID?: string;
};

type Aspecto = {
  fondo: keyof Colores;
  borde: keyof Colores;
  letra: ColorDeTexto;
  icono?: NombreDeIcono;
  punteado?: boolean;
};

const ASPECTO: Record<TipoDeChip | 'seleccionado' | 'deshabilitado', Aspecto> = {
  normal: { fondo: 'superficie', borde: 'borde', letra: 'texto' },
  pregunta: {
    fondo: 'superficie',
    borde: 'ambar',
    letra: 'ambar',
    icono: 'questionmark.circle',
    punteado: true,
  },
  supuesto: { fondo: 'superficie2', borde: 'superficie2', letra: 'texto2' },
  seleccionado: {
    fondo: 'acento',
    borde: 'acento',
    letra: 'sobreAcento',
    icono: 'checkmark',
  },
  deshabilitado: { fondo: 'superficie2', borde: 'superficie2', letra: 'texto3' },
};

export function Chip({
  etiqueta,
  onPress,
  tipo = 'normal',
  seleccionado = false,
  deshabilitado = false,
  pista,
  testID,
}: Props) {
  const tema = useTema();
  const aspecto =
    ASPECTO[deshabilitado ? 'deshabilitado' : seleccionado ? 'seleccionado' : tipo];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityHint={pista}
      accessibilityState={{ selected: seleccionado, disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      testID={testID}
      style={[
        estilos.zona,
        { minHeight: tema.tactil.minimo, minWidth: tema.tactil.minimo },
      ]}
    >
      {({ pressed }) => (
        <View
          testID={testID && `${testID}.pildora`}
          style={[
            estilos.pildora,
            {
              minHeight: tema.chip.alto,
              paddingHorizontal: tema.espacio.l,
              gap: tema.espacio.xs,
              borderRadius: tema.radio.circulo,
              borderColor: tema.color[aspecto.borde],
              borderStyle: aspecto.punteado ? 'dashed' : 'solid',
              backgroundColor: tema.color[aspecto.fondo],
            },
            pressed && { opacity: tema.opacidad.pulsado },
          ]}
        >
          {aspecto.icono != null ? (
            <Icono
              nombre={aspecto.icono}
              tamano="s"
              color={aspecto.letra}
              testID={testID && `${testID}.icono`}
            />
          ) : null}
          <Texto color={aspecto.letra}>{etiqueta}</Texto>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  // Transparente: solo cuenta para el dedo. La píldora va en medio.
  zona: { alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
  pildora: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});
