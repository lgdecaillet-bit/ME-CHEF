/**
 * El esquema personal, probado en el PC.
 *
 * Por qué existe: `src/db/schema.ts` describe la base de datos que vive cifrada
 * en el teléfono. Sin este test, la primera vez que se sabría si el esquema es
 * válido sería abriendo la app en el iPhone, con un error de SQLite en pantalla.
 *
 * Lo importante de este archivo es de dónde sale el SQL: **se genera desde
 * `schema.ts` con el mismo generador que produce las migraciones reales**, no se
 * escribe a mano. Una copia a mano se separa del esquema en cuanto alguien añade
 * una columna, y entonces el test pasa mientras la app falla. Ya ocurrió: la
 * primera versión de este archivo llevaba un DDL a mano al que le faltaban cinco
 * columnas, y no creaba doce de las catorce tablas.
 *
 * `better-sqlite3` es el mismo motor SQLite que corre en el móvil: si algo no se
 * puede crear aquí, tampoco allí.
 *
 * Ojo: esto NO prueba el cifrado (SQLCipher), que necesita un development build
 * y por tanto la licencia de Apple. Eso llega en Fase 1, detrás de un flag.
 */
import Database from 'better-sqlite3';
import { is } from 'drizzle-orm';
import { SQLiteTable, getTableConfig } from 'drizzle-orm/sqlite-core';
import { generateSQLiteDrizzleJson, generateSQLiteMigration } from 'drizzle-kit/api';
import * as esquema from '../schema';
import { comensal, hogar, inventario } from '../schema';

/** El DDL real, generado desde schema.ts igual que lo hará la migración. */
async function ddlDelEsquema(): Promise<string[]> {
  const vacio = await generateSQLiteDrizzleJson({});
  const lleno = await generateSQLiteDrizzleJson(esquema as Record<string, unknown>);
  return generateSQLiteMigration(vacio, lleno);
}

async function baseConElEsquema(): Promise<Database.Database> {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  for (const sentencia of await ddlDelEsquema()) db.exec(sentencia);
  return db;
}

describe('el esquema se puede crear en SQLite tal cual', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = await baseConElEsquema();
  });

  afterEach(() => db.close());

  it('crea las catorce tablas sin que SQLite proteste', async () => {
    expect(await ddlDelEsquema()).toHaveLength(14);
    const tablas = db
      .prepare("select name from sqlite_master where type = 'table'")
      .all() as { name: string }[];
    expect(tablas.length).toBeGreaterThanOrEqual(14);
  });

  it('guarda un hogar y lo vuelve a leer igual', () => {
    db.prepare(
      'insert into hogar (id, pais, moneda, idioma, creado_en) values (?, ?, ?, ?, ?)'
    ).run('h1', 'CH', 'CHF', 'es', Date.now());

    const fila = db.prepare('select * from hogar where id = ?').get('h1') as {
      pais: string;
      moneda: string;
    };
    // País, moneda e idioma son columnas, nunca ramas del código: un país nuevo
    // es datos, no código (CLAUDE.md).
    expect(fila.pais).toBe('CH');
    expect(fila.moneda).toBe('CHF');
  });

  it('un hogar con tres comensales, cada uno con su factor', () => {
    db.prepare(
      'insert into hogar (id, pais, moneda, idioma, creado_en) values (?, ?, ?, ?, ?)'
    ).run('h1', 'CH', 'CHF', 'es', Date.now());

    const insertar = db.prepare(
      'insert into comensal (id, hogar_id, nombre, factor_porcion) values (?, ?, ?, ?)'
    );
    insertar.run('c1', 'h1', 'mamá', 1);
    insertar.run('c2', 'h1', 'papá', 1);
    insertar.run('c3', 'h1', 'niño', 0.7);

    const suma = db
      .prepare('select sum(factor_porcion) as total from comensal where hogar_id = ?')
      .get('h1') as { total: number };
    // Es el caso del primer usuario: cocina para tres.
    expect(suma.total).toBeCloseTo(2.7);
  });

  it('no deja crear un comensal de un hogar que no existe', () => {
    // Sin esta comprobación, un borrado a medias dejaría comensales huérfanos y
    // las porciones saldrían mal sin que nada avise.
    expect(() =>
      db
        .prepare('insert into comensal (id, hogar_id, factor_porcion) values (?, ?, ?)')
        .run('c1', 'hogar-fantasma', 1)
    ).toThrow(/FOREIGN KEY/i);
  });

  it('el factor de porción vale 1 si no se dice otra cosa', () => {
    db.prepare(
      'insert into hogar (id, pais, moneda, idioma, creado_en) values (?, ?, ?, ?, ?)'
    ).run('h1', 'CO', 'COP', 'es', Date.now());
    db.prepare('insert into comensal (id, hogar_id) values (?, ?)').run('c1', 'h1');

    const fila = db.prepare('select factor_porcion as f from comensal').get() as {
      f: number;
    };
    expect(fila.f).toBe(1);
  });

  it('las listas se guardan como JSON y vuelven como listas', () => {
    db.prepare(
      'insert into hogar (id, pais, moneda, idioma, despensa_basica, creado_en) values (?, ?, ?, ?, ?, ?)'
    ).run(
      'h1',
      'CH',
      'CHF',
      'es',
      JSON.stringify(['arroz', 'aceite', 'sal']),
      Date.now()
    );

    const fila = db.prepare('select despensa_basica as d from hogar').get() as {
      d: string;
    };
    expect(JSON.parse(fila.d)).toEqual(['arroz', 'aceite', 'sal']);
  });

  it('guarda un ítem de inventario sin cantidad y lo lee como NULL', () => {
    // El metadato de Drizzle dice que la columna admite NULL; esto comprueba que
    // SQLite de verdad lo acepta y lo devuelve. Es el caso normal de una foto de
    // nevera: se ve el huevo, no se cuenta (arreglo de BUG-1).
    //
    // OJO con la frontera: aquí vuelve `null`, y el motor usa `undefined`
    // (`ItemInventario.cantidad?: number`). Los dos significan «está, no sé
    // cuánto» y todo el motor los trata igual porque compara con `== null`, pero
    // la capa que lea de esta base tiene que normalizar `null → undefined`.
    // Escrito en la decisión #49; el repositorio que lo haga llega en Fase 1.
    db.prepare(
      'insert into hogar (id, pais, moneda, idioma, creado_en) values (?, ?, ?, ?, ?)'
    ).run('h1', 'CO', 'COP', 'es', Date.now());
    db.prepare(
      'insert into inventario (id, hogar_id, ingrediente_id, confianza, origen, entro_en, visto_en) values (?, ?, ?, ?, ?, ?, ?)'
    ).run('i1', 'h1', 'huevo', 0.9, 'escaneo', Date.now(), Date.now());

    const fila = db.prepare('select cantidad from inventario where id = ?').get('i1') as {
      cantidad: number | null;
    };
    expect(fila.cantidad).toBeNull();
  });

  it('borrar todo deja la base vacía, y se puede comprobar', () => {
    // «Se exporta y se borra entero, verificable» (CLAUDE.md).
    db.prepare(
      'insert into hogar (id, pais, moneda, idioma, creado_en) values (?, ?, ?, ?, ?)'
    ).run('h1', 'CH', 'CHF', 'es', Date.now());
    db.prepare('insert into comensal (id, hogar_id) values (?, ?)').run('c1', 'h1');

    db.exec('delete from comensal; delete from hogar;');

    const quedan = db.prepare('select count(*) as n from comensal').get() as {
      n: number;
    };
    const hogares = db.prepare('select count(*) as n from hogar').get() as { n: number };
    expect(quedan.n).toBe(0);
    expect(hogares.n).toBe(0);
  });
});

describe('el esquema declara lo que la app necesita', () => {
  // Igualdad, no contención: si alguien añade o quita una columna, este test lo
  // dice y hay que decidir a conciencia si el cambio es correcto. Con
  // `arrayContaining` una columna nueva pasa desapercibida.
  it('la tabla hogar tiene exactamente las columnas de schema.ts', () => {
    const columnas = getTableConfig(hogar)
      .columns.map((c) => c.name)
      .sort();
    expect(columnas).toEqual([
      'come_en_casa',
      'comidas_por_dia',
      'creado_en',
      'despensa_basica',
      'id',
      'idioma',
      'minutos_diarios',
      'minutos_por_comida',
      'moneda',
      'pais',
      'presupuesto_semanal',
    ]);
  });

  it('la tabla comensal tiene exactamente las columnas de schema.ts', () => {
    // `no_come` es lo que BUG-5 debe llegar a respetar en Fase 1: existe en el
    // modelo desde el principio, y es el filtro de recetas el que lo ignora.
    const columnas = getTableConfig(comensal)
      .columns.map((c) => c.name)
      .sort();
    expect(columnas).toEqual([
      'factor_porcion',
      'hogar_id',
      'id',
      'no_come',
      'nombre',
      'objetivo_id',
    ]);
  });

  it('la cantidad del inventario admite NULL, y eso es deliberado', () => {
    // De esto depende el arreglo de BUG-1. `undefined` en el motor significa
    // «está, no sé cuánto», que es el caso normal de una foto de nevera. Si
    // alguien devolviera esta columna a NOT NULL, el motor seguiría guardando el
    // ítem en memoria y reventaría al escribirlo en el teléfono, lejos de aquí.
    expect(inventario.cantidad.notNull).toBe(false);
    expect(hogar.id.notNull).toBe(true); // control: la aserción sabe distinguir
  });

  it('el factor de porción es obligatorio y vale 1 por defecto', () => {
    expect(comensal.factorPorcion.notNull).toBe(true);
    expect(comensal.factorPorcion.hasDefault).toBe(true);
  });

  it('ninguna tabla se llama como algo que debe calcularse', () => {
    // Tres cosas no se guardan nunca porque se calculan: la lista de mercado,
    // las macros de una receta y las pills derivadas (CLAUDE.md). Si aparece
    // una tabla con ese nombre, el diseño se torció.
    const nombres = Object.keys(esquema).map((n) => n.toLowerCase());
    for (const prohibida of ['listademercado', 'listamercado', 'macros', 'pills']) {
      expect(nombres).not.toContain(prohibida);
    }
  });
});

describe('las relaciones entre tablas apuntan a algo que existe', () => {
  // Drizzle declara las claves foráneas como funciones perezosas
  // (`.references(() => hogar.id)`) y no las resuelve hasta que alguien las
  // pide. Una referencia a una tabla borrada NO se nota al importar el módulo
  // ni al compilar: se nota cuando SQLite rechaza la migración, en el teléfono.
  const tablas = Object.entries(esquema).filter(([, t]) => is(t, SQLiteTable)) as [
    string,
    SQLiteTable,
  ][];

  it('hay catorce tablas que revisar', () => {
    expect(tablas).toHaveLength(14);
  });

  it.each(tablas.map(([nombre]) => nombre))(
    'las claves foráneas de %s resuelven a una columna real',
    (nombre) => {
      const tabla = Object.fromEntries(tablas)[nombre] as SQLiteTable;
      for (const fk of getTableConfig(tabla).foreignKeys) {
        const ref = fk.reference();
        expect(ref.foreignTable).toBeDefined();
        expect(ref.foreignColumns.length).toBeGreaterThan(0);
        for (const columna of ref.foreignColumns) {
          expect(typeof columna.name).toBe('string');
          expect(columna.name.length).toBeGreaterThan(0);
        }
      }
    }
  );

  it('comensal cuelga de hogar, que es la unidad de cocina', () => {
    const fks = getTableConfig(comensal).foreignKeys;
    expect(fks).toHaveLength(1);
    const ref = fks[0]!.reference();
    expect(getTableConfig(ref.foreignTable).name).toBe('hogar');
    expect(ref.foreignColumns[0]?.name).toBe('id');
  });
});
