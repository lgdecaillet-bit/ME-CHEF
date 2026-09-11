import { act, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { Aviso } from '../Aviso';
import { colores, duracion, opacidad } from '../tokens';
import { conOcultos, dibujar, estiloDe } from './dibujar';

let anunciar: jest.SpyInstance;

beforeEach(() => {
  jest.useFakeTimers();
  anunciar = jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
});

afterEach(() => {
  jest.useRealTimers();
});

const pasan = (ms: number) => act(() => jest.advanceTimersByTime(ms));

describe('Aviso', () => {
  it('al aparecer, VoiceOver lo lee en voz alta, una vez', async () => {
    await dibujar(<Aviso tipo="exito" texto="Receta guardada." alCerrar={jest.fn()} />);
    expect(screen.getByText('Receta guardada.')).toBeTruthy();
    expect(anunciar).toHaveBeenCalledTimes(1);
    expect(anunciar).toHaveBeenCalledWith('Receta guardada.');
  });

  it('a los 3 s se cierra solo, y ni un momento antes', async () => {
    const alCerrar = jest.fn();
    await dibujar(<Aviso tipo="info" texto="Guardé tu lista." alCerrar={alCerrar} />);
    await pasan(duracion.aviso - 1);
    expect(alCerrar).not.toHaveBeenCalled();
    await pasan(1);
    expect(alCerrar).toHaveBeenCalledTimes(1);
    expect(duracion.aviso).toBe(3000);
  });

  it('si le llega otro alCerrar, la cuenta sigue donde iba y avisa al último', async () => {
    const primero = jest.fn();
    const ultimo = jest.fn();
    await dibujar(<Aviso tipo="info" texto="Guardé tu lista." alCerrar={primero} />);
    await pasan(2000);
    await screen.rerender(
      <Aviso tipo="info" texto="Guardé tu lista." alCerrar={ultimo} />
    );
    await pasan(1000);
    expect(ultimo).toHaveBeenCalledTimes(1);
    expect(primero).not.toHaveBeenCalled();
  });

  it('con otro texto, lo vuelve a leer y la cuenta empieza de nuevo', async () => {
    const alCerrar = jest.fn();
    await dibujar(<Aviso tipo="info" texto="Uno." alCerrar={alCerrar} />);
    await pasan(2000);
    await screen.rerender(<Aviso tipo="info" texto="Dos." alCerrar={alCerrar} />);
    expect(anunciar).toHaveBeenLastCalledWith('Dos.');
    await pasan(2000);
    expect(alCerrar).not.toHaveBeenCalled();
    await pasan(1000);
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it('si lo quitan antes de tiempo, no avisa a nadie', async () => {
    const alCerrar = jest.fn();
    const { unmount } = await dibujar(
      <Aviso tipo="error" texto="No pude guardar." alCerrar={alCerrar} />
    );
    await pasan(1000);
    await unmount();
    await pasan(5000);
    expect(alCerrar).not.toHaveBeenCalled();
  });

  it.each([
    ['info', 'info.circle.fill', 'texto2'],
    ['exito', 'checkmark.circle.fill', 'acento'],
    ['error', 'exclamationmark.triangle.fill', 'rojo'],
  ] as const)('%s: icono %s en %s, no solo el color', async (tipo, icono, color) => {
    await dibujar(<Aviso tipo={tipo} texto="Hola." alCerrar={jest.fn()} testID="a" />);
    expect(screen.getByTestId('a.icono', conOcultos).props).toMatchObject({
      name: icono,
      tintColor: colores.claro[color],
    });
  });

  it('el texto va siempre en el color de texto, y el aviso flota con su sombra', async () => {
    await dibujar(<Aviso tipo="error" texto="Hola." alCerrar={jest.fn()} testID="a" />);
    expect(estiloDe(screen.getByText('Hola.')).color).toBe(colores.claro.texto);
    expect(estiloDe(screen.getByTestId('a'))).toMatchObject({
      backgroundColor: colores.claro.superficie,
      shadowColor: colores.claro.sombra,
      shadowOpacity: opacidad.sombra,
    });
  });

  it('sin testID, se dibuja igual', async () => {
    await dibujar(<Aviso tipo="exito" texto="Listo." alCerrar={jest.fn()} />);
    expect(screen.getByText('Listo.')).toBeTruthy();
  });
});
