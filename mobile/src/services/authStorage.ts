import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '../types';

const TOKEN_KEY = 'cineweb_mobile_token';
const USER_KEY = 'cineweb_mobile_user';

export async function saveSession(token: string, user: AuthUser) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function loadSession() {
  const [token, userJson] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  return {
    token,
    user: userJson ? (JSON.parse(userJson) as AuthUser) : null,
  };
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
