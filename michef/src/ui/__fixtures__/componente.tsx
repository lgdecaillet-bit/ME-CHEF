/* eslint-disable */
// FIXTURE. Dentro de src/ui/ sí se importa `Text`, porque es donde vive, pero un
// color escrito a mano tampoco pasa: el único archivo con colores es tokens.ts.
// scripts/probar-reglas.js comprueba las dos cosas.
import { Text } from 'react-native';

export function ComponenteMal() {
  return <Text style={{ color: '#123456' }}>{null}</Text>;
}
