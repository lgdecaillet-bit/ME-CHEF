import { screen, userEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { Boton } from '../Boton';
import { colores, opacidad } from '../tokens';
import { apoyarDedo, conOcultos, dibujar, estiloDe, levantarDedo } from './dibujar';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));
const vibrar = Haptics.impactAsync as jest.Mock;

beforeEach(() => vibrar.mockResolvedValue(undefined));

type Props = Parameters<typeof Boton>[0];

async function boton(props: Partial<Props> = {}, esquema?: 'claro' | 'oscuro') {
  const alTocar = jest.fn();
  await dibujar(<Boton etiqueta="Cocinar" onPress={alTocar} testID="b" {...props} />, {
    esquema,
  });
  return alTocar;
}

const caja = () => estiloDe(screen.getByTestId('b'));
const letra = () => estiloDe(screen.getByText('Cocinar')).color;
const tocar = () => userEvent.setup().press(screen.getByTestId('b'));

describe('Boton', () => {
  it('VoiceOver lo lee igual que se ve (WCAG 2.5.3), y la pista va aparte', async () => {
    await boton({ pista: 'Abre los pasos de la receta' });
    const elBoton = screen.getByRole('button', { name: 'Cocinar' });
    expect(elBoton.props.accessibilityHint).toBe('Abre los pasos de la receta');
  });

  it('al tocarlo vibra suave y hace lo suyo, una vez', async () => {
    const alTocar = await boton();
    await tocar();
    expect(alTocar).toHaveBeenCalledTimes(1);
    expect(vibrar).toHaveBeenCalledTimes(1);
    expect(vibrar).toHaveBeenCalledWith('light');
  });

  it('si el iPhone no puede vibrar, el botón hace lo suyo igual', async () => {
    vibrar.mockRejectedValue(new Error('sin motor de vibración'));
    const alTocar = await boton();
    await tocar();
    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['primario', 'acento', 'sobreAcento'],
    ['secundario', 'superficie2', 'acento'],
    ['destructivo', 'superficie2', 'rojo'],
  ] as const)('%s: fondo %s y letra %s', async (variante, fondo, color) => {
    await boton({ variante });
    expect(caja().backgroundColor).toBe(colores.claro[fondo]);
    expect(letra()).toBe(colores.claro[color]);
  });

  it('terciario: sin fondo, con la letra del acento, como un enlace', async () => {
    await boton({ variante: 'terciario' });
    expect(caja().backgroundColor).toBe('transparent');
    expect(letra()).toBe(colores.claro.acento);
  });

  it('sin variante, es el primario', async () => {
    await boton();
    expect(caja().backgroundColor).toBe(colores.claro.acento);
  });

  it('en oscuro, con los colores del modo oscuro', async () => {
    await boton({}, 'oscuro');
    expect(caja().backgroundColor).toBe(colores.oscuro.acento);
    expect(letra()).toBe(colores.oscuro.sobreAcento);
  });

  it('deshabilitado: no responde ni vibra, va en gris, y VoiceOver lo dice', async () => {
    const alTocar = await boton({ deshabilitado: true });
    await tocar();
    expect(alTocar).not.toHaveBeenCalled();
    expect(vibrar).not.toHaveBeenCalled();
    expect(screen.getByTestId('b').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: false,
    });
    expect(caja().backgroundColor).toBe(colores.claro.superficie2);
    expect(letra()).toBe(colores.claro.texto3);
  });

  it('terciario deshabilitado sigue sin fondo', async () => {
    await boton({ variante: 'terciario', deshabilitado: true });
    expect(caja().backgroundColor).toBe('transparent');
    expect(letra()).toBe(colores.claro.texto3);
  });

  it('cargando: la rueda ocupa el sitio del icono, sigue diciendo qué es y no responde', async () => {
    const alTocar = await boton({ cargando: true, icono: 'fork.knife' });
    expect(screen.getByTestId('b.cargando').props.color).toBe(colores.claro.sobreAcento);
    expect(screen.queryByTestId('b.icono', conOcultos)).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Cocinar' }).props.accessibilityState
    ).toMatchObject({ disabled: true, busy: true });
    await tocar();
    expect(alTocar).not.toHaveBeenCalled();
  });

  it('con icono, lo dibuja del color de la letra, y VoiceOver no lo lee aparte', async () => {
    await boton({ icono: 'fork.knife', variante: 'secundario' });
    expect(screen.getByTestId('b.icono', conOcultos).props).toMatchObject({
      name: 'fork.knife',
      tintColor: colores.claro.acento,
      accessible: false,
    });
  });

  it('sin icono ni carga, solo el texto', async () => {
    await boton();
    expect(screen.queryByTestId('b.icono', conOcultos)).toBeNull();
    expect(screen.queryByTestId('b.cargando')).toBeNull();
  });

  it('mide al menos 44 pt de alto, lo mínimo tocable de Apple', async () => {
    await boton();
    expect(caja().minHeight).toBe(44);
  });

  it('se atenúa mientras el dedo lo toca, y vuelve al soltar', async () => {
    await boton();
    expect(caja().opacity).toBeUndefined();
    await apoyarDedo(screen.getByTestId('b'));
    expect(caja().opacity).toBe(opacidad.pulsado);
    await levantarDedo(screen.getByTestId('b'));
    expect(caja().opacity).toBeUndefined();
  });

  it('sin testID tampoco pone uno a la rueda ni al icono', async () => {
    await dibujar(<Boton etiqueta="Cocinar" onPress={jest.fn()} cargando />);
    await dibujar(<Boton etiqueta="Ver" onPress={jest.fn()} icono="fork.knife" />);
    expect(screen.getByRole('button', { name: 'Ver' })).toBeTruthy();
    expect(screen.queryByTestId('undefined.icono', conOcultos)).toBeNull();
  });
});
