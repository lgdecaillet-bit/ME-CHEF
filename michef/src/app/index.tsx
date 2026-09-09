import { StyleSheet, Text, View } from 'react-native';

// Pantalla provisional. La pantalla inicial real llega en D6 (docs/fases/fase-0-fundaciones.md).
export default function Home() {
  return (
    <View style={styles.container} testID="home">
      <Text style={styles.title}>ME CHEF</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '600' },
});
