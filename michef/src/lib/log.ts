/**
 * El único archivo del proyecto con permiso para usar `console`. ESLint lo
 * prohíbe en todo lo demás (`no-console`), así que cualquier mensaje interno
 * pasa por aquí y hay un solo sitio que decide adónde va.
 *
 * - En desarrollo, todo sale por la terminal de `npx expo start`.
 * - En producción, `info` y `warn` se callan: un log que nadie lee solo sirve
 *   para filtrar datos.
 * - `error` va **siempre** a Sentry, que es donde alguien lo va a ver. Si
 *   Sentry no está iniciado (sin DSN), `captureException` no hace nada.
 *
 * Lo que se pasa en `datos` viaja a Sentry como `extra`, y `beforeSend` le
 * quita lo que parezca personal antes de salir del teléfono (`sentry.ts`).
 * Aun así: no se le pasan datos personales a propósito.
 */
import * as Sentry from '@sentry/react-native';

type Datos = Record<string, unknown>;

// `__DEV__` se lee en cada llamada y no al importar, para que el test pueda
// comprobar las dos ramas sin recargar el módulo.
export const log = {
  info(mensaje: string, datos?: Datos): void {
    if (__DEV__) console.info(mensaje, datos ?? '');
  },

  warn(mensaje: string, datos?: Datos): void {
    if (__DEV__) console.warn(mensaje, datos ?? '');
  },

  error(mensaje: string, error?: unknown, datos?: Datos): void {
    if (__DEV__) console.error(mensaje, error ?? '', datos ?? '');
    // `mensaje` va después de `datos`: unos datos con su propio campo
    // «mensaje» no pueden pisar el del error.
    Sentry.captureException(error ?? new Error(mensaje), {
      extra: { ...datos, mensaje },
    });
  },
};
