import { Pressable, StyleSheet, Text, View } from 'react-native';

// Pantalla inicial de la Fase 0: el nombre de la app y nada más. Es vacía a
// propósito; lo que se ve de producto llega con el sistema de diseño (D6.5).
// `testID="home"` lo usa el smoke de Maestro en D7 para saber que la app abrió.
export default function Home() {
  return (
    <View style={styles.contenedor} testID="home">
      <Text style={styles.titulo} accessibilityRole="header">
        ME CHEF
      </Text>
      {__DEV__ ? <BotonDeError /> : null}
    </View>
  );
}

// Solo en desarrollo. Existe para comprobar que un error en el iPhone llega a
// Sentry con archivo y línea. Un test comprueba que en producción no se dibuja.
//
// Lanza un error de JavaScript y no un crash nativo: Expo Go no incluye el
// código nativo de Sentry, así que un crash nativo no llegaría desde aquí.
function BotonDeError() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Provocar un error de prueba para Sentry"
      onPress={() => {
        throw new Error('Prueba de Sentry: botón de desarrollo');
      }}
      style={styles.boton}
      testID="provocar-error"
    >
      <Text style={styles.textoBoton}>Provocar error</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
  titulo: { fontSize: 32, fontWeight: '600' },
  // 44 pt de alto: el mínimo tocable de Apple, también para un botón de pruebas.
  boton: {
    minHeight: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B00020',
  },
  textoBoton: { fontSize: 16, color: '#B00020' },
});
