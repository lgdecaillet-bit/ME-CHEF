/* eslint-disable */
// FIXTURE. Una pantalla que viola a propósito cada regla de interfaz de
// diseno.md § 4, para que scripts/probar-reglas.js compruebe que disparan
// (decisiones #47 y #58). Nadie la importa, y está fuera de la ejecución normal
// de ESLint, de TypeScript, de dependency-cruiser, de knip, de Jest y de
// Prettier (Prettier movería los comentarios de línea).
//
// Cada línea que viola una regla acaba con un comentario «@espera» y un trozo
// del mensaje, y probar-reglas.js comprueba que ESLint se queja justo en esa
// línea. Así un selector muerto no queda tapado por otro vivo que dice lo mismo.
// Las que acaban con «@permitido» no pueden tener ninguna queja.
//
// El `eslint-disable` de arriba NO apaga nada: probar-reglas.js corre con
// --no-inline-config. Está para que el editor no la pinte de rojo.
import { Animated, View } from 'react-native'; // @permitido
import { Text } from 'react-native'; // @espera solo se usan en src/ui/
import { Pressable } from 'react-native'; // @espera solo se usan en src/ui/
import { Switch } from 'react-native'; // @espera solo se usan en src/ui/
import { Pressable as PressableDeGestos } from 'react-native-gesture-handler'; // @espera solo se usan en src/ui/
import { Link } from 'expo-router'; // @espera solo se usan en src/ui/
import TextoInterno from 'react-native/Libraries/Text/Text'; // @espera archivos internos

const marca = '#FF0000'; // @espera Color escrito a mano
const sombra = 'rgb(0, 0, 0)'; // @espera Color escrito a mano
const linea = `1px solid #FF0000`; // @espera Color escrito a mano

export function PantallaMal({ x, n }: { x: boolean; n: number }) {
  return (
    <View
      style={{
        borderColor: 'red', // @espera Color escrito a mano
        backgroundColor: 'transparent', // @permitido
        padding: 12, // @espera Medida escrita a mano
        marginTop: -8, // @espera Medida escrita a mano
        margin: 0, // @permitido
      }}
    >
      <View color="texto2" />{/* @permitido */}
      <Text>Hola</Text>{/* @espera jsx-no-literals */}
      <Text>{x ? 'Abrir' : 'Cerrar'}</Text>{/* @espera Texto de lo que se ve */}
      <Text>{x && 'varios'}</Text>{/* @espera Texto de lo que se ve */}
      <Text>{'Hay ' + n}</Text>{/* @espera Texto de lo que se ve */}
      <Text>{`Hay ${n}`}</Text>{/* @espera Texto de lo que se ve */}
      <Text>{n}</Text>{/* @permitido */}
      <View testID={x ? 'uno' : 'dos'} />{/* @permitido */}
      <View>{String(n) === 'dos' && <View />}</View>{/* @permitido */}
      <Pressable accessibilityLabel="Cerrar" />{/* @espera Texto de lo que se ve */}
      <Pressable accessibilityLabel={'Cerrar'} />{/* @espera Texto de lo que se ve */}
      <Pressable accessibilityLabel={`Cerrar ${n}`} />{/* @espera Texto de lo que se ve */}
      <Pressable accessibilityLabel={x ? 'Abrir' : 'Cerrar'} />{/* @espera Texto de lo que se ve */}
      <Pressable accessibilityHint={'Abre ' + n} />{/* @espera Texto de lo que se ve */}
      <Animated.Text />{/* @espera solo se usan en src/ui/ */}
      <Switch /><PressableDeGestos /><Link href="/" /><TextoInterno />{/* @permitido */}
      {[marca, sombra, linea].length}
    </View>
  );
}
