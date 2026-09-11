/**
 * Etiqueta · lo que distingue lo medido de lo estimado. Aquí vive el principio 4
 * de diseno.md: «precio estimado ≠ leído de factura, ingrediente visto ≠
 * supuesto», y la distinción es visual, no solo textual.
 *
 * Seis tipos: seguro, posible, supuesto, estimado, real y aviso. Cada uno lleva
 * su icono además de su color, así que se distinguen también sin ver colores.
 * VoiceOver lee el texto, que dice lo mismo que el icono.
 */
import { StyleSheet, View } from 'react-native';

import { Icono, type NombreDeIcono } from './Icono';
import { useTema } from './tema';
import { Texto, type ColorDeTexto } from './Texto';

export type TipoDeEtiqueta =
  'seguro' | 'posible' | 'supuesto' | 'estimado' | 'real' | 'aviso';

const ASPECTO: Record<TipoDeEtiqueta, { icono: NombreDeIcono; color: ColorDeTexto }> = {
  // Lo que la app vio en la foto.
  seguro: { icono: 'checkmark.circle.fill', color: 'acento' },
  // Lo que cree haber visto, y pregunta.
  posible: { icono: 'questionmark.circle', color: 'ambar' },
  // Lo que da por hecho sin haberlo visto (la sal, el aceite).
  supuesto: { icono: 'circle.dashed', color: 'texto2' },
  // Un precio o una cantidad calculados, no leídos.
  estimado: { icono: 'plusminus.circle', color: 'texto2' },
  // Un precio leído de una factura.
  real: { icono: 'doc.text', color: 'texto' },
  // Lo que hay que mirar: una alergia, algo que caduca.
  aviso: { icono: 'exclamationmark.triangle.fill', color: 'rojo' },
};

type Props = {
  tipo: TipoDeEtiqueta;
  /** Lo que dice la etiqueta. Viene de `t()`. */
  texto: string;
  testID?: string;
};

export function Etiqueta({ tipo, texto, testID }: Props) {
  const tema = useTema();
  const aspecto = ASPECTO[tipo];
  return (
    <View
      accessible
      accessibilityLabel={texto}
      testID={testID}
      style={[
        estilos.base,
        {
          gap: tema.espacio.xs,
          paddingHorizontal: tema.espacio.s,
          paddingVertical: tema.espacio.xs,
          borderRadius: tema.radio.circulo,
          backgroundColor: tema.color.superficie2,
        },
      ]}
    >
      <Icono
        nombre={aspecto.icono}
        tamano="s"
        color={aspecto.color}
        testID={testID && `${testID}.icono`}
      />
      <Texto variante="nota" color={aspecto.color}>
        {texto}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
});
