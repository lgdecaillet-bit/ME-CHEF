import { colores, espacio, tactil, tipografia } from '../tokens';

describe('tokens', () => {
  it('claro y oscuro tienen los mismos colores, todos escritos #RRGGBB', () => {
    expect(Object.keys(colores.oscuro).sort()).toEqual(Object.keys(colores.claro).sort());
    // Una sola forma de escribirlos: el cálculo de contraste solo acepta esta,
    // y así un «#fff» no se cuela sin que nadie lo compruebe.
    for (const esquema of Object.values(colores)) {
      for (const valor of Object.values(esquema)) expect(valor).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('los espacios siguen la rejilla de 4 pt', () => {
    for (const valor of Object.values(espacio)) expect(valor % 4).toBe(0);
  });

  it('lo que se toca mide al menos 44 pt, lo mínimo de Apple', () => {
    expect(tactil.minimo).toBeGreaterThanOrEqual(44);
  });

  it('cada estilo de texto tiene interlineado mayor que la letra, y puede crecer', () => {
    for (const estilo of Object.values(tipografia)) {
      expect(estilo.lineHeight).toBeGreaterThan(estilo.fontSize);
      expect(estilo.escalaMaxima).toBeGreaterThan(1);
    }
  });

  it('con la letra más grande, cada estilo llega al tamaño que le da iOS y no más', () => {
    const maximo = (e: { fontSize: number; escalaMaxima: number }) =>
      Math.round(e.fontSize * e.escalaMaxima);
    expect(maximo(tipografia.titulo1)).toBe(60);
    expect(maximo(tipografia.titulo2)).toBe(58);
    expect(maximo(tipografia.titulo3)).toBe(56);
    expect(maximo(tipografia.cuerpo)).toBe(53);
    expect(maximo(tipografia.nota)).toBe(44);
  });
});
