import fc from 'fast-check';

import { interpretarFlags, leerFlags } from '../flags';

const TODO_APAGADO = { cifrado: false, nevera: false, facturas: false };

describe('interpretarFlags', () => {
  it('sin nada definido, todo nace apagado', () => {
    expect(
      interpretarFlags({ cifrado: undefined, nevera: undefined, facturas: undefined })
    ).toEqual(TODO_APAGADO);
  });

  it('una variable vacía también es apagado', () => {
    expect(interpretarFlags({ cifrado: '', nevera: '  ', facturas: undefined })).toEqual(
      TODO_APAGADO
    );
  });

  it.each([
    ['true', true],
    ['1', true],
    [' TRUE ', true],
    ['True', true],
    ['false', false],
    ['0', false],
    ['FALSE', false],
  ])('«%s» se lee como %s', (valor, esperado) => {
    expect(
      interpretarFlags({ cifrado: undefined, nevera: valor, facturas: undefined }).nevera
    ).toBe(esperado);
  });

  it('cada interruptor es independiente', () => {
    expect(interpretarFlags({ cifrado: '0', nevera: '1', facturas: 'false' })).toEqual({
      cifrado: false,
      nevera: true,
      facturas: false,
    });
  });

  it('un valor mal escrito para la app y dice cuál', () => {
    expect(() =>
      interpretarFlags({ cifrado: undefined, nevera: 'ture', facturas: undefined })
    ).toThrow('EXPO_PUBLIC_FLAG_NEVERA');
  });

  it('si hay varios mal escritos, los nombra todos', () => {
    let mensaje = '';
    try {
      interpretarFlags({ cifrado: 'si', nevera: '1', facturas: 'on' });
    } catch (e) {
      mensaje = (e as Error).message;
    }
    expect(mensaje).toContain('EXPO_PUBLIC_FLAG_CIFRADO');
    expect(mensaje).toContain('EXPO_PUBLIC_FLAG_FACTURAS');
    expect(mensaje).not.toContain('EXPO_PUBLIC_FLAG_NEVERA');
  });

  // Regresión: el test de propiedad de abajo falló una vez de cada muchas en
  // D6. `valor in VALORES` mira también lo que todo objeto hereda, así que
  // «constructor» o «__proto__» pasaban como apagado en silencio. fast-check
  // prueba esas palabras a propósito, pero no en cada corrida: por eso quedan
  // aquí fijas, para que se prueben siempre.
  it.each(['constructor', '__proto__', 'hasownproperty', 'valueof', 'tostring'])(
    '«%s» no es un valor válido, aunque todo objeto lo herede',
    (valor) => {
      expect(() =>
        interpretarFlags({ cifrado: valor, nevera: undefined, facturas: undefined })
      ).toThrow('EXPO_PUBLIC_FLAG_CIFRADO');
    }
  );

  it('propiedad: cualquier valor que no sea true/false/1/0 hace fallar el arranque', () => {
    const validos = new Set(['true', 'false', '1', '0']);
    fc.assert(
      fc.property(
        fc
          .string()
          .filter((s) => s.trim() !== '' && !validos.has(s.trim().toLowerCase())),
        (valor) => {
          expect(() =>
            interpretarFlags({ cifrado: valor, nevera: undefined, facturas: undefined })
          ).toThrow('EXPO_PUBLIC_FLAG_CIFRADO');
        }
      )
    );
  });
});

describe('leerFlags', () => {
  const guardado = { ...process.env };
  afterEach(() => {
    process.env = { ...guardado };
  });

  it('lee cada interruptor de su variable EXPO_PUBLIC_FLAG_*', () => {
    process.env.EXPO_PUBLIC_FLAG_CIFRADO = '0';
    process.env.EXPO_PUBLIC_FLAG_NEVERA = '1';
    process.env.EXPO_PUBLIC_FLAG_FACTURAS = 'true';
    expect(leerFlags()).toEqual({ cifrado: false, nevera: true, facturas: true });
  });

  it('sin variables, todo apagado', () => {
    delete process.env.EXPO_PUBLIC_FLAG_CIFRADO;
    delete process.env.EXPO_PUBLIC_FLAG_NEVERA;
    delete process.env.EXPO_PUBLIC_FLAG_FACTURAS;
    expect(leerFlags()).toEqual(TODO_APAGADO);
  });
});
