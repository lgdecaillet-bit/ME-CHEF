import { screen, userEvent } from '@testing-library/react-native';

import { Chip } from '../Chip';
import { colores, opacidad } from '../tokens';
import { apoyarDedo, conOcultos, dibujar, estiloDe, levantarDedo } from './dibujar';

type Props = Parameters<typeof Chip>[0];

async function chip(props: Partial<Props> = {}) {
  const alTocar = jest.fn();
  await dibujar(<Chip etiqueta="Tomate" onPress={alTocar} testID="c" {...props} />);
  return alTocar;
}

const caja = () => estiloDe(screen.getByTestId('c'));
const letra = () => estiloDe(screen.getByText('Tomate')).color;
const icono = () => screen.queryByTestId('c.icono', conOcultos);

describe('Chip', () => {
  it('normal: VoiceOver lee su texto y no está seleccionado; superficie y borde gris', async () => {
    await chip();
    expect(screen.getByRole('button', { name: 'Tomate', selected: false })).toBeTruthy();
    expect(caja()).toMatchObject({
      backgroundColor: colores.claro.superficie,
      borderColor: colores.claro.borde,
      borderStyle: 'solid',
    });
    expect(letra()).toBe(colores.claro.texto);
    expect(icono()).toBeNull();
  });

  it('seleccionado: se rellena con el acento, lleva una marca, y VoiceOver lo dice', async () => {
    await chip({ seleccionado: true });
    expect(screen.getByRole('button', { name: 'Tomate', selected: true })).toBeTruthy();
    expect(caja().backgroundColor).toBe(colores.claro.acento);
    expect(letra()).toBe(colores.claro.sobreAcento);
    expect(icono()?.props).toMatchObject({
      name: 'checkmark',
      tintColor: colores.claro.sobreAcento,
    });
  });

  it('pregunta: ámbar, con borde punteado y una interrogación, no solo el color', async () => {
    await chip({ tipo: 'pregunta' });
    expect(caja()).toMatchObject({
      borderColor: colores.claro.ambar,
      borderStyle: 'dashed',
    });
    expect(letra()).toBe(colores.claro.ambar);
    expect(icono()?.props.name).toBe('questionmark.circle');
  });

  it('supuesto: gris, sin borde que destaque', async () => {
    await chip({ tipo: 'supuesto' });
    expect(caja()).toMatchObject({
      backgroundColor: colores.claro.superficie2,
      borderColor: colores.claro.superficie2,
    });
    expect(letra()).toBe(colores.claro.texto2);
  });

  it('una pregunta ya elegida se ve elegida: la selección manda sobre el tipo', async () => {
    await chip({ tipo: 'pregunta', seleccionado: true });
    expect(caja()).toMatchObject({
      backgroundColor: colores.claro.acento,
      borderStyle: 'solid',
    });
    expect(icono()?.props.name).toBe('checkmark');
  });

  it('deshabilitado: gris, no responde, y VoiceOver lo dice, aunque esté elegido', async () => {
    const alTocar = await chip({ deshabilitado: true, seleccionado: true });
    await userEvent.setup().press(screen.getByTestId('c'));
    expect(alTocar).not.toHaveBeenCalled();
    expect(screen.getByTestId('c').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(letra()).toBe(colores.claro.texto3);
    expect(caja().backgroundColor).toBe(colores.claro.superficie2);
  });

  it('al tocarlo avisa, una vez', async () => {
    const alTocar = await chip();
    await userEvent.setup().press(screen.getByTestId('c'));
    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it('la pista va aparte del nombre', async () => {
    await chip({ pista: 'Lo marca como que lo tienes' });
    expect(screen.getByRole('button', { name: 'Tomate' }).props.accessibilityHint).toBe(
      'Lo marca como que lo tienes'
    );
  });

  it('mide al menos 44 pt de alto', async () => {
    await chip();
    expect(caja().minHeight).toBe(44);
  });

  it('se atenúa mientras el dedo lo toca', async () => {
    await chip();
    await apoyarDedo(screen.getByTestId('c'));
    expect(caja().opacity).toBe(opacidad.pulsado);
    await levantarDedo(screen.getByTestId('c'));
    expect(caja().opacity).toBeUndefined();
  });

  it('sin testID, el icono tampoco lleva uno', async () => {
    await dibujar(<Chip etiqueta="Sal" tipo="pregunta" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Sal' })).toBeTruthy();
  });
});
