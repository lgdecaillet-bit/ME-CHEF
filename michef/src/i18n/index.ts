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
 * Un número como se escribe en castellano: con coma decimal («1,5 porciones»).
 * Todavía sin separador de miles: «1000» sale tal cual. Llegará cuando haga
 * falta (los precios, en Fase 3), y con él un test.
 */
export function numero(n: number): string {
  return String(n).replace('.', ',');
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
