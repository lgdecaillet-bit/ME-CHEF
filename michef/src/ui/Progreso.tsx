/**
 * Progreso · la barra «2 de 2» del onboarding.
 *
 * VoiceOver lee su valor en palabras («1 de 2»). En iOS, React Native no la
 * anuncia como «barra de progreso»: ese rol solo le dice que cambia a menudo.
 * Nunca se sale de la barra: un número negativo cuenta como 0, uno mayor que el
 * total como el total, y uno que no es finito (NaN, Infinity) como 0.
 */
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';

import { useTema } from './tema';
import { Texto } from './Texto';

type Props = {
  actual: number;
  total: number;
  testID?: string;
};

const finito = (n: number) => (Number.isFinite(n) ? n : 0);

export function Progreso({ actual, total, testID }: Props) {
  const tema = useTema();
  const de = Math.max(0, finito(total));
  const va = Math.min(de, Math.max(0, finito(actual)));
  const fraccion = de > 0 ? va / de : 0;
  const texto = t('componentes.progreso.texto', { actual: va, total: de });
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: de, now: va, text: texto }}
      testID={testID}
      style={{ gap: tema.espacio.xs }}
    >
      <Texto variante="nota" color="texto2">
        {texto}
      </Texto>
      <View
        style={[
          estilos.pista,
          {
            height: tema.espacio.s,
            borderRadius: tema.radio.circulo,
            backgroundColor: tema.color.superficie2,
          },
        ]}
      >
        <View
          testID={testID && `${testID}.relleno`}
          style={{ flex: fraccion, backgroundColor: tema.color.acento }}
        />
        <View style={{ flex: 1 - fraccion }} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pista: { flexDirection: 'row', overflow: 'hidden' },
});
