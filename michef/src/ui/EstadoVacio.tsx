/**
 * EstadoVacio · lo que se ve cuando no hay nada que enseñar. Dice la verdad y
 * ofrece el siguiente paso (diseno.md, principio 2): nunca relleno, nunca
 * recetas de mentira.
 *
 * Estados: con acción y sin acción. Un icono, un título, un texto y, si hay algo
 * que hacer, un botón. El icono es adorno: el título ya lo dice.
 */
import { View } from 'react-native';

import { Boton } from './Boton';
import { Icono, type NombreDeIcono } from './Icono';
import { useTema } from './tema';
import { Texto } from './Texto';

type Props = {
  icono: NombreDeIcono;
  /** Qué pasa, en pocas palabras. Viene de `t()`. */
  titulo: string;
  /** Por qué, y qué se puede hacer. Viene de `t()`. */
  texto: string;
  accion?: { etiqueta: string; onPress: () => void; pista?: string };
  testID?: string;
};

export function EstadoVacio({ icono, titulo, texto, accion, testID }: Props) {
  const tema = useTema();
  return (
    <View
      testID={testID}
      style={{ alignItems: 'center', gap: tema.espacio.m, padding: tema.espacio.xl }}
    >
      <Icono
        nombre={icono}
        tamano="xl"
        color="texto3"
        testID={testID && `${testID}.icono`}
      />
      <Texto variante="titulo3" centrado>
        {titulo}
      </Texto>
      <Texto color="texto2" centrado>
        {texto}
      </Texto>
      {accion != null ? (
        <Boton
          etiqueta={accion.etiqueta}
          pista={accion.pista}
          onPress={accion.onPress}
          testID={testID && `${testID}.accion`}
        />
      ) : null}
    </View>
  );
}
