import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Pedido, Sessao } from './types';

export type RootStackParamList = {
  Home: undefined;
  Purchase: { sessao: Sessao };
  Receipt: { pedido: Pedido };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type PurchaseScreenProps = NativeStackScreenProps<RootStackParamList, 'Purchase'>;
export type ReceiptScreenProps = NativeStackScreenProps<RootStackParamList, 'Receipt'>;
