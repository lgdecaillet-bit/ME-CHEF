// Arranque de Jest · ME CHEF
//
// Corre después de montar `expect`, en cada archivo de tests.
//
// Reanimated (decisión #60.2): `setUpTests` añade `toHaveAnimatedStyle` y deja
// que las animaciones avancen con el reloj falso de Jest
// (`jest.advanceTimersByTime`). Sin esto, un test no puede ver dónde está una
// animación a mitad de camino, solo que se pidió.
//
// Reanimated corre sus animaciones con `react-native-worklets`, que es código
// nativo y en Jest no existe: la librería trae su propio sustituto para tests,
// y se registra antes de cargar Reanimated.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

const { setUpTests } = require('react-native-reanimated');

setUpTests();
