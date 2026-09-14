import { render } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';

import { ProveedorTema, useTema, type Tema } from '../tema';
import { colores, duracion, icono, opacidad, tipografia } from '../tokens';

// El modo del iPhone. `react-native` lo lee de este módulo.
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const modoDelIphone = useColorScheme as jest.Mock;

function Sonda({ alVer }: { alVer: (tema: Tema) => void }) {
  alVer(useTema());
  return null;
}

async function leerTema(
  props: { esquema?: 'claro' | 'oscuro'; escalaDeLetra?: number } = {}
) {
  const vistos: Tema[] = [];
  await render(
    <ProveedorTema {...props}>
      <Sonda alVer={(tema) => vistos.push(tema)} />
    </ProveedorTema>
  );
  const ultimo = vistos.at(-1);
  if (ultimo == null) throw new Error('La sonda no llegó a dibujarse.');
  return ultimo;
}

describe('ProveedorTema', () => {
  it('con el iPhone en claro, entrega los colores claros', async () => {
    modoDelIphone.mockReturnValue('light');
    const tema = await leerTema();
    expect(tema.esquema).toBe('claro');
    expect(tema.color).toEqual(colores.claro);
  });

  it('con el iPhone en oscuro, entrega los colores oscuros', async () => {
    modoDelIphone.mockReturnValue('dark');
    const tema = await leerTema();
    expect(tema.esquema).toBe('oscuro');
    expect(tema.color).toEqual(colores.oscuro);
  });

  it.each([null, 'unspecified'])(
    'si iOS no dice el modo (%s), usa el claro',
    async (valor) => {
      modoDelIphone.mockReturnValue(valor);
      expect((await leerTema()).esquema).toBe('claro');
    }
  );

  it('un modo forzado manda sobre el del iPhone, en los dos sentidos', async () => {
    modoDelIphone.mockReturnValue('light');
    expect((await leerTema({ esquema: 'oscuro' })).color).toEqual(colores.oscuro);
    modoDelIphone.mockReturnValue('dark');
    expect((await leerTema({ esquema: 'claro' })).color).toEqual(colores.claro);
  });

  it('entrega también la letra y, solo si se la dan, una escala simulada', async () => {
    modoDelIphone.mockReturnValue('light');
    const normal = await leerTema();
    expect(normal.tipografia).toBe(tipografia);
    expect(normal.escalaDeLetra).toBeUndefined();
    expect((await leerTema({ escalaDeLetra: 2 })).escalaDeLetra).toBe(2);
  });
});

describe('useTema', () => {
  it('fuera del proveedor falla diciendo dónde se monta, en vez de pintar sin colores', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<Sonda alVer={() => undefined} />)).rejects.toThrow(
      'useTema() se usó fuera de <ProveedorTema>. El proveedor se monta en src/app/_layout.tsx.'
    );
  });
});

describe('ProveedorTema, al volver a dibujarse', () => {
  it('trae también los iconos, las opacidades y la duración del aviso', async () => {
    modoDelIphone.mockReturnValue('light');
    const tema = await leerTema();
    expect(tema.icono).toBe(icono);
    expect(tema.opacidad).toBe(opacidad);
    expect(tema.duracion).toBe(duracion);
  });

  it('entrega el mismo tema mientras no cambie el modo ni la escala, y uno nuevo si cambian', async () => {
    modoDelIphone.mockReturnValue('light');
    const vistos: Tema[] = [];
    const arbol = (
      props: { esquema?: 'claro' | 'oscuro'; escalaDeLetra?: number } = {}
    ) => (
      <ProveedorTema {...props}>
        <Sonda alVer={(tema) => vistos.push(tema)} />
      </ProveedorTema>
    );
    const { rerender } = await render(arbol());
    await rerender(arbol());
    expect(vistos.at(-1)).toBe(vistos[0]);
    await rerender(arbol({ esquema: 'oscuro' }));
    expect(vistos.at(-1)).not.toBe(vistos[0]);
    const oscuro = vistos.at(-1);
    await rerender(arbol({ esquema: 'oscuro', escalaDeLetra: 2 }));
    expect(vistos.at(-1)).not.toBe(oscuro);
  });
});
