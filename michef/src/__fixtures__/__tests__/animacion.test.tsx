/* eslint-disable */
// FIXTURE. Un test también se escribe con Reanimated (decisión #60.2): los tests
// relajan casi todas las reglas de la interfaz, pero no esta. Jest no lo corre
// (está bajo __fixtures__) y scripts/probar-reglas.js comprueba cada línea.
import { Animated } from 'react-native'; // @espera react-native-reanimated
import { getAnimatedStyle } from 'react-native-reanimated'; // @permitido

export const usados = [Animated, getAnimatedStyle]; // @permitido
