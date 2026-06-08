export interface Genero {
  id: number;
  nome: string;
}

export interface Filme {
  id: number;
  titulo: string;
  sinopse?: string;
  classificacaoEtaria: string;
  duracao: number;
  elenco?: string;
  generoId: number;
  genero?: Genero;
  dataInicialExibicao: string;
  dataFinalExibicao: string;
}

export interface Sala {
  id: number;
  numero: number;
  capacidade: number;
  poltronas: any;
}

export interface Sessao {
  id: number;
  data: string;
  valorIngresso: number;
  filmeId: number;
  filme?: Filme;
  salaId: number;
  sala?: Sala;
}

export interface LancheCombo {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  qtUnidade: number;
  subtotal: number;
}

export interface Ingresso {
  id: number;
  tipo: string;
  valorPago: number;
  assento?: string | null;
  sessaoId: number;
  sessao?: Sessao;
  pedidoId?: number | null;
}

export interface Pedido {
  id: number;
  qtInteira: number;
  qtMeia: number;
  valorTotal: number;
  dataHora: string;
  formaPagamento?: string | null;
  statusPagamento: string;
  codigoComprovante: string;
  combos?: any[];
  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  ingressos?: Ingresso[];
  lanches?: LancheCombo[];
}
