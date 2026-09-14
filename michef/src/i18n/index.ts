/**
 * `t()` · la única forma de sacar un texto de `es.ts`.
 *
 * La clave está tipada: `t('galeria.titulo')` compila, y una clave que no
 * existe es un error de `npm run typecheck`, no un texto roto en el iPhone.
 */
import { log } from '@/lib/log';

import { es } from './es';

type Hojas<T, Prefijo extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefijo}${K}`
    : Hojas<T[K], `${Prefijo}${K}.`>;
}[keyof T & string];

export type Clave = Hojas<typeof es>;

type Valores = Record<string, string | number>;

/**
 * Cómo escribe los números una región: el separador de decimales y el de miles.
 * No depende del idioma de la app sino de la región del iPhone (decisión #60.9):
 * en Suiza, con la app en castellano, quien tiene el teléfono en alemán escribe
 * «1.5» y quien lo tiene en francés, «1,5». Y en Estados Unidos «1,5» se lee
 * como mil quinientos.
 */
export type FormatoDeNumeros = { decimal: string; miles: string };

/**
 * Un número con los separadores de una región: «1.234,5» en Colombia,
 * «1’234.5» en Suiza en alemán. Escribe exactamente el número que es, con los
 * decimales que tenga, sin redondear: redondear es cosa de quien lo muestra.
 *
 * «NaN», «Infinity» y los exponentes («1e+21») no llevan miles; solo se cambia
 * el punto decimal. Un número así en pantalla es un fallo de quien lo calculó,
 * y se ve.
 */
export function escribirNumero(n: number, { decimal, miles }: FormatoDeNumeros): string {
  const texto = String(n);
  if (!/^-?\d+(\.\d+)?$/.test(texto)) return texto.replace('.', decimal);
  // El signo va con la parte entera, y \B no parte entre él y la primera cifra.
  const [entera, fraccion] = texto.split('.') as [string, string?];
  const conMiles = entera.replace(/\B(?=(\d{3})+(?!\d))/g, miles);
  return fraccion == null ? conMiles : `${conMiles}${decimal}${fraccion}`;
}

/**
 * Los separadores con los que escribe la app. Hoy, coma decimal y sin miles, lo
 * de antes. PENDIENTE (#60.9): leerlos de la región del iPhone con
 * `expo-localization`, que espera el «adelante» de Luciano para instalarse.
 */
const formatoDeLaApp: FormatoDeNumeros = { decimal: ',', miles: '' };

/** Un número como lo escribe la app. */
export function numero(n: number): string {
  return escribirNumero(n, formatoDeLaApp);
}

export function t(clave: Clave, valores?: Valores): string {
  let nodo: unknown = es;
  for (const parte of clave.split('.')) {
    // `hasOwn` y no `nodo[parte]` a secas: «constructor» o «toString» existen
    // en cualquier objeto y no son textos.
    nodo =
      typeof nodo === 'object' && nodo !== null && Object.hasOwn(nodo, parte)
        ? (nodo as Record<string, unknown>)[parte]
        : undefined;
  }
  if (typeof nodo !== 'string') {
    // El tipo de `clave` ya lo impide; esto es para quien lo fuerce con `as`.
    // Se ve la clave en pantalla, que es un fallo visible, en vez de romper.
    log.error(`t(): la clave «${clave}» no es un texto de es.ts.`);
    return clave;
  }
  return nodo.replace(/\{(\w+)\}/g, (hueco: string, nombre: string) => {
    if (valores != null && Object.hasOwn(valores, nombre)) {
      const valor = valores[nombre];
      return typeof valor === 'number' ? numero(valor) : String(valor);
    }
    log.warn(`t(): falta el valor de {${nombre}} en «${clave}».`);
    return hueco;
  });
}
