/**
 * Las variables de entorno se validan al arrancar, en el segundo cero.
 *
 * Si falta una, la app no arranca y dice **cuál**. Mejor un error claro al
 * abrirla que uno confuso veinte minutos después, cuando la primera llamada a
 * Supabase falla sin decir por qué.
 *
 * El mensaje de error nombra las variables, **nunca sus valores**: el error
 * puede acabar en Sentry o en una captura de pantalla.
 */
import { z } from 'zod';

// La forma de un DSN: https://<llave>@<servidor>/<número de proyecto>. La
// dirección del panel de Sentry parece buena, no lleva llave, y Sentry la
// descarta sin avisar.
const FORMA_DSN = /^https:\/\/[^@\s/]+@[^\s/]+\/\d+$/;

// Una dirección web: http o https, y nada más. `z.url()` a secas da por buenas
// `javascript:alert(1)` o `localhost:54321` sin `http://`. Y `z.httpUrl()`, que
// parecía la solución, rechaza las IP y `localhost`: justo la Supabase local, a
// la que el iPhone llega por la IP del PC en la red de casa. Comprobado con las
// dos listas del test.
const URL_WEB = z.url({ protocol: /^https?$/ });

const esquema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: URL_WEB,
  // La llave pública de Supabase: un JWT (`eyJ…`) o una `sb_publishable_…`.
  // Ninguna de las dos mide menos de 40 caracteres; algo más corto es un
  // copiar-pegar a medias.
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(40),
  // Opcional: sin DSN, Sentry no se inicia y la app funciona igual. Así se
  // puede trabajar sin cuenta de Sentry, y los tests no la necesitan.
  EXPO_PUBLIC_SENTRY_DSN: z.string().regex(FORMA_DSN).optional(),
});

export type Entorno = z.infer<typeof esquema>;
type Crudo = Record<keyof Entorno, string | undefined>;

export function validarEntorno(crudo: Crudo): Entorno {
  // `VARIABLE=` sin nada detrás llega como cadena vacía. Cuenta como que falta.
  const limpio = Object.fromEntries(
    Object.entries(crudo).map(([k, v]) => [k, v?.trim() ? v.trim() : undefined])
  ) as Crudo;

  const resultado = esquema.safeParse(limpio);
  if (resultado.success) return resultado.data;

  const nombres = [...new Set(resultado.error.issues.map((i) => String(i.path[0])))];
  const lineas = nombres.map(
    (n) =>
      `  · ${n}: ${limpio[n as keyof Crudo] === undefined ? 'falta' : 'no tiene el formato esperado'}`
  );
  throw new Error(
    'La app no arranca sin estas variables de entorno:\n' +
      lineas.join('\n') +
      '\n\nSe ponen en michef/.env. La plantilla está en .env.example y los pasos, en COMANDOS.md § 9.'
  );
}

/**
 * Cada variable se lee **escrita literalmente**, a propósito. Expo solo
 * sustituye `process.env.EXPO_PUBLIC_ALGO` cuando aparece así en el código. Con
 * desestructuración o con `process.env[nombre]`, en el iPhone llega `undefined`
 * aunque la variable esté en el `.env`.
 */
export function leerEntorno(): Entorno {
  return validarEntorno({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  });
}
