import { screen } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';

import { Icono } from '../Icono';
import { colores, icono } from '../tokens';
import { conOcultos, dibujar } from './dibujar';

// El tamaño de letra del iPhone. `react-native` lo lee de este módulo.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const ventana = useWindowDimensions as jest.Mock;
const letraDelIphone = (fontScale: number) =>
  ventana.mockReturnValue({ width: 390, height: 844, scale: 3, fontScale });

beforeEach(() => letraDelIphone(1));

type PropsNativas = {
  name: string;
  size: number;
  tintColor: string;
  accessible?: boolean;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: string;
};
const propsDelIcono = () => screen.getByTestId('i', conOcultos).props as PropsNativas;

describe('Icono', () => {
  it('dibuja el SF Symbol pedido, mediano y con el color del texto', async () => {
    await dibujar(<Icono nombre="fork.knife" testID="i" />);
    expect(propsDelIcono()).toMatchObject({
      name: 'fork.knife',
      size: icono.tamano.m,
      tintColor: colores.claro.texto,
    });
  });

  it('usa el color que se le pida, en el modo en que esté', async () => {
    await dibujar(<Icono nombre="fork.knife" color="acento" testID="i" />, {
      esquema: 'oscuro',
    });
    expect(propsDelIcono().tintColor).toBe(colores.oscuro.acento);
  });

  it.each(['s', 'm', 'l', 'xl'] as const)(
    'el tamaño %s sale de los tokens',
    async (tamano) => {
      await dibujar(<Icono nombre="fork.knife" tamano={tamano} testID="i" />);
      expect(propsDelIcono().size).toBe(icono.tamano[tamano]);
    }
  );

  it('crece con la letra del iPhone, y encoge si es pequeña', async () => {
    letraDelIphone(1.5);
    await dibujar(<Icono nombre="fork.knife" testID="i" />);
    expect(propsDelIcono().size).toBeCloseTo(icono.tamano.m * 1.5);
    letraDelIphone(0.82);
    await dibujar(<Icono nombre="fork.knife" testID="i" />);
    expect(propsDelIcono().size).toBeCloseTo(icono.tamano.m * 0.82);
  });

  it('pero no pasa del doble: con la letra más grande no cabría', async () => {
    letraDelIphone(3.571);
    await dibujar(<Icono nombre="fork.knife" tamano="xl" testID="i" />);
    expect(propsDelIcono().size).toBe(icono.tamano.xl * icono.escalaMaxima);
  });

  it('con la escala simulada de la galería, manda esa y no la del iPhone', async () => {
    letraDelIphone(3);
    await dibujar(<Icono nombre="fork.knife" testID="i" />, { escalaDeLetra: 1.353 });
    expect(propsDelIcono().size).toBeCloseTo(icono.tamano.m * 1.353);
  });

  it('sin descripción, VoiceOver lo salta: va junto a un texto que ya lo dice', async () => {
    await dibujar(<Icono nombre="fork.knife" testID="i" />);
    expect(propsDelIcono()).toMatchObject({
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(screen.queryByRole('image')).toBeNull();
  });

  it('con descripción, VoiceOver lo lee como una imagen con nombre', async () => {
    await dibujar(<Icono nombre="refrigerator" descripcion="Nevera" testID="i" />);
    expect(screen.getByRole('image', { name: 'Nevera' })).toBeTruthy();
  });
});
