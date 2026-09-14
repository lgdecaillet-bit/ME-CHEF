import { fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { Campo } from '../Campo';
import { colores, espacio, tactil, tipografia } from '../tokens';
import { conOcultos, dibujar, estiloDe } from './dibujar';

let anunciar: jest.SpyInstance;

beforeEach(() => {
  anunciar = jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
});

type Props = Parameters<typeof Campo>[0];

function elCampo(props: Partial<Props> = {}) {
  return (
    <Campo etiqueta="Ingrediente" valor="" alCambiar={jest.fn()} testID="c" {...props} />
  );
}

const entrada = () => screen.getByTestId('c');
const caja = () => estiloDe(screen.getByTestId('c.caja'));
const textoDeLaEtiqueta = (texto = 'Ingrediente') => screen.getByText(texto, conOcultos);

/** Los testID del árbol dibujado, en el orden en que se ven de arriba abajo. */
function ordenDeArribaAbajo(): string[] {
  const vistos: string[] = [];
  const recorrer = (nodo: unknown) => {
    if (nodo == null || typeof nodo !== 'object') return;
    if (Array.isArray(nodo)) {
      nodo.forEach(recorrer);
      return;
    }
    const { props, children } = nodo as {
      props?: { testID?: string };
      children?: unknown;
    };
    if (props?.testID != null) vistos.push(props.testID);
    recorrer(children);
  };
  recorrer(screen.toJSON());
  return vistos;
}

describe('Campo', () => {
  it('VoiceOver lo nombra con su etiqueta, y la etiqueta visible no se lee dos veces', async () => {
    await dibujar(elCampo());
    expect(screen.getByLabelText('Ingrediente')).toBe(entrada());
    expect(screen.queryByText('Ingrediente')).toBeNull();
    expect(screen.getByText('Ingrediente', conOcultos)).toBeTruthy();
  });

  it('la etiqueta va encima de la caja, fuera de ella, y la caja solo lleva lo escrito', async () => {
    await dibujar(elCampo({ error: 'Falta algo.' }));
    expect(ordenDeArribaAbajo()).toEqual([
      'c.etiqueta',
      'c.caja',
      'c',
      'c.error.icono',
      'c.error',
    ]);
    // En su sitio, sin moverse: ni posición absoluta ni transformaciones.
    expect(estiloDe(screen.getByTestId('c.etiqueta', conOcultos))).toEqual({});
    expect(caja().paddingTop).toBeUndefined();
    expect(caja().paddingVertical).toBe(espacio.s);
  });

  it('vacío y sin tocar: etiqueta en gris secundario, superficie blanca y borde gris', async () => {
    await dibujar(elCampo());
    expect(estiloDe(textoDeLaEtiqueta())).toMatchObject({
      fontSize: tipografia.secundario.fontSize,
      color: colores.claro.texto2,
    });
    expect(caja()).toMatchObject({
      borderColor: colores.claro.borde,
      backgroundColor: colores.claro.superficie,
    });
  });

  it('al tocarlo, solo cambia el borde, al acento; la etiqueta no se mueve', async () => {
    await dibujar(elCampo());
    const antes = estiloDe(textoDeLaEtiqueta());
    await fireEvent(entrada(), 'focus');
    expect(caja().borderColor).toBe(colores.claro.acento);
    expect(estiloDe(textoDeLaEtiqueta())).toEqual(antes);
  });

  it('al salir, el borde vuelve a gris', async () => {
    await dibujar(elCampo());
    await fireEvent(entrada(), 'focus');
    await fireEvent(entrada(), 'blur');
    expect(caja().borderColor).toBe(colores.claro.borde);
  });

  it('con valor, se ve lo escrito', async () => {
    await dibujar(elCampo({ valor: 'Tomate' }));
    expect(entrada().props.value).toBe('Tomate');
  });

  it('la caja mide al menos lo mínimo tocable', async () => {
    await dibujar(elCampo());
    expect(caja().minHeight).toBe(tactil.minimo);
  });

  it('escribir avisa con el texto nuevo', async () => {
    const alCambiar = jest.fn();
    await dibujar(elCampo({ alCambiar }));
    await fireEvent.changeText(entrada(), 'Tomate');
    expect(alCambiar).toHaveBeenCalledWith('Tomate');
  });

  it('error: todo en rojo, el mensaje debajo con su icono, y VoiceOver lo oye y lo anuncia', async () => {
    await dibujar(elCampo({ error: 'Escribe un ingrediente para seguir.' }));
    expect(caja().borderColor).toBe(colores.claro.rojo);
    expect(estiloDe(textoDeLaEtiqueta()).color).toBe(colores.claro.rojo);
    expect(screen.getByTestId('c.error').props.children).toBe(
      'Escribe un ingrediente para seguir.'
    );
    expect(screen.getByTestId('c.error.icono', conOcultos).props).toMatchObject({
      name: 'exclamationmark.circle',
      tintColor: colores.claro.rojo,
    });
    expect(entrada().props.accessibilityHint).toBe('Escribe un ingrediente para seguir.');
    expect(anunciar).toHaveBeenCalledWith('Escribe un ingrediente para seguir.');
  });

  it('con el dedo encima y un error, el borde sigue en rojo', async () => {
    await dibujar(elCampo({ error: 'Falta algo.' }));
    await fireEvent(entrada(), 'focus');
    expect(caja().borderColor).toBe(colores.claro.rojo);
  });

  it('sin error, VoiceOver oye la pista; con error, el error manda', async () => {
    await dibujar(elCampo({ pista: 'Lo que tengas en casa' }));
    expect(entrada().props.accessibilityHint).toBe('Lo que tengas en casa');
    expect(screen.queryByTestId('c.error')).toBeNull();
    await screen.rerender(
      elCampo({ pista: 'Lo que tengas en casa', error: 'Falta algo.' })
    );
    expect(entrada().props.accessibilityHint).toBe('Falta algo.');
  });

  it('el error se anuncia cuando aparece o cambia, no cada vez que se dibuja', async () => {
    await dibujar(elCampo({ error: 'Falta algo.' }));
    await screen.rerender(elCampo({ error: 'Falta algo.', valor: 'x' }));
    expect(anunciar).toHaveBeenCalledTimes(1);
    await screen.rerender(elCampo({ error: 'Otra cosa.' }));
    expect(anunciar).toHaveBeenCalledTimes(2);
    await screen.rerender(elCampo());
    expect(anunciar).toHaveBeenCalledTimes(2);
  });

  it('deshabilitado: no se puede escribir, va en gris, y VoiceOver lo dice', async () => {
    await dibujar(elCampo({ valor: 'Casa', deshabilitado: true }));
    expect(entrada().props.editable).toBe(false);
    expect(entrada().props.accessibilityState).toMatchObject({ disabled: true });
    expect(caja().backgroundColor).toBe(colores.claro.superficie2);
    expect(estiloDe(entrada()).color).toBe(colores.claro.texto3);
  });

  it('la letra sigue Dynamic Type, como Texto, también con la escala de la galería', async () => {
    await dibujar(elCampo());
    expect(entrada().props.allowFontScaling).toBe(true);
    expect(entrada().props.maxFontSizeMultiplier).toBe(tipografia.cuerpo.escalaMaxima);
    expect(estiloDe(entrada())).toMatchObject({
      fontSize: tipografia.cuerpo.fontSize,
      color: colores.claro.texto,
    });
    await dibujar(elCampo(), { escalaDeLetra: 1.353 });
    expect(entrada().props.allowFontScaling).toBe(false);
    expect(estiloDe(entrada()).fontSize).toBeCloseTo(tipografia.cuerpo.fontSize * 1.353);
  });

  it('con la letra más grande, se queda en el tamaño que le da iOS al cuerpo', async () => {
    await dibujar(elCampo(), { escalaDeLetra: 3.571 });
    expect(estiloDe(entrada()).fontSize).toBeCloseTo(
      tipografia.cuerpo.fontSize * tipografia.cuerpo.escalaMaxima
    );
  });

  it('una etiqueta larga no se corta: con la letra grande ocupa las líneas que haga falta', async () => {
    await dibujar(elCampo({ etiqueta: 'Nombre del hogar donde vives' }), {
      escalaDeLetra: 3.571,
    });
    const texto = textoDeLaEtiqueta('Nombre del hogar donde vives');
    expect(texto.props.numberOfLines).toBeUndefined();
    expect(estiloDe(texto).fontSize).toBeCloseTo(
      tipografia.secundario.fontSize * tipografia.secundario.escalaMaxima
    );
    // VoiceOver la oye entera: es el nombre del campo.
    expect(screen.getByLabelText('Nombre del hogar donde vives')).toBe(entrada());
  });

  it('en oscuro, con la superficie del modo oscuro', async () => {
    await dibujar(elCampo(), { esquema: 'oscuro' });
    expect(caja().backgroundColor).toBe(colores.oscuro.superficie);
  });

  it('sin testID, se dibuja igual, también con error', async () => {
    await dibujar(
      <Campo etiqueta="Ingrediente" valor="" alCambiar={jest.fn()} error="Falta algo." />
    );
    expect(screen.getByLabelText('Ingrediente')).toBeTruthy();
    expect(screen.getByText('Falta algo.')).toBeTruthy();
  });
});
