import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t } from '@/i18n';
import { BotonDeDesarrollo } from '@/ui/BotonDeDesarrollo';
import { useTema } from '@/ui/tema';
import { Texto } from '@/ui/Texto';

// Pantalla inicial de la Fase 0: el nombre de la app y nada más. Es vacía a
// propósito, y desde D6.5a está vacía *con* el sistema de diseño: el título
// sale de `Texto`, lo que dice sale de `es.ts` y los colores, del tema.
// `testID="home"` lo usa el smoke de Maestro en D7 para saber que la app abrió.
export default function Home() {
  const tema = useTema();
  return (
    <View style={[estilos.contenedor, { gap: tema.espacio.xxl }]} testID="home">
      <Texto variante="titulo1">{t('app.nombre')}</Texto>
      {__DEV__ ? <HerramientasDeDesarrollo /> : null}
    </View>
  );
}

// Solo en desarrollo. Un test comprueba que en producción no se dibujan.
//
// «Provocar error» existe para comprobar que un error en el iPhone llega a
// Sentry con archivo y línea. Lanza un error de JavaScript y no un crash
// nativo: Expo Go no incluye el código nativo de Sentry, así que un crash
// nativo no llegaría desde aquí.
function HerramientasDeDesarrollo() {
  const tema = useTema();
  return (
    <View style={{ gap: tema.espacio.m }}>
      <BotonDeDesarrollo
        etiqueta={t('desarrollo.abrirGaleria')}
        descripcion={t('desarrollo.abrirGaleriaDescripcion')}
        onPress={() => router.push('/galeria')}
        testID="abrir-galeria"
      />
      <BotonDeDesarrollo
        tono="peligro"
        etiqueta={t('desarrollo.provocarError')}
        descripcion={t('desarrollo.provocarErrorDescripcion')}
        onPress={() => {
          throw new Error('Prueba de Sentry: botón de desarrollo');
        }}
        testID="provocar-error"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
