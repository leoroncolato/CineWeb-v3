import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { LancheCombo, Ingresso } from '../../types';
import { useToast } from '../../components/ToastContext';

export function PDVPage() {
  const [lanchesDisponiveis, setLanchesDisponiveis] = useState<LancheCombo[]>([]);
  const [ingressosDisponiveis, setIngressosDisponiveis] = useState<Ingresso[]>([]);
  const { addToast } = useToast();

  const [carrinhoLanches, setCarrinhoLanches] = useState<{item: LancheCombo, qt: number}[]>([]);
  const [carrinhoIngressos, setCarrinhoIngressos] = useState<Ingresso[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [resL, resI] = await Promise.all([
          api.get('/lanche-combo'),
          api.get('/ingresso')
        ]);
        setLanchesDisponiveis(resL.data);
        // Filtrar ingressos que ainda não estão em um pedido. Idealmente o backend faria isso, 
        // mas faremos via mapeamento para demonstração do PDV caso falte filtro.
        const ingLivres = resI.data.filter((i:any) => i.pedidoId === null);
        setIngressosDisponiveis(ingLivres);
      } catch {
        addToast('Falha com PDV', 'danger');
      }
    };
    load();
  }, []);

  const addLanche = (l: LancheCombo) => {
    setCarrinhoLanches(prev => {
      const exists = prev.find(p => p.item.id === l.id);
      if (exists) {
        return prev.map(p => p.item.id === l.id ? { ...p, qt: p.qt + 1 } : p);
      }
      return [...prev, { item: l, qt: 1 }];
    });
  };

  const removeLanche = (id: number) => {
    setCarrinhoLanches(prev => prev.filter(p => p.item.id !== id));
  };

  const addIngresso = (i: Ingresso) => {
    if (!carrinhoIngressos.find(c => c.id === i.id)) {
      setCarrinhoIngressos([...carrinhoIngressos, i]);
    }
  };
  const removeIngresso = (id: number) => {
    setCarrinhoIngressos(prev => prev.filter(c => c.id !== id));
  };

  const valorTotalLanches = carrinhoLanches.reduce((sum, p) => sum + (p.item.preco * p.qt), 0);
  const valorTotalIngressos = carrinhoIngressos.reduce((sum, i) => sum + i.valorPago, 0);
  const valorFinal = valorTotalLanches + valorTotalIngressos;

  const fecharPedido = async () => {
    if (carrinhoLanches.length === 0 && carrinhoIngressos.length === 0) {
      addToast('O carrinho está vazio!', 'warning'); return;
    }
    
    const ingressosIds = carrinhoIngressos.map(i => i.id);
    const lancheIds = carrinhoLanches.flatMap(c => Array.from({ length: c.qt }, () => c.item.id));

    try {
      await api.post('/pedido', {
        ingressoIds: ingressosIds,
        lancheIds,
      });
      addToast('Pedido fechado e salvo com sucesso!', 'success');
      setCarrinhoLanches([]);
      setCarrinhoIngressos([]);
      
      // Remove ingressos usados da listagem
      setIngressosDisponiveis(prev => prev.filter(i => !ingressosIds.includes(i.id)));
      
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Erro ao fechar pedido', 'danger');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">PDV / <span>Caixa</span></h2>
      </div>

      <div className="row g-4">
        {/* Mostruário */}
        <div className="col-lg-8">
          <div className="row g-4">
            
            <div className="col-12">
              <div className="glass-panel h-100">
                <h5 className="mb-3 text-accent"><i className="bi bi-cup-straw"></i> Bombonière</h5>
                <div className="d-flex flex-wrap gap-3">
                  {lanchesDisponiveis.map(l => (
                    <div key={l.id} className="card bg-dark border-secondary p-3" style={{width: '200px', cursor: 'pointer', transition: '0.2s'}} onClick={() => addLanche(l)}>
                      <h6 className="fw-bold">{l.nome}</h6>
                      <p className="text-muted small mb-2" style={{height:'40px', overflow:'hidden'}}>{l.descricao}</p>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <span className="text-success fw-bold">R$ {l.preco.toFixed(2)}</span>
                        <button className="btn btn-sm btn-outline-primary rounded-circle"><i className="bi bi-plus"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="glass-panel h-100">
                <h5 className="mb-3 text-accent"><i className="bi bi-ticket-perforated"></i> Ingressos Livres (Para Combinar)</h5>
                <div className="table-responsive" style={{maxHeight: '250px'}}>
                  <table className="table table-sm">
                    <thead><tr><th>TICKET</th><th>Sessão</th><th>Tipo</th><th>Valor</th><th>Add</th></tr></thead>
                    <tbody>
                      {ingressosDisponiveis.map(i => (
                        <tr key={i.id}>
                          <td>#{String(i.id).padStart(4,'0')}</td>
                          <td>{i.sessao?.filme?.titulo}</td>
                          <td>{i.tipo}</td>
                          <td>R$ {i.valorPago.toFixed(2)}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-accent" onClick={() => addIngresso(i)} disabled={carrinhoIngressos.some(c=>c.id===i.id)}>
                              <i className="bi bi-check2-circle"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Carrinho Box Lateral */}
        <div className="col-lg-4">
          <div className="glass-panel d-flex flex-column" style={{ minHeight: '600px', backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <h4 className="fw-bold border-bottom border-secondary pb-3 flex-shrink-0">
              <i className="bi bi-receipt"></i> Resumo do Pedido
            </h4>
            
            <div className="flex-grow-1 overflow-auto mt-3 no-scrollbar pb-3">
              {carrinhoLanches.length === 0 && carrinhoIngressos.length === 0 && (
                <div className="text-muted text-center mt-5"><i className="bi bi-cart-x fs-1"></i><p>Carrinho Vazio.</p></div>
              )}

              {/* Lista Lanches */}
              {carrinhoLanches.map(c => (
                <div key={c.item.id} className="d-flex justify-content-between align-items-center mb-3 border-bottom border-dark pb-2">
                  <div>
                    <div className="fw-medium">{c.item.nome}</div>
                    <small className="text-muted">{c.qt}x R$ {c.item.preco.toFixed(2)}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">R$ {(c.qt * c.item.preco).toFixed(2)}</span>
                    <button className="btn btn-sm text-danger px-1" onClick={()=>removeLanche(c.item.id)}><i className="bi bi-dash-circle"></i></button>
                  </div>
                </div>
              ))}

              {/* Lista Ingressos */}
              {carrinhoIngressos.map(i => (
                <div key={i.id} className="d-flex justify-content-between align-items-center mb-3 border-bottom border-dark pb-2">
                  <div>
                    <div className="fw-medium">Ticket #{i.id} ({i.tipo})</div>
                    <small className="text-muted">{i.sessao?.filme?.titulo}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">R$ {i.valorPago.toFixed(2)}</span>
                    <button className="btn btn-sm text-danger px-1" onClick={()=>removeIngresso(i.id)}><i className="bi bi-dash-circle"></i></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto border-top border-secondary pt-3 flex-shrink-0">
              <div className="d-flex justify-content-between text-muted mb-2">
                 <span>Subtotal Lanches:</span>
                 <span>R$ {valorTotalLanches.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-muted mb-3">
                 <span>Subtotal Ingressos:</span>
                 <span>R$ {valorTotalIngressos.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-end mb-4">
                 <span className="fs-5">Total Final</span>
                 <span className="fs-2 fw-bold text-success">R$ {valorFinal.toFixed(2)}</span>
              </div>
              
              <button className="btn btn-primary btn-lg w-100 fw-bold shadow" onClick={fecharPedido}>
                Finalizar Compra
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
