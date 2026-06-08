import * as SQLite from 'expo-sqlite';
import type { LocalTicket, Pedido } from '../types';

const db = SQLite.openDatabaseSync('cineweb-mobile.db');

export async function initLocalDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tickets (
      pedidoId INTEGER PRIMARY KEY NOT NULL,
      codigoComprovante TEXT NOT NULL,
      filme TEXT NOT NULL,
      dataSessao TEXT NOT NULL,
      sala TEXT NOT NULL,
      assentos TEXT NOT NULL,
      total REAL NOT NULL,
      combos TEXT NOT NULL,
      dataCompra TEXT NOT NULL,
      syncStatus TEXT NOT NULL
    );
  `);
}

export async function upsertPedidoLocal(pedido: Pedido, syncStatus: LocalTicket['syncStatus'] = 'synced') {
  const ticket = pedidoToLocalTicket(pedido, syncStatus);

  await db.runAsync(
    `INSERT OR REPLACE INTO tickets (
      pedidoId, codigoComprovante, filme, dataSessao, sala, assentos, total, combos, dataCompra, syncStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ticket.pedidoId,
      ticket.codigoComprovante,
      ticket.filme,
      ticket.dataSessao,
      ticket.sala,
      ticket.assentos,
      ticket.total,
      ticket.combos,
      ticket.dataCompra,
      ticket.syncStatus,
    ],
  );

  return ticket;
}

export async function syncPedidosToLocal(pedidos: Pedido[]) {
  for (const pedido of pedidos) {
    await upsertPedidoLocal(pedido, 'synced');
  }
  return listLocalTickets();
}

export async function listLocalTickets() {
  return db.getAllAsync<LocalTicket>(
    'SELECT * FROM tickets ORDER BY dataCompra DESC, pedidoId DESC',
  );
}

function pedidoToLocalTicket(pedido: Pedido, syncStatus: LocalTicket['syncStatus']): LocalTicket {
  const primeiroIngresso = pedido.ingressos?.[0];
  const sessao = primeiroIngresso?.sessao;
  const combos = pedido.combos || [];

  return {
    pedidoId: pedido.id,
    codigoComprovante: pedido.codigoComprovante,
    filme: sessao?.filme?.titulo || 'Filme',
    dataSessao: sessao?.data || pedido.dataHora,
    sala: sessao?.sala ? `Sala ${sessao.sala.numero}` : 'Sala',
    assentos: pedido.ingressos?.map((ingresso) => ingresso.assento || 'S/A').join(', ') || 'S/A',
    total: pedido.valorTotal,
    combos: combos.length
      ? combos.map((combo) => `${combo.quantidade}x ${combo.nome}`).join(', ')
      : 'Sem combos',
    dataCompra: pedido.dataHora,
    syncStatus,
  };
}
