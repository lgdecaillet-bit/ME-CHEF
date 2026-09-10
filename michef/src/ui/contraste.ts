/**
 * Contraste entre dos colores, con la fórmula de WCAG 2.2 (criterio 1.4.3).
 *
 * Lo usa `__tests__/contraste.test.ts`, que vigila que cada par texto/fondo de
 * los tokens llegue a AA en claro y en oscuro. No entra en la app: nadie de
 * `src/app/` lo importa.
 */
const FORMA = /^#[0-9a-f]{6}$/i;

function canal(valor: number): number {
  const c = valor / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminancia relativa: 0 es negro puro, 1 es blanco puro. */
export function luminancia(hex: string): number {
  // Solo #RRGGBB. Un «#FFF» o un «rgba(…)» calculados a medias darían un
  // contraste falso, y es justo lo que este cálculo existe para impedir.
  if (!FORMA.test(hex)) {
    throw new Error(
      `«${hex}» no es un color #RRGGBB: su contraste no se puede calcular.`
    );
  }
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * canal((n >> 16) & 255) +
    0.7152 * canal((n >> 8) & 255) +
    0.0722 * canal(n & 255)
  );
}

/** De 1 (el mismo color) a 21 (negro sobre blanco). AA pide 4,5 para texto. */
export function relacionDeContraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
