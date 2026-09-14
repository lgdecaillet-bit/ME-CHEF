import { screen } from '@testing-library/react-native';

import { Etiqueta, type TipoDeEtiqueta } from '../Etiqueta';
import { colores } from '../tokens';
import { conOcultos, dibujar, estiloDe } from './dibujar';

const TIPOS = [
  ['seguro', 'checkmark.circle.fill', 'acento'],
  ['posible', 'questionmark.circle', 'ambar'],
  ['supuesto', 'circle.dashed', 'texto2'],
  ['estimado', 'plusminus.circle', 'texto2'],
  ['real', 'doc.text', 'texto'],
  ['aviso', 'exclamationmark.triangle.fill', 'rojo'],
] as const;

describe('Etiqueta', () => {
  it.each(TIPOS)(
    '%s: icono %s, y el texto y el icono en %s',
    async (tipo, icono, color) => {
      await dibujar(<Etiqueta tipo={tipo} texto="Lo vi" testID="e" />);
      expect(screen.getByTestId('e.icono', conOcultos).props).toMatchObject({
        name: icono,
        tintColor: colores.claro[color],
      });
      expect(estiloDe(screen.getByText('Lo vi')).color).toBe(colores.claro[color]);
    }
  );

  it('cada tipo tiene su propio icono: se distinguen también sin ver colores', () => {
    expect(new Set(TIPOS.map(([, icono]) => icono)).size).toBe(TIPOS.length);
  });

  it('lo estimado y lo real, y lo visto y lo supuesto, no se ven igual (principio 4)', () => {
    const aspecto = (tipo: TipoDeEtiqueta) => TIPOS.find(([t]) => t === tipo)?.slice(1);
    expect(aspecto('estimado')).not.toEqual(aspecto('real'));
    expect(aspecto('seguro')).not.toEqual(aspecto('supuesto'));
  });

  it('VoiceOver la lee como una sola cosa, con su texto; el icono no se lee aparte', async () => {
    await dibujar(<Etiqueta tipo="aviso" texto="Caduca mañana" testID="e" />);
    expect(screen.getByLabelText('Caduca mañana').props.accessible).toBe(true);
    expect(screen.queryByTestId('e.icono')).toBeNull();
  });

  it('va sobre un gris, y en oscuro con los colores del modo oscuro', async () => {
    await dibujar(<Etiqueta tipo="seguro" texto="Lo vi" testID="e" />, {
      esquema: 'oscuro',
    });
    expect(estiloDe(screen.getByTestId('e')).backgroundColor).toBe(
      colores.oscuro.superficie2
    );
    expect(estiloDe(screen.getByText('Lo vi')).color).toBe(colores.oscuro.acento);
  });

  it('sin testID, se dibuja igual', async () => {
    await dibujar(<Etiqueta tipo="real" texto="De tu factura" />);
    expect(screen.getByLabelText('De tu factura')).toBeTruthy();
  });
});
