import { useState } from 'react';
import { Efetivo } from '../mfe/efetivo/Efetivo';
import { Escalas } from '../mfe/escalas/Escalas';
import { Eventos } from '../mfe/eventos/Eventos';
import { Painel } from '../mfe/painel/Painel';
import { apiBaseUrl } from '../shared/api';

const MODULOS = [
  { id: 'painel', nome: 'Painel', Componente: Painel },
  { id: 'efetivo', nome: 'Efetivo', Componente: Efetivo },
  { id: 'escalas', nome: 'Escalas e trocas', Componente: Escalas },
  { id: 'eventos', nome: 'Eventos', Componente: Eventos },
] as const;

export function App() {
  const [ativo, setAtivo] = useState<string>(() => location.hash.replace('#', '') || 'painel');
  const modulo = MODULOS.find((m) => m.id === ativo) ?? MODULOS[0];

  function abrir(id: string) {
    location.hash = id;
    setAtivo(id);
  }

  return (
    <div className="layout">
      <aside>
        <div className="marca">
          <span className="logo">MS</span>
          <div>
            <strong>MilScale</strong>
            <small>Escalas de serviço</small>
          </div>
        </div>
        <nav>
          {MODULOS.map((m) => (
            <button key={m.id} className={m.id === modulo.id ? 'ativo' : ''} onClick={() => abrir(m.id)}>
              {m.nome}
            </button>
          ))}
        </nav>
        <footer>
          <small>API Gateway</small>
          <code>{apiBaseUrl ? new URL(apiBaseUrl).host : 'não configurado'}</code>
        </footer>
      </aside>
      <main>
        <modulo.Componente key={modulo.id} />
      </main>
    </div>
  );
}
