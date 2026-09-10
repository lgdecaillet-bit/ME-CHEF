// Ayudas de los tests de src/ui/. No es un test: Jest solo corre los *.test.tsx.
import { act, fireEvent, render } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { ProveedorTema } from '../tema';
import type { Esquema } from '../tokens';

type Opciones = { esquema?: Esquema; escalaDeLetra?: number };

/**
 * Dibuja una pieza dentro del tema: en claro, salvo que se pida otro modo. El
 * tema va como `wrapper`, así que `rerender` lo conserva.
 */
export function dibujar(
  elemento: ReactElement,
  { esquema = 'claro', escalaDeLetra }: Opciones = {}
) {
  function Envoltura({ children }: { children: ReactNode }) {
    return (
      <ProveedorTema esquema={esquema} escalaDeLetra={escalaDeLetra}>
        {children}
      </ProveedorTema>
    );
  }
  return render(elemento, { wrapper: Envoltura });
}

/** El estilo de un elemento, aplanado: lo que de verdad se pinta. */
export function estiloDe(elemento: {
  props: { style?: unknown };
}): ViewStyle & TextStyle {
  return (
    StyleSheet.flatten(elemento.props.style as StyleProp<ViewStyle & TextStyle>) ?? {}
  );
}

type Elemento = Parameters<typeof fireEvent>[0];

// Un toque de dedo, con lo mínimo que mira `Pressable` para saber si está
// «pulsado».
function toque() {
  return {
    persist: () => undefined,
    currentTarget: { measure: () => undefined },
    nativeEvent: {
      changedTouches: [],
      identifier: 0,
      locationX: 0,
      locationY: 0,
      pageX: 0,
      pageY: 0,
      target: 0,
      timestamp: Date.now(),
      touches: [],
    },
  };
}

/** Apoya el dedo y no lo levanta: para ver cómo se ve algo mientras se toca. */
export async function apoyarDedo(elemento: Elemento) {
  await fireEvent(elemento, 'responderGrant', toque());
}

// `Pressable` deja algo «pulsado» al menos 130 ms aunque el dedo se levante
// antes (DEFAULT_MIN_PRESS_DURATION), para que el toque se llegue a ver.
const PULSACION_MINIMA_MS = 130;

/** Levanta el dedo, y espera lo que `Pressable` tarda en darlo por suelto. */
export async function levantarDedo(elemento: Elemento) {
  await fireEvent(elemento, 'responderRelease', toque());
  await act(() => new Promise((listo) => setTimeout(listo, PULSACION_MINIMA_MS + 20)));
}

/** RNTL no ve lo que VoiceOver no ve (los iconos de adorno) si no se le pide. */
export const conOcultos = { includeHiddenElements: true };
