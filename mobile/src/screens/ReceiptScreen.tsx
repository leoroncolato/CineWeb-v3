import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReceiptScreenProps } from '../navigation';

export function ReceiptScreen({ route, navigation }: ReceiptScreenProps) {
  const { pedido } = route.params;
  const primeiroIngresso = pedido.ingressos?.[0];
  const sessao = primeiroIngresso?.sessao;
  const combos = pedido.combos || [];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.receipt}>
        <Text style={styles.label}>Comprovante emitido</Text>
        <Text style={styles.code}>{pedido.codigoComprovante}</Text>

        <View style={styles.divider} />

        <Text style={styles.title}>{sessao?.filme?.titulo || 'Filme'}</Text>
        <Text style={styles.muted}>{sessao?.data ? formatDate(sessao.data) : formatDate(pedido.dataHora)}</Text>
        <Text style={styles.muted}>{sessao?.sala ? `Sala ${sessao.sala.numero}` : 'Sala'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingressos</Text>
          {pedido.ingressos?.map((ingresso) => (
            <View key={ingresso.id} style={styles.line}>
              <Text style={styles.lineText}>{ingresso.assento || 'S/A'} • {ingresso.tipo}</Text>
              <Text style={styles.lineText}>R$ {Number(ingresso.valorPago).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combos</Text>
          {combos.length === 0 ? (
            <Text style={styles.muted}>Sem combos</Text>
          ) : combos.map((combo) => (
            <View key={combo.lancheComboId} style={styles.line}>
              <Text style={styles.lineText}>{combo.quantidade}x {combo.nome}</Text>
              <Text style={styles.lineText}>R$ {Number(combo.subtotal).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.line}>
          <Text style={styles.sectionTitle}>Pagamento</Text>
          <Text style={styles.lineText}>{pedido.formaPagamento}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Text style={styles.status}>{pedido.statusPagamento}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>R$ {Number(pedido.valorTotal).toFixed(2)}</Text>
        </View>
      </View>

      <Pressable style={styles.button} onPress={() => navigation.popToTop()}>
        <Text style={styles.buttonText}>Ver meus ingressos</Text>
      </Pressable>
    </ScrollView>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
    gap: 16,
  },
  receipt: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253136',
    backgroundColor: '#11171a',
    padding: 18,
    gap: 12,
  },
  label: {
    color: '#aeced2',
    textTransform: 'uppercase',
    fontWeight: '900',
    fontSize: 12,
  },
  code: {
    color: '#ff8830',
    fontSize: 28,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#253136',
    marginVertical: 4,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  muted: {
    color: '#aeced2',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '900',
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  lineText: {
    color: '#cbdcdf',
    flexShrink: 1,
  },
  status: {
    color: '#7ef2ad',
    fontWeight: '900',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  total: {
    color: '#7ef2ad',
    fontSize: 22,
    fontWeight: '900',
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#ff8830',
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#111',
    fontWeight: '900',
  },
});
