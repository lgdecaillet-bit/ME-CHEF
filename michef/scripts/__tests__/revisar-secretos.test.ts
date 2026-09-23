/**
 * El test que le faltaba al arreglo del PR #3 (revisión retroactiva del
 * 2026-09-23): el control de secretos del pre-commit tiene que bloquear cuando
 * hay una fuga, **decir por qué**, y no confundir una fuga con una herramienta
 * rota.
 *
 * Se corre el guion de verdad con `sh -e`, como lo corre husky, y con un
 * `gitleaks` falso delante en el PATH que responde lo que cada caso necesita.
 * Así no depende de que gitleaks esté instalado ni de que haya nada en stage.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const GUION = path.resolve(__dirname, '..', 'revisar-secretos.sh');

// En Linux y macOS `sh` está en el PATH. En Windows, fuera de Git Bash, no
// siempre; pero Git for Windows lo trae, y es el mismo que usa husky.
function encontrarSh(): string {
  if (spawnSync('sh', ['-c', 'exit 0']).status === 0) return 'sh';
  const gitCore = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim();
  for (const relativo of ['../../../usr/bin/sh.exe', '../../../bin/sh.exe']) {
    const candidato = path.resolve(gitCore, relativo);
    if (fs.existsSync(candidato)) return candidato;
  }
  throw new Error('No encuentro `sh` ni el de Git for Windows: este test lo necesita.');
}

const SH = encontrarSh();

// El gitleaks falso: `git --help` dice que existe el subcomando moderno, y
// `git --staged …` responde según GITLEAKS_FALSO.
const FALSO = `#!/bin/sh
if [ "$2" = "--help" ]; then exit 0; fi
case "$GITLEAKS_FALSO" in
  limpio) echo "no leaks found"; exit 0 ;;
  fuga) echo "WRN leaks found: 1"; exit 1 ;;
  rota) echo "ERR failed to load config"; exit 2 ;;
esac
`;

let carpeta: string;

beforeAll(() => {
  carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'mechef-gitleaks-'));
  fs.writeFileSync(path.join(carpeta, 'gitleaks'), FALSO, { mode: 0o755 });
});

afterAll(() => {
  fs.rmSync(carpeta, { recursive: true, force: true });
});

function correr(modo: 'limpio' | 'fuga' | 'rota') {
  const r = spawnSync(SH, ['-e', GUION], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GITLEAKS_FALSO: modo,
      PATH: `${carpeta}${path.delimiter}${process.env.PATH ?? ''}`,
    },
  });
  return { codigo: r.status, texto: `${r.stdout}${r.stderr}` };
}

describe('revisar-secretos.sh · el control de secretos del pre-commit', () => {
  it('sin fuga deja pasar', () => {
    expect(correr('limpio').codigo).toBe(0);
  });

  it('con una fuga bloquea y dice qué hacer', () => {
    const { codigo, texto } = correr('fuga');
    expect(codigo).toBe(1);
    expect(texto).toContain('Hay un secreto en lo que ibas a commitear');
    expect(texto).toContain('NO uses --no-verify');
  });

  it('con la herramienta rota bloquea, pero no grita «secreto»', () => {
    const { codigo, texto } = correr('rota');
    expect(codigo).toBe(1);
    expect(texto).toContain('NO por una fuga');
    expect(texto).not.toContain('Hay un secreto');
  });
});
