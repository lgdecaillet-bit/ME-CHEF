import * as Sentry from '@sentry/react-native';
import type { ErrorEvent } from '@sentry/react-native';
import fc from 'fast-check';

import { iniciarSentry, limpiarEvento, limpiarPII } from '../sentry';

jest.mock('@sentry/react-native', () => ({ init: jest.fn() }));

const Q = '[quitado]';

function evento(parcial: Partial<ErrorEvent>): ErrorEvent {
  return { type: undefined, ...parcial } as ErrorEvent;
}

describe('limpiarPII · valores', () => {
  // Cada caso dice qué trozo NO puede quedar a la vista después de limpiar.
  it.each([
    ['un correo', 'escribió ana.maria@correo.com.co ayer', 'ana.maria'],
    // Regresión: el test de propiedad encontró que el apóstrofo cortaba el
    // correo y dejaba la primera parte a la vista.
    ['un correo con apóstrofo', "de o'brien@correo.com", "o'"],
    // Regresiones del revisor en D6: la expresión solo conocía letras sin
    // tilde, y en Colombia y en Suiza los correos las llevan.
    ['un correo con tilde antes de la @', 'de josé@gmail.com', 'josé'],
    ['un correo con tildes en el nombre', 'de maría.lópez@gmail.com', 'maría'],
    ['un correo con diéresis en el dominio', 'de ana@müller.ch', 'müller'],
    ['un móvil de Colombia', 'llamar al +57 310 555 1234', '555'],
    ['un móvil de Suiza', 'mi número: +41 79 123 45 67', '123 45'],
    ['un teléfono sin prefijo', 'tel 3105551234', '3105551234'],
    // Regresiones del revisor: las dos formas más habituales de escribir un
    // teléfono en Suiza y en Colombia pasaban enteras.
    ['un teléfono suizo con barra', 'llamar al 079/123 45 67', '079/123'],
    ['un teléfono colombiano con paréntesis', 'al (300) 123 4567', '123 4567'],
    // JWT inventado y de pinta obviamente falsa, a propósito. Uno con pinta real
    // lo marca gitleaks (regla `jwt`) aunque sea inventado, y la salida no es
    // apagar la regla ni añadirle una excepción (#55): es no escribir algo que
    // parezca un secreto. Mismo criterio que en D4.
    [
      'un JWT',
      'token eyJaaaaaaaaaaaaaaaaaaaaa.eyJbbbbbbbbbbbbbbbbbbbbb.cccccccccccccccc',
      'eyJaaaa',
    ],
  ])('quita %s de un texto', (_, texto, prohibido) => {
    const limpio = limpiarPII({ nota: texto }).nota;
    expect(limpio).toContain(Q);
    expect(limpio).not.toContain(prohibido);
  });

  it('deja en paz los números cortos, que no son personales', () => {
    const texto = 'iOS 18.2, receta 42, 2026, 350 g, 4 porciones';
    expect(limpiarPII({ t: texto }).t).toBe(texto);
  });

  it('entra en objetos y listas anidados', () => {
    const limpio = limpiarPII({ a: [{ b: { c: 'ana@x.com' } }] });
    expect(limpio.a[0]?.b.c).toBe(Q);
  });

  it('no modifica el objeto original', () => {
    const original = { nota: 'ana@x.com', email: 'ana@x.com' };
    limpiarPII(original);
    expect(original).toEqual({ nota: 'ana@x.com', email: 'ana@x.com' });
  });

  it('deja pasar tal cual lo que no es texto ni objeto', () => {
    expect(limpiarPII({ n: 5, b: true, z: null, u: undefined })).toEqual({
      n: 5,
      b: true,
      z: null,
      u: undefined,
    });
  });

  it('aguanta un ciclo sin colgarse', () => {
    const a: Record<string, unknown> = { nota: 'ana@x.com' };
    a.yo = a;
    const limpio = limpiarPII(a);
    expect(limpio.nota).toBe(Q);
    expect(limpio.yo).toBe(Q);
  });

  it('corta lo demasiado profundo en vez de recorrerlo', () => {
    let hondo: Record<string, unknown> = { fondo: 'algo' };
    for (let i = 0; i < 20; i++) hondo = { dentro: hondo };
    expect(JSON.stringify(limpiarPII(hondo))).toContain(Q);
    expect(JSON.stringify(limpiarPII(hondo))).not.toContain('algo');
  });

  it('propiedad: ningún correo sobrevive, esté donde esté', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string(),
        fc.string(),
        (correo, antes, despues) => {
          const sucio = { extra: { lista: [`${antes} ${correo} ${despues}`] } };
          expect(JSON.stringify(limpiarPII(sucio))).not.toContain(correo);
        }
      )
    );
  });
});

describe('limpiarPII · nombres de campo', () => {
  it.each([
    'email',
    'correo',
    'telefono',
    'teléfono',
    'phone',
    'nombre',
    'name',
    'direccion',
    'address',
    'ip_address',
    'password',
    'token',
    'authorization',
    'cookie',
    'latitude',
    'lng',
  ])('quita el campo «%s» aunque su valor parezca inocente', (clave) => {
    expect(limpiarPII({ [clave]: 'x' })[clave]).toBe(Q);
  });

  // Regresión del revisor en D6: solo se reconocía el nombre exacto, así que
  // `log.error('x', e, { first_name: 'Ana' })` mandaba «Ana» a Sentry.
  it.each([
    'userName',
    'username',
    'user_email',
    'emailAddress',
    'first_name',
    'lastName',
    'full_name',
    'displayName',
    'phoneNumber',
    'nombreCompleto',
    'nombre_usuario',
    'direccionEntrega',
    'accessToken',
  ])('quita el campo compuesto «%s»', (clave) => {
    expect(limpiarPII({ [clave]: 'x' })[clave]).toBe(Q);
  });

  it('no quita campos que solo contienen la palabra dentro de otra', () => {
    // `filename` contiene «name», pero es justo lo que hace útil un aviso.
    expect(
      limpiarPII({
        filename: 'app.tsx',
        nameless: 'ok',
        hostname: 'h',
        typeName: 'Error',
        zip: 1,
      })
    ).toEqual({
      filename: 'app.tsx',
      nameless: 'ok',
      hostname: 'h',
      typeName: 'Error',
      zip: 1,
    });
  });
});

describe('limpiarEvento', () => {
  it('borra el usuario entero y el nombre del servidor', () => {
    const limpio = limpiarEvento(
      evento({ user: { id: '1', email: 'ana@x.com' }, server_name: 'MacBook-de-Ana' })
    );
    expect(limpio.user).toBeUndefined();
    expect(limpio.server_name).toBeUndefined();
  });

  it('borra el nombre del dispositivo («iPhone de Luciano») y deja el modelo', () => {
    const limpio = limpiarEvento(
      evento({ contexts: { device: { name: 'iPhone de Luciano', model: 'iPhone16,1' } } })
    );
    expect(limpio.contexts?.device?.name).toBeUndefined();
    expect(limpio.contexts?.device?.model).toBe('iPhone16,1');
  });

  it('en los contextos del sistema deja «os.name», que dice «iOS» y no es de nadie', () => {
    // Regresión del revisor: la regla de `name` se aplicaba a todos los
    // contextos y el aviso llegaba sin saber en qué sistema pasó.
    const limpio = limpiarEvento(
      evento({
        contexts: { os: { name: 'iOS', version: '18.2' }, app: { app_name: 'ME CHEF' } },
      })
    );
    expect(limpio.contexts?.os).toEqual({ name: 'iOS', version: '18.2' });
    expect(limpio.contexts?.app).toEqual({ app_name: 'ME CHEF' });
  });

  it('pero en los contextos también quita lo que sí es personal', () => {
    const limpio = limpiarEvento(
      evento({ contexts: { pedido: { email: 'ana@x.com', userName: 'ana' } } })
    );
    expect(limpio.contexts?.pedido).toEqual({ email: Q, userName: Q });
  });

  it('limpia los mensajes con parámetros (logentry)', () => {
    const limpio = limpiarEvento(
      evento({ logentry: { message: 'escribe a %s', params: ['ana@x.com'] } })
    );
    expect(JSON.stringify(limpio)).not.toContain('ana@x.com');
  });

  it('limpia el mensaje, los extras, las etiquetas y las migas', () => {
    const limpio = limpiarEvento(
      evento({
        message: 'no encuentro a ana@x.com',
        extra: { email: 'ana@x.com' },
        tags: { quien: 'ana@x.com' },
        breadcrumbs: [{ message: 'llamó al +57 310 555 1234' }],
      })
    );
    expect(JSON.stringify(limpio)).not.toContain('ana@x.com');
    expect(JSON.stringify(limpio)).not.toContain('555 1234');
  });

  it('limpia el texto del error pero NO toca su pila de llamadas', () => {
    // Un nombre de archivo con muchas cifras parece un teléfono. Si el filtro
    // pasara por la pila, Sentry ya no podría decir archivo y línea.
    const archivo = 'app:///bundle-1757500000123.js';
    const limpio = limpiarEvento(
      evento({
        exception: {
          values: [
            {
              type: 'Error',
              value: 'fallo para ana@x.com',
              stacktrace: { frames: [{ filename: archivo, lineno: 42, colno: 7 }] },
            },
          ],
        },
      })
    );
    const excepcion = limpio.exception?.values?.[0];
    expect(excepcion?.value).toBe(`fallo para ${Q}`);
    expect(excepcion?.stacktrace?.frames?.[0]).toEqual({
      filename: archivo,
      lineno: 42,
      colno: 7,
    });
  });

  it('un evento sin nada que limpiar sale intacto en lo que importa', () => {
    const limpio = limpiarEvento(evento({ message: undefined, level: 'error' }));
    expect(limpio.level).toBe('error');
    expect(limpio.message).toBeUndefined();
    expect(limpio.exception).toBeUndefined();
  });

  it('una excepción sin texto sigue sin texto', () => {
    const limpio = limpiarEvento(evento({ exception: { values: [{ type: 'Error' }] } }));
    expect(limpio.exception?.values?.[0]?.value).toBeUndefined();
  });
});

describe('iniciarSentry', () => {
  it('sin DSN no inicia nada y lo dice', () => {
    // El aviso de «Sentry está apagado» se prueba abajo; aquí solo haría ruido.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(iniciarSentry(undefined)).toBe(false);
    expect(iniciarSentry('')).toBe(false);
    expect(iniciarSentry('   ')).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  // Regresión de la verificación de D6 en el iPhone: el DSN estaba vacío en el
  // .env, Sentry no se inició, y nada lo dijo. El aviso no llegó a sentry.io y
  // costó averiguar por qué. Un servicio que se apaga solo tiene que decirlo.
  it('sin DSN, en desarrollo lo dice en la terminal, nombrando la variable', () => {
    const aviso = jest.spyOn(console, 'warn').mockImplementation(() => {});
    iniciarSentry(undefined);
    expect(aviso).toHaveBeenCalledWith(
      expect.stringContaining('EXPO_PUBLIC_SENTRY_DSN'),
      expect.anything()
    );
  });

  it('sin DSN, en producción no ensucia la consola', () => {
    const g = globalThis as unknown as { __DEV__: boolean };
    const antes = g.__DEV__;
    g.__DEV__ = false;
    const aviso = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      iniciarSentry(undefined);
      expect(aviso).not.toHaveBeenCalled();
    } finally {
      g.__DEV__ = antes;
    }
  });

  it('recorta el DSN, como hace env.ts: pegado con espacios, Sentry lo descartaría callado', () => {
    iniciarSentry('  https://abc@o1.ingest.de.sentry.io/1\n');
    expect((Sentry.init as jest.Mock).mock.calls[0][0].dsn).toBe(
      'https://abc@o1.ingest.de.sentry.io/1'
    );
  });

  it('con DSN inicia con la privacidad cerrada', () => {
    expect(iniciarSentry('https://abc@o1.ingest.de.sentry.io/1')).toBe(true);
    const opciones = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(opciones).toMatchObject({
      dsn: 'https://abc@o1.ingest.de.sentry.io/1',
      environment: 'desarrollo',
      sendDefaultPii: false,
      attachScreenshot: false,
      attachViewHierarchy: false,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      tracesSampleRate: 0,
    });
    expect(opciones.beforeSend).toBe(limpiarEvento);
  });

  // En la verificación de D6 en el iPhone se encendió `debug: true` para ver qué
  // hacía Sentry. Ese modo imprime cada evento en la consola, también en la app
  // publicada. Este test impide que un diagnóstico temporal llegue a commitearse.
  it('no inicia en modo diagnóstico', () => {
    iniciarSentry('https://abc@o1.ingest.de.sentry.io/1');
    expect((Sentry.init as jest.Mock).mock.calls[0][0]).not.toHaveProperty('debug');
  });

  it('en producción se marca como producción', () => {
    const g = globalThis as unknown as { __DEV__: boolean };
    const antes = g.__DEV__;
    g.__DEV__ = false;
    try {
      iniciarSentry('https://abc@o1.ingest.de.sentry.io/1');
      expect((Sentry.init as jest.Mock).mock.calls[0][0].environment).toBe('produccion');
    } finally {
      g.__DEV__ = antes;
    }
  });

  it('las migas también pasan por el filtro', () => {
    iniciarSentry('https://abc@o1.ingest.de.sentry.io/1');
    const { beforeBreadcrumb } = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(beforeBreadcrumb({ message: 'ana@x.com', data: { email: 'x' } })).toEqual({
      message: Q,
      data: { email: Q },
    });
  });
});

// ── Segunda revisión de D6 ───────────────────────────────────────────────────

describe('limpiarPII · lo que CLAUDE.md prohíbe sacar: el cuerpo y los comensales', () => {
  // «El objetivo físico y los comensales nunca salen» (prohibición dura).
  it.each([
    'comensal',
    'comensales',
    'nombreComensal',
    'nombre_comensal',
    'peso',
    'altura',
    'estatura',
    'edad',
    'sexo',
    'genero',
    'objetivo',
    'fechaNacimiento',
    'fecha_nacimiento',
    'fechanacimiento',
    'alergias',
    'weight',
    'age',
    'gender',
    'birthdate',
  ])('quita el campo «%s»', (clave) => {
    expect(limpiarPII({ [clave]: 'x' })[clave]).toBe(Q);
  });

  it.each(['calle', 'domicilio', 'codigoPostal', 'codigopostal', 'street'])(
    'quita la dirección postal «%s»',
    (clave) => {
      expect(limpiarPII({ [clave]: 'x' })[clave]).toBe(Q);
    }
  );

  it('no confunde los pesos del precio con el peso del cuerpo', () => {
    expect(limpiarPII({ precioPesos: 12000, pesos: 5 })).toEqual({
      precioPesos: 12000,
      pesos: 5,
    });
  });
});

describe('limpiarPII · nombres pegados y siglas', () => {
  it.each([
    'firstname',
    'FIRSTNAME',
    'fullname',
    'displayname',
    'nombrecompleto',
    'useremail',
    'phonenumber',
    'accesstoken',
    'IPAddress',
    'HTTPToken',
    // Solo se atrapa si la sigla se separa de la palabra que la sigue: «addr»
    // no es personal, «ip» sí. Protege el segundo corte de `palabras()`.
    'IPAddr',
  ])('quita «%s»', (clave) => {
    expect(limpiarPII({ [clave]: 'x' })[clave]).toBe(Q);
  });

  it('pero no lo técnico que solo se parece', () => {
    const tecnico = {
      tipo: 'x',
      ship: 1,
      eventName: 'tap',
      screenName: 'Home',
      pesos: 3,
    };
    expect(limpiarPII(tecnico)).toEqual(tecnico);
  });
});

describe('limpiarEvento · contextos del SDK y contextos propios', () => {
  it('en un contexto propio (setContext) «nombre» sí se quita', () => {
    const limpio = limpiarEvento(
      evento({
        contexts: { hogar: { nombre: 'Ana', miembros: 3 }, comensal: { name: 'Ana' } },
      })
    );
    expect(limpio.contexts?.hogar).toEqual({ nombre: Q, miembros: 3 });
    expect(limpio.contexts?.comensal).toBe(Q);
  });

  it('en los contextos del SDK sobrevive lo técnico', () => {
    const limpio = limpiarEvento(
      evento({
        contexts: {
          device: {
            screen_height_pixels: 2556,
            model: 'iPhone16,1',
            name: 'iPhone de Luciano',
          },
          os: { name: 'iOS' },
          runtime: { name: 'Hermes' },
          culture: { display_name: 'Español (Suiza)' },
          ota_updates: { channel: 'preview' },
        },
      })
    );
    expect(limpio.contexts?.device).toEqual({
      screen_height_pixels: 2556,
      model: 'iPhone16,1',
      name: undefined,
    });
    expect(limpio.contexts?.os?.name).toBe('iOS');
    expect(limpio.contexts?.runtime?.name).toBe('Hermes');
    expect(limpio.contexts?.culture?.display_name).toBe('Español (Suiza)');
    expect(limpio.contexts?.ota_updates).toEqual({ channel: 'preview' });
  });

  it('pero incluso en un contexto del SDK se quita lo que siempre es personal', () => {
    const limpio = limpiarEvento(
      evento({ contexts: { device: { email: 'ana@x.com' } } })
    );
    expect(limpio.contexts?.device?.email).toBe(Q);
  });
});

describe('limpiarPII · textos largos', () => {
  // Un texto enorme en un error suele ser un JSON o una imagen en base64, y una
  // foto no puede salir del teléfono (CLAUDE.md). Además, revisarlo entero
  // congelaría la app.
  it('un texto de más de 2.000 caracteres se quita entero, sin revisarlo', () => {
    const foto = 'iVBORw0KGgo' + 'A'.repeat(200_000);
    const limpio = limpiarPII({ t: foto }).t;
    expect(limpio).not.toContain('iVBORw0KGgo');
    expect(limpio).toBe('[quitado: texto de 200011 caracteres]');
  });

  it('uno de 2.000 exactos se sigue revisando, y conserva lo que no es personal', () => {
    const texto = 'ana@x.com ' + 'b'.repeat(1990);
    expect(texto).toHaveLength(2000);
    const limpio = limpiarPII({ t: texto }).t;
    expect(limpio.startsWith(`${Q} `)).toBe(true);
    expect(limpio).toContain('bbbb');
  });

  it('el mensaje y el texto de la excepción también tienen el tope', () => {
    const largo = 'x'.repeat(5000);
    const limpio = limpiarEvento(
      evento({ message: largo, exception: { values: [{ type: 'Error', value: largo }] } })
    );
    expect(limpio.message).toBe('[quitado: texto de 5000 caracteres]');
    expect(limpio.exception?.values?.[0]?.value).toBe(
      '[quitado: texto de 5000 caracteres]'
    );
  });
});

// ── Tercera revisión de D6 ───────────────────────────────────────────────────

describe('limpiarEvento · un contexto que se parece a los del SDK no es del SDK', () => {
  // Regresión: `startsWith('expo')` dejaba en modo relajado cualquier contexto
  // propio que empezara así, y el SDK no pone ninguno con ese nombre.
  it.each(['exportacion', 'expo', 'osito', 'devices'])(
    'el contexto «%s» se limpia en estricto',
    (clave) => {
      const limpio = limpiarEvento(
        evento({ contexts: { [clave]: { nombre: 'Ana', edad: 30 } } })
      );
      expect(limpio.contexts?.[clave]).toEqual({ nombre: Q, edad: Q });
    }
  );

  it('y si el propio nombre del contexto es personal, se quita entero', () => {
    const limpio = limpiarEvento(evento({ contexts: { expoComensal: { edad: 30 } } }));
    expect(limpio.contexts?.expoComensal).toBe(Q);
  });
});

describe('limpiarPII · las restricciones del comensal', () => {
  // Una restricción puede ser una alergia: un dato de salud. Así se llama la
  // tabla en src/db/schema.ts, y la palabra no estaba en la lista.
  it.each(['restriccion', 'restricciones', 'restriccionComensal'])(
    'quita «%s»',
    (clave) => {
      const limpio = limpiarPII({ [clave]: { tipo: 'alergia', valor: 'maní' } });
      expect(limpio[clave]).toBe(Q);
    }
  );
});

describe('limpiarPII · «calle» solo como palabra entera', () => {
  // Regresión: por la regla de principio de palabra, `caller` y `callee`
  // —palabras técnicas en inglés— caían por empezar por «calle».
  it('quita la calle, pero no a quien llama', () => {
    expect(
      limpiarPII({
        calle: 'x',
        nombreCalle: 'x',
        caller: 'a',
        callee: 'b',
        callerName: 'c',
      })
    ).toEqual({ calle: Q, nombreCalle: Q, caller: 'a', callee: 'b', callerName: 'c' });
  });
});
