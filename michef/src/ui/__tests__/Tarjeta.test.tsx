import { screen, userEvent } from '@testing-library/react-native';

import { Tarjeta } from '../Tarjeta';
import { Texto } from '../Texto';
import { colores, espacio, opacidad, radio } from '../tokens';
import { apoyarDedo, dibujar, estiloDe, levantarDedo } from './dibujar';

describe('Tarjeta', () => {
  it('normal: una superficie con lo que tenga dentro, que no es un botón', async () => {
    await dibujar(
      <Tarjeta testID="t">
        <Texto>Tomates</Texto>
      </Tarjeta>
    );
    expect(screen.getByText('Tomates')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    expect(estiloDe(screen.getByTestId('t'))).toMatchObject({
      backgroundColor: colores.claro.superficie,
      borderRadius: radio.l,
      padding: espacio.l,
    });
  });

  it('pulsable: es un botón, y VoiceOver lo nombra con lo que tiene dentro', async () => {
    const alTocar = jest.fn();
    await dibujar(
      <Tarjeta onPress={alTocar} pista="Abre la receta" testID="t">
        <Texto>Tortilla de papas</Texto>
      </Tarjeta>
    );
    const boton = screen.getByRole('button', { name: 'Tortilla de papas' });
    expect(boton.props.accessibilityHint).toBe('Abre la receta');
    await userEvent.setup().press(boton);
    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it('pulsable, se atenúa mientras el dedo la toca', async () => {
    await dibujar(
      <Tarjeta onPress={jest.fn()} testID="t">
        <Texto>Tortilla</Texto>
      </Tarjeta>
    );
    await apoyarDedo(screen.getByTestId('t'));
    expect(estiloDe(screen.getByTestId('t')).opacity).toBe(opacidad.pulsado);
    await levantarDedo(screen.getByTestId('t'));
    expect(estiloDe(screen.getByTestId('t')).opacity).toBeUndefined();
  });

  it('con etiqueta: la etiqueta va arriba, antes que el contenido', async () => {
    await dibujar(
      <Tarjeta etiqueta={{ tipo: 'seguro', texto: 'Lo vi' }}>
        <Texto>Tomates</Texto>
      </Tarjeta>
    );
    const textos = screen.getAllByText(/Lo vi|Tomates/).map((t) => t.props.children);
    expect(textos).toEqual(['Lo vi', 'Tomates']);
  });

  it('sin etiqueta, solo el contenido', async () => {
    await dibujar(
      <Tarjeta>
        <Texto>Tomates</Texto>
      </Tarjeta>
    );
    expect(screen.queryByText('Lo vi')).toBeNull();
  });

  it('en oscuro, con la superficie del modo oscuro', async () => {
    await dibujar(
      <Tarjeta testID="t">
        <Texto>Tomates</Texto>
      </Tarjeta>,
      { esquema: 'oscuro' }
    );
    expect(estiloDe(screen.getByTestId('t')).backgroundColor).toBe(
      colores.oscuro.superficie
    );
  });
});
