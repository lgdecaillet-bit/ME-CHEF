/**
 * El tema · ME CHEF
 *
 * `ProveedorTema` mira si el iPhone está en claro o en oscuro y entrega los
 * tokens de ese modo. Se monta una vez, en `src/app/_layout.tsx`, y cualquier
 * pieza los pide con `useTema()`. Si el usuario cambia el modo con la app
 * abierta, todo se vuelve a pintar solo.
 *
 * La galería monta un segundo proveedor dentro del primero, para forzar un modo
 * o simular un tamaño de letra sin tocar los ajustes del teléfono.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  colores,
  espacio,
  movimiento,
  radio,
  tactil,
  tipografia,
  type Colores,
  type Esquema,
} from './tokens';

export type Tema = {
  esquema: Esquema;
  color: Colores;
  tipografia: typeof tipografia;
  espacio: typeof espacio;
  radio: typeof radio;
  movimiento: typeof movimiento;
  tactil: typeof tactil;
  /**
   * Solo la galería lo fija, para simular Dynamic Type. Sin él, el tamaño de
   * la letra lo decide el iPhone.
   */
  escalaDeLetra?: number;
};

const ContextoDelTema = createContext<Tema | null>(null);

type Props = {
  children: ReactNode;
  /** Fuerza un modo. Sin él, manda el del iPhone. */
  esquema?: Esquema;
  escalaDeLetra?: number;
};

export function ProveedorTema({ children, esquema, escalaDeLetra }: Props) {
  // iOS puede no decir el modo (`null` o 'unspecified'). Entonces, claro, que
  // es el del sistema por defecto.
  const delTelefono = useColorScheme();
  const elegido: Esquema = esquema ?? (delTelefono === 'dark' ? 'oscuro' : 'claro');
  const tema: Tema = {
    esquema: elegido,
    color: colores[elegido],
    tipografia,
    espacio,
    radio,
    movimiento,
    tactil,
    escalaDeLetra,
  };
  return <ContextoDelTema.Provider value={tema}>{children}</ContextoDelTema.Provider>;
}

export function useTema(): Tema {
  const tema = useContext(ContextoDelTema);
  if (tema == null) {
    throw new Error(
      'useTema() se usó fuera de <ProveedorTema>. El proveedor se monta en src/app/_layout.tsx.'
    );
  }
  return tema;
}
