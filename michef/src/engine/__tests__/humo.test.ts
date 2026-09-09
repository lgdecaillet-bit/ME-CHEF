// Test de humo: existe solo para que el gate tenga algo que correr en D2.
// Los tests de verdad del motor, con casos límite, propiedades invariantes y
// los 7 bugs conocidos como `test.failing`, llegan en D3.
import { porcionesDelHogar } from '../portions';

describe('el motor está enchufado', () => {
  it('un hogar sin comensales asume 2 porciones', () => {
    expect(porcionesDelHogar([])).toBe(2);
  });
});
