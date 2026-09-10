import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import fc from 'fast-check';

import { siguienteValor, Stepper } from '../Stepper';
import { colores, opacidad, tactil } from '../tokens';
import { apoyarDedo, conOcultos, dibujar, estiloDe, levantarDedo } from './dibujar';

describe('siguienteValor', () => {
  const enteros = { minimo: 0, maximo: 8, paso: 1 };
  const medias = { minimo: 0.5, maximo: 8, paso: 0.5 };

  it('sube y baja un paso', () => {
    expect(siguienteValor(2, 1, enteros)).toBe(3);
    expect(siguienteValor(2, -1, enteros)).toBe(1);
  });

  it('con medias: 1 → 1,5 → 2', () => {
    expect(siguienteValor(1, 1, medias)).toBe(1.5);
    expect(siguienteValor(1.5, 1, medias)).toBe(2);
    expect(siguienteValor(1, -1, medias)).toBe(0.5);
  });

  it('nunca se sale de los límites', () => {
    expect(siguienteValor(8, 1, enteros)).toBe(8);
    expect(siguienteValor(0, -1, enteros)).toBe(0);
    expect(siguienteValor(0.5, -1, medias)).toBe(0.5);
  });

  it('un valor fuera de la rejilla cae en la más cercana', () => {
    expect(siguienteValor(1.3, 1, medias)).toBe(2);
    expect(siguienteValor(1.3, -1, medias)).toBe(1);
  });

  it('sin decimales de sobra: con pasos de 0,1, 0,2 y un paso más dan 0,3', () => {
    expect(siguienteValor(0.2, 1, { minimo: 0, maximo: 1, paso: 0.1 })).toBe(0.3);
  });

  it('siempre dentro de los límites y en la rejilla del paso, con cualquier valor', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(0.1, 0.25, 0.5, 1),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 20 }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.constantFrom(1 as const, -1 as const),
        (paso, minimo, ancho, valor, sentido) => {
          const maximo = minimo + ancho;
          const r = siguienteValor(valor, sentido, { minimo, maximo, paso });
          const pasos = r / paso;
          return r >= minimo && r <= maximo && Math.abs(pasos - Math.round(pasos)) < 1e-9;
        }
      )
    );
  });
});

type Props = Parameters<typeof Stepper>[0];

async function stepper(props: Partial<Props> = {}) {
  const alCambiar = jest.fn();
  await dibujar(
    <Stepper
      etiqueta="Porciones"
      valor={2}
      alCambiar={alCambiar}
      minimo={1}
      maximo={8}
      testID="s"
      {...props}
    />
  );
  return alCambiar;
}

const ajustable = () => screen.getByRole('adjustable', { name: 'Porciones' });
const voiceOver = (accion: string) =>
  fireEvent(ajustable(), 'accessibilityAction', { nativeEvent: { actionName: accion } });
const iconoDe = (boton: 'menos' | 'mas') =>
  screen.getByTestId(`s.${boton}.icono`, conOcultos).props.tintColor;

describe('Stepper', () => {
  it('VoiceOver lo lee como un control ajustable, con su nombre y su valor', async () => {
    await stepper();
    expect(ajustable().props.accessibilityValue).toEqual({ text: '2' });
    expect(ajustable().props.accessibilityActions).toEqual([
      { name: 'increment' },
      { name: 'decrement' },
    ]);
    expect(screen.getByText('Porciones')).toBeTruthy();
  });

  it('las medias se escriben con coma, en pantalla y en VoiceOver', async () => {
    await stepper({ valor: 1.5, paso: 0.5 });
    expect(screen.getByTestId('s.valor').props.children).toBe('1,5');
    expect(ajustable().props.accessibilityValue).toEqual({ text: '1,5' });
  });

  it('+ sube un paso y − baja un paso', async () => {
    const alCambiar = await stepper();
    const usuario = userEvent.setup();
    await usuario.press(screen.getByTestId('s.mas'));
    expect(alCambiar).toHaveBeenLastCalledWith(3);
    await usuario.press(screen.getByTestId('s.menos'));
    expect(alCambiar).toHaveBeenLastCalledWith(1);
  });

  it('con medias, sube de medio en medio', async () => {
    const alCambiar = await stepper({ valor: 1, paso: 0.5 });
    await userEvent.setup().press(screen.getByTestId('s.mas'));
    expect(alCambiar).toHaveBeenCalledWith(1.5);
  });

  it('en el mínimo, − se apaga y no hace nada; + sigue vivo', async () => {
    const alCambiar = await stepper({ valor: 1 });
    expect(screen.getByTestId('s.menos').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    await userEvent.setup().press(screen.getByTestId('s.menos'));
    expect(alCambiar).not.toHaveBeenCalled();
    expect(iconoDe('menos')).toBe(colores.claro.texto3);
    expect(iconoDe('mas')).toBe(colores.claro.acento);
  });

  it('en el máximo, + se apaga y no hace nada; − sigue vivo', async () => {
    const alCambiar = await stepper({ valor: 8 });
    await userEvent.setup().press(screen.getByTestId('s.mas'));
    expect(alCambiar).not.toHaveBeenCalled();
    expect(iconoDe('mas')).toBe(colores.claro.texto3);
    expect(iconoDe('menos')).toBe(colores.claro.acento);
  });

  it('VoiceOver: deslizar hacia arriba sube, hacia abajo baja', async () => {
    const alCambiar = await stepper();
    await voiceOver('increment');
    expect(alCambiar).toHaveBeenLastCalledWith(3);
    await voiceOver('decrement');
    expect(alCambiar).toHaveBeenLastCalledWith(1);
  });

  it('VoiceOver en un límite no hace nada', async () => {
    const enElMaximo = await stepper({ valor: 8 });
    await voiceOver('increment');
    expect(enElMaximo).not.toHaveBeenCalled();
    const enElMinimo = await stepper({ valor: 1 });
    await voiceOver('decrement');
    expect(enElMinimo).not.toHaveBeenCalled();
  });

  it('otra acción de VoiceOver no mueve el número', async () => {
    const alCambiar = await stepper();
    await voiceOver('activate');
    expect(alCambiar).not.toHaveBeenCalled();
  });

  it('los botones miden 44 pt y se atenúan mientras se tocan', async () => {
    await stepper();
    const mas = () => estiloDe(screen.getByTestId('s.mas'));
    expect(mas()).toMatchObject({ width: tactil.minimo, height: tactil.minimo });
    await apoyarDedo(screen.getByTestId('s.mas'));
    expect(mas().opacity).toBe(opacidad.pulsado);
    await levantarDedo(screen.getByTestId('s.mas'));
    expect(mas().opacity).toBeUndefined();
  });

  it('sin paso, va de uno en uno', async () => {
    const alCambiar = await stepper({ valor: 2 });
    await voiceOver('increment');
    expect(alCambiar).toHaveBeenCalledWith(3);
  });

  it('sin testID, se dibuja igual', async () => {
    await dibujar(
      <Stepper
        etiqueta="Porciones"
        valor={2}
        alCambiar={jest.fn()}
        minimo={1}
        maximo={8}
      />
    );
    expect(ajustable()).toBeTruthy();
  });
});
