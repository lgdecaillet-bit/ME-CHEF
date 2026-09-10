// Metro · ME CHEF
//
// `getSentryExpoConfig` en lugar del `getDefaultConfig` de Expo: le da a cada
// bundle un identificador único, para que Sentry empareje un error de
// producción con su mapa de código y enseñe archivo y línea en vez de código
// minificado. Los mapas se suben en los builds de EAS (D7), no en Expo Go.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// Los `.sql` como archivos, no como código: Drizzle guarda así sus migraciones
// y la app las aplica al abrir la base local. Entra en uso en Fase 1.
config.resolver.assetExts.push('sql');

module.exports = config;
