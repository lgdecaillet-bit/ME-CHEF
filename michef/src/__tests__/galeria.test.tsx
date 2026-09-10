import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet, useColorScheme } from 'react-native';

import { colores, tipografia } from '@/ui/tokens';

import Galeria from '../app/(dev)/galeria';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const modoDelIphone = useColorScheme as jest.Mock;

const global_ = globalThis as unknown as { __DEV__: boolean };
const devOriginal = global_.__DEV__;

beforeEach(() => modoDelIphone.mockReturnValue('light'));
afterEach(() => {
  global_.__DEV__ = devOriginal;
});

const fondo = () =>
  StyleSheet.flatten(screen.getByTestId('galeria').props.style).backgroundColor;
const muestra = (variante: string) => screen.getByTestId(`galeria.texto.${variante}`);
const letra = (variante: string) =>
  StyleSheet.flatten(muestra(variante).props.style).fontSize;

describe('galería', () => {
  it('enseña cada color con su valor, cada estilo de texto, los espacios y los radios', async () => {
    await render(<Galeria />);
    for (const [nombre, valor] of Object.entries(colores.claro)) {
      const fila = within(screen.getByTestId(`galeria.color.${nombre}`));
      expect(fila.getByText(nombre)).toBeTruthy();
      expect(fila.getByText(valor)).toBeTruthy();
    }
    for (const variante of Object.keys(tipografia)) {
      expect(muestra(variante).props.children).toBe('Veo 7 cosas en tu nevera.');
    }
    expect(screen.getByText('xxxl · 48 pt')).toBeTruthy();
    expect(screen.getByText('circulo · 999 pt')).toBeTruthy();
  });

  it('sigue el modo del iPhone mientras no se elija otro', async () => {
    modoDelIphone.mockReturnValue('dark');
    await render(<Galeria />);
    expect(fondo()).toBe(colores.oscuro.fondo);
    expect(
      screen.getByRole('button', {
        name: 'Ver la galería en el modo del iPhone',
        selected: true,
      })
    ).toBeTruthy();
  });

  it('«Oscuro» la pone en oscuro con el iPhone en claro, y «Del iPhone» la devuelve', async () => {
    await render(<Galeria />);
    expect(fondo()).toBe(colores.claro.fondo);
    await fireEvent.press(screen.getByTestId('galeria.modo.oscuro'));
    expect(fondo()).toBe(colores.oscuro.fondo);
    const filaFondo = within(screen.getByTestId('galeria.color.fondo'));
    expect(filaFondo.getByText(colores.oscuro.fondo)).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: 'Ver la galería en modo oscuro',
        selected: true,
      })
    ).toBeTruthy();
    await fireEvent.press(screen.getByTestId('galeria.modo.sistema'));
    expect(fondo()).toBe(colores.claro.fondo);
  });

  it('«Claro» la pone en claro con el iPhone en oscuro', async () => {
    modoDelIphone.mockReturnValue('dark');
    await render(<Galeria />);
    await fireEvent.press(screen.getByTestId('galeria.modo.claro'));
    expect(fondo()).toBe(colores.claro.fondo);
  });

  it('simula la letra grande y la máxima, cada estilo hasta su tope', async () => {
    await render(<Galeria />);
    expect(letra('cuerpo')).toBe(17);
    expect(muestra('cuerpo').props.allowFontScaling).toBe(true);
    await fireEvent.press(screen.getByTestId('galeria.letra.grande'));
    expect(letra('cuerpo')).toBeCloseTo(17 * 1.353);
    await fireEvent.press(screen.getByTestId('galeria.letra.maxima'));
    expect(letra('cuerpo')).toBeCloseTo(53);
    expect(letra('titulo1')).toBeCloseTo(60);
    await fireEvent.press(screen.getByTestId('galeria.letra.iphone'));
    expect(letra('cuerpo')).toBe(17);
    expect(muestra('cuerpo').props.allowFontScaling).toBe(true);
  });

  it('en producción no dibuja nada', async () => {
    global_.__DEV__ = false;
    await render(<Galeria />);
    expect(screen.queryByTestId('galeria')).toBeNull();
    expect(screen.toJSON()).toBeNull();
  });
});
