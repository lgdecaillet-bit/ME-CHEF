import { screen } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { Cargando } from '../Cargando';
import { colores, espacio, movimiento, opacidad } from '../tokens';
import { useMovimientoReducido } from '../useMovimientoReducido';
import { dibujar, estiloDe } from './dibujar';

jest.mock('../useMovimientoReducido', () => ({ useMovimientoReducido: jest.fn() }));
const reducido = useMovimientoReducido as jest.Mock;

const bucle = { start: jest.fn(), stop: jest.fn(), reset: jest.fn() };

beforeEach(() => {
  reducido.mockReturnValue(true);
  jest.spyOn(Animated, 'loop').mockReturnValue(bucle);
});

describe('Cargando', () => {
  it('VoiceOver dice qué se está cargando, y que está ocupado', async () => {
    await dibujar(<Cargando descripcion="Cargando recetas" testID="c" />);
    const barra = screen.getByRole('progressbar', { name: 'Cargando recetas' });
    expect(barra.props.accessibilityState).toMatchObject({ busy: true });
  });

  it('en línea: tres líneas grises de largo distinto, sin bloque grande', async () => {
    await dibujar(<Cargando descripcion="Cargando" testID="c" />);
    const lineas = screen.getAllByTestId('c.linea').map(estiloDe);
    expect(lineas.map((l) => l.width)).toEqual(['100%', '85%', '60%']);
    expect(lineas.every((l) => l.backgroundColor === colores.claro.superficie2)).toBe(
      true
    );
    expect(screen.queryByTestId('c.bloque')).toBeNull();
    expect(estiloDe(screen.getByTestId('c')).flex).toBeUndefined();
  });

  it('pantalla: un bloque grande arriba y tres líneas, ocupando la pantalla', async () => {
    await dibujar(<Cargando modo="pantalla" descripcion="Cargando" testID="c" />);
    expect(estiloDe(screen.getByTestId('c.bloque')).height).toBe(espacio.xxxl * 4);
    expect(screen.getAllByTestId('c.linea')).toHaveLength(3);
    expect(estiloDe(screen.getByTestId('c'))).toMatchObject({
      flex: 1,
      padding: espacio.l,
    });
  });

  it('late: baja hasta la opacidad de latido y vuelve, despacio y sin parar', async () => {
    reducido.mockReturnValue(false);
    const timing = jest.spyOn(Animated, 'timing');
    const { unmount } = await dibujar(<Cargando descripcion="Cargando" />);
    expect(timing.mock.calls.map(([, config]) => config)).toEqual([
      { toValue: opacidad.latido, duration: movimiento.lento, useNativeDriver: true },
      { toValue: 1, duration: movimiento.lento, useNativeDriver: true },
    ]);
    expect(bucle.start).toHaveBeenCalledTimes(1);
    await unmount();
    expect(bucle.stop).toHaveBeenCalledTimes(1);
  });

  it('con «Reducir movimiento», no late: se queda a opacidad entera', async () => {
    await dibujar(<Cargando descripcion="Cargando" testID="c" />);
    expect(Animated.loop).not.toHaveBeenCalled();
    expect(estiloDe(screen.getByTestId('c')).opacity).toBe(1);
  });

  it('si «Reducir movimiento» se activa mientras late, se para y se queda entero', async () => {
    reducido.mockReturnValue(false);
    await dibujar(<Cargando descripcion="Cargando" testID="c" />);
    reducido.mockReturnValue(true);
    await screen.rerender(<Cargando descripcion="Cargando" testID="c" />);
    expect(bucle.stop).toHaveBeenCalledTimes(1);
    expect(estiloDe(screen.getByTestId('c')).opacity).toBe(1);
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
