-- Migracion 0001 · el catalogo compartido
--
-- Es `supabase/schema.sql` tal cual, convertido en migracion versionada. Antes
-- era un archivo suelto para pegar en un panel: nadie podía saber si lo que
-- había en el servidor era esto. Ahora corre igual en local, en CI y en
-- produccion, con el mismo comando.
--
-- Cambios respecto a schema.sql, y ninguno mas:
--   · `create table if not exists` y `create or replace view`, para que la
--     migracion se pueda repetir sin romperse.
--   · Los cinco indices llevan nombre. `if not exists` no existe para un indice
--     anonimo, asi que sin nombre no habia forma de hacerlos repetibles.
--
-- **Aqui no hay ni una regla de acceso, a proposito.** Van todas en la 0002,
-- juntas y con sus tests al lado, para que se puedan leer de una vez y para que
-- nadie tenga que buscarlas por el archivo.
--
-- Ninguna fila de este esquema lleva identidad de usuario. Los datos personales
-- viven en SQLite cifrado en el telefono (CLAUDE.md).

create extension if not exists vector;

-- ---------------------------------------------------------------- ingredientes

-- Canónico: sin idioma, sin país, sin marca. Es la columna vertebral.
create table if not exists ingrediente (
  id            text primary key,
  categoria     text not null,          -- proteina, verdura, grano, lacteo, condimento
  unidad_base   text not null default 'g',   -- g | ml
  perecibilidad_dias int,
  creado_en     timestamptz not null default now()
);

-- Porciones caseras: "1 cebolla mediana = 110 g". Vienen de USDA.
create table if not exists ingrediente_porcion (
  ingrediente_id text not null references ingrediente(id),
  descripcion    text not null,          -- "unidad mediana", "taza cocido"
  gramos         real not null,
  primary key (ingrediente_id, descripcion)
);

-- Cómo se llama en cada idioma, con sinónimos y formas como aparecen en tickets.
create table if not exists ingrediente_nombre (
  ingrediente_id text not null references ingrediente(id),
  idioma         text not null,          -- es, fr, de, en
  nombre         text not null,
  sinonimos      text[],
  formas_ticket  text[],                 -- 'PECH POLLO', 'poulet filet'
  primary key (ingrediente_id, idioma)
);

-- Números de bases públicas. NUNCA de un modelo (ver CLAUDE.md).
create table if not exists nutricion (
  ingrediente_id text not null references ingrediente(id),
  fuente         text not null,          -- usda | suiza | ciqual | bedca | estimado
  id_en_fuente   text,
  kcal           real, proteina real, carbohidrato real, grasa real, fibra real,
  estado         text,                   -- crudo | cocido
  confianza      real not null default 1,
  primary key (ingrediente_id, fuente)
);

-- Open Food Facts vive aparte (licencia ODbL con share-alike). No mezclar.
create table if not exists off_producto (
  codigo_barras text primary key,
  nombre        text,
  marca         text,
  pais          text,
  datos         jsonb,
  importado_en  timestamptz not null default now()
);

-- ------------------------------------------------------- productos y precios

-- Lo que existe en una tienda real. Absorbe la diversidad del mundo:
-- un país nuevo se llena solo con las primeras facturas.
create table if not exists producto (
  id             text primary key,
  ingrediente_id text not null references ingrediente(id),
  pais           text not null,
  nombre_comercial text not null,
  marca          text,
  codigo_barras  text,
  gramos_envase  real,
  mapeado_por    text not null,          -- cache | base | modelo | humano
  confianza      real not null default 1,
  creado_en      timestamptz not null default now()
);
create index if not exists idx_producto_pais_ingrediente
  on producto (pais, ingrediente_id);
create index if not exists idx_producto_nombre_comercial
  on producto using gin (to_tsvector('simple', nombre_comercial));

create table if not exists tienda (
  id       text primary key,
  cadena   text not null,
  pais     text not null,
  ciudad   text,
  direccion text,
  lat real, lon real
);

-- Tres fuentes, una regla: usar siempre la de mayor confianza.
-- estimado (modelo, una vez por país) < dato_abierto < factura (decae con el tiempo)
create table if not exists precio (
  id           bigserial primary key,
  producto_id  text not null references producto(id),
  tienda_id    text references tienda(id),
  fecha        date not null,
  moneda       text not null,
  precio_por_unidad real not null,       -- normalizado por kg o litro
  fuente       text not null,            -- estimado | dato_abierto | factura
  confianza    real not null
);
create index if not exists idx_precio_producto_tienda_fecha
  on precio (producto_id, tienda_id, fecha desc);

-- --------------------------------------------------------------------- recetas

-- Estructura, no texto. Apunta a ids canónicos, por eso no tiene país.
create table if not exists receta (
  id           text primary key,
  minutos      int not null,
  tipo         text not null,            -- desayuno | almuerzo | comida | in_the_middle
  dificultad   text,
  cocina       text,                     -- colombiana, italiana, asiatica
  proteina_principal text,
  origen       text not null,            -- pipeline | importada
  estado       text not null default 'borrador', -- borrador | validada | publicada | retirada
  creada_en    timestamptz not null default now()
);
create index if not exists idx_receta_estado_tipo
  on receta (estado, tipo);

create table if not exists receta_ingrediente (
  receta_id      text not null references receta(id),
  ingrediente_id text not null references ingrediente(id),
  cantidad_por_porcion real not null,    -- para UNA porción
  unidad         text not null,
  primary key (receta_id, ingrediente_id)
);

create table if not exists receta_paso (
  receta_id   text not null references receta(id),
  orden       int not null,
  instruccion text not null,
  asi_debe_verse text,                   -- "dorado, no oscuro"
  timer_segundos int,
  equipo      text,                      -- olla | sarten | horno | airfryer
  primary key (receta_id, orden)
);

-- Generado una vez por idioma, en lote. Nunca se traduce en vivo.
create table if not exists receta_texto (
  receta_id text not null references receta(id),
  idioma    text not null,
  titulo    text not null,
  subtitulo text,
  linea_notificacion text,               -- "esos huevitos te están esperando"
  imagen_url text,
  primary key (receta_id, idioma)
);

-- Contadores agregados. Sin usuario, sin eventos individuales.
create table if not exists receta_senal (
  receta_id      text primary key references receta(id),
  vistas         bigint not null default 0,
  elegidas       bigint not null default 0,
  terminadas     bigint not null default 0,
  abandonos      bigint not null default 0,
  repeticiones   bigint not null default 0,
  regeneraciones bigint not null default 0,
  estrellas_suma bigint not null default 0,
  estrellas_n    bigint not null default 0,
  minutos_reales_media real,
  ranking        real not null default 0  -- recalculado en lote
);

-- Para "algo calientico para la noche" y para detectar duplicados.
create table if not exists receta_vector (
  receta_id text primary key references receta(id),
  embedding vector(1536)
);
create index if not exists idx_receta_vector_embedding
  on receta_vector using hnsw (embedding vector_cosine_ops);

-- --------------------------------------------------- disponibilidad por país

-- Derivada: ¿hay algún producto de ese ingrediente en ese país?
-- Las recetas con ingredientes sin producto local se marcan difíciles.
create or replace view ingrediente_disponible as
select distinct ingrediente_id, pais from producto;

create or replace view receta_disponible as
select r.id as receta_id, p.pais,
       bool_and(d.ingrediente_id is not null) as disponible
from receta r
join receta_ingrediente ri on ri.receta_id = r.id
cross join (select distinct pais from producto) p
left join ingrediente_disponible d
       on d.ingrediente_id = ri.ingrediente_id and d.pais = p.pais
group by r.id, p.pais;

-- ------------------------------------------------------- caché de modelos

-- La vuelta que hace que un país nuevo cueste cada vez menos:
-- toda respuesta de modelo se guarda y no se vuelve a pedir.
create table if not exists cache_modelo (
  clave      text primary key,           -- hash de (tarea + entrada + país)
  tarea      text not null,
  respuesta  jsonb not null,
  modelo     text not null,
  creado_en  timestamptz not null default now()
);
