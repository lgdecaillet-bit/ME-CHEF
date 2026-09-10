/**
 * Sentry: que un error en el iPhone nos llegue solo, con archivo y línea.
 *
 * **Nada personal sale del teléfono** (CLAUDE.md, prohibición dura). Un aviso de
 * error es una salida del teléfono como cualquier otra, así que antes de
 * enviarlo `limpiarEvento` le quita todo lo que parezca personal:
 *
 * - Campos cuyo **nombre** delata el contenido. El nombre se parte en palabras
 *   (`first_name` → first, name; `IPAddr` → ip, addr) y basta con que una sea
 *   personal: contacto, dirección, credenciales, y lo que CLAUDE.md prohíbe
 *   sacar por su nombre, **el cuerpo y los comensales** (`peso`, `edad`,
 *   `objetivo`, `comensal`…).
 * - **Valores** que parecen personales, estén donde estén: correos (también con
 *   tildes: josé@, müller.ch), teléfonos (también `079/123 45 67` y
 *   `(300) 123 4567`) y JWT.
 * - **Textos de más de 2.000 caracteres, enteros y sin revisarlos.** Suelen ser
 *   un JSON o una imagen en base64, y una foto no puede salir del teléfono.
 *   Además, revisarlos congelaría la app: este filtro corre con cada error y con
 *   cada miga, y cada `console.*` de cualquier librería es una miga.
 * - El bloque `user` entero, el `server_name` y el nombre del dispositivo, que
 *   en iOS suele ser «iPhone de <nombre>».
 *
 * Lo que **no** se toca: la pila de llamadas (`stacktrace`) y `debug_meta`. Son
 * nombres de archivo y números de línea, que es justo lo que hace útil el
 * aviso, y un filtro de teléfonos pasado por encima rompería la simbolicación.
 *
 * **Límite que hay que conocer: esto solo cubre los errores de JavaScript.** El
 * SDK no le pasa `beforeSend` a su parte nativa, así que un crash nativo sale
 * sin pasar por aquí (decisión #57, punto 12). En Expo Go no hay parte nativa;
 * en el primer build de D7 sí, y hay un aviso escrito en `estado.md`.
 *
 * **Lo que protege el nombre del campo, sin exagerar:** las columnas de las
 * tablas de la base local se llaman `tipo`, `valor` o `noCome`, que no delatan
 * nada. Una fila de `objetivo`, `comensal` o `restriccion` solo se quita si va
 * dentro de un campo con ese nombre. **Nunca se pasa una fila de la base local
 * a `log` ni a Sentry** (decisión #57, punto 13).
 *
 * Y lo que ningún filtro atrapa: un nombre propio suelto en un texto («Ana
 * Pérez»). La única defensa es no pasárselo a `log`, ni a `setContext`,
 * `setUser`, `setTag` o `setExtra`.
 */
import * as Sentry from '@sentry/react-native';
import type { Breadcrumb, ErrorEvent } from '@sentry/react-native';

const QUITADO = '[quitado]';

const TOPE_DE_TEXTO = 2000;

// Palabras que delatan un dato personal en el nombre de un campo, estén donde
// estén, también en los contextos del SDK. Las de 4 letras o más cuentan
// también como principio o final de una palabra más larga (`useremail`,
// `accesstoken`, `codigopostal`); las cortas (`ip`, `lat`) solo enteras, para
// que `tip` o `zip` no caigan por contener `ip`.
const PERSONALES = new Set([
  // Contacto e identidad
  'email',
  'mail',
  'correo',
  'telefono',
  'teléfono',
  'phone',
  'mobile',
  'movil',
  'móvil',
  'celular',
  'apellido',
  'apellidos',
  'surname',
  'firstname',
  'lastname',
  'middlename',
  'fullname',
  'displayname',
  'givenname',
  'familyname',
  'nombrecompleto',
  'user',
  'usuario',
  // Dónde vive
  'direccion',
  'dirección',
  'address',
  'calle',
  'domicilio',
  'street',
  'postal',
  'zipcode',
  'postcode',
  'lat',
  'latitud',
  'latitude',
  'lon',
  'lng',
  'longitud',
  'longitude',
  'ip',
  // Credenciales
  'password',
  'contrasena',
  'contraseña',
  'secret',
  'token',
  'authorization',
  'cookie',
]);

// El cuerpo y el hogar: «el objetivo físico y los comensales nunca salen»
// (CLAUDE.md). Solo como palabra entera —los `pesos` de un precio no son el
// `peso` de nadie— y solo en datos nuestros: en los contextos del SDK,
// `screen_height_pixels` es la pantalla, no la persona.
const DEL_CUERPO_Y_EL_HOGAR = new Set([
  'comensal',
  'comensales',
  'peso',
  'altura',
  'estatura',
  'edad',
  'sexo',
  'genero',
  'género',
  'objetivo',
  'nacimiento',
  'fechanacimiento',
  'alergia',
  'alergias',
  'intolerancia',
  'intolerancias',
  // Así se llama la tabla de las alergias en src/db/schema.ts.
  'restriccion',
  'restricciones',
  'weight',
  'height',
  'age',
  'gender',
  'sex',
  'birth',
  'birthday',
  'birthdate',
  'dob',
]);

// «name» y «nombre» no bastan solos en todas partes: `os.name` es «iOS» y
// `typeName` es «Error». En datos nuestros son personales solos, o acompañados
// de una de estas palabras.
const ACOMPANAN_A_NOMBRE = new Set([
  'first',
  'last',
  'middle',
  'full',
  'display',
  'given',
  'family',
  'legal',
  'real',
  'completo',
]);

// Los contextos que rellena el propio SDK (comprobado en su código: `app`,
// `device`, `os`, `ota_updates`, `replay`, más los habituales del núcleo). En
// ellos `name` es «iOS» o «Hermes» y `height` es la pantalla. Cualquier otro
// —uno propio, puesto con `setContext`— se limpia en estricto.
//
// Lista cerrada, a propósito: la primera versión aceptaba además todo lo que
// empezara por `expo`, y un `setContext('exportacion', …)` se saltaba el modo
// estricto. El SDK no pone ningún contexto con ese nombre.
const CONTEXTOS_DEL_SDK = new Set([
  'app',
  'device',
  'os',
  'runtime',
  'culture',
  'trace',
  'replay',
  'ota_updates',
  'react_native_context',
]);

type Modo = 'estricto' | 'sdk';

function esContextoDelSdk(clave: string): boolean {
  return CONTEXTOS_DEL_SDK.has(clave);
}

function palabras(clave: string): string[] {
  return clave
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // phoneNumber → phone Number
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // IPAddr → IP Addr
    .split(/[\s_.-]+/)
    .map((p) => p.toLowerCase())
    .filter(Boolean);
}

// Solo cuentan enteras aunque tengan 4 letras o más: `calle` como principio de
// palabra se llevaba `caller` y `callee`, palabras técnicas en inglés.
const SOLO_ENTERAS = new Set(['calle']);

function esPalabraPersonal(palabra: string): boolean {
  if (PERSONALES.has(palabra)) return true;
  if (palabra.length < 4) return false;
  for (const p of PERSONALES) {
    if (
      p.length >= 4 &&
      !SOLO_ENTERAS.has(p) &&
      (palabra.startsWith(p) || palabra.endsWith(p))
    ) {
      return true;
    }
  }
  return false;
}

function esClavePersonal(clave: string, modo: Modo): boolean {
  const ps = palabras(clave);
  if (ps.some(esPalabraPersonal)) return true;
  if (modo === 'sdk') return false;
  if (ps.some((p) => DEL_CUERPO_Y_EL_HOGAR.has(p))) return true;
  if (!ps.includes('name') && !ps.includes('nombre')) return false;
  if (ps.length === 1) return true;
  return ps.some((p) => ACOMPANAN_A_NOMBRE.has(p));
}

// Letras con tilde, diéresis y eñe (U+00C0–U+024F) escritas como rango y no con
// `\p{L}`, para no depender de que el motor de JavaScript del iPhone soporte
// las clases Unicode en expresiones regulares.
//
// **Todas las repeticiones llevan tope.** Sin él, la de correos recorría el
// texto hasta el final desde cada posición: 50.000 caracteres sin «@» tardaban
// 3,4 s, y 200.000, casi un minuto. Lo midió el revisor en D6. Los topes son los
// de la norma: 64 caracteres antes de la @, 63 por tramo del dominio.
const VALORES_PERSONALES: RegExp[] = [
  // Correo: todo lo que la norma permite antes de la @ (RFC 5322, «atext»),
  // apóstrofo incluido, más letras con tilde.
  /[A-Za-z0-9À-ɏ!#$%&'*+/=?^_`{|}~.-]{1,64}@[A-Za-z0-9À-ɏ-]{1,63}(?:\.[A-Za-z0-9À-ɏ-]{1,63}){0,8}\.[A-Za-zÀ-ɏ]{2,24}/g,
  // JWT. Uno de más de 2.048 caracteres por tramo ya lo quita el tope de texto.
  /eyJ[\w-]{8,2048}\.[\w-]{8,2048}\.[\w-]{8,2048}/g,
  // Teléfono: 9 a 15 cifras, separadas por espacio, punto, guion, barra o
  // paréntesis. Borra también números largos que no son personales (una marca
  // de tiempo en un mensaje): se acepta, sobra antes que falte.
  /\+?\(?\d(?:[\s./()-]{0,3}\d){8,14}/g,
];

const PROFUNDIDAD_MAXIMA = 8;

/**
 * Pasa las expresiones de valores personales por un texto, sin tope de
 * longitud. Se exporta solo para el test de rendimiento, que comprueba que las
 * expresiones no se vuelven cuadráticas aunque algún día se quite el tope.
 */
export function aplicarPatrones(texto: string): string {
  return VALORES_PERSONALES.reduce((t, patron) => t.replace(patron, QUITADO), texto);
}

function limpiarTexto(texto: string): string {
  if (texto.length > TOPE_DE_TEXTO) {
    return `[quitado: texto de ${texto.length} caracteres]`;
  }
  return aplicarPatrones(texto);
}

/**
 * Recorre cualquier valor y devuelve una copia sin datos personales. No
 * modifica el original. Aguanta ciclos y profundidad excesiva: lo que no puede
 * recorrer, lo quita.
 *
 * `modo: 'sdk'` es para los contextos que rellena el propio SDK: ahí `name` y
 * `height` son técnicos. En todo lo demás, estricto.
 */
export function limpiarPII<T>(valor: T, modo: Modo = 'estricto'): T {
  const vistos = new WeakSet<object>();

  function recorrer(v: unknown, profundidad: number): unknown {
    if (typeof v === 'string') return limpiarTexto(v);
    if (v === null || typeof v !== 'object') return v;
    if (profundidad > PROFUNDIDAD_MAXIMA || vistos.has(v)) return QUITADO;
    vistos.add(v);

    if (Array.isArray(v)) return v.map((x) => recorrer(x, profundidad + 1));

    const copia: Record<string, unknown> = {};
    for (const [clave, dentro] of Object.entries(v)) {
      copia[clave] = esClavePersonal(clave, modo)
        ? QUITADO
        : recorrer(dentro, profundidad + 1);
    }
    return copia;
  }

  return recorrer(valor, 0) as T;
}

function limpiarContextos(contextos: ErrorEvent['contexts']): ErrorEvent['contexts'] {
  if (!contextos) return contextos;
  const limpio: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(contextos)) {
    const delSdk = esContextoDelSdk(clave);
    limpio[clave] =
      !delSdk && esClavePersonal(clave, 'estricto')
        ? QUITADO
        : limpiarPII(valor, delSdk ? 'sdk' : 'estricto');
  }
  return limpio as ErrorEvent['contexts'];
}

export function limpiarEvento(evento: ErrorEvent): ErrorEvent {
  const limpio: ErrorEvent = {
    ...evento,
    message: evento.message === undefined ? undefined : limpiarTexto(evento.message),
    logentry: limpiarPII(evento.logentry),
    extra: limpiarPII(evento.extra),
    tags: limpiarPII(evento.tags),
    contexts: limpiarContextos(evento.contexts),
    breadcrumbs: limpiarPII(evento.breadcrumbs),
    request: limpiarPII(evento.request),
    user: undefined,
    server_name: undefined,
  };

  if (limpio.contexts?.device) {
    limpio.contexts = {
      ...limpio.contexts,
      device: { ...limpio.contexts.device, name: undefined },
    };
  }

  // El mensaje del error sí se limpia («no encuentro a ana@x.com»); su pila no.
  if (evento.exception?.values) {
    limpio.exception = {
      ...evento.exception,
      values: evento.exception.values.map((e) => ({
        ...e,
        value: e.value === undefined ? undefined : limpiarTexto(e.value),
      })),
    };
  }

  return limpio;
}

/**
 * Inicia Sentry si hay DSN. Sin DSN no hace nada y devuelve `false`: la app
 * funciona igual, solo que sin avisos.
 *
 * El DSN se recorta, igual que en `env.ts`: pegado con un espacio delante pasa
 * la validación, y Sentry lo descartaría sin avisar.
 *
 * En Expo Go se envían los errores de JavaScript, pero no los nativos: Expo Go
 * no incluye el código nativo de Sentry. Los nativos se prueban con un build
 * de desarrollo, cuando haya licencia de Apple.
 */
export function iniciarSentry(dsn: string | undefined): boolean {
  const recortado = dsn?.trim();
  if (!recortado) return false;

  Sentry.init({
    dsn: recortado,
    environment: __DEV__ ? 'desarrollo' : 'produccion',
    // Sentry no añade IP, cookies ni usuario por su cuenta.
    sendDefaultPii: false,
    // Una captura de pantalla puede enseñar la nevera, una factura o una
    // receta con nombre propio. Nunca.
    attachScreenshot: false,
    attachViewHierarchy: false,
    // Sin grabación de sesión ni medición de rendimiento: hoy no se necesitan
    // y cada una es otra cosa que sale del teléfono.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    tracesSampleRate: 0,
    beforeSend: limpiarEvento,
    beforeBreadcrumb: (miga: Breadcrumb) => limpiarPII(miga),
  });
  return true;
}
