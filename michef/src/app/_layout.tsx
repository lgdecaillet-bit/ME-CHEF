import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';

import { leerEntorno } from '@/config/env';
import { leerFlags } from '@/config/flags';
import { iniciarSentry } from '@/lib/sentry';

// Al arrancar, en este orden y a propósito:
//
// 1. Sentry, con el DSN tal cual. Va primero para que, si lo de abajo falla,
//    el fallo también llegue. Sin DSN no hace nada.
// 2. Las variables de entorno y los interruptores. Si falta algo o hay un
//    valor mal escrito, la app para aquí con un mensaje que dice cuál, en vez
//    de fallar de forma confusa más adelante.
iniciarSentry(process.env.EXPO_PUBLIC_SENTRY_DSN);
leerEntorno();
leerFlags();

function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

// `wrap` añade las migas de los toques, el perfilador y el widget de opiniones
// de Sentry (comprobado en `@sentry/react-native/dist/js/sdk.js`). **No** es un
// `ErrorBoundary`: los errores de dibujado de React deberían llegar por el
// manejador global de errores de React Native, pero eso no se ha comprobado en
// el iPhone. La prueba del botón es un error dentro de un toque, no de dibujado.
export default Sentry.wrap(RootLayout);
