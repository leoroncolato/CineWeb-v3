import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_URL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'forgot';

export function AuthScreen() {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(nome.trim(), email.trim(), senha);
      } else if (mode === 'forgot') {
        if (resetToken) {
          await resetPassword(resetToken.trim(), senha);
          Alert.alert('Senha atualizada', 'Entre novamente com sua nova senha.');
          setMode('login');
          setResetToken('');
          setSenha('');
        } else {
          const token = await forgotPassword(email.trim());
          if (token) setResetToken(token);
          Alert.alert('Recuperacao', token ? `Token gerado: ${token}` : 'Se o e-mail existir, um token foi gerado.');
        }
      } else {
        await login(email.trim(), senha);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Nao foi possivel concluir a acao.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
      <View style={styles.panel}>
        <Text style={styles.logo}>CineWeb</Text>
        <Text style={styles.subtitle}>Ingressos, combos e comprovantes sincronizados</Text>

        <View style={styles.segment}>
          <SegmentButton label="Entrar" active={mode === 'login'} onPress={() => setMode('login')} />
          <SegmentButton label="Criar conta" active={mode === 'register'} onPress={() => setMode('register')} />
          <SegmentButton label="Senha" active={mode === 'forgot'} onPress={() => setMode('forgot')} />
        </View>

        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#8a9ba0"
            value={nome}
            onChangeText={setNome}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#8a9ba0"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {mode === 'forgot' && resetToken ? (
          <TextInput
            style={styles.input}
            placeholder="Token de recuperacao"
            placeholderTextColor="#8a9ba0"
            value={resetToken}
            onChangeText={setResetToken}
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder={mode === 'forgot' && resetToken ? 'Nova senha' : 'Senha'}
          placeholderTextColor="#8a9ba0"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Pressable style={styles.primaryButton} onPress={submit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === 'register' ? 'Registrar' : mode === 'forgot' ? (resetToken ? 'Redefinir senha' : 'Gerar token') : 'Entrar'}
            </Text>
          )}
        </Pressable>

        <Text style={styles.apiHint}>API: {API_URL}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#090b0d',
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    gap: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#253136',
    backgroundColor: '#11171a',
    padding: 22,
  },
  logo: {
    color: '#ff8830',
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbdcdf',
    fontSize: 15,
    marginBottom: 8,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d3b40',
    paddingVertical: 10,
  },
  segmentButtonActive: {
    backgroundColor: '#ff8830',
    borderColor: '#ff8830',
  },
  segmentText: {
    color: '#cbdcdf',
    fontWeight: '700',
    fontSize: 12,
  },
  segmentTextActive: {
    color: '#111',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2d3b40',
    backgroundColor: '#0c1113',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#ff8830',
    paddingVertical: 14,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#111',
    fontWeight: '800',
  },
  apiHint: {
    color: '#76898f',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
