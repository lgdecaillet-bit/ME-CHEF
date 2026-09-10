/**
 * Interruptores de funciones. Todo lo que está a medias se mergea apagado
 * (`protocolos-calidad.md` § 2, trunk-based), en vez de vivir en una rama larga.
 *
 * Cada interruptor se lee de `EXPO_PUBLIC_FLAG_<NOMBRE>` y **nace apagado**. Solo
 * se aceptan cuatro valores: `true`, `false`, `1` y `0`. Cualquier otra cosa
 * —«ture», «si», «on»— para la app al arrancar y dice cuál está mal escrito. Un
 * interruptor mal escrito que se queda apagado en silencio es justo el tipo de
 * error que cuesta una tarde encontrar.
 *
 * Cada fase añade el suyo cuando lo necesita. No se declaran por adelantado.
 */
export type Flags = {
  /** SQLCipher en la base local. Fase 1, necesita build de desarrollo. */
  cifrado: boolean;
  /** Foto de la nevera → inventario. Fase 2. */
  nevera: boolean;
  /** Foto de la factura → inventario y precios. Fase 3. */
  facturas: boolean;
};

type Crudo = Record<keyof Flags, string | undefined>;

const VALORES: Record<string, boolean> = {
  true: true,
  '1': true,
  false: false,
  '0': false,
};

export function interpretarFlags(crudo: Crudo): Flags {
  const flags = {} as Flags;
  const malos: string[] = [];

  for (const nombre of Object.keys(crudo) as (keyof Flags)[]) {
    const valor = crudo[nombre]?.trim().toLowerCase();
    if (valor === undefined || valor === '') {
      flags[nombre] = false;
    } else if (Object.prototype.hasOwnProperty.call(VALORES, valor)) {
      // Solo lo propio de la tabla, no lo heredado: con `valor in VALORES`,
      // «constructor» o «__proto__» pasaban como apagado en silencio. Lo
      // encontró el test de propiedad en D6. Y `hasOwnProperty.call` y no
      // `Object.hasOwn`, que es más nuevo: esto corre en el motor de
      // JavaScript del iPhone, no en el Node de los tests.
      flags[nombre] = VALORES[valor] === true;
    } else {
      malos.push(`  · EXPO_PUBLIC_FLAG_${nombre.toUpperCase()}`);
    }
  }

  if (malos.length > 0) {
    throw new Error(
      'Estos interruptores tienen un valor que no se entiende. Solo valen true, false, 1 o 0:\n' +
        malos.join('\n')
    );
  }
  return flags;
}

/** Lectura literal, por el mismo motivo que en `env.ts`. */
export function leerFlags(): Flags {
  return interpretarFlags({
    cifrado: process.env.EXPO_PUBLIC_FLAG_CIFRADO,
    nevera: process.env.EXPO_PUBLIC_FLAG_NEVERA,
    facturas: process.env.EXPO_PUBLIC_FLAG_FACTURAS,
  });
}
