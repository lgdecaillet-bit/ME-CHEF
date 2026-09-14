/**
 * La galería · solo en desarrollo.
 *
 * Un inventario de lo que sale del sistema de diseño, para verlo en el iPhone
 * antes de que exista la pantalla que lo use: cada componente en cada uno de
 * sus estados, y debajo los colores, la escala de texto, los espacios y los
 * radios. Todo en claro, en oscuro y con la letra en tres tamaños. Es fea a
 * propósito: es un inventario, no una pantalla (fase 0, D6.5).
 *
 * Las muestras no hacen nada al tocarlas, salvo las que enseñan un cambio: el
 * chip que se elige, los campos, el stepper y los avisos.
 *
 * En producción no existe, por dos lados: `_layout.tsx` la saca de la
 * navegación con `Stack.Protected`, y si aun así se llegara aquí, no dibuja
 * nada. Hay un test para cada uno.
 */
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { t, type Clave } from '@/i18n';
import { Aviso, type TipoDeAviso } from '@/ui/Aviso';
import { Boton, type VarianteDeBoton } from '@/ui/Boton';
import { Campo } from '@/ui/Campo';
import { Cargando } from '@/ui/Cargando';
import { Chip } from '@/ui/Chip';
import { EstadoVacio } from '@/ui/EstadoVacio';
import { Etiqueta, type TipoDeEtiqueta } from '@/ui/Etiqueta';
import { Icono } from '@/ui/Icono';
import { Progreso } from '@/ui/Progreso';
import { Stepper } from '@/ui/Stepper';
import { Tarjeta } from '@/ui/Tarjeta';
import { ProveedorTema, useTema } from '@/ui/tema';
import { Texto, type VarianteDeTexto } from '@/ui/Texto';
import type { Colores, Esquema } from '@/ui/tokens';

type Opcion<V> = { id: string; valor: V; etiqueta: Clave; pista: Clave };

const MODOS = [
  {
    id: 'sistema',
    valor: null,
    etiqueta: 'galeria.modo.sistema',
    pista: 'galeria.modo.sistemaPista',
  },
  {
    id: 'claro',
    valor: 'claro',
    etiqueta: 'galeria.modo.claro',
    pista: 'galeria.modo.claroPista',
  },
  {
    id: 'oscuro',
    valor: 'oscuro',
    etiqueta: 'galeria.modo.oscuro',
    pista: 'galeria.modo.oscuroPista',
  },
] as const satisfies readonly Opcion<Esquema | null>[];

// Lo que React Native multiplica la letra en dos ajustes de iOS: el mayor antes
// de Accesibilidad (1,353) y el mayor de todos (3,571). Cada estilo lo recorta
// a su tope (`escalaMaxima` en tokens.ts). «Del iPhone» no simula nada: deja
// que mande el ajuste real.
const TAMANOS = [
  {
    id: 'iphone',
    valor: undefined,
    etiqueta: 'galeria.letra.iphone',
    pista: 'galeria.letra.iphonePista',
  },
  {
    id: 'grande',
    valor: 1.353,
    etiqueta: 'galeria.letra.grande',
    pista: 'galeria.letra.grandePista',
  },
  {
    id: 'maxima',
    valor: 3.571,
    etiqueta: 'galeria.letra.maxima',
    pista: 'galeria.letra.maximaPista',
  },
] as const satisfies readonly Opcion<number | undefined>[];

type Modo = (typeof MODOS)[number];
type Tamano = (typeof TAMANOS)[number];

const BOTONES = [
  { variante: 'primario', etiqueta: 'galeria.boton.primario' },
  { variante: 'secundario', etiqueta: 'galeria.boton.secundario' },
  { variante: 'terciario', etiqueta: 'galeria.boton.terciario' },
  { variante: 'destructivo', etiqueta: 'galeria.boton.destructivo' },
] as const satisfies readonly { variante: VarianteDeBoton; etiqueta: Clave }[];

const ETIQUETAS = [
  { tipo: 'seguro', texto: 'galeria.etiqueta.seguro' },
  { tipo: 'posible', texto: 'galeria.etiqueta.posible' },
  { tipo: 'supuesto', texto: 'galeria.etiqueta.supuesto' },
  { tipo: 'estimado', texto: 'galeria.etiqueta.estimado' },
  { tipo: 'real', texto: 'galeria.etiqueta.real' },
  { tipo: 'aviso', texto: 'galeria.etiqueta.aviso' },
] as const satisfies readonly { tipo: TipoDeEtiqueta; texto: Clave }[];

const AVISOS = [
  { tipo: 'info', texto: 'galeria.aviso.info' },
  { tipo: 'exito', texto: 'galeria.aviso.exito' },
  { tipo: 'error', texto: 'galeria.aviso.error' },
] as const satisfies readonly { tipo: TipoDeAviso; texto: Clave }[];

// Lo que hacen las muestras al tocarlas: nada. Enseñan cómo se ven.
const nada = () => undefined;

export default function Galeria() {
  const [modo, setModo] = useState<Modo>(MODOS[0]);
  const [tamano, setTamano] = useState<Tamano>(TAMANOS[0]);
  if (!__DEV__) return null;
  return (
    <ProveedorTema esquema={modo.valor ?? undefined} escalaDeLetra={tamano.valor}>
      <Muestrario
        modo={modo}
        alElegirModo={setModo}
        tamano={tamano}
        alElegirTamano={setTamano}
      />
    </ProveedorTema>
  );
}

type PropsMuestrario = {
  modo: Modo;
  alElegirModo: (modo: Modo) => void;
  tamano: Tamano;
  alElegirTamano: (tamano: Tamano) => void;
};

function Muestrario({ modo, alElegirModo, tamano, alElegirTamano }: PropsMuestrario) {
  const tema = useTema();
  return (
    <ScrollView
      testID="galeria"
      style={{ backgroundColor: tema.color.fondo }}
      contentContainerStyle={{ padding: tema.espacio.l, gap: tema.espacio.xl }}
    >
      <Texto color="texto2">{t('galeria.intro')}</Texto>

      <Seccion titulo={t('galeria.modo.titulo')}>
        <Fila>
          {MODOS.map((opcion) => (
            <Chip
              key={opcion.id}
              testID={`galeria.modo.${opcion.id}`}
              etiqueta={t(opcion.etiqueta)}
              pista={t(opcion.pista)}
              seleccionado={opcion.id === modo.id}
              onPress={() => alElegirModo(opcion)}
            />
          ))}
        </Fila>
      </Seccion>

      <Seccion titulo={t('galeria.letra.titulo')}>
        <Fila>
          {TAMANOS.map((opcion) => (
            <Chip
              key={opcion.id}
              testID={`galeria.letra.${opcion.id}`}
              etiqueta={t(opcion.etiqueta)}
              pista={t(opcion.pista)}
              seleccionado={opcion.id === tamano.id}
              onPress={() => alElegirTamano(opcion)}
            />
          ))}
        </Fila>
        <Texto variante="nota" color="texto2">
          {t('galeria.letra.aviso')}
        </Texto>
      </Seccion>

      <Botones />
      <Chips />
      <Tarjetas />
      <Etiquetas />
      <Campos />
      <Steppers />
      <Vacios />
      <Cargandos />
      <Avisos />
      <Iconos />
      <Progresos />
      <Paleta />
      <Textos />
      <Espacios />
      <Radios />
    </ScrollView>
  );
}

function Botones() {
  return (
    <Seccion titulo={t('galeria.boton.titulo')}>
      {BOTONES.map(({ variante, etiqueta }) => (
        <Boton
          key={variante}
          variante={variante}
          etiqueta={t(etiqueta)}
          pista={t('galeria.muestra')}
          icono={variante === 'primario' ? 'fork.knife' : undefined}
          onPress={nada}
          testID={`galeria.boton.${variante}`}
        />
      ))}
      <Boton
        etiqueta={t('galeria.boton.deshabilitado')}
        deshabilitado
        onPress={nada}
        testID="galeria.boton.deshabilitado"
      />
      <Boton
        etiqueta={t('galeria.boton.cargando')}
        cargando
        onPress={nada}
        testID="galeria.boton.cargando"
      />
    </Seccion>
  );
}

function Chips() {
  const [elegido, setElegido] = useState(true);
  return (
    <Seccion titulo={t('galeria.chip.titulo')}>
      <Fila>
        <Chip
          etiqueta={t('galeria.chip.normal')}
          onPress={nada}
          testID="galeria.chip.normal"
        />
        <Chip
          etiqueta={t('galeria.chip.seleccionado')}
          seleccionado={elegido}
          onPress={() => setElegido(!elegido)}
          testID="galeria.chip.seleccionado"
        />
        <Chip
          tipo="pregunta"
          etiqueta={t('galeria.chip.pregunta')}
          onPress={nada}
          testID="galeria.chip.pregunta"
        />
        <Chip
          tipo="supuesto"
          etiqueta={t('galeria.chip.supuesto')}
          onPress={nada}
          testID="galeria.chip.supuesto"
        />
        <Chip
          etiqueta={t('galeria.chip.deshabilitado')}
          deshabilitado
          onPress={nada}
          testID="galeria.chip.deshabilitado"
        />
      </Fila>
    </Seccion>
  );
}

function Tarjetas() {
  return (
    <Seccion titulo={t('galeria.tarjeta.titulo')}>
      <Tarjeta testID="galeria.tarjeta.normal">
        <Texto>{t('galeria.tarjeta.normal')}</Texto>
      </Tarjeta>
      <Tarjeta
        onPress={nada}
        pista={t('galeria.muestra')}
        testID="galeria.tarjeta.pulsable"
      >
        <Texto>{t('galeria.tarjeta.pulsable')}</Texto>
      </Tarjeta>
      <Tarjeta
        etiqueta={{ tipo: 'seguro', texto: t('galeria.etiqueta.seguro') }}
        testID="galeria.tarjeta.conEtiqueta"
      >
        <Texto>{t('galeria.tarjeta.conEtiqueta')}</Texto>
      </Tarjeta>
    </Seccion>
  );
}

function Etiquetas() {
  return (
    <Seccion titulo={t('galeria.etiqueta.titulo')}>
      <Fila>
        {ETIQUETAS.map(({ tipo, texto }) => (
          <Etiqueta
            key={tipo}
            tipo={tipo}
            texto={t(texto)}
            testID={`galeria.etiqueta.${tipo}`}
          />
        ))}
      </Fila>
    </Seccion>
  );
}

function Campos() {
  const [vacio, setVacio] = useState('');
  const [conValor, setConValor] = useState(t('galeria.campo.valor'));
  const [conError, setConError] = useState('');
  return (
    <Seccion titulo={t('galeria.campo.titulo')}>
      <Campo
        etiqueta={t('galeria.campo.etiqueta')}
        valor={vacio}
        alCambiar={setVacio}
        testID="galeria.campo.vacio"
      />
      <Campo
        etiqueta={t('galeria.campo.etiqueta')}
        valor={conValor}
        alCambiar={setConValor}
        testID="galeria.campo.conValor"
      />
      {/* El error se va en cuanto se escribe algo, como en una pantalla de verdad. */}
      <Campo
        etiqueta={t('galeria.campo.etiqueta')}
        valor={conError}
        alCambiar={setConError}
        error={conError.length === 0 ? t('galeria.campo.error') : undefined}
        testID="galeria.campo.error"
      />
      <Campo
        etiqueta={t('galeria.campo.hogar')}
        valor={t('galeria.campo.hogarValor')}
        alCambiar={nada}
        deshabilitado
        testID="galeria.campo.deshabilitado"
      />
    </Seccion>
  );
}

function Steppers() {
  const [porciones, setPorciones] = useState(2);
  const etiqueta = t('galeria.stepper.etiqueta');
  return (
    <Seccion titulo={t('galeria.stepper.titulo')}>
      <Stepper
        etiqueta={etiqueta}
        valor={porciones}
        alCambiar={setPorciones}
        minimo={0.5}
        maximo={8}
        paso={0.5}
        testID="galeria.stepper.normal"
      />
      <Stepper
        etiqueta={etiqueta}
        valor={1}
        alCambiar={nada}
        minimo={1}
        maximo={8}
        testID="galeria.stepper.minimo"
      />
      <Stepper
        etiqueta={etiqueta}
        valor={8}
        alCambiar={nada}
        minimo={1}
        maximo={8}
        testID="galeria.stepper.maximo"
      />
    </Seccion>
  );
}

function Vacios() {
  return (
    <Seccion titulo={t('galeria.vacio.titulo')}>
      <Tarjeta>
        <EstadoVacio
          icono="refrigerator"
          titulo={t('galeria.vacio.conAccionTitulo')}
          texto={t('galeria.vacio.conAccionTexto')}
          accion={{ etiqueta: t('galeria.vacio.accion'), onPress: nada }}
          testID="galeria.vacio.conAccion"
        />
      </Tarjeta>
      <Tarjeta>
        <EstadoVacio
          icono="book"
          titulo={t('galeria.vacio.sinAccionTitulo')}
          texto={t('galeria.vacio.sinAccionTexto')}
          testID="galeria.vacio.sinAccion"
        />
      </Tarjeta>
    </Seccion>
  );
}

function Cargandos() {
  const descripcion = t('galeria.cargando.descripcion');
  return (
    <Seccion titulo={t('galeria.cargando.titulo')}>
      <Cargando descripcion={descripcion} testID="galeria.cargando.linea" />
      <Cargando
        modo="pantalla"
        descripcion={descripcion}
        testID="galeria.cargando.pantalla"
      />
    </Seccion>
  );
}

// Los avisos se van solos a los 3 s: el botón los vuelve a sacar.
function Avisos() {
  const [visibles, setVisibles] = useState<TipoDeAviso[]>([]);
  return (
    <Seccion titulo={t('galeria.aviso.titulo')}>
      <Boton
        variante="secundario"
        etiqueta={t('galeria.aviso.mostrar')}
        onPress={() => setVisibles(AVISOS.map(({ tipo }) => tipo))}
        testID="galeria.aviso.mostrar"
      />
      {AVISOS.filter(({ tipo }) => visibles.includes(tipo)).map(({ tipo, texto }) => (
        <Aviso
          key={tipo}
          tipo={tipo}
          texto={t(texto)}
          alCerrar={() => setVisibles((antes) => antes.filter((otro) => otro !== tipo))}
          testID={`galeria.aviso.${tipo}`}
        />
      ))}
    </Seccion>
  );
}

function Iconos() {
  const tema = useTema();
  const tamanos = Object.keys(tema.icono.tamano) as (keyof typeof tema.icono.tamano)[];
  return (
    <Seccion titulo={t('galeria.icono.titulo')}>
      <Fila>
        {tamanos.map((tamano) => (
          <View key={tamano} style={[estilos.centrado, { gap: tema.espacio.xs }]}>
            <Icono
              nombre="fork.knife"
              tamano={tamano}
              testID={`galeria.icono.${tamano}`}
            />
            <Texto variante="nota" color="texto2">
              {t('galeria.medida', { nombre: tamano, valor: tema.icono.tamano[tamano] })}
            </Texto>
          </View>
        ))}
        <Icono
          nombre="refrigerator"
          tamano="l"
          color="acento"
          descripcion={t('galeria.icono.nevera')}
          testID="galeria.icono.conDescripcion"
        />
      </Fila>
    </Seccion>
  );
}

function Progresos() {
  return (
    <Seccion titulo={t('galeria.progreso.titulo')}>
      <Progreso actual={1} total={2} testID="galeria.progreso.mitad" />
      <Progreso actual={2} total={2} testID="galeria.progreso.completo" />
    </Seccion>
  );
}

function Paleta() {
  const tema = useTema();
  const nombres = Object.keys(tema.color) as (keyof Colores)[];
  return (
    <Seccion titulo={t('galeria.colores.titulo')}>
      {nombres.map((nombre) => (
        <View
          key={nombre}
          testID={`galeria.color.${nombre}`}
          style={[estilos.fila, { gap: tema.espacio.m }]}
        >
          <View
            style={[
              estilos.borde,
              {
                width: tema.espacio.xxl,
                height: tema.espacio.xxl,
                borderRadius: tema.radio.s,
                borderColor: tema.color.borde,
                backgroundColor: tema.color[nombre],
              },
            ]}
          />
          <Texto>{nombre}</Texto>
          <Texto variante="nota" color="texto2">
            {tema.color[nombre]}
          </Texto>
        </View>
      ))}
    </Seccion>
  );
}

function Textos() {
  const tema = useTema();
  const variantes = Object.keys(tema.tipografia) as VarianteDeTexto[];
  return (
    <Seccion titulo={t('galeria.texto.titulo')}>
      {variantes.map((variante) => (
        <View key={variante}>
          <Texto variante="nota" color="texto3">
            {variante}
          </Texto>
          <Texto variante={variante} testID={`galeria.texto.${variante}`}>
            {t('galeria.texto.muestra', { n: 7 })}
          </Texto>
        </View>
      ))}
    </Seccion>
  );
}

function Espacios() {
  const tema = useTema();
  return (
    <Seccion titulo={t('galeria.espacio.titulo')}>
      {Object.entries(tema.espacio).map(([nombre, valor]) => (
        <View key={nombre} style={[estilos.fila, { gap: tema.espacio.m }]}>
          <View
            style={{
              width: valor,
              height: tema.espacio.s,
              backgroundColor: tema.color.acento,
            }}
          />
          <Texto variante="nota" color="texto2">
            {t('galeria.medida', { nombre, valor })}
          </Texto>
        </View>
      ))}
    </Seccion>
  );
}

function Radios() {
  const tema = useTema();
  return (
    <Seccion titulo={t('galeria.radio.titulo')}>
      <Fila>
        {Object.entries(tema.radio).map(([nombre, valor]) => (
          <View key={nombre} style={[estilos.centrado, { gap: tema.espacio.xs }]}>
            <View
              style={[
                estilos.borde,
                {
                  width: tema.espacio.xxxl,
                  height: tema.espacio.xxxl,
                  borderRadius: valor,
                  borderColor: tema.color.borde,
                  backgroundColor: tema.color.superficie,
                },
              ]}
            />
            <Texto variante="nota" color="texto2">
              {t('galeria.medida', { nombre, valor })}
            </Texto>
          </View>
        ))}
      </Fila>
    </Seccion>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  const tema = useTema();
  return (
    <View style={{ gap: tema.espacio.s }}>
      <Texto variante="titulo3">{titulo}</Texto>
      {children}
    </View>
  );
}

function Fila({ children }: { children: ReactNode }) {
  const tema = useTema();
  return <View style={[estilos.fila, { gap: tema.espacio.s }]}>{children}</View>;
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  centrado: { alignItems: 'center' },
  borde: { borderWidth: 1 },
});
