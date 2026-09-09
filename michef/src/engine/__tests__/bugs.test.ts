/**
 * Los errores conocidos del motor, registrados como tests.
 *
 * Empezaron siendo siete, encontrados leyendo el motor en D3. El revisor añadió
 * BUG-8 y un test propio destapó BUG-9, los dos el mismo día que se arreglaron
 * los cuatro primeros. Que aparezcan dos nuevos al arreglar cuatro es lo normal
 * y es buena señal: mirar de cerca encuentra cosas.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CÓMO FUNCIONA ESTE ARCHIVO
 *
 * Cada bug es un `it.failing`. Eso significa:
 *   · mientras el bug exista, el test PASA y el gate sigue verde
 *   · el día que alguien lo arregle, el test SE PONE ROJO y te avisa
 *
 * Ese rojo no es un problema: es el aviso de que hay que quitar `.failing` y
 * dejar el test como un test normal. Comprobado que se comporta así.
 *
 * Por qué se registran antes de arreglarlos: la regla de CLAUDE.md es que un
 * bug encontrado se convierte en test ANTES del arreglo. Si no, no hay forma de
 * saber si el arreglo arregla algo, y el bug puede volver sin que nadie lo note.
 *
 * ESTADO: **cuatro arreglados, tres pendientes.**
 *
 * BUG-1, BUG-4, BUG-5 y BUG-7 tenían una única respuesta correcta y ningún
 * llamador que romper, así que se arreglaron en cuanto se registraron. Sus tests
 * dejaron de ser `.failing` y ahora son tests de regresión normales: si el bug
 * vuelve, se ponen rojos. Se comprobó el paso: con el motor sin arreglar los
 * cinco daban «Failing test passed even though it was supposed to fail».
 *
 * BUG-2, BUG-3 y BUG-6 siguen registrados como `.failing` porque su arreglo
 * necesita algo que todavía no existe: un catálogo de ingredientes con unidad
 * canónica y densidad (BUG-2 y BUG-3), y una frontera donde validar la entrada
 * (BUG-6). Arreglarlos hoy sería inventarse las conversiones, que es justo lo
 * que CLAUDE.md prohíbe.
 *
 * BUG-8 y BUG-9 se registraron el 2026-09-09 y esperan el «adelante» de Luciano
 * (decisión #34). BUG-8 necesita además decidir si el inventario se normaliza a
 * una fila por (ingrediente, unidad, origen); mientras esa decisión no exista,
 * su test afirma solo el invariante que cualquier arreglo correcto cumple.
 *
 * Cada bug lleva escrito qué le pasa al usuario, que es lo que decide su orden.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { descontarCocinado, fusionarEscaneo } from '../inventory';
import { listaDeMercado } from '../groceries';
import { recetasConLoQueHay } from '../coverage';
import { escalarReceta } from '../portions';
import type { ItemDetectado, Restriccion, Unidad } from '../types';
import { AHORA, comensal, detectado, idsDe, ingrediente, item, receta } from './ayudas';

describe('BUG-1 · ARREGLADO · lo que se ve sin contar sigue en la nevera', () => {
  // Dónde estaba: inventory.ts, fusionarEscaneo.
  // Qué pasaba: un ítem nuevo sin cantidad entraba con `cantidad: 0`, y el filtro
  // final `cantidad > 0` lo borraba en la misma función.
  // Por qué importaba: era el MÁS GRAVE de los siete. Una foto de nevera casi
  // nunca dice cuánto hay de algo; dice QUÉ hay. Con este bug, la mitad de lo
  // que la cámara reconocía se perdía antes de llegar a las recetas.
  // Arreglo: `ItemInventario.cantidad` es opcional — `undefined` es «está, no sé
  // cuánto», distinto de `0` — y el filtro mira la confianza. La columna de la
  // base de datos dejó de ser NOT NULL para poder guardarlo.
  it('un huevo visto sin contar sigue estando en la nevera', () => {
    const resultado = fusionarEscaneo(
      [],
      [{ ingredienteId: 'huevo', certeza: 'seguro' }],
      AHORA
    );
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.ingredienteId).toBe('huevo');
  });

  it('lo mismo con varios: se ven tres cosas, quedan tres', () => {
    const resultado = fusionarEscaneo(
      [],
      [
        { ingredienteId: 'huevo', certeza: 'seguro' },
        { ingredienteId: 'tomate', certeza: 'seguro' },
        { ingredienteId: 'queso', certeza: 'seguro' },
      ],
      AHORA
    );
    expect(resultado).toHaveLength(3);
  });

  it('pero un cero explícito sí se va: eso significa que se acabó', () => {
    // La distinción entera del arreglo está aquí. Si esta prueba se pusiera
    // roja, `undefined` y `0` habrían vuelto a significar lo mismo.
    const resultado = fusionarEscaneo(
      [],
      [{ ingredienteId: 'huevo', cantidad: 0, certeza: 'seguro' }],
      AHORA
    );
    expect(resultado).toHaveLength(0);
  });

  it('cocinar algo de cantidad desconocida no se la inventa', () => {
    const nevera = fusionarEscaneo(
      [],
      [{ ingredienteId: 'aceite', certeza: 'seguro' }],
      AHORA
    );
    const despues = descontarCocinado(nevera, [
      { ingredienteId: 'aceite', cantidad: 30 },
    ]);
    // Sigue ahí y sigue sin saberse cuánto hay. Restar sobre un cero inventado
    // habría dado «0 g de aceite», que es un dato falso.
    expect(despues).toHaveLength(1);
    expect(despues[0]?.cantidad).toBeUndefined();
  });

  it('un ítem registrado en 0 se va aunque la foto lo vea, y eso es lo querido', () => {
    // Aquí chocan dos reglas: «la foto manda sobre lo registrado» (inventory.ts) y
    // «0 significa que se acabó» (el arreglo de BUG-1). Gana la segunda: ver algo
    // sin contarlo no es información de cantidad, así que no desmiente al 0 que
    // alguien escribió a mano. Queda fijado para que un cambio futuro sea
    // deliberado; si algún día se prefiere lo contrario, este test lo dirá.
    const resultado = fusionarEscaneo(
      [item({ ingredienteId: 'huevo', cantidad: 0, origen: 'manual' })],
      [{ ingredienteId: 'huevo', certeza: 'seguro' }],
      AHORA
    );
    expect(resultado).toHaveLength(0);
  });

  it('lo que está sin cantidad conocida no resta en la lista de mercado', () => {
    // La otra mitad del contrato de `undefined`. Sirve para hacer recetas, pero
    // no puede descontar del mercado: no se sabe cuánto hay. Se compra entero.
    // Quedarse corto es peor que comprar de más.
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('arroz', 200)] }), porciones: 1 },
    ];
    const nevera = fusionarEscaneo(
      [],
      [{ ingredienteId: 'arroz', certeza: 'seguro' }],
      AHORA
    );
    expect(nevera).toHaveLength(1);
    expect(listaDeMercado(semana, nevera)[0]?.cantidadAComprar).toBe(200);
  });
});

describe('BUG-2 · todo lo nuevo entra en gramos, aunque sea líquido', () => {
  // Dónde: inventory.ts, fusionarEscaneo, rama de ítem nuevo: `unidad: 'g'`.
  // Qué pasa: el motor inventa una unidad que no puede conocer.
  // Por qué importa: la leche queda en gramos, y a partir de ahí la lista de
  // mercado y las cantidades de la receta arrastran el error. Es «nunca
  // inventar» aplicado a las unidades.
  // Arreglo previsto (Fase 1): `ItemDetectado` lleva su unidad, y si no la
  // trae, se toma la del catálogo canónico del ingrediente.
  //
  // OJO, el daño creció al arreglar BUG-4. Ahora que el inventario se agrupa por
  // (ingrediente, unidad), un líquido detectado por la foto queda como
  // `leche|g` y una receta que lo pide en `ml` busca `leche|ml`: no lo encuentra
  // y manda a comprarlo entero. O sea: **hoy ningún líquido visto en la foto
  // descuenta de la lista de mercado.** Es conservador y no inventa nada, pero
  // sube la prioridad de este bug: es lo que decide cuándo se arregla.
  it.failing('la leche entra en mililitros, no en gramos', () => {
    // El tipo actual no tiene `unidad`: esa es justamente la causa del bug.
    // El test lo pasa como lo hará la versión arreglada.
    const conUnidad: ItemDetectado & { unidad?: Unidad } = {
      ingredienteId: 'leche',
      cantidad: 500,
      certeza: 'seguro',
      unidad: 'ml',
    };
    const resultado = fusionarEscaneo([], [conUnidad], AHORA);
    expect(resultado[0]?.unidad).toBe('ml');
  });
});

describe('BUG-3 · la lista de mercado suma sin mirar la unidad', () => {
  // Dónde: groceries.ts, listaDeMercado, el acumulador `necesario`.
  // Qué pasa: si dos recetas piden el mismo ingrediente en unidades distintas,
  // suma los números y se queda con la unidad de la primera.
  // Por qué importa: 200 g + 200 ml = «400 g» de algo que no existe. Y el
  // presupuesto se calcula sobre esa cantidad falsa.
  // Arreglo previsto (Fase 1): convertir a la unidad canónica del ingrediente
  // antes de sumar, o llevar una línea por unidad.
  it.failing('200 g y 200 ml del mismo ingrediente no se suman como si nada', () => {
    const semana = [
      {
        receta: receta({ id: 'r1', ingredientes: [ingrediente('yogur', 200, 'g')] }),
        porciones: 1,
      },
      {
        receta: receta({ id: 'r2', ingredientes: [ingrediente('yogur', 200, 'ml')] }),
        porciones: 1,
      },
    ];
    const lineas = listaDeMercado(semana, []);
    const sumadasALoBruto = lineas.length === 1 && lineas[0]?.cantidadNecesaria === 400;
    expect(sumadasALoBruto).toBe(false);
  });
});

describe('BUG-4 · ARREGLADO · las filas repetidas del inventario se suman', () => {
  // Dónde estaba: groceries.ts, listaDeMercado, el Map `enCasa`.
  // Qué pasaba: `new Map(...)` con claves repetidas se queda con la última.
  // Por qué importaba: el inventario tiene una fila por origen (escaneo, factura,
  // manual), así que tener el mismo ingrediente dos veces es lo NORMAL, no el
  // caso raro. Resultado: te mandaba a comprar lo que ya tenías.
  // Arreglo: se acumulan las cantidades por ingrediente. La clave del acumulador
  // lleva la unidad, para no sumar gramos con mililitros (eso es BUG-3, que
  // sigue abierto porque necesita densidades que aún no existen).
  it('seis huevos de la factura y seis del escaneo son doce', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('huevo', 12)] }), porciones: 1 },
    ];
    const inventario = [
      item({ ingredienteId: 'huevo', cantidad: 6, origen: 'factura' }),
      item({ ingredienteId: 'huevo', cantidad: 6, origen: 'escaneo' }),
    ];
    // Hay 12 y hacen falta 12: no hay que comprar nada.
    expect(listaDeMercado(semana, inventario)).toHaveLength(0);
  });

  it('si con las dos filas no alcanza, pide solo lo que falta', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('huevo', 12)] }), porciones: 1 },
    ];
    const inventario = [
      item({ ingredienteId: 'huevo', cantidad: 4, origen: 'factura' }),
      item({ ingredienteId: 'huevo', cantidad: 3, origen: 'escaneo' }),
    ];
    const lineas = listaDeMercado(semana, inventario);
    expect(lineas[0]?.cantidadEnCasa).toBe(7);
    expect(lineas[0]?.cantidadAComprar).toBe(5);
  });

  it('dos filas en unidades distintas NO se suman a lo bruto', () => {
    // Mientras no exista la densidad de cada ingrediente, sumar 100 g con
    // 100 ml es inventarse un dato. Lo que no se puede comparar cuenta como
    // cero y se compra: quedarse corto de mercado es peor que comprar de más.
    const semana = [
      {
        receta: receta({ ingredientes: [ingrediente('yogur', 200, 'g')] }),
        porciones: 1,
      },
    ];
    const inventario = [item({ ingredienteId: 'yogur', cantidad: 200, unidad: 'ml' })];
    expect(listaDeMercado(semana, inventario)[0]?.cantidadAComprar).toBe(200);
  });
});

describe('BUG-5 · ARREGLADO · la alergia llega sola al filtro de recetas', () => {
  // Dónde estaba: coverage.ts, recetasConLoQueHay. No recibía los comensales.
  // Qué pasaba: `Comensal.noCome` existía en el modelo y en la base de datos,
  // pero esta función no lo veía. Quien la llamaba tenía que traducirlo a mano a
  // una restricción `excluir_ingrediente`, y nada obligaba a hacerlo.
  // Por qué importaba: una alergia es una restricción DURA. El comportamiento por
  // defecto de una función de seguridad no puede ser «inseguro salvo que quien
  // llama se acuerde». Era el segundo más grave de los siete.
  // Arreglo: la función recibe los comensales como sexto parámetro y excluye su
  // `noCome` SIEMPRE, sin depender de quién la llame.
  it('quien es alérgico al maní no ve recetas con maní', () => {
    const conMani = receta({
      id: 'con-mani',
      ingredientes: [ingrediente('mani'), ingrediente('arroz')],
    });
    const sinMani = receta({ id: 'sin-mani', ingredientes: [ingrediente('arroz')] });
    const alergico = comensal({ id: 'nino', noCome: ['mani'] });

    const opciones = recetasConLoQueHay(
      [conMani, sinMani],
      [detectado({ ingredienteId: 'mani' }), detectado({ ingredienteId: 'arroz' })],
      [],
      [alergico]
    );

    expect(opciones.some((o) => idsDe(o.receta).includes('mani'))).toBe(false);
  });

  it('la alergia de un comensal se acumula con las restricciones de la sesión', () => {
    // Las dos vías conviven: lo que el hogar no come nunca, y lo que el usuario
    // pide en esta sesión. Sin esta prueba, un arreglo posterior podría hacer que
    // una sustituya a la otra en vez de sumarse.
    const conMani = receta({
      id: 'con-mani',
      ingredientes: [ingrediente('mani'), ingrediente('arroz')],
    });
    const conLeche = receta({
      id: 'con-leche',
      ingredientes: [ingrediente('leche'), ingrediente('arroz')],
    });
    const soloArroz = receta({ id: 'solo-arroz', ingredientes: [ingrediente('arroz')] });

    const opciones = recetasConLoQueHay(
      [conMani, conLeche, soloArroz],
      [
        detectado({ ingredienteId: 'mani' }),
        detectado({ ingredienteId: 'leche' }),
        detectado({ ingredienteId: 'arroz' }),
      ],
      [],
      [comensal({ id: 'nino', noCome: ['mani'] })],
      [{ tipo: 'excluir_ingrediente', valor: 'leche' }]
    );

    expect(opciones.map((o) => o.receta.id)).toEqual(['solo-arroz']);
  });

  it('un comensal sin alergias no excluye nada', () => {
    // `noCome` es opcional, y lo normal es que esté vacío. Si esta prueba se
    // pusiera roja, el arreglo estaría quitando recetas a quien no pidió nada.
    const conMani = receta({
      id: 'con-mani',
      ingredientes: [ingrediente('mani'), ingrediente('arroz')],
    });
    const soloArroz = receta({ id: 'solo-arroz', ingredientes: [ingrediente('arroz')] });

    const opciones = recetasConLoQueHay(
      [conMani, soloArroz],
      [detectado({ ingredienteId: 'mani' }), detectado({ ingredienteId: 'arroz' })],
      [],
      [comensal({ id: 'papa' })]
    );

    expect(opciones).toHaveLength(2);
  });

  it('traducir la alergia a mano sigue funcionando', () => {
    // Seguía siendo la única forma segura de llamar antes del arreglo, y hay
    // código que puede seguir haciéndolo. El arreglo suma una vía, no sustituye.
    const conMani = receta({
      id: 'con-mani',
      ingredientes: [ingrediente('mani'), ingrediente('arroz')],
    });
    const sinMani = receta({ id: 'sin-mani', ingredientes: [ingrediente('arroz')] });
    const comoRestriccion: Restriccion[] = [
      { tipo: 'excluir_ingrediente', valor: 'mani' },
    ];

    const opciones = recetasConLoQueHay(
      [conMani, sinMani],
      [detectado({ ingredienteId: 'mani' }), detectado({ ingredienteId: 'arroz' })],
      [],
      [],
      comoRestriccion
    );

    expect(opciones.map((o) => o.receta.id)).toEqual(['sin-mani']);
  });
});

describe('BUG-6 · un tiempo máximo inválido rompe el filtro en silencio', () => {
  // Dónde: coverage.ts, `Number(tiempoMax.valor)`.
  // Qué pasa, en dos caras del mismo fallo:
  //   · 'treinta' → NaN → `r.minutos > NaN` es siempre false → NO se descarta
  //     nada y el filtro queda apagado sin decirlo.
  //   · ''        → 0   → el filtro pasa a ser «nada que tarde más de 0
  //     minutos» y descarta el catálogo entero, también sin decirlo.
  // Por qué importa: fallar en silencio es peor que fallar. El usuario pide
  // «menos de 20 minutos» y recibe una de 90, o no recibe nada, y en ninguno de
  // los dos casos hay un error que mirar. `Restriccion.valor` es un string
  // libre, así que basta un dato mal guardado.
  // Arreglo previsto (Fase 1): validar con zod en la frontera. Un valor que no
  // sea un número positivo se rechaza **en voz alta**, nunca se interpreta.
  //
  // Los dos tests exigen lo mismo: que lance. Así el arreglo los vuelve verdes a
  // la vez y el registro no se contradice consigo mismo.
  const conValor = (valor: string) => () =>
    recetasConLoQueHay(
      [receta({ id: 'lenta', minutos: 90, ingredientes: [ingrediente('huevo')] })],
      [detectado({ ingredienteId: 'huevo' })],
      [],
      [],
      [{ tipo: 'tiempo_max', valor }]
    );

  it.failing('un valor que no es un número se rechaza en voz alta', () => {
    expect(conValor('treinta')).toThrow();
  });

  it.failing('un valor vacío también se rechaza, no vale como «0 minutos»', () => {
    expect(conValor('')).toThrow();
  });

  it.failing('un valor negativo tampoco cuela', () => {
    expect(conValor('-10')).toThrow();
  });

  it('un valor correcto sigue funcionando, y debe seguir haciéndolo tras el arreglo', () => {
    expect(conValor('120')()).toHaveLength(1);
    expect(conValor('30')()).toHaveLength(0);
  });
});

describe('BUG-7 · ARREGLADO · el campo que mentía ya no existe', () => {
  // Dónde estaba: portions.ts, escalarReceta.
  // Qué pasaba: devolvía `RecetaIngrediente[]`, cuyo campo se llama
  // `cantidadPorPorcion`, con la cantidad TOTAL ya multiplicada dentro.
  // Por qué importaba: no rompía nada todavía porque nadie encadenaba la
  // función. El día que alguien escalara un resultado ya escalado, multiplicaba
  // dos veces y no había forma de notarlo mirando el tipo. Un nombre que miente
  // es una trampa que espera. Por eso se arregló ANTES de tener llamadores:
  // cambiar la firma cuando no hay ninguno es gratis.
  // Arreglo: un tipo propio, `IngredienteEscalado`, con `cantidadTotal`.
  it('el resultado trae la cantidad total en un campo que se llama así', () => {
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('arroz', 100)] }),
      4
    );
    expect(escalada[0]?.cantidadTotal).toBe(400);
  });

  it('el campo viejo no reaparece ni por descuido', () => {
    // Esta comprobación es en tiempo de ejecución a propósito. La causa original
    // era un `...i` que copiaba el ingrediente entero; TypeScript NO avisa de las
    // propiedades de más que llegan por un spread, así que si alguien lo
    // reintroduce, el compilador se queda callado y solo este test lo ve.
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('arroz', 100)] }),
      4
    );
    expect(escalada[0]).not.toHaveProperty('cantidadPorPorcion');
  });

  it('encadenar dos escalados ya no se puede hacer sin darse cuenta', () => {
    // `escalarReceta` pide una `Receta`, y lo que devuelve ya no lo es. El día
    // que alguien lo intente, no compila. Aquí solo queda constancia de la forma.
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('arroz', 100)] }),
      4
    );
    expect(Object.keys(escalada[0] ?? {}).sort()).toEqual([
      'cantidadTotal',
      'ingredienteId',
      'unidad',
    ]);
  });
});

describe('BUG-8 · fusionar o cocinar borra las filas repetidas del inventario', () => {
  // Dónde: inventory.ts, `fusionarEscaneo` (línea del `new Map`) y
  // `descontarCocinado` (lo mismo).
  // Qué pasa: `new Map(inventario.map((i) => [i.ingredienteId, {...i}]))` con
  // claves repetidas se queda con la última. Es **el mismo `new Map` que BUG-4**,
  // en las dos funciones vecinas, y no se vio al arreglar BUG-4.
  // Por qué importa: el arreglo de BUG-4 declara que tener el mismo ingrediente
  // en varias filas es lo NORMAL (una por origen). Estas dos funciones destruyen
  // esa situación en silencio: sacar una foto de la nevera borra inventario real.
  // Medido: seis huevos de factura más seis de escaneo quedan en seis al fusionar,
  // y en cuatro al descontar dos.
  // Lo encontró el revisor el 2026-09-09, revisando el arreglo de BUG-4.
  //
  // CONDICIÓN PARA ARREGLARLO (decisión #49): hay que decidir antes si el
  // inventario se normaliza a una fila por (ingrediente, unidad, origen) o si
  // estas funciones agrupan como hace ahora `listaDeMercado`. Son diseños
  // distintos con consecuencias distintas en la pantalla de nevera. Por eso los
  // tests de abajo afirman solo el invariante que **cualquier** arreglo correcto
  // cumple — no se pierde cantidad — y no la forma del resultado.
  const dosFilas = () => [
    item({ ingredienteId: 'huevo', cantidad: 6, origen: 'factura' }),
    item({ ingredienteId: 'huevo', cantidad: 6, origen: 'escaneo' }),
  ];
  const totalDe = (items: { cantidad?: number }[]) =>
    items.reduce((t, i) => t + (i.cantidad ?? 0), 0);

  it.failing('la foto no hace desaparecer seis de los doce huevos', () => {
    const despues = fusionarEscaneo(
      dosFilas(),
      [{ ingredienteId: 'huevo', certeza: 'seguro' }],
      AHORA
    );
    expect(totalDe(despues)).toBe(12);
  });

  it.failing('cocinar dos huevos de doce deja diez, no cuatro', () => {
    const despues = descontarCocinado(dosFilas(), [
      { ingredienteId: 'huevo', cantidad: 2 },
    ]);
    expect(totalDe(despues)).toBe(10);
  });
});

describe('BUG-9 · la lista de mercado redondea hacia abajo lo que hay que comprar', () => {
  // Dónde: groceries.ts, `listaDeMercado`, los dos `redondear(...)`.
  // Qué pasa: `redondear` redondea al más CERCANO — «nadie mide 137 g de
  // cebolla» — y eso está bien para presentar una receta. Aplicado a la cantidad
  // a comprar, redondea hacia abajo: si hacen falta 12, manda a comprar 10.
  // Por qué importa: una lista de mercado que se queda corta obliga a volver a la
  // tienda, que es justo lo que la app promete evitar. El redondeo amable tiene
  // que ir hacia arriba en la lista, y al más cercano en la receta.
  // Se descubrió el 2026-09-09 al escribir otro test, que falló esperando 12 y
  // recibiendo 10.
  //
  // CONDICIÓN PARA ARREGLARLO (decisión #49): ninguna técnica — es un
  // `Math.ceil` en vez de un `Math.round`, con su propia función. Falta solo el
  // «adelante» de Luciano (#34), porque cambia números que ya ve el usuario.
  it.failing('si hacen falta 12, no manda a comprar 10', () => {
    const semana = [
      { receta: receta({ ingredientes: [ingrediente('huevo', 12)] }), porciones: 1 },
    ];
    // Se afirma el invariante, no el número exacto: 12 y 15 son dos arreglos
    // válidos, 10 no lo es en ninguna versión correcta.
    expect(listaDeMercado(semana, [])[0]?.cantidadAComprar).toBeGreaterThanOrEqual(12);
  });
});
