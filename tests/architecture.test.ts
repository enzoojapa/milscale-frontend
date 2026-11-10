import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '../src');
const MFE = path.join(SRC, 'mfe');

function arquivos(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? arquivos(p) : /\.tsx?$/.test(p) ? [p] : [];
  });
}
const imports = (f: string) => [...fs.readFileSync(f, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);

describe('Microfrontends', () => {
  const modulos = fs.readdirSync(MFE);

  it('um microfrontend nao importa outro (so o shared)', () => {
    const erros = modulos.flatMap((mod) =>
      arquivos(path.join(MFE, mod)).flatMap((f) =>
        imports(f)
          .filter((i) => i.startsWith('.'))
          .map((i) => path.relative(MFE, path.resolve(path.dirname(f), i)).split(path.sep)[0])
          .filter((alvo) => modulos.includes(alvo) && alvo !== mod)
          .map((alvo) => `${mod} -> ${alvo}`),
      ),
    );
    expect(erros).toEqual([]);
  });

  it('nenhum modulo chama microsservico direto: so fetch dentro de shared/api.ts', () => {
    const comFetch = arquivos(SRC).filter((f) => /\bfetch\(/.test(fs.readFileSync(f, 'utf8')));
    expect(comFetch.map((f) => path.relative(SRC, f))).toEqual(['shared/api.ts']);
  });

  it('shared nao depende de nenhum microfrontend', () => {
    const erros = arquivos(path.join(SRC, 'shared')).flatMap((f) => imports(f).filter((i) => i.includes('mfe')));
    expect(erros).toEqual([]);
  });
});
