/**
 * Stepper · un número que se sube y se baja de a poco: las porciones.
 *
 * Estados: en el mínimo, normal y en el máximo. Admite medias (`paso={0.5}`).
 * - Los botones − y + miden 44 pt, y en el mínimo o en el máximo se apagan.
 * - VoiceOver lo lee como un control ajustable («Porciones, 2»), y se sube o se
 *   baja deslizando un dedo hacia arriba o hacia abajo, como en iOS.
 * - Nunca se sale de sus límites ni deja un número con decimales de sobra.
 */
import { Pressable, StyleSheet, View, type AccessibilityActionEvent } from 'react-native';

import { numero } from '@/i18n';

import { Icono, type NombreDeIcono } from './Icono';
import { useTema } from './tema';
import { Texto } from './Texto';

type Props = {
  /** Qué se cuenta: lo que se ve al lado y lo que dice VoiceOver. Viene de `t()`. */
  etiqueta: string;
  valor: number;
  alCambiar: (valor: number) => void;
  minimo: number;
  maximo: number;
  /** De cuánto en cuánto. 0,5 para medias porciones. */
  paso?: number;
  testID?: string;
};

/**
 * El siguiente valor, un paso arriba o abajo, siempre dentro de los límites y en
 * la rejilla que empieza en el mínimo (mínimo 0,5 y paso 1: 0,5 → 1,5 → 2,5).
 * Redondea a los decimales del paso y del mínimo, porque en coma flotante
 * 0,1 + 0,2 no da 0,3. Con un paso que no sirve (cero, negativo, NaN, infinito)
 * no se mueve.
 */
export function siguienteValor(
  valor: number,
  sentido: 1 | -1,
  { minimo, maximo, paso }: { minimo: number; maximo: number; paso: number }
): number {
  if (!(Number.isFinite(paso) && paso > 0)) return valor;
  const decimales = Math.max(decimalesDe(paso), decimalesDe(minimo));
  const pasos = Math.round((valor + sentido * paso - minimo) / paso);
  const enRejilla = Number((minimo + pasos * paso).toFixed(decimales));
  return Math.min(maximo, Math.max(minimo, enRejilla));
}

function decimalesDe(n: number): number {
  return (String(n).split('.')[1] ?? '').length;
}

export function Stepper({
  etiqueta,
  valor,
  alCambiar,
  minimo,
  maximo,
  paso = 1,
  testID,
}: Props) {
  const tema = useTema();
  const puedeBajar = valor > minimo;
  const puedeSubir = valor < maximo;
  const mover = (sentido: 1 | -1) => {
    if (!(sentido === 1 ? puedeSubir : puedeBajar)) return;
    const siguiente = siguienteValor(valor, sentido, { minimo, maximo, paso });
    // Con un paso que no sirve, el número no cambia, y no se avisa de nada.
    if (siguiente !== valor) alCambiar(siguiente);
  };
  const alAccionDeVoiceOver = (evento: AccessibilityActionEvent) => {
    if (evento.nativeEvent.actionName === 'increment') mover(1);
    if (evento.nativeEvent.actionName === 'decrement') mover(-1);
  };
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={etiqueta}
      accessibilityValue={{ text: numero(valor) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={alAccionDeVoiceOver}
      testID={testID}
      style={[estilos.fila, { gap: tema.espacio.m }]}
    >
      <View style={estilos.etiqueta}>
        <Texto>{etiqueta}</Texto>
      </View>
      <BotonRedondo
        icono="minus"
        activo={puedeBajar}
        onPress={() => mover(-1)}
        testID={testID && `${testID}.menos`}
      />
      <Texto variante="cuerpoFuerte" testID={testID && `${testID}.valor`}>
        {numero(valor)}
      </Texto>
      <BotonRedondo
        icono="plus"
        activo={puedeSubir}
        onPress={() => mover(1)}
        testID={testID && `${testID}.mas`}
      />
    </View>
  );
}

// VoiceOver no los ve: el Stepper entero es un solo control ajustable.
function BotonRedondo({
  icono,
  activo,
  onPress,
  testID,
}: {
  icono: NombreDeIcono;
  activo: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const tema = useTema();
  return (
    <Pressable
      disabled={!activo}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        estilos.redondo,
        {
          width: tema.tactil.minimo,
          height: tema.tactil.minimo,
          borderRadius: tema.radio.circulo,
          backgroundColor: tema.color.superficie2,
        },
        pressed && { opacity: tema.opacidad.pulsado },
      ]}
    >
      <Icono
        nombre={icono}
        color={activo ? 'acento' : 'texto3'}
        testID={testID && `${testID}.icono`}
      />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  etiqueta: { flex: 1 },
  redondo: { alignItems: 'center', justifyContent: 'center' },
});
