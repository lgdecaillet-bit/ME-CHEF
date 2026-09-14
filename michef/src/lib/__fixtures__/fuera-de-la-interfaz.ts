/* eslint-disable */
// FIXTURE. Fuera de src/app/ y src/ui/ las reglas de interfaz no aplican: un
// `gap` del motor o una cadena «#abc» no son estilo. scripts/probar-reglas.js
// comprueba que en esta línea no dispara ninguna.
export const noEsEstilo = { gap: 200, margin: 0.15, color: '#abc' }; // @permitido

// Las animaciones, en cambio, van con Reanimated en todo src/ (decisión #60.2).
import { Animated } from 'react-native'; // @espera react-native-reanimated
export const animado = Animated; // @permitido
