/**
 * Los siete errores conocidos del motor, registrados como tests.
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
 * D3 no arregla ninguno: eso es Fase 1, donde el motor cambia de verdad.
 * Cada bug lleva escrito qué le pasa al usuario, que es lo que decide su orden.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { fusionarEscaneo } from '../inventory';
import { listaDeMercado } from '../groceries';
import { recetasConLoQueHay } from '../coverage';
import { escalarReceta } from '../portions';
import type { OpcionReceta } from '../coverage';
import type { Comensal, ItemDetectado, Receta, Restriccion, Unidad } from '../types';
import { AHORA, comensal, detectado, idsDe, ingrediente, item, receta } from './ayudas';

describe('BUG-1 · la foto detecta un ingrediente sin cantidad y desaparece', () => {
  // Dónde: inventory.ts, fusionarEscaneo.
  // Qué pasa: un ítem nuevo sin cantidad entra con `cantidad: 0`, y el filtro
  // final `cantidad > 0` lo borra en la misma función.
  // Por qué importa: es el MÁS GRAVE de los siete. Una foto de nevera casi
  // nunca dice cuánto hay de algo; dice QUÉ hay. Con este bug, la mitad de lo
  // que la cámara reconoce se pierde antes de llegar a las recetas.
  // Arreglo previsto (Fase 1): cantidad opcional, y que el filtro mire la
  // confianza, no la cantidad.
  it.failing('un huevo visto sin contar sigue estando en la nevera', () => {
    const resultado = fusionarEscaneo(
      [],
      [{ ingredienteId: 'huevo', certeza: 'seguro' }],
      AHORA
    );
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.ingredienteId).toBe('huevo');
  });

  it.failing('lo mismo con varios: se ven tres cosas, quedan tres', () => {
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
});

describe('BUG-2 · todo lo nuevo entra en gramos, aunque sea líquido', () => {
  // Dónde: inventory.ts, fusionarEscaneo, rama de ítem nuevo: `unidad: 'g'`.
  // Qué pasa: el motor inventa una unidad que no puede conocer.
  // Por qué importa: la leche queda en gramos, y a partir de ahí la lista de
  // mercado y las cantidades de la receta arrastran el error. Es «nunca
  // inventar» aplicado a las unidades.
  // Arreglo previsto (Fase 1): `ItemDetectado` lleva su unidad, y si no la
  // trae, se toma la del catálogo canónico del ingrediente.
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

describe('BUG-4 · dos filas del mismo ingrediente y solo cuenta la última', () => {
  // Dónde: groceries.ts, listaDeMercado, el Map `enCasa`.
  // Qué pasa: `new Map(...)` con claves repetidas se queda con la última.
  // Por qué importa: el inventario tiene una fila por origen (escaneo, factura,
  // manual), así que tener el mismo ingrediente dos veces es lo NORMAL, no el
  // caso raro. Resultado: te manda a comprar lo que ya tienes.
  // Arreglo previsto (Fase 1): sumar las cantidades por ingrediente.
  it.failing('seis huevos de la factura y seis del escaneo son doce', () => {
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
});

describe('BUG-5 · una alergia no llega al filtro de recetas', () => {
  // Dónde: coverage.ts, recetasConLoQueHay. No recibe los comensales.
  // Qué pasa: `Comensal.noCome` existe en el modelo y en la base de datos, pero
  // esta función no lo ve. Quien la llama tiene que traducirlo a mano a una
  // restricción `excluir_ingrediente`, y nada obliga a hacerlo.
  // Por qué importa: una alergia es una restricción DURA. El comportamiento por
  // defecto de una función de seguridad no puede ser «inseguro salvo que quien
  // llama se acuerde». Es el segundo más grave de los siete.
  // Arreglo previsto (Fase 1): la función recibe los comensales como sexto
  // parámetro y excluye su `noCome` siempre, sin depender de quien la llame.
  //
  // El test llama a la función con la firma que tendrá DESPUÉS del arreglo. Hoy
  // ese argumento de más se ignora, la receta con maní sale, y el test falla:
  // por eso está registrado como `.failing`. El día que la firma acepte
  // comensales, el test pasará y se pondrá rojo pidiendo que le quiten el
  // `.failing`. Si en Fase 1 se elige otra firma, este test cambia con ella.
  type ConComensales = (
    catalogo: Receta[],
    detectado: ItemDetectado[],
    despensaBasica: string[],
    restricciones?: Restriccion[],
    cuantas?: number,
    comensales?: Comensal[]
  ) => OpcionReceta[];

  it.failing('quien es alérgico al maní no ve recetas con maní', () => {
    const conMani = receta({
      id: 'con-mani',
      ingredientes: [ingrediente('mani'), ingrediente('arroz')],
    });
    const sinMani = receta({ id: 'sin-mani', ingredientes: [ingrediente('arroz')] });
    const alergico = comensal({ id: 'nino', noCome: ['mani'] });

    const conFirmaArreglada = recetasConLoQueHay as unknown as ConComensales;
    const opciones = conFirmaArreglada(
      [conMani, sinMani],
      [detectado({ ingredienteId: 'mani' }), detectado({ ingredienteId: 'arroz' })],
      [],
      [],
      3,
      [alergico]
    );

    expect(opciones.some((o) => idsDe(o.receta).includes('mani'))).toBe(false);
  });

  it('mientras tanto, traducir la alergia a mano sí funciona', () => {
    // Este NO es `.failing`: es la única forma segura de llamar hoy, y conviene
    // que esté probada para que quien arregle el bug sepa qué comportamiento
    // tiene que conservar.
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

describe('BUG-7 · escalarReceta devuelve el total en un campo que dice «por porción»', () => {
  // Dónde: portions.ts, escalarReceta.
  // Qué pasa: devuelve `RecetaIngrediente[]`, cuyo campo se llama
  // `cantidadPorPorcion`, pero le mete la cantidad TOTAL ya multiplicada.
  // Por qué importa: no rompe nada hoy porque nadie encadena la función. El día
  // que alguien escale un resultado ya escalado, multiplica dos veces y no hay
  // forma de notarlo mirando el tipo. Un nombre que miente es una trampa que
  // espera.
  // Arreglo previsto (Fase 1): devolver un tipo propio con `cantidadTotal`, de
  // forma que encadenar por accidente ni siquiera compile.
  //
  // El test comprueba la forma que tendrá el resultado DESPUÉS del arreglo. Hoy
  // ese campo no existe y el test falla; cuando exista, se pondrá rojo pidiendo
  // que le quiten el `.failing`.
  it.failing('el resultado trae la cantidad total en un campo que se llama así', () => {
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('arroz', 100)] }),
      4
    ) as unknown as { cantidadTotal?: number }[];

    expect(escalada[0]?.cantidadTotal).toBe(400);
  });

  it('hoy devuelve el total, y ese es exactamente el problema', () => {
    // Test de caracterización, no `.failing`: fija el comportamiento actual para
    // que el cambio de Fase 1 sea visible y deliberado, no accidental.
    const escalada = escalarReceta(
      receta({ ingredientes: [ingrediente('arroz', 100)] }),
      4
    );
    expect(escalada[0]?.cantidadPorPorcion).toBe(400);
  });
});
