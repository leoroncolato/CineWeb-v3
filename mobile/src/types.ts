export type UserRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  usuario: AuthUser;
}

export interface Genero {
  id: number;
  nome: string;
}

export interface Filme {
  id: number;
  titulo: string;
  sinopse?: string | null;
  classificacaoEtaria: string;
  duracao: number;
  elenco?: string | null;
  generoId: number;
  genero?: Genero;
  dataInicialExibicao: string;
  dataFinalExibicao: string;
}

export interface Sala {
  id: number;
  numero: number;
  capacidade: number;
  poltronas: unknown;
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
  descricao?: string | null;
  preco: number;
  qtUnidade: number;
  subtotal: number;
}

export interface Ingresso {
  id: number;
  tipo: 'Inteira' | 'Meia';
  valorPago: number;
  assento?: string | null;
  sessaoId: number;
  sessao?: Sessao;
}

export interface PedidoCombo {
  lancheComboId: number;
  nome: string;
  descricao?: string | null;
  preco: number;
  quantidade: number;
  subtotal: number;
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
  combos?: PedidoCombo[];
  ingressos?: Ingresso[];
}

export interface LocalTicket {
  pedidoId: number;
  codigoComprovante: string;
  filme: string;
  dataSessao: string;
  sala: string;
  assentos: string;
  total: number;
  combos: string;
  dataCompra: string;
  syncStatus: 'synced' | 'pending';
}
