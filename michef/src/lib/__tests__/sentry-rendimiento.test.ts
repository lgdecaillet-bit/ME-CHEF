// El filtro de Sentry corre con cada error y con cada miga, y cada `console.*`
// de cualquier librería es una miga. Si tarda, congela la app.
//
// En D6 el revisor midió que la expresión de correos era cuadrática: 50.000
// caracteres sin «@» tardaban 3,4 s, y 200.000 casi un minuto. El tope de 2.000
// caracteres ya evita los textos enormes; esto prueba además que las
// expresiones, por sí solas, no se vuelven cuadráticas: sin esto, quitar el tope
// algún día devolvería el problema en silencio.
//
// Un segundo es un margen enorme a propósito: una expresión acotada tarda unos
// milisegundos, y una cuadrática, varios segundos. Así el test no falla porque
// la máquina de CI vaya lenta, y sí cuando alguien quita un límite.
import { aplicarPatrones } from '../sentry';

jest.mock('@sentry/react-native', () => ({ init: jest.fn() }));

const N = 50_000;

it.each([
  ['letras sin @', 'a'.repeat(N)],
  ['base64', 'QUJD+/='.repeat(N / 7)],
  ['arrobas sueltas', 'a@'.repeat(N / 2)],
  ['puntos y guiones', 'a.b-'.repeat(N / 4)],
  ['cifras con separadores', '1 2/3('.repeat(N / 6)],
  ['comienzos de JWT', 'eyJ'.repeat(N / 3)],
])('%s: 50.000 caracteres se revisan en menos de un segundo', (_, texto) => {
  const inicio = Date.now();
  aplicarPatrones(texto);
  expect(Date.now() - inicio).toBeLessThan(1000);
});
