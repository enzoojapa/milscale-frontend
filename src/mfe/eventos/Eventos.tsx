import { useEffect, useState } from 'react';
import { api } from '../../shared/api';
import { Feedback } from '../../shared/Feedback';
import { Evento } from '../../shared/types';

export function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      setEventos((await api<{ eventos: Evento[] }>('/api/eventos')).eventos);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <section>
      <div className="cabecalho">
        <div>
          <h2>Eventos</h2>
          <p className="sub">Eventos publicados no Azure Service Bus e consumidos pela Azure Function</p>
        </div>
        <button onClick={carregar}>Atualizar</button>
      </div>
      <Feedback erro={erro} />
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Evento</th>
            <th>Quando</th>
            <th>Dados</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>
                <span className="tag evento">{e.tipo}</span>
              </td>
              <td>{new Date(e.ocorridoEm).toLocaleString('pt-BR')}</td>
              <td>
                <code>{JSON.stringify(e.dados)}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {eventos.length === 0 && <p className="vazio">Nenhum evento publicado ainda.</p>}
    </section>
  );
}
