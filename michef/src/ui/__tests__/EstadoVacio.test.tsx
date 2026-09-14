import { screen, userEvent } from '@testing-library/react-native';

import { EstadoVacio } from '../EstadoVacio';
import { colores, icono } from '../tokens';
import { conOcultos, dibujar, estiloDe } from './dibujar';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('EstadoVacio', () => {
  it('con acción: dice qué pasa, por qué, y ofrece el siguiente paso', async () => {
    const alTocar = jest.fn();
    await dibujar(
      <EstadoVacio
        icono="refrigerator"
        titulo="Tu nevera está vacía"
        texto="Hazle una foto y te digo qué puedes cocinar."
        accion={{ etiqueta: 'Hacer una foto', onPress: alTocar, pista: 'Abre la cámara' }}
        testID="v"
      />
    );
    expect(screen.getByRole('header', { name: 'Tu nevera está vacía' })).toBeTruthy();
    expect(screen.getByText('Hazle una foto y te digo qué puedes cocinar.')).toBeTruthy();
    const boton = screen.getByRole('button', { name: 'Hacer una foto' });
    expect(boton.props.accessibilityHint).toBe('Abre la cámara');
    await userEvent.setup().press(boton);
    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it('sin acción: sin botón', async () => {
    await dibujar(
      <EstadoVacio
        icono="book"
        titulo="Todavía no hay recetas"
        texto="Aparecerán aquí."
      />
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('el icono es grande, gris y de adorno: el título ya lo dice', async () => {
    // Con la letra a escala 1: el mock de React Native la trae al doble.
    await dibujar(
      <EstadoVacio
        icono="book"
        titulo="Sin recetas"
        texto="Aparecerán aquí."
        testID="v"
      />,
      { escalaDeLetra: 1 }
    );
    expect(screen.getByTestId('v.icono', conOcultos).props).toMatchObject({
      name: 'book',
      size: icono.tamano.xl,
      tintColor: colores.claro.texto3,
      accessible: false,
    });
  });

  it('el texto va centrado, y el de debajo en gris', async () => {
    await dibujar(
      <EstadoVacio icono="book" titulo="Sin recetas" texto="Aparecerán aquí." />
    );
    expect(estiloDe(screen.getByText('Sin recetas')).textAlign).toBe('center');
    expect(estiloDe(screen.getByText('Aparecerán aquí.'))).toMatchObject({
      textAlign: 'center',
      color: colores.claro.texto2,
    });
  });

  it('sin testID, el botón tampoco lleva uno', async () => {
    await dibujar(
      <EstadoVacio
        icono="book"
        titulo="Sin recetas"
        texto="Aparecerán aquí."
        accion={{ etiqueta: 'Buscar', onPress: jest.fn() }}
      />
    );
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeTruthy();
  });
});
