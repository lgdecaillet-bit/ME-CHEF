/**
 * Aviso · un mensaje corto que aparece y se va solo a los 3 s (un «toast»). No
 * bloquea: la pantalla sigue usable debajo.
 *
 * Tres tipos, cada uno con su icono además de su color: info, éxito y error.
 * - Al aparecer, VoiceOver lo lee en voz alta, esté donde esté el foco.
 * - A los 3 s llama a `alCerrar`. Dónde se pone y cuándo se quita lo decide
 *   quien lo muestra: la cola de avisos llega con su primer uso (decisión #59).
 * - Un error que pide hacer algo no va en un Aviso, que se va solo: va en la
 *   pantalla, junto a lo que hay que arreglar (como el error de un `Campo`).
 */
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { Icono, type NombreDeIcono } from './Icono';
import { useTema } from './tema';
import { Texto, type ColorDeTexto } from './Texto';

export type TipoDeAviso = 'info' | 'exito' | 'error';

const ASPECTO: Record<TipoDeAviso, { icono: NombreDeIcono; color: ColorDeTexto }> = {
  info: { icono: 'info.circle.fill', color: 'texto2' },
  exito: { icono: 'checkmark.circle.fill', color: 'acento' },
  error: { icono: 'exclamationmark.triangle.fill', color: 'rojo' },
};

type Props = {
  tipo: TipoDeAviso;
  /** Lo que dice. Corto: se va solo a los 3 s. Viene de `t()`. */
  texto: string;
  alCerrar: () => void;
  testID?: string;
};

export function Aviso({ tipo, texto, alCerrar, testID }: Props) {
  const tema = useTema();
  // El último `alCerrar`, sin reiniciar la cuenta cada vez que llega uno nuevo.
  const alCerrarActual = useRef(alCerrar);
  useEffect(() => {
    alCerrarActual.current = alCerrar;
  });

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(texto);
    const reloj = setTimeout(() => alCerrarActual.current(), tema.duracion.aviso);
    return () => clearTimeout(reloj);
  }, [texto, tema.duracion.aviso]);

  const aspecto = ASPECTO[tipo];
  return (
    <View
      testID={testID}
      style={[
        estilos.fila,
        {
          gap: tema.espacio.s,
          paddingHorizontal: tema.espacio.l,
          paddingVertical: tema.espacio.m,
          borderRadius: tema.radio.l,
          backgroundColor: tema.color.superficie,
          shadowColor: tema.color.sombra,
          shadowOpacity: tema.opacidad.sombra,
          shadowRadius: tema.espacio.s,
          shadowOffset: { width: 0, height: tema.espacio.xs },
        },
      ]}
    >
      <Icono
        nombre={aspecto.icono}
        color={aspecto.color}
        testID={testID && `${testID}.icono`}
      />
      <View style={estilos.texto}>
        <Texto>{texto}</Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  texto: { flex: 1 },
});
