/**
 * El control positivo de scripts/doctor.js (decisión #63, y el mismo espíritu
 * que probar-reglas.js): un guion que perdona algo tiene que demostrar que NO
 * perdona todo lo demás.
 *
 * El fixture de parches es la salida real de `expo-doctor@1.20.4` en `main` el
 * 2026-09-21, con cuatro paquetes atrasados solo en el tercer número. Los otros
 * casos se derivan de ella cambiando lo mínimo, para que la diferencia entre
 * «pasa» y «no pasa» sea exactamente la línea que se cambió.
 */
import { limpiar, veredicto } from '../doctor';

const SOLO_PARCHES = `Running 21 checks on your project...
20/21 checks passed. 1 checks failed. Possible issues detected:
Use the --verbose flag to see more details about passed checks.

✖ Check that packages match versions required by installed Expo SDK

🔧 Patch version mismatches
package         expected  found
expo            ~57.0.24  57.0.22
expo-constants  ~57.0.19  57.0.18
expo-router     ~57.0.22  57.0.21
expo-updates    ~57.0.23  57.0.22

Changelogs:
- expo-constants → https://github.com/expo/expo/blob/sdk-57/packages/expo-constants/CHANGELOG.md

4 packages out of date.
Advice:
Use 'npx expo install --check' to review and upgrade your dependencies.

1 check failed, indicating possible issues with the project.
`;

describe('veredicto de expo-doctor', () => {
  it('pasa sin avisos cuando expo-doctor sale con 0', () => {
    const r = veredicto('Running 21 checks on your project...\n21/21 checks passed.', 0);
    expect(r.pasa).toBe(true);
    expect(r.avisos).toEqual([]);
  });

  it('perdona cuando lo único que falla son parches, y dice cuáles', () => {
    const r = veredicto(SOLO_PARCHES, 1);
    expect(r.pasa).toBe(true);
    expect(r.motivo).toContain('#63');
    expect(r.avisos).toEqual([
      'expo ~57.0.24 57.0.22',
      'expo-constants ~57.0.19 57.0.18',
      'expo-router ~57.0.22 57.0.21',
      'expo-updates ~57.0.23 57.0.22',
    ]);
  });

  it('perdona igual con códigos de color en la salida (como en local)', () => {
    const conColor = SOLO_PARCHES.replace(
      '✖ Check that packages',
      '\x1b[31m✖\x1b[39m \x1b[1mCheck that packages'
    ).replace('Patch version mismatches', '\x1b[33mPatch version mismatches\x1b[39m');
    expect(limpiar(conColor)).toBe(SOLO_PARCHES);
    expect(veredicto(conColor, 1).pasa).toBe(true);
  });

  it.each([
    ['Major version mismatches', '❗'],
    ['Minor version mismatches', '⚠️'],
    ['Other/prerelease mismatches', '➿'],
  ])('NO perdona una sección «%s» aunque sea la única', (seccion, icono) => {
    const salida = SOLO_PARCHES.replace(
      '🔧 Patch version mismatches',
      `${icono} ${seccion}`
    );
    const r = veredicto(salida, 1);
    expect(r.pasa).toBe(false);
    expect(r.motivo).toContain(seccion);
  });

  it('NO perdona parches si además hay una sección mayor', () => {
    const salida = SOLO_PARCHES.replace(
      '🔧 Patch version mismatches',
      '❗ Major version mismatches\npackage  expected  found\nexpo-camera  ~57.0.0  16.0.0\n\n🔧 Patch version mismatches'
    );
    const r = veredicto(salida, 1);
    expect(r.pasa).toBe(false);
    expect(r.motivo).toContain('Major version mismatches');
  });

  it('NO perdona si falló otro check además del de versiones', () => {
    const salida = SOLO_PARCHES.replace(
      '20/21 checks passed. 1 checks failed',
      '19/21 checks passed. 2 checks failed'
    ).replace(
      '✖ Check that packages',
      '✖ Check for app config fields that may not be synced in a non-CNG project\n\n✖ Check that packages'
    );
    const r = veredicto(salida, 1);
    expect(r.pasa).toBe(false);
    expect(r.motivo).toContain('2 checks');
  });

  it('NO perdona si el único check caído no es el de versiones', () => {
    const salida = SOLO_PARCHES.replace(
      '✖ Check that packages match versions required by installed Expo SDK',
      '✖ Validate packages against React Native Directory package metadata'
    );
    const r = veredicto(salida, 1);
    expect(r.pasa).toBe(false);
    expect(r.motivo).toContain('no es el de versiones');
  });

  it('NO perdona si el check de versiones falla pero no se ve la sección de parches', () => {
    const salida = SOLO_PARCHES.replace('🔧 Patch version mismatches\n', '');
    const r = veredicto(salida, 1);
    expect(r.pasa).toBe(false);
    expect(r.motivo).toContain('no se ve la sección de parches');
  });

  it('NO perdona una salida que no se entiende', () => {
    const r = veredicto(
      'Error: npx expo config --json --full exited with non-zero code: 1',
      1
    );
    expect(r.pasa).toBe(false);
    expect(r.motivo).toContain('no trae el resumen');
  });

  it('NO perdona un código distinto de 0 aunque la salida diga 21/21', () => {
    // Si el proceso murió después de imprimir el resumen, el resumen no vale.
    const r = veredicto('Running 21 checks on your project...\n21/21 checks passed.', 1);
    expect(r.pasa).toBe(false);
  });
});
