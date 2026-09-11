/* eslint-disable */
// FIXTURE. Dentro de src/ui/ sí se usan `Text`, `Pressable` y `Animated.Text`,
// porque es donde viven, pero un color o una medida escritos a mano tampoco
// pasan: el único archivo con valores es tokens.ts. Mismas marcas que
// src/__fixtures__/pantalla.tsx, y scripts/probar-reglas.js las comprueba.
import { Animated, Pressable, Text } from 'react-native'; // @permitido
import { ActivityIndicator } from 'react-native'; // @permitido
import { SymbolView } from 'expo-symbols'; // @permitido

export function ComponenteMal() {
  return (
    <Pressable>
      <Animated.Text />{/* @permitido */}
      <SymbolView name="star" /><ActivityIndicator />{/* @permitido */}
      <Text style={{ color: '#123456' }}>{null}</Text>{/* @espera Color escrito a mano */}
      <Text style={{ padding: 12 }}>{null}</Text>{/* @espera Medida escrita a mano */}
    </Pressable>
  );
}
