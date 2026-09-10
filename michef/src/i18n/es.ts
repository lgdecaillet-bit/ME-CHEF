/**
 * Los textos de ME CHEF, en castellano.
 *
 * Ningún texto visible vive en un componente: todos están aquí, con una clave
 * que dice dónde se usan (`galeria.modo.titulo`). Así el tono se revisa en un
 * solo archivo, y el francés y el alemán serán otro archivo igual que este.
 * ESLint prohíbe el texto suelto en JSX (diseno.md § 4): se pide con `t()`.
 *
 * ── Guía de tono ────────────────────────────────────────────────────────────
 * - Tú, cercano, frases cortas. «Veo 7 cosas», no «Se han detectado 7
 *   elementos».
 * - Sin exclamaciones, sin culpa, sin urgencia artificial. Un test vigila las
 *   exclamaciones.
 * - Los números nutricionales llevan «aprox.», siempre. Los precios, su origen.
 * - Un error dice qué pasó y qué puede hacer el usuario. Nunca «Algo salió
 *   mal»: un test también lo vigila.
 *
 * Para meter un valor: `{nombre}` en el texto, y `t('clave', { nombre })`.
 */
export const es = {
  app: {
    nombre: 'ME CHEF',
  },
  desarrollo: {
    provocarError: 'Provocar error',
    provocarErrorDescripcion: 'Provocar un error de prueba para Sentry',
    abrirGaleria: 'Galería',
    abrirGaleriaDescripcion: 'Abrir la galería del sistema de diseño',
  },
  galeria: {
    titulo: 'Galería',
    intro: 'Cada pieza del sistema de diseño, tal como sale. Solo existe en desarrollo.',
    medida: '{nombre} · {valor} pt',
    modo: {
      titulo: 'Modo',
      sistema: 'Del iPhone',
      sistemaDescripcion: 'Ver la galería en el modo del iPhone',
      claro: 'Claro',
      claroDescripcion: 'Ver la galería en modo claro',
      oscuro: 'Oscuro',
      oscuroDescripcion: 'Ver la galería en modo oscuro',
    },
    letra: {
      titulo: 'Tamaño de letra',
      iphone: 'Del iPhone',
      iphoneDescripcion: 'Ver la galería con la letra que tenga el iPhone',
      grande: 'Grande',
      grandeDescripcion: 'Ver la galería con la letra grande',
      maxima: 'Máxima',
      maximaDescripcion: 'Ver la galería con la letra más grande de Accesibilidad',
      aviso:
        'Grande y Máxima son una simulación. La de verdad se cambia en Ajustes › Accesibilidad › Pantalla y tamaño del texto.',
    },
    colores: { titulo: 'Colores' },
    texto: { titulo: 'Texto', muestra: 'Veo {n} cosas en tu nevera.' },
    espacio: { titulo: 'Espacios' },
    radio: { titulo: 'Radios' },
  },
} as const;
