import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet, useColorScheme } from 'react-native';

import { colores, duracion, tipografia } from '@/ui/tokens';

import Galeria from '../app/(dev)/galeria';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
// Quieta: sin latidos ni etiquetas que viajen, para no depender del reloj.
jest.mock('@/ui/useMovimientoReducido', () => ({ useMovimientoReducido: () => true }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));
const modoDelIphone = useColorScheme as jest.Mock;

const global_ = globalThis as unknown as { __DEV__: boolean };
const devOriginal = global_.__DEV__;

beforeEach(() => modoDelIphone.mockReturnValue('light'));
afterEach(() => {
  global_.__DEV__ = devOriginal;
  jest.useRealTimers();
});

// Los iconos de adorno están ocultos para VoiceOver, y RNTL no los ve si no se
// le pide.
const conOcultos = { includeHiddenElements: true };
const fondo = () =>
  StyleSheet.flatten(screen.getByTestId('galeria').props.style).backgroundColor;
const muestra = (variante: string) => screen.getByTestId(`galeria.texto.${variante}`);
const letra = (variante: string) =>
  StyleSheet.flatten(muestra(variante).props.style).fontSize;
const elegido = (testID: string) =>
  screen.getByTestId(testID).props.accessibilityState?.selected;

// Cada componente de diseno.md § 2.2, en cada uno de sus estados.
const ESTADOS = [
  ...[
    'primario',
    'secundario',
    'terciario',
    'destructivo',
    'deshabilitado',
    'cargando',
  ].map((e) => `galeria.boton.${e}`),
  ...['normal', 'seleccionado', 'pregunta', 'supuesto', 'deshabilitado'].map(
    (e) => `galeria.chip.${e}`
  ),
  ...['normal', 'pulsable', 'conEtiqueta'].map((e) => `galeria.tarjeta.${e}`),
  ...['seguro', 'posible', 'supuesto', 'estimado', 'real', 'aviso'].map(
    (e) => `galeria.etiqueta.${e}`
  ),
  ...['vacio', 'conValor', 'error', 'deshabilitado'].map((e) => `galeria.campo.${e}`),
  ...['normal', 'minimo', 'maximo'].map((e) => `galeria.stepper.${e}`),
  ...['conAccion', 'sinAccion'].map((e) => `galeria.vacio.${e}`),
  ...['linea', 'pantalla'].map((e) => `galeria.cargando.${e}`),
  'galeria.aviso.mostrar',
  ...['s', 'm', 'l', 'xl', 'conDescripcion'].map((e) => `galeria.icono.${e}`),
  ...['mitad', 'completo'].map((e) => `galeria.progreso.${e}`),
];

describe('galería', () => {
  it('enseña cada componente en cada uno de sus estados', async () => {
    await render(<Galeria />);
    for (const testID of ESTADOS) {
      expect(screen.getByTestId(testID, conOcultos)).toBeTruthy();
    }
  });

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
    expect(elegido('galeria.modo.sistema')).toBe(true);
  });

  it('«Oscuro» la pone en oscuro con el iPhone en claro, y «Del iPhone» la devuelve', async () => {
    await render(<Galeria />);
    expect(fondo()).toBe(colores.claro.fondo);
    await fireEvent.press(screen.getByTestId('galeria.modo.oscuro'));
    expect(fondo()).toBe(colores.oscuro.fondo);
    const filaFondo = within(screen.getByTestId('galeria.color.fondo'));
    expect(filaFondo.getByText(colores.oscuro.fondo)).toBeTruthy();
    expect(elegido('galeria.modo.oscuro')).toBe(true);
    expect(elegido('galeria.modo.sistema')).toBe(false);
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
    expect(elegido('galeria.letra.grande')).toBe(true);
    await fireEvent.press(screen.getByTestId('galeria.letra.maxima'));
    expect(letra('cuerpo')).toBeCloseTo(53);
    expect(letra('titulo1')).toBeCloseTo(60);
    await fireEvent.press(screen.getByTestId('galeria.letra.iphone'));
    expect(letra('cuerpo')).toBe(17);
    expect(muestra('cuerpo').props.allowFontScaling).toBe(true);
  });

  it('las muestras no hacen nada al tocarlas: enseñan cómo se ven', async () => {
    await render(<Galeria />);
    await fireEvent.press(screen.getByTestId('galeria.boton.primario'));
    await fireEvent.press(screen.getByTestId('galeria.chip.normal'));
    expect(screen.getByTestId('galeria')).toBeTruthy();
    expect(elegido('galeria.chip.normal')).toBe(false);
  });

  it('el chip de muestra se elige y se suelta', async () => {
    await render(<Galeria />);
    expect(elegido('galeria.chip.seleccionado')).toBe(true);
    await fireEvent.press(screen.getByTestId('galeria.chip.seleccionado'));
    expect(elegido('galeria.chip.seleccionado')).toBe(false);
  });

  it('el campo con error lo pierde en cuanto se escribe algo', async () => {
    await render(<Galeria />);
    expect(screen.getByTestId('galeria.campo.error.error')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('galeria.campo.error'), 'Tomate');
    expect(screen.queryByTestId('galeria.campo.error.error')).toBeNull();
  });

  it('los campos de muestra se pueden escribir', async () => {
    await render(<Galeria />);
    await fireEvent.changeText(screen.getByTestId('galeria.campo.vacio'), 'Cebolla');
    expect(screen.getByTestId('galeria.campo.vacio').props.value).toBe('Cebolla');
    await fireEvent.changeText(screen.getByTestId('galeria.campo.conValor'), 'Ajo');
    expect(screen.getByTestId('galeria.campo.conValor').props.value).toBe('Ajo');
  });

  it('el stepper de muestra va de medio en medio', async () => {
    await render(<Galeria />);
    await fireEvent.press(screen.getByTestId('galeria.stepper.normal.mas'));
    expect(screen.getByTestId('galeria.stepper.normal.valor').props.children).toBe('2,5');
  });

  it('los avisos salen con su botón y se van solos a los 3 s', async () => {
    jest.useFakeTimers();
    await render(<Galeria />);
    expect(screen.queryByTestId('galeria.aviso.info')).toBeNull();
    await fireEvent.press(screen.getByTestId('galeria.aviso.mostrar'));
    for (const tipo of ['info', 'exito', 'error']) {
      expect(screen.getByTestId(`galeria.aviso.${tipo}`)).toBeTruthy();
    }
    await act(() => jest.advanceTimersByTime(duracion.aviso));
    expect(screen.queryByTestId('galeria.aviso.info')).toBeNull();
    expect(screen.queryByTestId('galeria.aviso.error')).toBeNull();
  });

  it('en producción no dibuja nada', async () => {
    global_.__DEV__ = false;
    await render(<Galeria />);
    expect(screen.queryByTestId('galeria')).toBeNull();
    expect(screen.toJSON()).toBeNull();
  });
});
