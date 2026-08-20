import axios from "axios";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "present_auth_token";

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://school.nuvotech.co.za/api/v1";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
