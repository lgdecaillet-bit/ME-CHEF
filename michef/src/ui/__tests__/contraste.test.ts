// El gate de contraste de diseno.md § 4: cada par texto/fondo de los tokens
// tiene que llegar a AA, en claro y en oscuro. Corre dentro de `npm run test`,
// así que está en `npm run gates`, en el pre-push y en el CI.
import fc from 'fast-check';

import { luminancia, relacionDeContraste } from '../contraste';
import { colores, type Colores, type Esquema } from '../tokens';

describe('la fórmula de contraste', () => {
  it('negro sobre blanco da 21, y un color consigo mismo da 1', () => {
    expect(relacionDeContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(relacionDeContraste('#7C7C80', '#7C7C80')).toBe(1);
  });

  it('coincide con los valores publicados: #767676 sobre blanco pasa AA por poco, #777777 no', () => {
    expect(relacionDeContraste('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
    expect(relacionDeContraste('#777777', '#FFFFFF')).toBeLessThan(4.5);
  });

  it('los colores muy oscuros usan el tramo lineal de la fórmula', () => {
    expect(luminancia('#010101')).toBeCloseTo(1 / 255 / 12.92, 10);
  });

  it('no importa el orden, y siempre da entre 1 y 21', () => {
    const color = fc
      .integer({ min: 0, max: 0xffffff })
      .map((n) => `#${n.toString(16).padStart(6, '0')}`);
    fc.assert(
      fc.property(color, color, (a, b) => {
        const r = relacionDeContraste(a, b);
        return r === relacionDeContraste(b, a) && r >= 1 && r <= 21 + 1e-9;
      })
    );
  });

  it('se niega a calcular con algo que no es #RRGGBB, en vez de dar un número falso', () => {
    for (const malo of ['#FFF', 'rgba(0,0,0,1)', 'white', '#GGGGGG', '', '#1234567']) {
      expect(() => luminancia(malo)).toThrow('no es un color #RRGGBB');
    }
  });
});

type Par = { delante: keyof Colores; detras: keyof Colores; minimo: number };

const TEXTOS: (keyof Colores)[] = [
  'texto',
  'texto2',
  'texto3',
  'acento',
  'ambar',
  'rojo',
];
const FONDOS: (keyof Colores)[] = ['fondo', 'superficie', 'superficie2'];

// 4,5 para texto (WCAG 2.2, 1.4.3). 3 para el borde de un control (1.4.11).
const PARES: Par[] = [
  ...TEXTOS.flatMap((delante) =>
    FONDOS.map((detras) => ({ delante, detras, minimo: 4.5 }))
  ),
  { delante: 'sobreAcento', detras: 'acento', minimo: 4.5 },
  ...FONDOS.map((detras) => ({ delante: 'borde' as const, detras, minimo: 3 })),
];

describe.each(['claro', 'oscuro'] satisfies Esquema[])('los tokens en %s', (esquema) => {
  it.each(PARES)(
    '$delante sobre $detras llega a $minimo',
    ({ delante, detras, minimo }) => {
      const c = colores[esquema];
      expect(relacionDeContraste(c[delante], c[detras])).toBeGreaterThanOrEqual(minimo);
    }
  );
});
