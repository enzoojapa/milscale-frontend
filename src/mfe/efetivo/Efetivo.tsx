import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../shared/api';
import { Feedback } from '../../shared/Feedback';
import { GRADUACOES, Militar, rotulo, SIGLA, SITUACOES } from '../../shared/types';

const vazio = { nomeGuerra: '', nomeCompleto: '', graduacao: 'SOLDADO', subunidade: '1a Companhia', situacao: 'APTO' };

export function Efetivo() {
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [form, setForm] = useState(vazio);
  const [editando, setEditando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function carregar() {
    const r = await api<{ militares: Militar[] }>('/api/militares');
    setMilitares(r.militares);
  }

  useEffect(() => {
    carregar().catch((e) => setErro(e.message));
  }, []);

  async function salvar(ev: FormEvent) {
    ev.preventDefault();
    setErro(null);
    setOk(null);
    try {
      if (editando) {
        await api(`/api/militares/${editando}`, { method: 'PUT', body: form });
        setOk('Militar atualizado');
      } else {
        await api('/api/militares', { method: 'POST', body: form });
        setOk('Militar cadastrado');
      }
      setForm(vazio);
      setEditando(null);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function mudarSituacao(m: Militar, situacao: string) {
    setErro(null);
    try {
      await api(`/api/militares/${m.id}`, { method: 'PUT', body: { situacao } });
      setOk(`${m.nomeGuerra} agora esta ${rotulo(situacao).toLowerCase()}`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function remover(m: Militar) {
    try {
      await api(`/api/militares/${m.id}`, { method: 'DELETE' });
      setOk(`${m.nomeGuerra} removido`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function editar(m: Militar) {
    setEditando(m.id);
    setForm({ nomeGuerra: m.nomeGuerra, nomeCompleto: m.nomeCompleto, graduacao: m.graduacao, subunidade: m.subunidade, situacao: m.situacao });
  }

  const set = (campo: keyof typeof vazio) => (ev: { target: { value: string } }) => setForm({ ...form, [campo]: ev.target.value });

  return (
    <section>
      <div className="cabecalho">
        <div>
          <h2>Efetivo</h2>
          <p className="sub">Microsservico de efetivo (MongoDB Atlas) via BFF</p>
        </div>
      </div>

      <form className="form" onSubmit={salvar}>
        <input placeholder="Nome de guerra" value={form.nomeGuerra} onChange={set('nomeGuerra')} required />
        <input placeholder="Nome completo" value={form.nomeCompleto} onChange={set('nomeCompleto')} required />
        <select value={form.graduacao} onChange={set('graduacao')}>
          {GRADUACOES.map((g) => (
            <option key={g} value={g}>
              {rotulo(g)}
            </option>
          ))}
        </select>
        <input placeholder="Subunidade" value={form.subunidade} onChange={set('subunidade')} required />
        <select value={form.situacao} onChange={set('situacao')}>
          {SITUACOES.map((s) => (
            <option key={s} value={s}>
              {rotulo(s)}
            </option>
          ))}
        </select>
        <button type="submit">{editando ? 'Salvar alteracao' : 'Cadastrar'}</button>
        {editando && (
          <button type="button" className="secundario" onClick={() => { setEditando(null); setForm(vazio); }}>
            Cancelar
          </button>
        )}
      </form>

      <Feedback erro={erro} sucesso={ok} />

      <table>
        <thead>
          <tr>
            <th>Militar</th>
            <th>Nome completo</th>
            <th>Subunidade</th>
            <th>Situacao</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {militares.map((m) => (
            <tr key={m.id}>
              <td>
                <strong>{SIGLA[m.graduacao]} {m.nomeGuerra}</strong>
              </td>
              <td>{m.nomeCompleto}</td>
              <td>{m.subunidade}</td>
              <td>
                <select className={`tag ${m.situacao.toLowerCase()}`} value={m.situacao} onChange={(ev) => mudarSituacao(m, ev.target.value)}>
                  {SITUACOES.map((s) => (
                    <option key={s} value={s}>
                      {rotulo(s)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="acoes-linha">
                <button className="secundario" onClick={() => editar(m)}>Editar</button>
                <button className="perigo" onClick={() => remover(m)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {militares.length === 0 && <p className="vazio">Nenhum militar cadastrado.</p>}
    </section>
  );
}
