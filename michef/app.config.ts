// Configuración de la app · ME CHEF
//
// Reemplaza a `app.json` (D6). En TypeScript para que un campo mal escrito sea
// un error de `npm run typecheck`, no una sorpresa en el build.
//
// Dos valores de aquí son permanentes y no se cambian a la ligera:
// - `ios.bundleIdentifier`: el nombre de la app ante Apple. Cambiarlo después
//   de publicar es, para Apple, otra app distinta (decisión #56).
// - `slug` y `scheme`: el nombre del proyecto en expo.dev y el de los enlaces
//   que abren la app (`mechef://`). Alineados a `mechef` antes de `eas init`.
import type { ExpoConfig } from 'expo/config';

// Lo dio `eas init` el 2026-09-10: proyecto `@lucogav8/mechef`. No es secreto.
const ID_PROYECTO_EAS = '5360a08d-118b-4dc0-a012-c1955bedf59c';

const config: ExpoConfig = {
  name: 'ME CHEF',
  slug: 'mechef',
  // Fijado a propósito: la sesión de `eas` de Luciano tiene dos cuentas, y sin
  // esto el proyecto podía acabar bajo la de TESO.
  owner: 'lucogav8',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mechef',
  userInterfaceStyle: 'automatic',
  // Solo iOS (D1). Sin esto Expo deduce `ios, android, web` de las librerías
  // instaladas, y `expo start` ofrecería plataformas que el proyecto no tiene.
  platforms: ['ios'],

  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.mechef.app',
  },

  // La huella: un resumen de todo lo nativo. Si cambia (una librería nativa
  // nueva, un plugin), un update por el aire ya no vale y hace falta un build
  // nuevo. Por eso cada plugin nativo entra en su fase y no antes.
  runtimeVersion: { policy: 'fingerprint' },
  updates: { url: `https://u.expo.dev/${ID_PROYECTO_EAS}` },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      '@sentry/react-native',
      {
        organization: 'mechef',
        project: 'mechef',
        // La organización está en la región europea (decisión #42). Esto no
        // basta para subir mapas de código con un token de organización: ver
        // el aviso para D7 en docs/estado.md.
        url: 'https://de.sentry.io/',
      },
    ],
    // `expo-secure-store` NO tiene plugin todavía, a propósito (decisión #57,
    // punto 9). `expo install` lo añadía solo, y sin opciones mete en la app un
    // permiso de Face ID en inglés para una función que no existe. Entra con
    // su primer uso, en Fase 1.
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    router: {},
    eas: { projectId: ID_PROYECTO_EAS },
  },
};

export default config;
