import { fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Animated } from 'react-native';

import { Campo } from '../Campo';
import { colores, espacio, movimiento, tipografia } from '../tokens';
import { useMovimientoReducido } from '../useMovimientoReducido';
import { conOcultos, dibujar, estiloDe } from './dibujar';

jest.mock('../useMovimientoReducido', () => ({ useMovimientoReducido: jest.fn() }));
const reducido = useMovimientoReducido as jest.Mock;

let anunciar: jest.SpyInstance;

beforeEach(() => {
  // Casi todos, sin animación: la etiqueta cambia de sitio en el acto.
  reducido.mockReturnValue(true);
  anunciar = jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
});

type Props = Parameters<typeof Campo>[0];

function elCampo(props: Partial<Props> = {}) {
  return (
    <Campo etiqueta="Ingrediente" valor="" alCambiar={jest.fn()} testID="c" {...props} />
  );
}

const entrada = () => screen.getByTestId('c');
const caja = () => estiloDe(screen.getByTestId('c.caja'));

function etiqueta() {
  const { transform } = estiloDe(screen.getByTestId('c.etiqueta', conOcultos)) as {
    transform: [{ translateY: number }, { scale: number }];
  };
  return { y: transform[0].translateY, escala: transform[1].scale };
}

const ABAJO = { y: 0, escala: 1 };
const ARRIBA = {
  y: -espacio.l,
  escala: tipografia.nota.fontSize / tipografia.cuerpo.fontSize,
};

describe('Campo', () => {
  it('VoiceOver lo nombra con su etiqueta, y la etiqueta visible no se lee dos veces', async () => {
    await dibujar(elCampo());
    expect(screen.getByLabelText('Ingrediente')).toBe(entrada());
    expect(screen.queryByText('Ingrediente')).toBeNull();
    expect(screen.getByText('Ingrediente', conOcultos)).toBeTruthy();
  });

  it('vacío y sin tocar: la etiqueta está dentro, a tamaño normal, y el borde es gris', async () => {
    await dibujar(elCampo());
    expect(etiqueta()).toEqual(ABAJO);
    expect(caja()).toMatchObject({
      borderColor: colores.claro.borde,
      backgroundColor: colores.claro.superficie,
    });
  });

  it('al tocarlo, la etiqueta sube y se encoge, y el borde se pone del acento', async () => {
    await dibujar(elCampo());
    await fireEvent(entrada(), 'focus');
    expect(etiqueta().y).toBe(ARRIBA.y);
    expect(etiqueta().escala).toBeCloseTo(ARRIBA.escala);
    expect(caja().borderColor).toBe(colores.claro.acento);
  });

  it('al salir sin escribir nada, la etiqueta vuelve a su sitio', async () => {
    await dibujar(elCampo());
    await fireEvent(entrada(), 'focus');
    await fireEvent(entrada(), 'blur');
    expect(etiqueta()).toEqual(ABAJO);
    expect(caja().borderColor).toBe(colores.claro.borde);
  });

  it('con valor, la etiqueta se queda arriba aunque no esté tocado', async () => {
    await dibujar(elCampo({ valor: 'Tomate' }));
    expect(etiqueta().y).toBe(ARRIBA.y);
    expect(entrada().props.value).toBe('Tomate');
  });

  it('escribir avisa con el texto nuevo', async () => {
    const alCambiar = jest.fn();
    await dibujar(elCampo({ alCambiar }));
    await fireEvent.changeText(entrada(), 'Tomate');
    expect(alCambiar).toHaveBeenCalledWith('Tomate');
  });

  it('error: todo en rojo, el mensaje debajo con su icono, y VoiceOver lo oye y lo anuncia', async () => {
    await dibujar(elCampo({ error: 'Escribe un ingrediente para seguir.' }));
    expect(caja().borderColor).toBe(colores.claro.rojo);
    expect(estiloDe(screen.getByText('Ingrediente', conOcultos)).color).toBe(
      colores.claro.rojo
    );
    expect(screen.getByTestId('c.error').props.children).toBe(
      'Escribe un ingrediente para seguir.'
    );
    expect(screen.getByTestId('c.error.icono', conOcultos).props).toMatchObject({
      name: 'exclamationmark.circle',
      tintColor: colores.claro.rojo,
    });
    expect(entrada().props.accessibilityHint).toBe('Escribe un ingrediente para seguir.');
    expect(anunciar).toHaveBeenCalledWith('Escribe un ingrediente para seguir.');
  });

  it('con el dedo encima y un error, el borde sigue en rojo', async () => {
    await dibujar(elCampo({ error: 'Falta algo.' }));
    await fireEvent(entrada(), 'focus');
    expect(caja().borderColor).toBe(colores.claro.rojo);
  });

  it('sin error, VoiceOver oye la pista; con error, el error manda', async () => {
    await dibujar(elCampo({ pista: 'Lo que tengas en casa' }));
    expect(entrada().props.accessibilityHint).toBe('Lo que tengas en casa');
    expect(screen.queryByTestId('c.error')).toBeNull();
    await screen.rerender(
      elCampo({ pista: 'Lo que tengas en casa', error: 'Falta algo.' })
    );
    expect(entrada().props.accessibilityHint).toBe('Falta algo.');
  });

  it('el error se anuncia cuando aparece o cambia, no cada vez que se dibuja', async () => {
    await dibujar(elCampo({ error: 'Falta algo.' }));
    await screen.rerender(elCampo({ error: 'Falta algo.', valor: 'x' }));
    expect(anunciar).toHaveBeenCalledTimes(1);
    await screen.rerender(elCampo({ error: 'Otra cosa.' }));
    expect(anunciar).toHaveBeenCalledTimes(2);
    await screen.rerender(elCampo());
    expect(anunciar).toHaveBeenCalledTimes(2);
  });

  it('deshabilitado: no se puede escribir, va en gris, y VoiceOver lo dice', async () => {
    await dibujar(elCampo({ valor: 'Casa', deshabilitado: true }));
    expect(entrada().props.editable).toBe(false);
    expect(entrada().props.accessibilityState).toMatchObject({ disabled: true });
    expect(caja().backgroundColor).toBe(colores.claro.superficie2);
    expect(estiloDe(entrada()).color).toBe(colores.claro.texto3);
  });

  it('la letra sigue Dynamic Type, como Texto, también con la escala de la galería', async () => {
    await dibujar(elCampo());
    expect(entrada().props.allowFontScaling).toBe(true);
    expect(entrada().props.maxFontSizeMultiplier).toBe(tipografia.cuerpo.escalaMaxima);
    expect(estiloDe(entrada())).toMatchObject({
      fontSize: tipografia.cuerpo.fontSize,
      color: colores.claro.texto,
    });
    await dibujar(elCampo(), { escalaDeLetra: 1.353 });
    expect(entrada().props.allowFontScaling).toBe(false);
    expect(estiloDe(entrada()).fontSize).toBeCloseTo(tipografia.cuerpo.fontSize * 1.353);
  });

  it('con la letra más grande, se queda en el tamaño que le da iOS al cuerpo', async () => {
    await dibujar(elCampo(), { escalaDeLetra: 3.571 });
    expect(estiloDe(entrada()).fontSize).toBeCloseTo(
      tipografia.cuerpo.fontSize * tipografia.cuerpo.escalaMaxima
    );
  });

  it('con animación, la etiqueta viaja en el tiempo rápido del tema, y se para si cambia a mitad', async () => {
    reducido.mockReturnValue(false);
    const parar = jest.fn();
    const timing = jest
      .spyOn(Animated, 'timing')
      .mockReturnValue({ start: jest.fn(), stop: parar, reset: jest.fn() });
    const { unmount } = await dibujar(elCampo());
    expect(timing).toHaveBeenLastCalledWith(expect.anything(), {
      toValue: 0,
      duration: movimiento.rapido,
      useNativeDriver: true,
    });
    await fireEvent(entrada(), 'focus');
    expect(parar).toHaveBeenCalledTimes(1);
    expect(timing).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 1 })
    );
    await unmount();
    expect(parar).toHaveBeenCalledTimes(2);
  });

  it('en oscuro, con la superficie del modo oscuro', async () => {
    await dibujar(elCampo(), { esquema: 'oscuro' });
    expect(caja().backgroundColor).toBe(colores.oscuro.superficie);
  });

  it('sin testID, se dibuja igual, también con error', async () => {
    await dibujar(
      <Campo etiqueta="Ingrediente" valor="" alCambiar={jest.fn()} error="Falta algo." />
    );
    expect(screen.getByLabelText('Ingrediente')).toBeTruthy();
    expect(screen.getByText('Falta algo.')).toBeTruthy();
  });
});
