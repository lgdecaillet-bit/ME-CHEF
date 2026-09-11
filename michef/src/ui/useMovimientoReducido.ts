/**
 * Si el iPhone tiene activado «Reducir movimiento» (Ajustes › Accesibilidad ›
 * Movimiento). Con él activado, nada late ni se desliza: `Cargando` se queda
 * quieto y la etiqueta de `Campo` cambia de sitio sin animación (diseno.md,
 * principio 7). Si el usuario lo cambia con la app abierta, se entera solo.
 *
 * Mientras iOS no contesta, cuenta como activado: es mejor no animar durante un
 * instante que animar a quien pidió que no.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState(true);
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (valor) => {
        if (vivo) setReducido(valor);
      },
      // Si iOS no contesta, se queda quieto: lo mismo que mientras espera.
      () => undefined
    );
    const suscripcion = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducido
    );
    return () => {
      vivo = false;
      suscripcion.remove();
    };
  }, []);
  return reducido;
}
