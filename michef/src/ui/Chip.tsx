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
 * - Mide al menos 44 pt de alto, y VoiceOver lee su texto.
 */
import { Pressable, StyleSheet } from 'react-native';

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
      style={({ pressed }) => [
        estilos.base,
        {
          minHeight: tema.tactil.minimo,
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
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
});
