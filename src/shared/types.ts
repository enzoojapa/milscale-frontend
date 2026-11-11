export interface Militar {
  id: string;
  nomeGuerra: string;
  nomeCompleto: string;
  graduacao: string;
  subunidade: string;
  situacao: string;
  apto: boolean;
}

export interface Escala {
  id: number;
  data: string;
  militarId: string;
  militarNome: string;
  posto: string;
  status: 'RASCUNHO' | 'PUBLICADA';
  inicio: string;
  fim: string;
}

export interface Troca {
  id: number;
  escalaId: number;
  militarSubstitutoNome: string;
  motivo: string;
  status: string;
  solicitadaEm: string;
}

export interface Evento {
  id: number;
  tipo: string;
  versao: number;
  ocorridoEm: string;
  dados: Record<string, unknown>;
}

export const GRADUACOES = ['SOLDADO', 'CABO', 'SARGENTO', 'TENENTE', 'CAPITAO'];
export const SITUACOES = ['APTO', 'MISSAO', 'AFASTADO'];
export const POSTOS = ['SENTINELA', 'CABO_DA_GUARDA', 'SARGENTO_DE_DIA', 'OFICIAL_DE_DIA'];

export const SIGLA: Record<string, string> = { SOLDADO: 'SD', CABO: 'CB', SARGENTO: 'SGT', TENENTE: 'TEN', CAPITAO: 'CAP' };
const ACENTOS: Record<string, string> = { MISSAO: 'Em missão', CAPITAO: 'Capitão', SARGENTO_DE_DIA: 'Sargento de dia', CABO_DA_GUARDA: 'Cabo da guarda', OFICIAL_DE_DIA: 'Oficial de dia', PUBLICADA: 'Publicada', RASCUNHO: 'Rascunho' };
export const rotulo = (s: string) => ACENTOS[s] ?? s.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
export const dataBr = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');
