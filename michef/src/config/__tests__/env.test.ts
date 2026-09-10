import { leerEntorno, validarEntorno } from '../env';

const URL_OK = 'https://npswkfpomhinewxsmiic.supabase.co';
const LLAVE_OK = 'sb_publishable_' + 'x'.repeat(40);
const DSN_OK = 'https://abc123@o1.ingest.de.sentry.io/1';

function crudo(cambios: Partial<Record<string, string | undefined>> = {}) {
  return {
    EXPO_PUBLIC_SUPABASE_URL: URL_OK,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: LLAVE_OK,
    EXPO_PUBLIC_SENTRY_DSN: DSN_OK,
    ...cambios,
  };
}

function mensajeDeError(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error('Se esperaba que lanzara, y no lanzó');
}

describe('validarEntorno', () => {
  it('con todo bien, devuelve los valores', () => {
    expect(validarEntorno(crudo())).toEqual({
      EXPO_PUBLIC_SUPABASE_URL: URL_OK,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: LLAVE_OK,
      EXPO_PUBLIC_SENTRY_DSN: DSN_OK,
    });
  });

  it('el DSN de Sentry es opcional: sin él, la app arranca igual', () => {
    const e = validarEntorno(crudo({ EXPO_PUBLIC_SENTRY_DSN: undefined }));
    expect(e.EXPO_PUBLIC_SENTRY_DSN).toBeUndefined();
  });

  it('quita espacios alrededor, que es lo que deja un copiar-pegar', () => {
    const e = validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_URL: `  ${URL_OK}\n` }));
    expect(e.EXPO_PUBLIC_SUPABASE_URL).toBe(URL_OK);
  });

  it('si falta la URL, no arranca y dice cuál falta', () => {
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_URL: undefined }))
    );
    expect(m).toContain('EXPO_PUBLIC_SUPABASE_URL: falta');
    expect(m).not.toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  });

  it('una variable escrita pero vacía (`VAR=`) cuenta como que falta', () => {
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_ANON_KEY: '   ' }))
    );
    expect(m).toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY: falta');
  });

  it('si la URL no es una URL, lo dice distinto a si falta', () => {
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_URL: 'npswkfpomhinewxsmiic' }))
    );
    expect(m).toContain('EXPO_PUBLIC_SUPABASE_URL: no tiene el formato esperado');
  });

  // Regresiones del revisor en D6: `z.url()` daba por buenas direcciones que
  // no son web, y la app habría arrancado para fallar en la primera llamada.
  it.each(['javascript:alert(1)', 'localhost:54321', 'http:/x', 'ftp://x.supabase.co'])(
    'la URL de Supabase «%s» no pasa: tiene que ser http o https',
    (url) => {
      const m = mensajeDeError(() =>
        validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_URL: url }))
      );
      expect(m).toContain('EXPO_PUBLIC_SUPABASE_URL: no tiene el formato esperado');
    }
  );

  // La Supabase local habla http, y el iPhone llega a ella por la IP del PC.
  it.each([
    'http://127.0.0.1:54321',
    'http://192.168.1.20:54321',
    'http://localhost:54321',
  ])('la Supabase local «%s» sí pasa', (local) => {
    expect(
      validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_URL: local })).EXPO_PUBLIC_SUPABASE_URL
    ).toBe(local);
  });

  // El DSN es una URL con una forma concreta: https://<llave>@<servidor>/<proyecto>.
  // La del panel de Sentry parece buena, no lleva llave, y Sentry la descarta
  // sin avisar: se habría confundido con «el problema de la región EU».
  it.each([
    'https://mechef.sentry.io/projects/mechef/',
    'https://o1.ingest.de.sentry.io/1',
    'https://abc@o1.ingest.de.sentry.io/',
    'http://abc@o1.ingest.de.sentry.io/1',
  ])('el DSN «%s» no pasa', (dsn) => {
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SENTRY_DSN: dsn }))
    );
    expect(m).toContain('EXPO_PUBLIC_SENTRY_DSN: no tiene el formato esperado');
  });

  it('una llave cortada a medias no pasa', () => {
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOi' }))
    );
    expect(m).toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY: no tiene el formato esperado');
  });

  it('un DSN escrito pero roto no se ignora en silencio', () => {
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SENTRY_DSN: 'no-es-url' }))
    );
    expect(m).toContain('EXPO_PUBLIC_SENTRY_DSN: no tiene el formato esperado');
  });

  it('si faltan varias, las nombra todas, cada una una sola vez', () => {
    const m = mensajeDeError(() =>
      validarEntorno(
        crudo({
          EXPO_PUBLIC_SUPABASE_URL: undefined,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: undefined,
        })
      )
    );
    expect(m).toContain('EXPO_PUBLIC_SUPABASE_URL: falta');
    expect(m).toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY: falta');
    expect(m.match(/EXPO_PUBLIC_SUPABASE_URL/g)).toHaveLength(1);
  });

  it('el mensaje nombra la variable pero NUNCA enseña su valor', () => {
    // El error puede acabar en Sentry o en una captura de pantalla.
    const valorSecreto = 'eyJ-esto-no-debe-salir-en-el-mensaje';
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_ANON_KEY: valorSecreto }))
    );
    expect(m).toContain('EXPO_PUBLIC_SUPABASE_ANON_KEY');
    expect(m).not.toContain(valorSecreto);
  });

  it('el mensaje dice dónde se arregla', () => {
    const m = mensajeDeError(() =>
      validarEntorno(crudo({ EXPO_PUBLIC_SUPABASE_URL: undefined }))
    );
    expect(m).toContain('michef/.env');
  });
});

describe('leerEntorno', () => {
  const guardado = { ...process.env };
  afterEach(() => {
    process.env = { ...guardado };
  });

  it('lee las tres variables de process.env', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = URL_OK;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = LLAVE_OK;
    process.env.EXPO_PUBLIC_SENTRY_DSN = DSN_OK;
    expect(leerEntorno()).toEqual({
      EXPO_PUBLIC_SUPABASE_URL: URL_OK,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: LLAVE_OK,
      EXPO_PUBLIC_SENTRY_DSN: DSN_OK,
    });
  });

  it('sin variables, lanza en vez de devolver algo a medias', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => leerEntorno()).toThrow('EXPO_PUBLIC_SUPABASE_URL: falta');
  });
});
