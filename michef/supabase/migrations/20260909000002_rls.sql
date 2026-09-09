-- Migracion 0002 · los candados
--
-- Hasta esta migracion, las quince tablas del catalogo estaban abiertas. No es
-- una forma de hablar: se comprobo antes de escribir esto, y como `anon` se
-- pudo insertar una fila en `precio` y leer `cache_modelo` entero. `anon` es el
-- rol de la clave publicable que viaja DENTRO del bundle de la app, asi que
-- cualquiera que instale la app tiene esa clave. Estaba todo abierto a todos.
--
-- El modelo, en una frase: **los clientes solo leen el catalogo publicado, y no
-- escriben nada.** Todo lo que escribe pasa por el proxy o por un job, que usan
-- `service_role`, y `service_role` se salta RLS por definicion.
--
-- ---------------------------------------------------------------------------
-- POR QUE HAY UN SOLO MECANISMO Y NO DOS, Y CUAL ES LA EXCEPCION (decision #47)
--
-- Para los cuatro verbos que RLS cubre — select, insert, update, delete — la
-- tentacion es poner cinturon y tirantes: RLS *y* revocar los permisos de
-- tabla. Seria mas seguro y seria peor, porque entonces ningun test podria
-- decir cual de los dos esta haciendo el trabajo. Si RLS se rompiera, el
-- `revoke` lo taparia y el test seguiria verde: una politica que no deniega
-- nada se ve exactamente igual que una que funciona.
--
-- **La excepcion es TRUNCATE, y hay que entender por que no es la misma
-- discusion.** PostgreSQL trata `truncate` como DDL, no como DML: **RLS no se
-- le aplica**. Y Supabase concede `ALL` sobre el esquema publico a `anon` y
-- `authenticated`, y `ALL` incluye TRUNCATE, TRIGGER y REFERENCES. Es decir que
-- hasta el bloque 7 de abajo, `anon` — el rol de la clave que viaja dentro de
-- la app — podia vaciar cualquier tabla de un golpe, incluidas `precio` y
-- `cache_modelo`. Comprobado, no supuesto: se hizo, y las filas desaparecieron.
--
-- Ahi no hay dos mecanismos solapados: hay cero. Revocar TRUNCATE no oculta
-- nada, porque no habia nada que ocultar. Cubre un verbo que RLS no alcanza.
--
-- Asi que el mecanismo es uno, RLS, y se comprueba de dos maneras
-- independientes en `supabase/tests/database/rls.test.sql`:
--   1. por comportamiento: se siembran filas como `postgres` y se intenta
--      leerlas y escribirlas como `anon`;
--   2. por estructura: se comprueba que RLS esta activado en las quince y que
--      las cuatro tablas cerradas no tienen NI UNA politica.
-- La segunda existe porque la primera tiene una trampa: con RLS activado y sin
-- politica de lectura, un `select` no da error, devuelve cero filas. Sobre una
-- tabla vacia eso pasa igual con RLS que sin RLS. Por eso se siembra primero.
-- ---------------------------------------------------------------------------

-- ── 1 · El candado, en las quince ──────────────────────────────────────────
alter table ingrediente          enable row level security;
alter table ingrediente_porcion  enable row level security;
alter table ingrediente_nombre   enable row level security;
alter table nutricion            enable row level security;
alter table off_producto         enable row level security;
alter table producto             enable row level security;
alter table tienda               enable row level security;
alter table precio               enable row level security;
alter table receta               enable row level security;
alter table receta_ingrediente   enable row level security;
alter table receta_paso          enable row level security;
alter table receta_texto         enable row level security;
alter table receta_senal         enable row level security;
alter table receta_vector        enable row level security;
alter table cache_modelo         enable row level security;

-- ── 2 · Lectura del catalogo canonico ──────────────────────────────────────
-- Nada de esto es secreto ni personal: es que la cebolla existe y pesa 110 g.
-- Sin esto la app no puede ni pintar un ingrediente.

create policy "catalogo: ingrediente se lee"
  on ingrediente for select to anon, authenticated using (true);

create policy "catalogo: porciones caseras se leen"
  on ingrediente_porcion for select to anon, authenticated using (true);

create policy "catalogo: nombres por idioma se leen"
  on ingrediente_nombre for select to anon, authenticated using (true);

create policy "catalogo: nutricion se lee"
  on nutricion for select to anon, authenticated using (true);

create policy "catalogo: productos se leen"
  on producto for select to anon, authenticated using (true);

create policy "catalogo: tiendas se leen"
  on tienda for select to anon, authenticated using (true);

-- ── 3 · Recetas: solo las publicadas ───────────────────────────────────────
-- Un borrador es trabajo a medias del pipeline. Que se vea seria enseñar una
-- receta que nadie ha validado, y la promesa es la contraria: lo que sale
-- ya paso el filtro.

create policy "recetas: solo las publicadas se leen"
  on receta for select to anon, authenticated
  using (estado = 'publicada');

-- Las cuatro tablas hijas heredan la condicion en vez de abrirse enteras. Si
-- se abrieran, el contenido de un borrador (sus pasos, su texto, su lista de
-- ingredientes) seguiria siendo legible aunque su fila en `receta` no lo fuera,
-- y el candado de arriba no serviria de nada.
--
-- La subconsulta mira `receta`, que tambien tiene RLS: al ejecutarla `anon`,
-- solo ve las publicadas. El candado se aplica dos veces por el mismo camino.

create policy "recetas: ingredientes de recetas publicadas"
  on receta_ingrediente for select to anon, authenticated
  using (exists (
    select 1 from receta r
    where r.id = receta_ingrediente.receta_id and r.estado = 'publicada'
  ));

create policy "recetas: pasos de recetas publicadas"
  on receta_paso for select to anon, authenticated
  using (exists (
    select 1 from receta r
    where r.id = receta_paso.receta_id and r.estado = 'publicada'
  ));

create policy "recetas: textos de recetas publicadas"
  on receta_texto for select to anon, authenticated
  using (exists (
    select 1 from receta r
    where r.id = receta_texto.receta_id and r.estado = 'publicada'
  ));

create policy "recetas: señales de recetas publicadas"
  on receta_senal for select to anon, authenticated
  using (exists (
    select 1 from receta r
    where r.id = receta_senal.receta_id and r.estado = 'publicada'
  ));

-- ── 4 · Las cuatro cerradas ────────────────────────────────────────────────
-- No llevan politica ninguna, y eso NO es un olvido: con RLS activado, la
-- ausencia de politica es la denegacion. Se listan aqui para que se lea como
-- una decision y no como un hueco, y hay un test que comprueba que siguen sin
-- politicas.
--
--   precio        · es el activo del proyecto. Se construye con facturas de
--                   gente real y con consultas a modelos que cuestan dinero.
--                   Un competidor que lo lea entero se ahorra el trabajo
--                   entero. Los precios llegan a la app calculados, por el
--                   proxy, nunca en crudo.
--   cache_modelo  · es la vuelta que hace que un pais nuevo cueste cada vez
--                   menos. Leerlo es leer todas las respuestas que se pagaron.
--                   Escribirlo es poder envenenar lo que la app cree saber.
--   off_producto  · Open Food Facts, licencia ODbL con share-alike. Se guarda
--                   aparte y no se reexpone tal cual, para no arrastrar la
--                   obligacion de compartir al resto del catalogo.
--   receta_vector · los embeddings permiten reconstruir el catalogo por
--                   similitud. Las busquedas semanticas las hace el servidor.

-- ── 5 · Las dos vistas ─────────────────────────────────────────────────────
-- ESTO ES LO QUE MAS FACIL SE OLVIDA. Una vista de Postgres se ejecuta, por
-- defecto, con los permisos de QUIEN LA CREO — aqui `postgres` — y no con los
-- de quien la consulta. Es decir: sin esta linea, las dos vistas de abajo se
-- saltan todo lo anterior y devuelven filas de tablas que acabamos de cerrar.
-- El candado estaria puesto y la ventana abierta al lado.
--
-- `security_invoker` invierte eso: la vista corre como quien pregunta, y sus
-- tablas base aplican RLS con normalidad. Existe desde PostgreSQL 15; aqui
-- corre 17.

alter view ingrediente_disponible set (security_invoker = on);
alter view receta_disponible      set (security_invoker = on);

-- ── 6 · Escritura ──────────────────────────────────────────────────────────
-- No hay ni una politica de insert, update o delete. Para nadie.
--
-- `service_role` no la necesita: en Supabase tiene BYPASSRLS, asi que se salta
-- todo esto por definicion. Es exactamente por eso que su clave no puede tocar
-- el telefono ni el bundle, y vive solo en el servidor (CLAUDE.md).
--
-- El dia que un cliente tenga que escribir algo, se añade una politica aqui,
-- con su nombre, y un test que compruebe que deniega lo que debe denegar.

-- ── 7 · Los verbos que RLS no alcanza ──────────────────────────────────
-- Ver la nota de la cabecera. `truncate` es DDL y se salta RLS entero; con el
-- `ALL` que Supabase concede por defecto, `anon` podia vaciar `precio` y
-- `cache_modelo` de un golpe. `trigger` y `references` van con el: el primero
-- deja colgar codigo de una tabla ajena, el segundo deja crear claves foraneas
-- que impiden borrar filas. Ninguno de los tres tiene nada que hacer en un
-- cliente. Lo que RLS si cubre — select, insert, update, delete — NO se toca
-- aqui, para que siga siendo RLS el unico que decide y los tests puedan
-- aislarlo.
revoke truncate, trigger, references on all tables in schema public
  from anon, authenticated;

-- Y lo mismo para las tablas que aun no existen. Sin esto, la proxima
-- migracion que cree una tabla la dejaria con TRUNCATE abierto otra vez, y el
-- agujero volveria por la puerta de atras. Hay ademas un test que cuenta las
-- tablas con TRUNCATE concedido y exige cero, para que una tabla creada de otra
-- forma tampoco se cuele.
alter default privileges in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;
