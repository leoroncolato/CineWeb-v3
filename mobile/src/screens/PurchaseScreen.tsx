import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../services/api';
import { upsertPedidoLocal } from '../services/localTickets';
import type { LancheCombo, Pedido } from '../types';
import type { PurchaseScreenProps } from '../navigation';

type TicketType = 'Inteira' | 'Meia';

export function PurchaseScreen({ route, navigation }: PurchaseScreenProps) {
  const { sessao } = route.params;
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketTypes, setTicketTypes] = useState<Record<string, TicketType>>({});
  const [combos, setCombos] = useState<LancheCombo[]>([]);
  const [comboQuantities, setComboQuantities] = useState<Record<number, number>>({});
  const [payment, setPayment] = useState('Pix');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [occupiedResponse, combosResponse] = await Promise.all([
          api.get<string[]>(`/ingresso/sessao/${sessao.id}/ocupados`),
          api.get<LancheCombo[]>('/lanche-combo'),
        ]);

        setOccupiedSeats(occupiedResponse.data.map((seat) => seat.toUpperCase()));
        setCombos(combosResponse.data);
      } catch (err: any) {
        Alert.alert('Falha ao preparar compra', err.response?.data?.message || 'Nao foi possivel carregar assentos.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sessao.id]);

  const seats = useMemo(() => buildSeats(sessao.sala?.poltronas, sessao.sala?.capacidade || 30), [sessao.sala]);
  const ticketsTotal = selectedSeats.reduce((total, seat) => {
    const type = ticketTypes[seat] || 'Inteira';
    return total + (type === 'Meia' ? sessao.valorIngresso / 2 : sessao.valorIngresso);
  }, 0);
  const combosTotal = combos.reduce((total, combo) => total + combo.preco * (comboQuantities[combo.id] || 0), 0);
  const total = ticketsTotal + combosTotal;

  const toggleSeat = (seat: string) => {
    if (occupiedSeats.includes(seat)) return;

    if (selectedSeats.includes(seat)) {
      setSelectedSeats((current) => current.filter((item) => item !== seat));
      setTicketTypes((current) => {
        const next = { ...current };
        delete next[seat];
        return next;
      });
      return;
    }

    setSelectedSeats((current) => [...current, seat]);
    setTicketTypes((current) => ({ ...current, [seat]: 'Inteira' }));
  };

  const setSeatType = (seat: string, type: TicketType) => {
    setTicketTypes((current) => ({ ...current, [seat]: type }));
  };

  const changeCombo = (id: number, delta: number) => {
    setComboQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] || 0) + delta),
    }));
  };

  const checkout = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Escolha um assento', 'Selecione pelo menos um assento para continuar.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sessaoId: sessao.id,
        formaPagamento: payment,
        ingressos: selectedSeats.map((seat) => ({
          assento: seat,
          tipo: ticketTypes[seat] || 'Inteira',
        })),
        combos: Object.entries(comboQuantities)
          .filter(([, quantidade]) => quantidade > 0)
          .map(([lancheComboId, quantidade]) => ({
            lancheComboId: Number(lancheComboId),
            quantidade,
          })),
      };

      const response = await api.post<Pedido>('/pedido/checkout', payload);
      await upsertPedidoLocal(response.data, 'synced');
      navigation.replace('Receipt', { pedido: response.data });
    } catch (err: any) {
      Alert.alert('Compra nao concluida', err.response?.data?.message || 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#ff8830" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>{sessao.filme?.titulo || 'Filme'}</Text>
        <Text style={styles.muted}>{formatDate(sessao.data)} • Sala {sessao.sala?.numero}</Text>
        <Text style={styles.price}>Ingresso base: R$ {Number(sessao.valorIngresso).toFixed(2)}</Text>
      </View>

      <SectionTitle title="Escolha os assentos" subtitle="Laranja selecionado, cinza ocupado" />
      <View style={styles.seatGrid}>
        {seats.map((seat) => {
          const occupied = occupiedSeats.includes(seat);
          const selected = selectedSeats.includes(seat);
          return (
            <Pressable
              key={seat}
              style={[styles.seat, occupied && styles.seatOccupied, selected && styles.seatSelected]}
              onPress={() => toggleSeat(seat)}
            >
              <Text style={[styles.seatText, selected && styles.seatTextSelected]}>{seat}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedSeats.length > 0 && (
        <>
          <SectionTitle title="Tipo do ingresso" subtitle="A meia entrada aplica 50% do valor da sessao" />
          {selectedSeats.map((seat) => (
            <View key={seat} style={styles.ticketTypeRow}>
              <Text style={styles.cardTitle}>Assento {seat}</Text>
              <View style={styles.typeButtons}>
                <SmallChoice label="Inteira" active={(ticketTypes[seat] || 'Inteira') === 'Inteira'} onPress={() => setSeatType(seat, 'Inteira')} />
                <SmallChoice label="Meia" active={ticketTypes[seat] === 'Meia'} onPress={() => setSeatType(seat, 'Meia')} />
              </View>
            </View>
          ))}
        </>
      )}

      <SectionTitle title="Combos de lanches" subtitle="Itens cadastrados no painel web" />
      {combos.length === 0 ? (
        <Text style={styles.muted}>Nenhum combo cadastrado.</Text>
      ) : combos.map((combo) => (
        <View key={combo.id} style={styles.comboRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{combo.nome}</Text>
            {!!combo.descricao && <Text style={styles.muted}>{combo.descricao}</Text>}
            <Text style={styles.priceSmall}>R$ {Number(combo.preco).toFixed(2)}</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable style={styles.stepButton} onPress={() => changeCombo(combo.id, -1)}>
              <Text style={styles.stepText}>-</Text>
            </Pressable>
            <Text style={styles.quantity}>{comboQuantities[combo.id] || 0}</Text>
            <Pressable style={styles.stepButton} onPress={() => changeCombo(combo.id, 1)}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <SectionTitle title="Pagamento" subtitle="Simulacao aprovada no backend" />
      <View style={styles.paymentRow}>
        {['Pix', 'Cartao de credito', 'Cartao de debito'].map((method) => (
          <SmallChoice key={method} label={method.replace('Cartao de ', '')} active={payment === method} onPress={() => setPayment(method)} />
        ))}
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.muted}>Total da compra</Text>
          <Text style={styles.total}>R$ {total.toFixed(2)}</Text>
        </View>
        <Pressable style={styles.checkoutButton} onPress={checkout} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#111" /> : <Text style={styles.checkoutText}>Pagar</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionText}>{title}</Text>
      <Text style={styles.muted}>{subtitle}</Text>
    </View>
  );
}

function SmallChoice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.choice, active && styles.choiceActive]} onPress={onPress}>
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

function buildSeats(poltronas: unknown, capacidade: number) {
  if (Array.isArray(poltronas)) {
    const labels: string[] = [];
    poltronas.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) return;
      row.forEach((value, colIndex) => {
        if (value === 1 || value === true || value === '1' || value === 'livre') {
          labels.push(`${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`);
        }
      });
    });
    if (labels.length) return labels;
  }

  return Array.from({ length: capacidade }, (_, index) => {
    const row = Math.floor(index / 5);
    const col = (index % 5) + 1;
    return `${String.fromCharCode(65 + row)}${col}`;
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#090b0d',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  loading: {
    flex: 1,
    backgroundColor: '#090b0d',
    justifyContent: 'center',
  },
  hero: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253136',
    backgroundColor: '#11171a',
    padding: 16,
    gap: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  muted: {
    color: '#aeced2',
  },
  price: {
    color: '#7ef2ad',
    fontSize: 18,
    fontWeight: '900',
  },
  priceSmall: {
    color: '#7ef2ad',
    fontWeight: '800',
    marginTop: 4,
  },
  sectionTitle: {
    gap: 4,
    marginTop: 4,
  },
  sectionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seat: {
    width: 50,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d3b40',
    backgroundColor: '#10181b',
  },
  seatOccupied: {
    backgroundColor: '#39464b',
    opacity: 0.55,
  },
  seatSelected: {
    backgroundColor: '#ff8830',
    borderColor: '#ff8830',
  },
  seatText: {
    color: '#cbdcdf',
    fontWeight: '900',
  },
  seatTextSelected: {
    color: '#111',
  },
  ticketTypeRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253136',
    backgroundColor: '#11171a',
    padding: 12,
    gap: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  choice: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d3b40',
    paddingVertical: 10,
  },
  choiceActive: {
    backgroundColor: '#ff8830',
    borderColor: '#ff8830',
  },
  choiceText: {
    color: '#cbdcdf',
    fontWeight: '800',
    fontSize: 12,
  },
  choiceTextActive: {
    color: '#111',
  },
  comboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253136',
    backgroundColor: '#11171a',
    padding: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#203036',
  },
  stepText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  quantity: {
    color: '#fff',
    width: 20,
    textAlign: 'center',
    fontWeight: '900',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#131c1f',
    borderWidth: 1,
    borderColor: '#253136',
    padding: 16,
    marginTop: 4,
  },
  total: {
    color: '#7ef2ad',
    fontSize: 24,
    fontWeight: '900',
  },
  checkoutButton: {
    minWidth: 112,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#ff8830',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  checkoutText: {
    color: '#111',
    fontWeight: '900',
  },
});
