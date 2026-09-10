import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, type EmitterSubscription } from 'react-native';

import { useMovimientoReducido } from '../useMovimientoReducido';

let preguntar: jest.SpyInstance;
let escuchar: (activado: boolean) => void;
const dejarDeEscuchar = jest.fn();

beforeEach(() => {
  preguntar = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled');
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((_evento, oyente) => {
      escuchar = oyente as unknown as (activado: boolean) => void;
      return { remove: dejarDeEscuchar } as unknown as EmitterSubscription;
    });
});

function sinRespuestaTodavia() {
  let responder: (valor: boolean) => void = () => undefined;
  const promesa = new Promise<boolean>((resolver) => {
    responder = resolver;
  });
  return { promesa, responder };
}

describe('useMovimientoReducido', () => {
  it('mientras iOS no contesta, cuenta como activado: mejor quieto que animar a quien no quiere', async () => {
    preguntar.mockReturnValue(sinRespuestaTodavia().promesa);
    const { result } = await renderHook(() => useMovimientoReducido());
    expect(result.current).toBe(true);
  });

  it('si iOS dice que está apagado, deja animar', async () => {
    preguntar.mockResolvedValue(false);
    const { result } = await renderHook(() => useMovimientoReducido());
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('si iOS dice que está activado, se queda quieto', async () => {
    preguntar.mockResolvedValue(true);
    const { result } = await renderHook(() => useMovimientoReducido());
    await act(async () => undefined);
    expect(result.current).toBe(true);
  });

  it('si iOS falla al contestar, se queda quieto', async () => {
    preguntar.mockRejectedValue(new Error('sin respuesta'));
    const { result } = await renderHook(() => useMovimientoReducido());
    await act(async () => undefined);
    expect(result.current).toBe(true);
  });

  it('si el usuario lo cambia con la app abierta, se entera', async () => {
    preguntar.mockResolvedValue(true);
    const { result } = await renderHook(() => useMovimientoReducido());
    await act(async () => escuchar(false));
    expect(result.current).toBe(false);
    await act(async () => escuchar(true));
    expect(result.current).toBe(true);
  });

  it('al irse deja de escuchar, y una respuesta que llega tarde no toca nada', async () => {
    const { promesa, responder } = sinRespuestaTodavia();
    preguntar.mockReturnValue(promesa);
    const { result, unmount } = await renderHook(() => useMovimientoReducido());
    await unmount();
    expect(dejarDeEscuchar).toHaveBeenCalledTimes(1);
    await act(async () => responder(false));
    expect(result.current).toBe(true);
  });
});
