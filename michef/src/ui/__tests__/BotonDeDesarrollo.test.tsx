import { render, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet, useColorScheme } from 'react-native';

import { BotonDeDesarrollo } from '../BotonDeDesarrollo';
import { ProveedorTema } from '../tema';
import { colores } from '../tokens';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

beforeEach(() => (useColorScheme as jest.Mock).mockReturnValue('light'));

type Props = Parameters<typeof BotonDeDesarrollo>[0];

async function dibujar(props: Partial<Props> = {}) {
  const alTocar = jest.fn();
  await render(
    <ProveedorTema>
      <BotonDeDesarrollo
        etiqueta="Galería"
        descripcion="Abrir la galería"
        onPress={alTocar}
        testID="boton"
        {...props}
      />
    </ProveedorTema>
  );
  return alTocar;
}

const estiloDelBoton = () => StyleSheet.flatten(screen.getByTestId('boton').props.style);
const colorDelTexto = () =>
  StyleSheet.flatten(screen.getByText('Galería').props.style).color;

describe('BotonDeDesarrollo', () => {
  it('VoiceOver lo encuentra como botón y dice qué hace', async () => {
    await dibujar();
    expect(screen.getByRole('button', { name: 'Abrir la galería' })).toBeTruthy();
    expect(screen.getByText('Galería')).toBeTruthy();
  });

  it('al tocarlo hace lo suyo, una vez', async () => {
    const alTocar = await dibujar();
    await userEvent.setup().press(screen.getByTestId('boton'));
    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it('mide al menos 44 pt de alto, lo mínimo tocable de Apple', async () => {
    await dibujar();
    expect(estiloDelBoton().minHeight).toBe(44);
  });

  it('en tono normal usa el acento; en peligro, el rojo', async () => {
    await dibujar();
    expect(estiloDelBoton().borderColor).toBe(colores.claro.acento);
    expect(colorDelTexto()).toBe(colores.claro.acento);
    await dibujar({ tono: 'peligro' });
    expect(estiloDelBoton().borderColor).toBe(colores.claro.rojo);
    expect(colorDelTexto()).toBe(colores.claro.rojo);
  });

  it('elegido: VoiceOver dice que está seleccionado, y se rellena con el acento', async () => {
    await dibujar({ seleccionado: true });
    expect(
      screen.getByRole('button', { name: 'Abrir la galería', selected: true })
    ).toBeTruthy();
    expect(estiloDelBoton().backgroundColor).toBe(colores.claro.acento);
    expect(colorDelTexto()).toBe(colores.claro.sobreAcento);
  });

  it('en un grupo, el no elegido lo dice; fuera de un grupo no dice nada', async () => {
    await dibujar({ seleccionado: false });
    expect(screen.getByTestId('boton').props.accessibilityState).toEqual({
      selected: false,
    });
    expect(estiloDelBoton().backgroundColor).toBe(colores.claro.superficie);
    // React Native rellena el estado con campos vacíos; lo que importa es que
    // no diga «seleccionado» ni «no seleccionado».
    await dibujar();
    expect(screen.getByTestId('boton').props.accessibilityState).toEqual({});
  });
});
