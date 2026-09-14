/**
 * Boton · el botón de la app.
 *
 * Seis estados (diseno.md § 2.2): primario, secundario, terciario, destructivo,
 * deshabilitado y cargando.
 * - VoiceOver lee lo mismo que se ve: la etiqueta es el texto del botón (WCAG
 *   2.5.3). Lo que hace, si no es obvio, va en `pista`.
 * - Al pulsarlo, una vibración suave (háptico `light`), como en iOS.
 * - Mide al menos 44 pt de alto, lo mínimo tocable de Apple.
 * - Deshabilitado o cargando, no responde, y VoiceOver lo dice.
 */
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Icono, type NombreDeIcono } from './Icono';
import { useTema } from './tema';
import { Texto, type ColorDeTexto } from './Texto';
import type { Colores } from './tokens';

export type VarianteDeBoton = 'primario' | 'secundario' | 'terciario' | 'destructivo';

type Props = {
  /** Lo que se lee en el botón, y lo que dice VoiceOver. Viene de `t()`. */
  etiqueta: string;
  onPress: () => void;
  variante?: VarianteDeBoton;
  /** Lo que VoiceOver añade después: qué pasa al tocarlo, si no es obvio. */
  pista?: string;
  icono?: NombreDeIcono;
  deshabilitado?: boolean;
  cargando?: boolean;
  testID?: string;
};

// El fondo y la letra de cada variante. Cada par está en el test de contraste.
const ASPECTO: Record<
  VarianteDeBoton,
  { fondo: keyof Colores | null; letra: ColorDeTexto }
> = {
  primario: { fondo: 'acento', letra: 'sobreAcento' },
  secundario: { fondo: 'superficie2', letra: 'acento' },
  // Sin fondo, como un enlace: va sobre la pantalla o sobre una tarjeta.
  terciario: { fondo: null, letra: 'acento' },
  // Rojo sobre gris, como el «Eliminar» de iOS. No se rellena de rojo: lo que
  // borra algo no debe ser lo que más llama la atención de la pantalla.
  destructivo: { fondo: 'superficie2', letra: 'rojo' },
};

export function Boton({
  etiqueta,
  onPress,
  variante = 'primario',
  pista,
  icono,
  deshabilitado = false,
  cargando = false,
  testID,
}: Props) {
  const tema = useTema();
  const aspecto = ASPECTO[variante];
  // Deshabilitado, en gris. WCAG no pide contraste a lo que no se puede usar,
  // pero texto3 llega a AA de todas formas.
  const letra: ColorDeTexto = deshabilitado ? 'texto3' : aspecto.letra;
  const fondo =
    aspecto.fondo == null
      ? 'transparent'
      : tema.color[deshabilitado ? 'superficie2' : aspecto.fondo];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityHint={pista}
      accessibilityState={{ disabled: deshabilitado || cargando, busy: cargando }}
      disabled={deshabilitado || cargando}
      onPress={() => {
        // La vibración es un adorno: si el iPhone no la da (un simulador, o el
        // modo de bajo consumo), el botón hace lo suyo igual.
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPress();
      }}
      testID={testID}
      style={({ pressed }) => [
        estilos.base,
        {
          minHeight: tema.tactil.minimo,
          paddingHorizontal: tema.espacio.l,
          paddingVertical: tema.espacio.s,
          gap: tema.espacio.s,
          borderRadius: tema.radio.m,
          backgroundColor: fondo,
        },
        pressed && { opacity: tema.opacidad.pulsado },
      ]}
    >
      {cargando ? (
        <ActivityIndicator
          color={tema.color[letra]}
          testID={testID && `${testID}.cargando`}
        />
      ) : icono != null ? (
        <Icono nombre={icono} color={letra} testID={testID && `${testID}.icono`} />
      ) : null}
      <Texto variante="cuerpoFuerte" color={letra} centrado>
        {etiqueta}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
