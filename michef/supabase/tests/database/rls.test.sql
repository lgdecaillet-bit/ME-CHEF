-- Los candados del catalogo, probados.
--
-- LO QUE HAY QUE ENTENDER ANTES DE TOCAR ESTE ARCHIVO (decision #47):
--
-- Una politica RLS que no deniega nada se ve EXACTAMENTE IGUAL que una que
-- funciona, y hay una trampa concreta que lo hace facil de creer: con RLS
-- activado y sin politica de lectura, un `select` no da error — devuelve cero
-- filas. Sobre una tabla vacia eso pasa igual con candado que sin el. Un test
-- que consulte una tabla vacia pasa en verde con RLS roto.
--
-- Por eso este archivo SIEMBRA FILAS PRIMERO, como `postgres`, y solo despues
-- se cambia a `anon` para comprobar que no las ve. Si algun dia alguien quita
-- la siembra "porque no hace falta", los tests dejan de probar nada.
--
-- Se comprueban dos cosas independientes:
--   · comportamiento — que `anon` no lee ni escribe lo que no debe;
--   · estructura     — que RLS sigue activado y que las tablas cerradas siguen
--                      sin politicas. Sin esto, alguien podria desactivar RLS
--                      en una tabla vacia y no enterarse hasta que tenga datos.
--
-- `anon` es el rol de la clave publicable que viaja dentro del bundle de la
-- app. Cualquiera que instale la app tiene esa clave. No es un rol de confianza.

begin;
select plan(22);

-- ───────────────────────────────────────────────────────────── siembra
-- Como `postgres`, que se salta RLS. Estas filas son las que `anon` NO debe ver.
-- Todos los ids llevan prefijo `t-` para no chocar nunca con datos reales: el
-- test corre contra la base local, que puede tener semilla o restos de pruebas
-- a mano. Un test que solo pasa sobre una base virgen no sirve de gran cosa.
insert into ingrediente (id, categoria) values ('t-cebolla', 'verdura');
insert into producto (id, ingrediente_id, pais, nombre_comercial, mapeado_por)
  values ('t-prod', 't-cebolla', 'CO', 'Cebolla larga x1', 'humano');
insert into tienda (id, cadena, pais) values ('t-tienda', 'D1', 'CO');
insert into precio (producto_id, tienda_id, fecha, moneda, precio_por_unidad, fuente, confianza)
  values ('t-prod', 't-tienda', current_date, 'COP', 4200, 'factura', 1);
insert into cache_modelo (clave, tarea, respuesta, modelo)
  values ('t-hash', 'nevera_pasada1', '{"visto": "cebolla"}'::jsonb, 'modelo-x');
insert into off_producto (codigo_barras, nombre) values ('t-7700000000001', 'Algo');

insert into receta (id, minutos, tipo, origen, estado)
  values ('t-pub', 20, 'comida', 'pipeline', 'publicada'),
         ('t-bor', 20, 'comida', 'pipeline', 'borrador');
insert into receta_ingrediente (receta_id, ingrediente_id, cantidad_por_porcion, unidad)
  values ('t-pub', 't-cebolla', 100, 'g'), ('t-bor', 't-cebolla', 100, 'g');
insert into receta_paso (receta_id, orden, instruccion)
  values ('t-pub', 1, 'paso de receta publicada'), ('t-bor', 1, 'paso de borrador');
insert into receta_texto (receta_id, idioma, titulo)
  values ('t-pub', 'es', 'Publicada'), ('t-bor', 'es', 'Borrador a medias');
insert into receta_senal (receta_id) values ('t-pub'), ('t-bor');
insert into receta_vector (receta_id, embedding)
  values ('t-pub', array_fill(0.1::real, array[1536])::vector);

-- ─────────────────────────────────────────────────── estructura (4 tests)

select is(
  (select count(*)::int from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0,
  'ninguna tabla del esquema publico se quedo sin RLS'
);

select is(
  (select count(*)::int from pg_policies
    where schemaname = 'public'
      and tablename in ('precio', 'cache_modelo', 'off_producto', 'receta_vector')),
  0,
  'las cuatro tablas cerradas no tienen ni una politica'
);

select is(
  (select count(*)::int from pg_policies
    where schemaname = 'public' and cmd <> 'SELECT'),
  0,
  'no hay politicas de insert, update ni delete para ningun cliente'
);

-- Se cuentan las vistas que NO lo tienen, y se exige cero. La primera version
-- contaba las que SI lo tienen y exigia 2, y eso no generalizaba: el revisor
-- creo una tercera vista sin `security_invoker` que exponia `precio` entero a
-- `anon`, y los 20 tests siguieron en verde. Un test de inventario no es un
-- test de invariante. El de RLS de arriba ya estaba bien escrito por eso mismo.
select is(
  (select count(*)::int from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'v'
      and coalesce(array_to_string(c.reloptions, ','), '') not like '%security_invoker=on%'),
  0,
  'ninguna vista se quedo corriendo como quien la creo'
);

-- TRUNCATE es DDL: **RLS no se le aplica**. Con el `ALL` que Supabase concede
-- por defecto, `anon` podia vaciar cualquier tabla de un golpe aunque no
-- pudiera borrar ni una fila con `delete`. Comprobado antes de arreglarlo: se
-- hizo, y las filas de `cache_modelo` desaparecieron.
-- Se cuenta sobre TODAS las tablas, no sobre una lista: asi una tabla creada
-- manana tampoco se cuela.
select is(
  (select count(*)::int
     from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee in ('anon', 'authenticated')
      and privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES')),
  0,
  'ningun cliente puede vaciar una tabla entera ni colgarle un trigger'
);

-- ──────────────────────────────────────────────── lo que anon SI puede
set local role anon;

select isnt_empty(
  'select 1 from ingrediente',
  'anon lee el catalogo de ingredientes: sin esto la app no pinta nada'
);

select is(
  (select count(*)::int from receta),
  1,
  'anon ve la receta publicada, y solo esa'
);

select is(
  (select id from receta),
  't-pub',
  'la que ve es la publicada, no el borrador'
);

-- ─────────────────────────────────────── lo que anon NO puede leer
-- Las filas existen: se sembraron arriba. Si estas cuentas dieran cero por estar
-- la tabla vacia, el test no probaria nada.

select is(
  (select count(*)::int from precio),
  0,
  'anon no lee precios, aunque hay uno sembrado'
);

select is(
  (select count(*)::int from cache_modelo),
  0,
  'anon no lee el cache de modelos, aunque hay uno sembrado'
);

select is(
  (select count(*)::int from off_producto),
  0,
  'anon no lee Open Food Facts, aunque hay uno sembrado'
);

select is(
  (select count(*)::int from receta_vector),
  0,
  'anon no lee los embeddings, aunque hay uno sembrado'
);

select is(
  (select count(*)::int from receta_paso),
  1,
  'anon ve un solo paso: el de la publicada, no el del borrador'
);

select is(
  (select instruccion from receta_paso),
  'paso de receta publicada',
  'el contenido del borrador no se filtra por la tabla hija'
);

select is(
  (select count(*)::int from receta_texto),
  1,
  'el texto del borrador tampoco se filtra'
);

select is(
  (select count(*)::int from receta_senal),
  1,
  'las señales del borrador tampoco'
);

-- La vista es el agujero mas facil de dejar abierto: sin `security_invoker`
-- correria como `postgres` y devolveria el borrador.
select is(
  (select count(distinct receta_id)::int from receta_disponible),
  1,
  'la vista de disponibilidad tampoco deja ver el borrador'
);

-- ────────────────────────────────────── lo que anon NO puede escribir

select throws_ok(
  $$insert into precio (producto_id, fecha, moneda, precio_por_unidad, fuente, confianza)
    values ('t-prod', current_date, 'COP', 1, 'factura', 1)$$,
  '42501',
  null,
  'anon no puede insertar un precio'
);

select throws_ok(
  $$insert into cache_modelo (clave, tarea, respuesta, modelo)
    values ('t-envenenado', 'nevera_pasada1', '{}'::jsonb, 'm')$$,
  '42501',
  null,
  'anon no puede envenenar el cache de modelos'
);

select throws_ok(
  $$insert into ingrediente (id, categoria) values ('t-inventado', 'verdura')$$,
  '42501',
  null,
  'anon no puede meter un ingrediente en el catalogo'
);

select throws_ok(
  $$truncate cache_modelo$$,
  '42501',
  null,
  'anon no puede vaciar una tabla cerrada de un golpe'
);

-- Este es el caso peligroso de verdad: la fila SI se ve. Sin politica de update
-- no da error, simplemente no cambia nada — y eso es lo que hay que comprobar,
-- porque un `update` silencioso que si funcionara no daria error tampoco.
update receta set minutos = 999 where id = 't-pub';
reset role;
select is(
  (select minutos from receta where id = 't-pub'),
  20,
  'anon ve la receta publicada pero no puede modificarla'
);

select * from finish();
rollback;
