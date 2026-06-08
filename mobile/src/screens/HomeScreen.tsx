import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { listLocalTickets, syncPedidosToLocal } from '../services/localTickets';
import type { Filme, LocalTicket, Pedido, Sessao } from '../types';
import type { HomeScreenProps } from '../navigation';

type TabKey = 'filmes' | 'sessoes' | 'ingressos';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<TabKey>('sessoes');
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [tickets, setTickets] = useState<LocalTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [filmesResponse, sessoesResponse] = await Promise.all([
        api.get<Filme[]>('/filme'),
        api.get<Sessao[]>('/sessao'),
      ]);

      setFilmes(filmesResponse.data);
      setSessoes(sessoesResponse.data);

      try {
        const pedidosResponse = await api.get<Pedido[]>('/pedido/me');
        const synced = await syncPedidosToLocal(pedidosResponse.data);
        setTickets(synced);
      } catch {
        setTickets(await listLocalTickets());
      }
    } catch (err: any) {
      Alert.alert('Falha ao carregar', err.response?.data?.message || 'Confira a conexao com a API.');
      setTickets(await listLocalTickets());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Ola, {user?.nome}</Text>
          <Text style={styles.title}>CineWeb Mobile</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Sessoes" active={tab === 'sessoes'} onPress={() => setTab('sessoes')} />
        <TabButton label="Filmes" active={tab === 'filmes'} onPress={() => setTab('filmes')} />
        <TabButton label="Ingressos" active={tab === 'ingressos'} onPress={() => setTab('ingressos')} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#ff8830" size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#ff8830" />}
        >
          {tab === 'sessoes' && (
            <>
              {sessoes.length === 0 && <EmptyState text="Nenhuma sessao cadastrada no web ainda." />}
              {sessoes.map((sessao) => (
                <View key={sessao.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{sessao.filme?.titulo || 'Filme'}</Text>
                  <Text style={styles.muted}>{formatDate(sessao.data)} • Sala {sessao.sala?.numero}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.price}>R$ {Number(sessao.valorIngresso).toFixed(2)}</Text>
                    <Pressable style={styles.buyButton} onPress={() => navigation.navigate('Purchase', { sessao })}>
                      <Text style={styles.buyButtonText}>Comprar</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )}

          {tab === 'filmes' && (
            <>
              {filmes.length === 0 && <EmptyState text="Cadastre filmes no painel web para aparecerem aqui." />}
              {filmes.map((filme) => (
                <View key={filme.id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>{filme.titulo}</Text>
                    <Text style={styles.badge}>{filme.classificacaoEtaria}</Text>
                  </View>
                  <Text style={styles.muted}>{filme.genero?.nome || 'Genero'} • {filme.duracao} min</Text>
                  {!!filme.sinopse && <Text style={styles.description}>{filme.sinopse}</Text>}
                </View>
              ))}
            </>
          )}

          {tab === 'ingressos' && (
            <>
              <Pressable style={styles.syncButton} onPress={refresh}>
                <Text style={styles.syncButtonText}>Sincronizar ingressos</Text>
              </Pressable>
              {tickets.length === 0 && <EmptyState text="Suas compras aparecerao aqui e ficam salvas localmente." />}
              {tickets.map((ticket) => (
                <View key={ticket.pedidoId} style={styles.ticketCard}>
                  <Text style={styles.ticketCode}>{ticket.codigoComprovante}</Text>
                  <Text style={styles.cardTitle}>{ticket.filme}</Text>
                  <Text style={styles.muted}>{formatDate(ticket.dataSessao)} • {ticket.sala}</Text>
                  <Text style={styles.description}>Assentos: {ticket.assentos}</Text>
                  <Text style={styles.description}>Combos: {ticket.combos}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={styles.price}>R$ {Number(ticket.total).toFixed(2)}</Text>
                    <Text style={styles.synced}>{ticket.syncStatus === 'synced' ? 'Sincronizado' : 'Pendente'}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#aeced2',
    fontSize: 13,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  logoutButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d3b40',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#cbdcdf',
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#11171a',
    borderWidth: 1,
    borderColor: '#253136',
    paddingVertical: 11,
  },
  tabButtonActive: {
    backgroundColor: '#ff8830',
    borderColor: '#ff8830',
  },
  tabText: {
    color: '#cbdcdf',
    fontWeight: '800',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#111',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253136',
    backgroundColor: '#11171a',
    padding: 16,
    gap: 8,
  },
  ticketCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b4c51',
    backgroundColor: '#10181b',
    padding: 16,
    gap: 8,
  },
  ticketCode: {
    color: '#ff8830',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  muted: {
    color: '#aeced2',
  },
  description: {
    color: '#cbdcdf',
    lineHeight: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    color: '#7ef2ad',
    fontSize: 18,
    fontWeight: '900',
  },
  badge: {
    color: '#111',
    backgroundColor: '#cbdcdf',
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: '900',
  },
  buyButton: {
    borderRadius: 8,
    backgroundColor: '#ff8830',
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  buyButtonText: {
    color: '#111',
    fontWeight: '900',
  },
  syncButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff8830',
    alignItems: 'center',
    paddingVertical: 12,
  },
  syncButtonText: {
    color: '#ff8830',
    fontWeight: '900',
  },
  synced: {
    color: '#7ef2ad',
    fontWeight: '800',
  },
  empty: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253136',
    padding: 20,
    alignItems: 'center',
  },
});
