// Vive fuera de src/app/ a propósito: expo-router trata cada archivo de esa
// carpeta como una pantalla, y un test ahí dentro sería una ruta más.
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProveedorTema } from '@/ui/tema';

import Home from '../app/index';

const global_ = globalThis as unknown as { __DEV__: boolean };
const devOriginal = global_.__DEV__;

afterEach(() => {
  global_.__DEV__ = devOriginal;
});

async function dibujar() {
  await render(
    <ProveedorTema>
      <Home />
    </ProveedorTema>
  );
}

describe('pantalla inicial', () => {
  it('se dibuja con su testID y el nombre de la app, anunciado como encabezado', async () => {
    await dibujar();
    expect(screen.getByTestId('home')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'ME CHEF' })).toBeTruthy();
  });

  it('en desarrollo enseña sus dos herramientas, tocables y con nombre', async () => {
    await dibujar();
    expect(
      screen.getByRole('button', { name: 'Provocar un error de prueba para Sentry' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Abrir la galería del sistema de diseño' })
    ).toBeTruthy();
  });

  it('el botón de error lanza un error de JavaScript con un mensaje reconocible', async () => {
    await dibujar();
    await expect(fireEvent.press(screen.getByTestId('provocar-error'))).rejects.toThrow(
      'Prueba de Sentry: botón de desarrollo'
    );
  });

  it('en producción NO existe ninguna de las dos', async () => {
    // Lo más importante de este archivo: un botón que rompe la app a propósito
    // no puede llegar nunca al teléfono de un usuario.
    global_.__DEV__ = false;
    await dibujar();
    expect(screen.queryByTestId('provocar-error')).toBeNull();
    expect(screen.queryByTestId('abrir-galeria')).toBeNull();
    expect(screen.getByTestId('home')).toBeTruthy();
  });
});
