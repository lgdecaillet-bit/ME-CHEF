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
    provocarErrorPista: 'Lanza un error de prueba, para ver si llega a Sentry',
    abrirGaleria: 'Galería',
    abrirGaleriaPista: 'Enseña cada pieza del sistema de diseño',
  },
  componentes: {
    progreso: { texto: '{actual} de {total}' },
  },
  galeria: {
    titulo: 'Galería',
    intro: 'Cada pieza del sistema de diseño, tal como sale. Solo existe en desarrollo.',
    medida: '{nombre} · {valor} pt',
    muestra: 'Es una muestra: no hace nada.',
    modo: {
      titulo: 'Modo',
      sistema: 'Del iPhone',
      sistemaPista: 'Pone la galería en el modo del iPhone',
      claro: 'Claro',
      claroPista: 'Pone la galería en modo claro',
      oscuro: 'Oscuro',
      oscuroPista: 'Pone la galería en modo oscuro',
    },
    letra: {
      titulo: 'Tamaño de letra',
      iphone: 'Del iPhone',
      iphonePista: 'Usa la letra que tenga el iPhone',
      grande: 'Grande',
      grandePista: 'Simula la letra grande',
      maxima: 'Máxima',
      maximaPista: 'Simula la letra más grande de Accesibilidad',
      aviso:
        'Grande y Máxima son una simulación. La de verdad se cambia en Ajustes › Accesibilidad › Pantalla y tamaño del texto.',
    },
    boton: {
      titulo: 'Botón',
      primario: 'Cocinar',
      secundario: 'Ver la receta',
      terciario: 'Ahora no',
      destructivo: 'Borrar la lista',
      deshabilitado: 'Cocinar',
      cargando: 'Buscando recetas',
    },
    chip: {
      titulo: 'Chip',
      normal: 'Tomate',
      seleccionado: 'Cebolla',
      pregunta: '¿Es pimentón?',
      supuesto: 'Sal',
      deshabilitado: 'Leche',
    },
    tarjeta: {
      titulo: 'Tarjeta',
      normal: 'Una tarjeta agrupa lo que va junto.',
      pulsable: 'Esta se puede tocar entera.',
      conEtiqueta: 'Tomates · 4',
    },
    etiqueta: {
      titulo: 'Etiqueta',
      seguro: 'Lo vi',
      posible: '¿Lo tienes?',
      supuesto: 'Supuesto',
      estimado: 'Precio estimado',
      real: 'De tu factura',
      aviso: 'Caduca mañana',
    },
    campo: {
      titulo: 'Campo',
      etiqueta: 'Ingrediente',
      valor: 'Tomate',
      error: 'Escribe un ingrediente para seguir.',
      hogar: 'Hogar',
      hogarValor: 'Casa',
    },
    stepper: { titulo: 'Stepper', etiqueta: 'Porciones' },
    vacio: {
      titulo: 'Estado vacío',
      conAccionTitulo: 'Tu nevera está vacía',
      conAccionTexto: 'Hazle una foto y te digo qué puedes cocinar.',
      accion: 'Hacer una foto',
      sinAccionTitulo: 'Todavía no hay recetas guardadas',
      sinAccionTexto: 'Las que guardes aparecerán aquí.',
    },
    cargando: { titulo: 'Cargando', descripcion: 'Cargando recetas' },
    aviso: {
      titulo: 'Aviso',
      mostrar: 'Ver los avisos',
      info: 'Guardé tu lista.',
      exito: 'Receta guardada.',
      error: 'No pude guardar la receta. Inténtalo otra vez.',
    },
    icono: { titulo: 'Icono', nevera: 'Nevera' },
    progreso: { titulo: 'Progreso' },
    colores: { titulo: 'Colores' },
    texto: { titulo: 'Texto', muestra: 'Veo {n} cosas en tu nevera.' },
    espacio: { titulo: 'Espacios' },
    radio: { titulo: 'Radios' },
  },
} as const;
