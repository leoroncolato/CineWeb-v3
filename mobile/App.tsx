import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PurchaseScreen } from './src/screens/PurchaseScreen';
import { ReceiptScreen } from './src/screens/ReceiptScreen';
import type { RootStackParamList } from './src/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#ff8830" size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AuthScreen />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <SafeAreaView style={styles.safeArea}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#090b0d' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '900' },
            contentStyle: { backgroundColor: '#090b0d' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CineWeb' }} />
          <Stack.Screen name="Purchase" component={PurchaseScreen} options={{ title: 'Comprar ingresso' }} />
          <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Comprovante' }} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090b0d',
  },
  loading: {
    flex: 1,
    backgroundColor: '#090b0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
