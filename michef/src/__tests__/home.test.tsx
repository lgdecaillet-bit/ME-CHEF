// Vive fuera de src/app/ a propósito: expo-router trata cada archivo de esa
// carpeta como una pantalla, y un test ahí dentro sería una ruta más.
import { fireEvent, render, screen } from '@testing-library/react-native';

import Home from '../app/index';

const global_ = globalThis as unknown as { __DEV__: boolean };
const devOriginal = global_.__DEV__;

afterEach(() => {
  global_.__DEV__ = devOriginal;
});

describe('pantalla inicial', () => {
  it('se dibuja con su testID y el nombre de la app', async () => {
    await render(<Home />);
    expect(screen.getByTestId('home')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'ME CHEF' })).toBeTruthy();
  });

  it('en desarrollo enseña el botón de prueba de Sentry, tocable y con nombre', async () => {
    await render(<Home />);
    expect(
      screen.getByRole('button', { name: 'Provocar un error de prueba para Sentry' })
    ).toBeTruthy();
  });

  it('el botón lanza un error de JavaScript con un mensaje reconocible', async () => {
    await render(<Home />);
    await expect(fireEvent.press(screen.getByTestId('provocar-error'))).rejects.toThrow(
      'Prueba de Sentry: botón de desarrollo'
    );
  });

  it('en producción el botón NO existe', async () => {
    // Lo más importante de este archivo: un botón que rompe la app a propósito
    // no puede llegar nunca al teléfono de un usuario.
    global_.__DEV__ = false;
    await render(<Home />);
    expect(screen.queryByTestId('provocar-error')).toBeNull();
    expect(screen.getByTestId('home')).toBeTruthy();
  });
});
