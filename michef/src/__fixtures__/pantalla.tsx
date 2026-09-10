/* eslint-disable */
// FIXTURE. Una pantalla que viola a propósito cada regla de interfaz de
// diseno.md § 4, para que scripts/probar-reglas.js compruebe que disparan
// (decisiones #47 y #58). Nadie la importa, y está fuera de la ejecución normal
// de ESLint, de TypeScript, de dependency-cruiser, de knip y de Jest.
//
// El `eslint-disable` de arriba NO apaga nada: probar-reglas.js corre con
// --no-inline-config. Está para que el editor no la pinte de rojo.
import { Pressable, Text, View } from 'react-native';

export function PantallaMal() {
  return (
    <View style={{ backgroundColor: '#FF0000', padding: 12 }}>
      <Pressable accessibilityLabel="Cerrar" onPress={() => undefined}>
        <Text style={{ fontSize: 18 }}>Hola</Text>
      </Pressable>
    </View>
  );
}
