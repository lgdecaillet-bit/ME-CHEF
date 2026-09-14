import { act, screen } from '@testing-library/react-native';
import { cancelAnimation, getAnimatedStyle } from 'react-native-reanimated';

import { Cargando } from '../Cargando';
import { cargando, colores, espacio, movimiento, opacidad } from '../tokens';
import { useMovimientoReducido } from '../useMovimientoReducido';
import { dibujar, estiloDe } from './dibujar';

jest.mock('../useMovimientoReducido', () => ({ useMovimientoReducido: jest.fn() }));
const reducido = useMovimientoReducido as jest.Mock;

// La de verdad, espiada: se comprueba que el latido se cancela al irse.
jest.mock('react-native-reanimated', () => {
  const real = jest.requireActual('react-native-reanimated');
  // `__esModule` no se copia al esparcir, y sin él `import Animated` se rompe.
  return { __esModule: true, ...real, cancelAnimation: jest.fn(real.cancelAnimation) };
});

// Las animaciones de Reanimated avanzan con el reloj falso de Jest (jest.setup.js).
beforeEach(() => {
  jest.useFakeTimers();
  reducido.mockReturnValue(true);
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

const pasan = (ms: number) => act(() => jest.advanceTimersByTime(ms));
const opacidadDe = (testID: string) =>
  Number(getAnimatedStyle(screen.getByTestId(testID)).opacity);

describe('Cargando', () => {
  it('VoiceOver dice qué se está cargando, y que está ocupado', async () => {
    await dibujar(<Cargando descripcion="Cargando recetas" testID="c" />);
    const barra = screen.getByRole('progressbar', { name: 'Cargando recetas' });
    expect(barra.props.accessibilityState).toMatchObject({ busy: true });
  });

  it('en línea: tres líneas grises de largo distinto, sin bloque grande', async () => {
    await dibujar(<Cargando descripcion="Cargando" testID="c" />);
    const lineas = screen.getAllByTestId('c.linea').map(estiloDe);
    expect(lineas.map((l) => l.width)).toEqual(cargando.lineas);
    expect(lineas.every((l) => l.backgroundColor === colores.claro.superficie2)).toBe(
      true
    );
    expect(screen.queryByTestId('c.bloque')).toBeNull();
    expect(estiloDe(screen.getByTestId('c')).flex).toBeUndefined();
  });

  it('pantalla: un bloque grande arriba y tres líneas, ocupando la pantalla', async () => {
    await dibujar(<Cargando modo="pantalla" descripcion="Cargando" testID="c" />);
    expect(estiloDe(screen.getByTestId('c.bloque')).height).toBe(cargando.bloque);
    expect(screen.getAllByTestId('c.linea')).toHaveLength(3);
    expect(estiloDe(screen.getByTestId('c'))).toMatchObject({
      flex: 1,
      padding: espacio.l,
    });
  });

  it('late: baja hasta la opacidad de latido, vuelve, y sigue sin parar', async () => {
    reducido.mockReturnValue(false);
    await dibujar(<Cargando descripcion="Cargando" testID="c" />);
    expect(opacidadDe('c')).toBe(1);
    await pasan(movimiento.lento / 2);
    expect(opacidadDe('c')).toBeGreaterThan(opacidad.latido);
    expect(opacidadDe('c')).toBeLessThan(1);
    await pasan(movimiento.lento / 2);
    expect(opacidadDe('c')).toBeCloseTo(opacidad.latido, 1);
    await pasan(movimiento.lento);
    expect(opacidadDe('c')).toBeCloseTo(1, 1);
    // Una segunda vuelta: el bucle no se acaba en la primera.
    await pasan(movimiento.lento);
    expect(opacidadDe('c')).toBeCloseTo(opacidad.latido, 1);
  });

  it('con «Reducir movimiento», no late: se queda a opacidad entera', async () => {
    await dibujar(<Cargando descripcion="Cargando" testID="c" />);
    await pasan(movimiento.lento);
    expect(opacidadDe('c')).toBe(1);
  });

  it('si «Reducir movimiento» se activa mientras late, se para y se queda entero', async () => {
    reducido.mockReturnValue(false);
    await dibujar(<Cargando descripcion="Cargando" testID="c" />);
    await pasan(movimiento.lento / 2);
    expect(opacidadDe('c')).toBeLessThan(1);
    reducido.mockReturnValue(true);
    await screen.rerender(<Cargando descripcion="Cargando" testID="c" />);
    await pasan(movimiento.lento);
    expect(opacidadDe('c')).toBe(1);
  });

  it('al irse de la pantalla, el latido se cancela', async () => {
    reducido.mockReturnValue(false);
    const { unmount } = await dibujar(<Cargando descripcion="Cargando" />);
    (cancelAnimation as jest.Mock).mockClear();
    await unmount();
    expect(cancelAnimation).toHaveBeenCalledTimes(1);
  });

  it('en oscuro, los bloques con el gris del modo oscuro', async () => {
    await dibujar(<Cargando descripcion="Cargando" testID="c" />, { esquema: 'oscuro' });
    expect(screen.getAllByTestId('c.linea').map(estiloDe)[0]?.backgroundColor).toBe(
      colores.oscuro.superficie2
    );
  });

  it('sin testID, se dibuja igual', async () => {
    await dibujar(<Cargando modo="pantalla" descripcion="Cargando recetas" />);
    expect(screen.getByRole('progressbar', { name: 'Cargando recetas' })).toBeTruthy();
  });
});
