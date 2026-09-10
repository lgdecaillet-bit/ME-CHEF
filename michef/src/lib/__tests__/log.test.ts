import * as Sentry from '@sentry/react-native';

import { log } from '../log';

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const global_ = globalThis as unknown as { __DEV__: boolean };
const devOriginal = global_.__DEV__;

function enProduccion() {
  global_.__DEV__ = false;
}

let info: jest.SpyInstance;
let warn: jest.SpyInstance;
let error: jest.SpyInstance;

beforeEach(() => {
  info = jest.spyOn(console, 'info').mockImplementation(() => {});
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  error = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  global_.__DEV__ = devOriginal;
});

describe('log en desarrollo', () => {
  it('info y warn salen por la consola', () => {
    log.info('hola', { a: 1 });
    log.warn('cuidado');
    expect(info).toHaveBeenCalledWith('hola', { a: 1 });
    expect(warn).toHaveBeenCalledWith('cuidado', '');
  });

  it('warn también lleva sus datos, e info sin datos no imprime «undefined»', () => {
    log.warn('cuidado', { paso: 2 });
    log.info('hola');
    expect(warn).toHaveBeenCalledWith('cuidado', { paso: 2 });
    expect(info).toHaveBeenCalledWith('hola', '');
  });

  it('error sale por la consola y además va a Sentry, con sus datos', () => {
    const e = new Error('se rompió');
    log.error('al guardar', e, { paso: 'guardar' });
    expect(error).toHaveBeenCalledWith('al guardar', e, { paso: 'guardar' });
    expect(Sentry.captureException).toHaveBeenCalledWith(e, {
      extra: { mensaje: 'al guardar', paso: 'guardar' },
    });
  });

  it('unos datos con su propio «mensaje» no pisan el mensaje del error', () => {
    log.error('al guardar', new Error('x'), { mensaje: 'otro' });
    const [, contexto] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(contexto.extra.mensaje).toBe('al guardar');
  });

  it('error sin objeto de error construye uno con el mensaje', () => {
    log.error('algo pasó');
    const [enviado] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(enviado).toBeInstanceOf(Error);
    expect((enviado as Error).message).toBe('algo pasó');
  });
});

describe('log en producción', () => {
  it('info y warn se callan', () => {
    enProduccion();
    log.info('hola');
    log.warn('cuidado');
    expect(info).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('error no ensucia la consola, pero sí llega a Sentry', () => {
    enProduccion();
    const e = new Error('en producción');
    log.error('fallo', e);
    expect(error).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(e, {
      extra: { mensaje: 'fallo' },
    });
  });
});
