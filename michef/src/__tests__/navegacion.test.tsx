// La navegación de verdad, con el `_layout.tsx` real: el orden de arranque, el
// tema montado, y la galería solo en desarrollo.
import { fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { View } from 'react-native';

import Galeria from '../app/(dev)/galeria';
import RootLayout from '../app/_layout';
import Home from '../app/index';

jest.mock('@sentry/react-native', () => ({
  wrap: (componente: unknown) => componente,
  captureException: jest.fn(),
}));
jest.mock('@/lib/sentry', () => ({ iniciarSentry: jest.fn() }));
jest.mock('@/config/env', () => ({ leerEntorno: jest.fn() }));
jest.mock('@/config/flags', () => ({ leerFlags: jest.fn() }));

const global_ = globalThis as unknown as { __DEV__: boolean };
const devOriginal = global_.__DEV__;

afterEach(() => {
  global_.__DEV__ = devOriginal;
});

// Una galería de mentira que se dibuja siempre. Así, si en producción no
// aparece, es por el `Stack.Protected` del layout y no por la guarda de la
// propia galería, que tiene su test en galeria.test.tsx.
function GaleriaSinGuarda() {
  return <View testID="galeria-sin-guarda" />;
}

describe('navegación', () => {
  it('al arrancar, primero Sentry y después el entorno y los interruptores', () => {
    jest.isolateModules(() => {
      const { iniciarSentry } = jest.requireMock<{ iniciarSentry: jest.Mock }>(
        '@/lib/sentry'
      );
      const { leerEntorno } = jest.requireMock<{ leerEntorno: jest.Mock }>(
        '@/config/env'
      );
      const { leerFlags } = jest.requireMock<{ leerFlags: jest.Mock }>('@/config/flags');
      jest.requireActual('../app/_layout');
      const [sentry, entorno, flags] = [iniciarSentry, leerEntorno, leerFlags].map(
        (f) => f.mock.invocationCallOrder[0]
      ) as [number, number, number];
      expect(sentry).toBeLessThan(entorno);
      expect(entorno).toBeLessThan(flags);
    });
  });

  it('abre en la pantalla inicial, con el tema montado', async () => {
    await renderRouter(
      { _layout: () => <RootLayout />, index: Home, '(dev)/galeria': Galeria },
      { initialUrl: '/' }
    );
    expect(screen.getByTestId('home')).toBeTruthy();
  });

  it('en desarrollo, «Galería» abre la galería', async () => {
    await renderRouter(
      { _layout: () => <RootLayout />, index: Home, '(dev)/galeria': Galeria },
      { initialUrl: '/' }
    );
    await fireEvent.press(screen.getByTestId('abrir-galeria'));
    expect(await screen.findByTestId('galeria')).toBeTruthy();
  });

  it('en desarrollo, la ruta de la galería existe', async () => {
    await renderRouter(
      { _layout: () => <RootLayout />, index: Home, '(dev)/galeria': GaleriaSinGuarda },
      { initialUrl: '/galeria' }
    );
    expect(screen.getByTestId('galeria-sin-guarda')).toBeTruthy();
  });

  it('en producción la galería no existe: ni con su dirección se llega', async () => {
    global_.__DEV__ = false;
    await renderRouter(
      { _layout: () => <RootLayout />, index: Home, '(dev)/galeria': GaleriaSinGuarda },
      { initialUrl: '/galeria' }
    );
    expect(screen.queryByTestId('galeria-sin-guarda')).toBeNull();
  });
});
