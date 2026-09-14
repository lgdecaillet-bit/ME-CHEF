import { getLocales, type Locale } from 'expo-localization';
import fc from 'fast-check';

import { log } from '@/lib/log';

import { escribirNumero, numero, t, type Clave, type FormatoDeNumeros } from '../index';

// La región del iPhone. Cada test dice cuál; sin decirlo, Jest da Estados Unidos.
jest.mock('expo-localization', () => ({ getLocales: jest.fn() }));
const regionDelIphone = (formato: {
  decimalSeparator: string | null;
  digitGroupingSeparator: string | null;
}) => (getLocales as jest.Mock).mockReturnValue([formato as Locale]);

jest.mock('@/lib/log', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Colombia, salvo que un test diga otra región.
beforeEach(() => regionDelIphone({ decimalSeparator: ',', digitGroupingSeparator: '.' }));

describe('t()', () => {
  it('saca un texto por su clave', () => {
    expect(t('app.nombre')).toBe('ME CHEF');
    expect(t('galeria.modo.oscuro')).toBe('Oscuro');
  });

  it('mete los valores en sus huecos', () => {
    expect(t('galeria.texto.muestra', { n: 7 })).toBe('Veo 7 cosas en tu nevera.');
    expect(t('galeria.medida', { nombre: 'l', valor: 16 })).toBe('l · 16 pt');
  });

  it('mete el valor tal cual, aunque parezca una orden de reemplazo', () => {
    expect(t('galeria.texto.muestra', { n: '$&' })).toBe('Veo $& cosas en tu nevera.');
  });

  it('si falta un valor, deja el hueco a la vista y avisa, en vez de romper', () => {
    expect(t('galeria.texto.muestra')).toBe('Veo {n} cosas en tu nevera.');
    expect(t('galeria.texto.muestra', { otro: 1 })).toBe('Veo {n} cosas en tu nevera.');
    expect(log.warn).toHaveBeenCalledTimes(2);
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('{n}'));
  });

  it('un valor heredado no cuenta como dado', () => {
    const heredado = Object.create({ n: 9 }) as Record<string, number>;
    expect(t('galeria.texto.muestra', heredado)).toBe('Veo {n} cosas en tu nevera.');
  });

  it.each(['galeria.nada', 'constructor', 'galeria', 'app.nombre.mas', 'toString', ''])(
    'una clave forzada que no es un texto («%s») sale tal cual, y se registra el error',
    (clave) => {
      expect(t(clave as Clave)).toBe(clave);
      expect(log.error).toHaveBeenCalledWith(expect.stringContaining(`«${clave}»`));
    }
  );

  it('con cualquier clave, t() nunca rompe y siempre devuelve un texto', () => {
    fc.assert(fc.property(fc.string(), (clave) => typeof t(clave as Clave) === 'string'));
  });
});

// Los separadores que da iOS para cada región.
const REGIONES: Record<string, FormatoDeNumeros> = {
  colombia: { decimal: ',', miles: '.' },
  suizaEnAleman: { decimal: '.', miles: '\u2019' },
  suizaEnFrances: { decimal: ',', miles: '\u202F' },
  estadosUnidos: { decimal: '.', miles: ',' },
};

describe('números por región (decisión #60.9)', () => {
  it.each([
    ['colombia', '1.234.567,5'],
    ['suizaEnAleman', '1\u2019234\u2019567.5'],
    ['suizaEnFrances', '1\u202F234\u202F567,5'],
    ['estadosUnidos', '1,234,567.5'],
  ] as const)('en %s, 1234567,5 se escribe «%s»', (region, escrito) => {
    expect(escribirNumero(1234567.5, REGIONES[region] as FormatoDeNumeros)).toBe(escrito);
  });

  it('medias porciones y números pequeños, en cada región', () => {
    expect(escribirNumero(1.5, REGIONES.colombia as FormatoDeNumeros)).toBe('1,5');
    expect(escribirNumero(1.5, REGIONES.suizaEnAleman as FormatoDeNumeros)).toBe('1.5');
    expect(escribirNumero(-0.25, REGIONES.suizaEnFrances as FormatoDeNumeros)).toBe(
      '-0,25'
    );
    expect(escribirNumero(2, REGIONES.estadosUnidos as FormatoDeNumeros)).toBe('2');
  });

  it('los miles van cada tres cifras, contando desde la coma, y nunca en los decimales', () => {
    const us = REGIONES.estadosUnidos as FormatoDeNumeros;
    expect(escribirNumero(999, us)).toBe('999');
    expect(escribirNumero(1000, us)).toBe('1,000');
    expect(escribirNumero(-12345.6789, us)).toBe('-12,345.6789');
    expect(escribirNumero(0.12345, us)).toBe('0.12345');
  });

  it('lo que no es un número normal no lleva miles, y se ve tal cual', () => {
    const ch = REGIONES.suizaEnFrances as FormatoDeNumeros;
    expect(escribirNumero(Number.NaN, ch)).toBe('NaN');
    expect(escribirNumero(-Infinity, ch)).toBe('-Infinity');
    expect(escribirNumero(1.5e21, ch)).toBe('1,5e+21');
  });

  it('con cualquier número y cualquier región, lo escrito se vuelve a leer como el mismo número', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        fc.constantFrom(...Object.values(REGIONES)),
        (n, formato) => {
          const escrito = escribirNumero(n, formato);
          const leido = escrito
            .split(formato.miles)
            .join('')
            .replace(formato.decimal, '.');
          return Number(leido) === n;
        }
      )
    );
  });
});

describe('números de la app, con la región del iPhone', () => {
  it('escribe con los separadores del iPhone', () => {
    expect(numero(1234.5)).toBe('1.234,5');
    regionDelIphone({ decimalSeparator: '.', digitGroupingSeparator: '\u2019' });
    expect(numero(1234.5)).toBe('1\u2019234.5');
  });

  it('lee la región en cada número: si cambia, el siguiente ya sale con la nueva', () => {
    expect(numero(1.5)).toBe('1,5');
    regionDelIphone({ decimalSeparator: '.', digitGroupingSeparator: ',' });
    expect(numero(1.5)).toBe('1.5');
  });

  it('si iOS no diera los separadores, coma decimal y sin miles', () => {
    regionDelIphone({ decimalSeparator: null, digitGroupingSeparator: null });
    expect(numero(1234.5)).toBe('1234,5');
  });

  it('t() mete los números con la región, y un texto que parece un número lo deja tal cual', () => {
    expect(t('galeria.texto.muestra', { n: 1.5 })).toBe('Veo 1,5 cosas en tu nevera.');
    expect(t('galeria.texto.muestra', { n: '1.5' })).toBe('Veo 1.5 cosas en tu nevera.');
  });

  it('con cualquier número, lo escrito se vuelve a leer como el mismo número', () => {
    fc.assert(
      fc.property(
        fc
          .double({ noNaN: true, noDefaultInfinity: true })
          .filter((n) => Math.abs(n) < 1e21),
        (n) => {
          const escrito = numero(n);
          return Number(escrito.split('.').join('').replace(',', '.')) === n;
        }
      )
    );
  });
});
