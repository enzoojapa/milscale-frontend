import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../shared/api';
import { Feedback } from '../../shared/Feedback';
import { dataBr, Escala, Militar, POSTOS, rotulo, SIGLA, Troca } from '../../shared/types';

const amanha = () => new Date(Date.now() + 21 * 3600e3).toISOString().slice(0, 10);

export function Escalas() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [form, setForm] = useState({ data: amanha(), militarId: '', posto: 'SENTINELA' });
  const [trocaDe, setTrocaDe] = useState<Escala | null>(null);
  const [trocaForm, setTrocaForm] = useState({ militarSubstitutoId: '', motivo: '' });
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const nome = (m?: Militar) => (m ? `${SIGLA[m.graduacao]} ${m.nomeGuerra}` : '');
  const aptos = militares.filter((m) => m.apto);

  async function carregar() {
    const [e, t, m] = await Promise.all([
      api<{ escalas: Escala[] }>('/api/escalas'),
      api<{ trocas: Troca[] }>('/api/trocas'),
      api<{ militares: Militar[] }>('/api/militares'),
    ]);
    setEscalas(e.escalas);
    setTrocas(t.trocas);
    setMilitares(m.militares);
  }

  useEffect(() => {
    carregar().catch((e) => setErro(e.message));
  }, []);

  async function executar(acao: () => Promise<unknown>, mensagem: string) {
    setErro(null);
    setOk(null);
    try {
      await acao();
      setOk(mensagem);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function criar(ev: FormEvent) {
    ev.preventDefault();
    const m = militares.find((x) => x.id === form.militarId);
    executar(
      () => api('/api/escalas', { method: 'POST', body: { ...form, militarNome: nome(m) } }),
      `${nome(m)} escalado em ${dataBr(form.data)}`,
    );
  }

  function solicitarTroca(ev: FormEvent) {
    ev.preventDefault();
    if (!trocaDe) return;
    const m = militares.find((x) => x.id === trocaForm.militarSubstitutoId);
    executar(
      () =>
        api('/api/trocas', {
          method: 'POST',
          body: { escalaId: trocaDe.id, militarSubstitutoId: trocaForm.militarSubstitutoId, militarSubstitutoNome: nome(m), motivo: trocaForm.motivo },
        }).then(() => {
          setTrocaDe(null);
          setTrocaForm({ militarSubstitutoId: '', motivo: '' });
        }),
      'Troca solicitada',
    );
  }

  return (
    <section>
      <div className="cabecalho">
        <div>
          <h2>Escalas e trocas</h2>
          <p className="sub">Microsservico de escalas (Azure SQL) via BFF. Servico de 24h, das 08h00 as 08h00.</p>
        </div>
      </div>

      <form className="form" onSubmit={criar}>
        <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
        <select value={form.militarId} onChange={(e) => setForm({ ...form, militarId: e.target.value })} required>
          <option value="">Militar apto...</option>
          {aptos.map((m) => (
            <option key={m.id} value={m.id}>
              {nome(m)}
            </option>
          ))}
        </select>
        <select value={form.posto} onChange={(e) => setForm({ ...form, posto: e.target.value })}>
          {POSTOS.map((p) => (
            <option key={p} value={p}>
              {rotulo(p)}
            </option>
          ))}
        </select>
        <button type="submit">Escalar</button>
      </form>

      <Feedback erro={erro} sucesso={ok} />

      {trocaDe && (
        <form className="form troca" onSubmit={solicitarTroca}>
          <span>
            Troca do servico de <strong>{trocaDe.militarNome}</strong> em {dataBr(trocaDe.data)}:
          </span>
          <select value={trocaForm.militarSubstitutoId} onChange={(e) => setTrocaForm({ ...trocaForm, militarSubstitutoId: e.target.value })} required>
            <option value="">Substituto...</option>
            {aptos.filter((m) => m.id !== trocaDe.militarId).map((m) => (
              <option key={m.id} value={m.id}>
                {nome(m)}
              </option>
            ))}
          </select>
          <input placeholder="Motivo" value={trocaForm.motivo} onChange={(e) => setTrocaForm({ ...trocaForm, motivo: e.target.value })} required />
          <button type="submit">Solicitar troca</button>
          <button type="button" className="secundario" onClick={() => setTrocaDe(null)}>
            Cancelar
          </button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Posto</th>
            <th>Militar</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {escalas.map((s) => (
            <tr key={s.id}>
              <td>{dataBr(s.data)}</td>
              <td>{rotulo(s.posto)}</td>
              <td>{s.militarNome}</td>
              <td>
                <span className={`tag ${s.status.toLowerCase()}`}>{rotulo(s.status)}</span>
              </td>
              <td className="acoes-linha">
                {s.status === 'RASCUNHO' ? (
                  <>
                    <button onClick={() => executar(() => api(`/api/escalas/${s.id}/publicar`, { method: 'POST' }), `Escala de ${s.militarNome} publicada`)}>
                      Publicar
                    </button>
                    <button className="perigo" onClick={() => executar(() => api(`/api/escalas/${s.id}`, { method: 'DELETE' }), 'Escala removida')}>
                      Remover
                    </button>
                  </>
                ) : (
                  <button className="secundario" onClick={() => setTrocaDe(s)}>
                    Pedir troca
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {escalas.length === 0 && <p className="vazio">Nenhuma escala cadastrada.</p>}

      <h3>Trocas</h3>
      <table>
        <thead>
          <tr>
            <th>Escala</th>
            <th>Substituto</th>
            <th>Motivo</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trocas.map((t) => (
            <tr key={t.id}>
              <td>#{t.escalaId}</td>
              <td>{t.militarSubstitutoNome}</td>
              <td>{t.motivo}</td>
              <td>
                <span className={`tag ${t.status.toLowerCase()}`}>{rotulo(t.status)}</span>
              </td>
              <td className="acoes-linha">
                {t.status === 'PENDENTE' && (
                  <button onClick={() => executar(() => api(`/api/trocas/${t.id}/aprovar`, { method: 'POST' }), 'Troca aprovada')}>Aprovar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {trocas.length === 0 && <p className="vazio">Nenhuma troca solicitada.</p>}
    </section>
  );
}
