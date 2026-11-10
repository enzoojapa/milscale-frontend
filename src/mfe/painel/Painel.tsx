import { useCallback, useEffect, useState } from 'react';
import { api } from '../../shared/api';
import { Feedback } from '../../shared/Feedback';
import { dataBr, Escala, rotulo } from '../../shared/types';

interface Bloco<T> {
  status: 'ok' | 'erro';
  dados: T | null;
  erro?: string;
}

interface PainelAgregado {
  data: string;
  geradoEm: string;
  tempoMs: number;
  efetivo: Bloco<{ total: number; aptos: number; militares: { id: string; situacao: string }[] }>;
  escala: Bloco<{ total: number; escalas: Escala[] }>;
  ciclo: Bloco<{ cicloDias: number; folgaEntreServicosDias: number; servicosPorMilitarEm30Dias: number; necessidadeDiaria: number }>;
}

const hoje = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);

function Fonte({ nome, bloco }: { nome: string; bloco: Bloco<unknown> }) {
  return (
    <span className={`fonte ${bloco.status}`} title={bloco.erro}>
      {nome}: {bloco.status === 'ok' ? 'ok' : 'falhou'}
    </span>
  );
}

export function Painel() {
  const [data, setData] = useState(hoje());
  const [painel, setPainel] = useState<PainelAgregado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setPainel(await api<PainelAgregado>(`/aggregated-data?data=${data}`));
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, [data]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const e = painel?.efetivo.dados;
  const c = painel?.ciclo.dados;
  const missao = e?.militares.filter((m) => m.situacao === 'MISSAO').length ?? 0;
  const afastados = e?.militares.filter((m) => m.situacao === 'AFASTADO').length ?? 0;

  return (
    <section>
      <div className="cabecalho">
        <div>
          <h2>Painel do dia</h2>
          <p className="sub">Dados de uma unica chamada: GET /aggregated-data</p>
        </div>
        <div className="acoes">
          <input type="date" value={data} onChange={(ev) => setData(ev.target.value)} />
          <button onClick={carregar} disabled={carregando}>
            {carregando ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <Feedback erro={erro} />

      {painel && (
        <>
          <div className="fontes">
            <Fonte nome="Efetivo (MongoDB)" bloco={painel.efetivo} />
            <Fonte nome="Escala (Azure SQL)" bloco={painel.escala} />
            <Fonte nome="Ciclo (Azure Function)" bloco={painel.ciclo} />
            <span className="tempo">{painel.tempoMs} ms</span>
          </div>

          <div className="cards">
            <div className="card">
              <span className="rotulo">Efetivo total</span>
              <strong>{e?.total ?? '-'}</strong>
            </div>
            <div className="card destaque">
              <span className="rotulo">Aptos</span>
              <strong>{e?.aptos ?? '-'}</strong>
            </div>
            <div className="card">
              <span className="rotulo">Em missao / afastados</span>
              <strong>
                {missao} / {afastados}
              </strong>
            </div>
            <div className="card">
              <span className="rotulo">Ciclo de servico</span>
              <strong>{c ? `${c.cicloDias} dias` : '-'}</strong>
              {c && <small>{c.folgaEntreServicosDias} dias de folga entre servicos</small>}
            </div>
          </div>

          <h3>Escala de {dataBr(painel.data)}</h3>
          {painel.escala.dados?.escalas.length ? (
            <table>
              <thead>
                <tr>
                  <th>Posto</th>
                  <th>Militar</th>
                  <th>Horario</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {painel.escala.dados.escalas.map((s) => (
                  <tr key={s.id}>
                    <td>{rotulo(s.posto)}</td>
                    <td>{s.militarNome}</td>
                    <td>08h00 de {dataBr(s.data)} as 08h00 do dia seguinte</td>
                    <td>
                      <span className={`tag ${s.status.toLowerCase()}`}>{rotulo(s.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="vazio">Nenhum militar escalado nesta data.</p>
          )}
        </>
      )}
    </section>
  );
}
