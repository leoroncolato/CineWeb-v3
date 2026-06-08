import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Pedido } from '../../types';
import { useToast } from '../../components/ToastContext';

export function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get('/pedido');
        setPedidos(response.data);
      } catch {
        addToast('Erro ao carregar pedidos', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Pedidos <span>Sincronizados</span></h2>
        <span className="badge bg-secondary fs-6 px-3">{pedidos.length} Pedidos</span>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="text-center p-5"><div className="spinner-border text-light"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Comprovante</th>
                  <th>Cliente</th>
                  <th>Ingressos</th>
                  <th>Combos</th>
                  <th>Pagamento</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4 text-muted">Nenhuma compra sincronizada ainda.</td></tr>
                ) : pedidos.map((pedido) => {
                  const combos = Array.isArray(pedido.combos) ? pedido.combos : [];
                  return (
                    <tr key={pedido.id}>
                      <td>
                        <span className="badge bg-dark border border-secondary">{pedido.codigoComprovante}</span>
                        <div className="small text-muted">{new Date(pedido.dataHora).toLocaleString()}</div>
                      </td>
                      <td>
                        <div className="fw-medium">{pedido.usuario?.nome || 'PDV'}</div>
                        <div className="small text-muted">{pedido.usuario?.email || 'Venda interna'}</div>
                      </td>
                      <td>
                        {pedido.ingressos?.map((ingresso) => (
                          <div key={ingresso.id} className="small">
                            {ingresso.sessao?.filme?.titulo} - {ingresso.assento || 'sem assento'} ({ingresso.tipo})
                          </div>
                        ))}
                      </td>
                      <td>
                        {combos.length === 0 ? (
                          <span className="text-muted small">Sem combos</span>
                        ) : combos.map((combo: any) => (
                          <div key={`${pedido.id}-${combo.lancheComboId}`} className="small">
                            {combo.quantidade}x {combo.nome}
                          </div>
                        ))}
                      </td>
                      <td>
                        <span className="badge bg-success text-dark">{pedido.statusPagamento}</span>
                        <div className="small text-muted">{pedido.formaPagamento || 'PDV'}</div>
                      </td>
                      <td className="text-end fw-bold">R$ {Number(pedido.valorTotal).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
