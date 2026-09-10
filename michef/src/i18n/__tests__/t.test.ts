import fc from 'fast-check';

import { log } from '@/lib/log';

import { t, type Clave } from '../index';

jest.mock('@/lib/log', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

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
