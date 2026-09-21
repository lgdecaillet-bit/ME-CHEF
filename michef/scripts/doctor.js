#!/usr/bin/env node
/**
 * Corre `expo-doctor` y perdona UNA cosa: que un paquete vaya atrasado solo en
 * el tercer número (57.0.23 → 57.0.24).
 *
 * Por qué existe (decisión #63): Expo publica un parche del SDK cada pocos
 * días y `expo-doctor` exige siempre el último. Cualquier PR que espere más de
 * tres o cuatro días se pone rojo solo, sin que cambie nada de lo nuestro.
 * Pasó cuatro veces en dos semanas (PRs #18, #23 y dos veces en el #24).
 * `expo-doctor` no tiene término medio: o comprueba todo o se apaga entera la
 * comprobación de versiones (`EXPO_DOCTOR_SKIP_DEPENDENCY_VERSION_CHECK`), y
 * apagarla dejaría pasar un paquete de otro SDK, que es justo lo que hay que
 * cazar.
 *
 * Lo que hace: corre `expo-doctor`, enseña su salida tal cual y decide con
 * `veredicto()`. Se perdona solo si el ÚNICO check que falló es el de versiones
 * y su ÚNICA sección es «Patch version mismatches». Cualquier otra cosa —una
 * sección «Major», «Minor» u «Other/prerelease», otro check caído, una salida
 * que no se entiende— falla igual que antes. En duda, rojo.
 *
 * Lo que NO perdona, a propósito: que se acumulen parches para siempre. Los
 * parches se ponen al día en un PR aparte cada dos semanas (`npx expo install
 * --fix`), no cuando nos ponen rojo. Esa rutina está en el tablero.
 *
 * La versión de `expo-doctor` va fijada: este guion lee su salida, y una
 * versión nueva podría cambiar el formato. Cuando se suba, se vuelven a
 * capturar los fixtures del test.
 */
const { execSync } = require('node:child_process');
const path = require('node:path');

const VERSION_DE_DOCTOR = '1.20.4';
const raiz = path.resolve(__dirname, '..');

const CHECK_DE_VERSIONES =
  'Check that packages match versions required by installed Expo SDK';
const SECCION_PARCHE = 'Patch version mismatches';
const SECCIONES_QUE_NO_SE_PERDONAN = [
  'Major version mismatches',
  'Minor version mismatches',
  'Other/prerelease mismatches',
];

/** Quita los códigos de color del terminal, que en local sí vienen. */
function limpiar(texto) {
  return texto.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Decide con la salida de `expo-doctor` y su código de salida.
 * @param {string} salida  stdout y stderr juntos
 * @param {number} codigo  código de salida del proceso
 * @returns {{ pasa: boolean, motivo: string, avisos: string[] }}
 */
function veredicto(salida, codigo) {
  const texto = limpiar(salida);

  if (codigo === 0) {
    return { pasa: true, motivo: 'expo-doctor no encontró nada.', avisos: [] };
  }

  // «20/21 checks passed. 1 checks failed.» — si no aparece, no se entiende
  // la salida y no hay nada que perdonar.
  const resumen = /(\d+)\/(\d+) checks passed\. (\d+) checks? failed/.exec(texto);
  if (!resumen) {
    return {
      pasa: false,
      motivo:
        'expo-doctor falló y la salida no trae el resumen de checks: no se perdona nada.',
      avisos: [],
    };
  }
  const fallidos = Number(resumen[3]);
  if (fallidos !== 1) {
    return {
      pasa: false,
      motivo: `expo-doctor: ${fallidos} checks fallaron. Solo se perdona el de versiones, y solo si es el único.`,
      avisos: [],
    };
  }

  const lineasConCruz = texto.split('\n').filter((l) => l.trim().startsWith('✖'));
  const soloElDeVersiones =
    lineasConCruz.length === 1 && lineasConCruz[0].includes(CHECK_DE_VERSIONES);
  if (!soloElDeVersiones) {
    return {
      pasa: false,
      motivo: `expo-doctor: el check que falló no es el de versiones (${lineasConCruz.join(' | ') || 'sin ✖ en la salida'}).`,
      avisos: [],
    };
  }

  const seccionesGraves = SECCIONES_QUE_NO_SE_PERDONAN.filter((s) => texto.includes(s));
  if (seccionesGraves.length > 0) {
    return {
      pasa: false,
      motivo: `expo-doctor: hay desajustes que no son de parche (${seccionesGraves.join(', ')}). Eso no se perdona.`,
      avisos: [],
    };
  }
  if (!texto.includes(SECCION_PARCHE)) {
    return {
      pasa: false,
      motivo:
        'expo-doctor: el check de versiones falló pero no se ve la sección de parches. No se entiende la salida: rojo.',
      avisos: [],
    };
  }

  // Solo parches. Se listan para que el aviso diga QUÉ va atrasado.
  const filas =
    /Patch version mismatches\n(?:package\s+expected\s+found\s*\n)?([\s\S]*?)\n\s*\n/.exec(
      texto
    );
  const avisos = filas
    ? filas[1]
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.replace(/\s+/g, ' '))
    : [];

  return {
    pasa: true,
    motivo:
      'expo-doctor: solo hay desajustes de parche. Se perdona, con aviso (decisión #63).',
    avisos,
  };
}

function main() {
  // execSync con cadena, no execFileSync: en Windows los binarios de npm son
  // `.cmd` y desde Node 20 lanzarlos sin shell está bloqueado (ver
  // probar-reglas.js). Si expo-doctor falla, lo que interesa está en
  // error.stdout/error.stderr, no en la excepción.
  let salida = '';
  let codigo = 0;
  try {
    salida = execSync(`npx expo-doctor@${VERSION_DE_DOCTOR}`, {
      cwd: raiz,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, CI: '1' },
    });
  } catch (error) {
    salida = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    codigo = typeof error.status === 'number' ? error.status : 1;
  }

  process.stdout.write(salida);

  const resultado = veredicto(salida, codigo);
  console.log('');
  if (resultado.pasa) {
    console.log(`✔ ${resultado.motivo}`);
    for (const aviso of resultado.avisos) {
      // En GitHub Actions `::warning::` sale en amarillo en el resumen del job.
      console.log(`::warning::Parche atrasado: ${aviso}`);
    }
    if (resultado.avisos.length > 0) {
      console.log(
        'Se ponen al día en el PR quincenal de parches (`npx expo install --fix`), no aquí.'
      );
    }
    process.exit(0);
  }
  console.log(`::error::${resultado.motivo}`);
  process.exit(codigo || 1);
}

module.exports = { veredicto, limpiar, VERSION_DE_DOCTOR };

if (require.main === module) {
  main();
}
