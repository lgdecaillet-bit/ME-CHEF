import { screen } from '@testing-library/react-native';
import fc from 'fast-check';

import { Progreso } from '../Progreso';
import { colores } from '../tokens';
import { dibujar, estiloDe } from './dibujar';

const relleno = () => estiloDe(screen.getByTestId('p.relleno'));
const barra = () => screen.getByRole('progressbar');

describe('Progreso', () => {
  it('1 de 2: lo dice en pantalla y a VoiceOver, y la barra va por la mitad', async () => {
    await dibujar(<Progreso actual={1} total={2} testID="p" />);
    expect(screen.getByText('1 de 2')).toBeTruthy();
    expect(barra().props.accessibilityValue).toEqual({
      min: 0,
      max: 2,
      now: 1,
      text: '1 de 2',
    });
    expect(relleno()).toMatchObject({ flex: 0.5, backgroundColor: colores.claro.acento });
  });

  it('2 de 2: la barra llena', async () => {
    await dibujar(<Progreso actual={2} total={2} testID="p" />);
    expect(screen.getByText('2 de 2')).toBeTruthy();
    expect(relleno().flex).toBe(1);
  });

  it.each([
    [-1, 2, '0 de 2', 0],
    [5, 2, '2 de 2', 1],
    [Number.NaN, 2, '0 de 2', 0],
    [1, 0, '0 de 0', 0],
    [1, -3, '0 de 0', 0],
    [1, Number.POSITIVE_INFINITY, '0 de 0', 0],
  ])(
    'con %s de %s, se queda dentro de la barra: «%s»',
    async (actual, total, texto, flex) => {
      await dibujar(<Progreso actual={actual} total={total} testID="p" />);
      expect(screen.getByText(texto)).toBeTruthy();
      expect(relleno().flex).toBe(flex);
    }
  );

  it('con cualquier número, la barra está entre vacía y llena y el texto no dice «NaN»', async () => {
    await fc.assert(
      fc.asyncProperty(fc.double(), fc.double(), async (actual, total) => {
        await dibujar(<Progreso actual={actual} total={total} testID="p" />);
        const flex = relleno().flex as number;
        const texto = barra().props.accessibilityValue.text as string;
        return flex >= 0 && flex <= 1 && !/NaN|Infinity/.test(texto);
      }),
      { numRuns: 40 }
    );
  });

  it('el fondo de la barra es gris, y en oscuro con los colores del modo oscuro', async () => {
    await dibujar(<Progreso actual={1} total={2} testID="p" />, { esquema: 'oscuro' });
    expect(relleno().backgroundColor).toBe(colores.oscuro.acento);
  });

  it('sin testID, se dibuja igual', async () => {
    await dibujar(<Progreso actual={1} total={2} />);
    expect(barra()).toBeTruthy();
  });
});
