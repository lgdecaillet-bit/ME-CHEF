/**
 * Tokens del sistema de diseño · ME CHEF
 *
 * El único archivo del proyecto donde se escribe un color, un tamaño de letra,
 * un espacio o un radio. ESLint lo prohíbe en todos los demás (diseno.md § 4),
 * así que cambiar un valor aquí cambia la app entera.
 *
 * Los nombres dicen para qué sirve cada valor («texto2», «acento»), no cómo se
 * ve («gris500», «verde»): así, cambiar la paleta no obliga a renombrar nada.
 *
 * Las pantallas no importan este archivo: piden los valores a `useTema()`, que
 * entrega los colores del modo en que esté el iPhone (claro u oscuro).
 *
 * Los valores de hoy son la primera propuesta, y se deciden viendo la galería
 * en el iPhone. El contraste de cada par texto/fondo lo vigila
 * `__tests__/contraste.test.ts`: un color que no llegue a AA pone
 * `npm run gates` en rojo.
 */
import type { TextStyle } from 'react-native';

export type Esquema = 'claro' | 'oscuro';

export type Colores = {
  /** El fondo de la pantalla. */
  fondo: string;
  /** Lo que se apoya sobre el fondo: tarjetas, campos. */
  superficie: string;
  /** Lo que se apoya sobre una superficie, o una opción elegida. */
  superficie2: string;
  texto: string;
  /** Texto secundario: explicaciones, subtítulos. */
  texto2: string;
  /** Texto terciario: notas, lo menos importante. También llega a AA. */
  texto3: string;
  /** El verde de «seguro» y de la acción principal. */
  acento: string;
  /** El texto que va encima del acento, como el de un botón principal. */
  sobreAcento: string;
  /** El ámbar de «posible»: lo que se pregunta, no se asume. */
  ambar: string;
  /** Error, y lo que «se daña». */
  rojo: string;
  /** El borde de un control. Llega a 3:1 con el fondo (WCAG 1.4.11). */
  borde: string;
  sombra: string;
};

export const colores: Record<Esquema, Colores> = {
  // Cerca de los grises de iOS, oscurecidos donde hacía falta para llegar a AA.
  claro: {
    fondo: '#F2F2F7',
    superficie: '#FFFFFF',
    superficie2: '#E5E5EA',
    texto: '#1C1C1E',
    texto2: '#48484C',
    texto3: '#5C5C61',
    acento: '#1A6B35',
    sobreAcento: '#FFFFFF',
    ambar: '#8A5300',
    rojo: '#B3261E',
    borde: '#7C7C80',
    sombra: '#000000',
  },
  oscuro: {
    fondo: '#000000',
    superficie: '#1C1C1E',
    superficie2: '#2C2C2E',
    texto: '#FFFFFF',
    texto2: '#D1D1D6',
    texto3: '#A1A1A6',
    acento: '#4CD964',
    // En oscuro el acento es claro, así que el texto encima va oscuro: blanco
    // sobre este verde no llega a AA.
    sobreAcento: '#000000',
    ambar: '#FFB340',
    rojo: '#FF6961',
    borde: '#7C7C80',
    sombra: '#000000',
  },
};

type EstiloDeTexto = {
  fontSize: number;
  lineHeight: number;
  fontWeight: NonNullable<TextStyle['fontWeight']>;
  /**
   * Hasta cuánto crece con Dynamic Type: el tamaño que iOS le da a ese estilo
   * con la letra más grande de Accesibilidad, dividido por el de partida. Sin
   * este tope, React Native multiplica todos los estilos por igual, y un
   * título llegaría a más de 100 pt.
   */
  escalaMaxima: number;
};

// La escala de iOS, con la fuente del sistema (SF Pro). Encima de cada uno, el
// estilo de iOS del que sale y su tamaño con la letra más grande.
export const tipografia = {
  // Large Title · 60
  titulo1: { fontSize: 34, lineHeight: 41, fontWeight: '700', escalaMaxima: 60 / 34 },
  // Title 1 · 58
  titulo2: { fontSize: 28, lineHeight: 34, fontWeight: '700', escalaMaxima: 58 / 28 },
  // Title 2 · 56
  titulo3: { fontSize: 22, lineHeight: 28, fontWeight: '600', escalaMaxima: 56 / 22 },
  // Body · 53
  cuerpo: { fontSize: 17, lineHeight: 22, fontWeight: '400', escalaMaxima: 53 / 17 },
  // Headline · 53
  cuerpoFuerte: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    escalaMaxima: 53 / 17,
  },
  // Subheadline · 49
  secundario: { fontSize: 15, lineHeight: 20, fontWeight: '400', escalaMaxima: 49 / 15 },
  // Footnote · 44
  nota: { fontSize: 13, lineHeight: 18, fontWeight: '400', escalaMaxima: 44 / 13 },
} as const satisfies Record<string, EstiloDeTexto>;

/** Rejilla de 4 pt. */
export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radio = { s: 8, m: 12, l: 16, xl: 24, circulo: 999 } as const;

/** Milisegundos. La curva la pone cada animación: la estándar de iOS. */
export const movimiento = { rapido: 150, normal: 250, lento: 400 } as const;

/** Lo mínimo que Apple pide para algo que se toca, en puntos. */
export const tactil = { minimo: 44 } as const;
