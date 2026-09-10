/**
 * La galería · solo en desarrollo.
 *
 * Un inventario de lo que sale del sistema de diseño, para verlo en el iPhone
 * antes de que exista la pantalla que lo use: los colores, la escala de texto,
 * los espacios y los radios, en claro, en oscuro y con la letra en tres
 * tamaños. Es fea a propósito: es un inventario, no una pantalla (fase 0,
 * D6.5). Los componentes entran aquí en D6.5b, cada uno en todos sus estados.
 *
 * En producción no existe, por dos lados: `_layout.tsx` la saca de la
 * navegación con `Stack.Protected`, y si aun así se llegara aquí, no dibuja
 * nada. Hay un test para cada uno.
 */
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { t, type Clave } from '@/i18n';
import { BotonDeDesarrollo } from '@/ui/BotonDeDesarrollo';
import { ProveedorTema, useTema } from '@/ui/tema';
import { Texto, type VarianteDeTexto } from '@/ui/Texto';
import type { Colores, Esquema } from '@/ui/tokens';

type Opcion<V> = { id: string; valor: V; etiqueta: Clave; descripcion: Clave };

const MODOS = [
  {
    id: 'sistema',
    valor: null,
    etiqueta: 'galeria.modo.sistema',
    descripcion: 'galeria.modo.sistemaDescripcion',
  },
  {
    id: 'claro',
    valor: 'claro',
    etiqueta: 'galeria.modo.claro',
    descripcion: 'galeria.modo.claroDescripcion',
  },
  {
    id: 'oscuro',
    valor: 'oscuro',
    etiqueta: 'galeria.modo.oscuro',
    descripcion: 'galeria.modo.oscuroDescripcion',
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
    descripcion: 'galeria.letra.iphoneDescripcion',
  },
  {
    id: 'grande',
    valor: 1.353,
    etiqueta: 'galeria.letra.grande',
    descripcion: 'galeria.letra.grandeDescripcion',
  },
  {
    id: 'maxima',
    valor: 3.571,
    etiqueta: 'galeria.letra.maxima',
    descripcion: 'galeria.letra.maximaDescripcion',
  },
] as const satisfies readonly Opcion<number | undefined>[];

type Modo = (typeof MODOS)[number];
type Tamano = (typeof TAMANOS)[number];

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
  const nombresDeColor = Object.keys(tema.color) as (keyof Colores)[];
  const variantes = Object.keys(tema.tipografia) as VarianteDeTexto[];
  return (
    <ScrollView
      testID="galeria"
      style={{ backgroundColor: tema.color.fondo }}
      contentContainerStyle={{ padding: tema.espacio.l, gap: tema.espacio.xl }}
    >
      <Texto color="texto2">{t('galeria.intro')}</Texto>

      <Seccion titulo={t('galeria.modo.titulo')}>
        <View style={[estilos.fila, { gap: tema.espacio.s }]}>
          {MODOS.map((opcion) => (
            <BotonDeDesarrollo
              key={opcion.id}
              testID={`galeria.modo.${opcion.id}`}
              etiqueta={t(opcion.etiqueta)}
              descripcion={t(opcion.descripcion)}
              seleccionado={opcion.id === modo.id}
              onPress={() => alElegirModo(opcion)}
            />
          ))}
        </View>
      </Seccion>

      <Seccion titulo={t('galeria.letra.titulo')}>
        <View style={[estilos.fila, { gap: tema.espacio.s }]}>
          {TAMANOS.map((opcion) => (
            <BotonDeDesarrollo
              key={opcion.id}
              testID={`galeria.letra.${opcion.id}`}
              etiqueta={t(opcion.etiqueta)}
              descripcion={t(opcion.descripcion)}
              seleccionado={opcion.id === tamano.id}
              onPress={() => alElegirTamano(opcion)}
            />
          ))}
        </View>
        <Texto variante="nota" color="texto2">
          {t('galeria.letra.aviso')}
        </Texto>
      </Seccion>

      <Seccion titulo={t('galeria.colores.titulo')}>
        {nombresDeColor.map((nombre) => (
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

      <Seccion titulo={t('galeria.radio.titulo')}>
        <View style={[estilos.fila, { gap: tema.espacio.l }]}>
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
        </View>
      </Seccion>
    </ScrollView>
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

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  centrado: { alignItems: 'center' },
  borde: { borderWidth: 1 },
});
