import { render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { useColorScheme } from 'react-native';

import { ProveedorTema } from '../tema';
import { Texto } from '../Texto';
import { colores, tipografia } from '../tokens';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const modoDelIphone = useColorScheme as jest.Mock;

beforeEach(() => modoDelIphone.mockReturnValue('light'));

async function dibujar(elemento: ReactElement, escalaDeLetra?: number) {
  await render(<ProveedorTema escalaDeLetra={escalaDeLetra}>{elemento}</ProveedorTema>);
}

function propsDe(texto: string) {
  return screen.getByText(texto).props as {
    style: { fontSize: number; lineHeight: number; fontWeight: string; color: string };
    allowFontScaling: boolean;
    maxFontSizeMultiplier: number;
    numberOfLines?: number;
  };
}

describe('Texto', () => {
  it('sin nada más, es cuerpo con el color de texto del modo claro', async () => {
    await dibujar(<Texto>Hola</Texto>);
    expect(propsDe('Hola').style).toEqual({
      fontSize: 17,
      lineHeight: 22,
      fontWeight: '400',
      color: colores.claro.texto,
    });
  });

  it('con el iPhone en oscuro, el mismo texto cambia de color solo', async () => {
    modoDelIphone.mockReturnValue('dark');
    await dibujar(<Texto>Hola</Texto>);
    expect(propsDe('Hola').style.color).toBe(colores.oscuro.texto);
  });

  it('usa el estilo de su variante y el color que se le pida', async () => {
    await dibujar(
      <Texto variante="nota" color="rojo">
        Hola
      </Texto>
    );
    expect(propsDe('Hola').style).toMatchObject({
      fontSize: 13,
      lineHeight: 18,
      color: colores.claro.rojo,
    });
  });

  it.each(['titulo1', 'titulo2', 'titulo3'] as const)(
    '%s se anuncia como encabezado en VoiceOver',
    async (variante) => {
      await dibujar(<Texto variante={variante}>Hola</Texto>);
      expect(screen.getByRole('header', { name: 'Hola' })).toBeTruthy();
    }
  );

  it('el cuerpo no se anuncia como encabezado', async () => {
    await dibujar(<Texto variante="cuerpoFuerte">Hola</Texto>);
    expect(screen.queryByRole('header')).toBeNull();
  });

  it('sigue el tamaño de letra del iPhone (Dynamic Type), hasta el tope de su estilo', async () => {
    await dibujar(<Texto variante="titulo1">Hola</Texto>);
    expect(propsDe('Hola').allowFontScaling).toBe(true);
    expect(propsDe('Hola').maxFontSizeMultiplier).toBe(tipografia.titulo1.escalaMaxima);
  });

  it('con una escala simulada, crece él y apaga la del iPhone para no multiplicar dos veces', async () => {
    await dibujar(<Texto>Hola</Texto>, 1.353);
    const props = propsDe('Hola');
    expect(props.allowFontScaling).toBe(false);
    expect(props.style.fontSize).toBeCloseTo(17 * 1.353);
    expect(props.style.lineHeight).toBeCloseTo(22 * 1.353);
  });

  it('con la escala más grande, un título se queda en el tamaño que le da iOS', async () => {
    await dibujar(<Texto variante="titulo1">Hola</Texto>, 3.571);
    expect(propsDe('Hola').style.fontSize).toBeCloseTo(60);
  });

  it('pasa el número de líneas y el testID', async () => {
    await dibujar(
      <Texto numberOfLines={2} testID="t">
        Hola
      </Texto>
    );
    expect(propsDe('Hola').numberOfLines).toBe(2);
    expect(screen.getByTestId('t')).toBeTruthy();
  });
});

describe('Texto centrado', () => {
  it('se centra solo si se pide: para un texto que va solo en medio', async () => {
    await dibujar(<Texto centrado>Hola</Texto>);
    expect(screen.getByText('Hola').props.style).toMatchObject({ textAlign: 'center' });
  });
});
