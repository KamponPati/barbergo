import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "barbergo_access_token";
const ROLE_KEY  = "barbergo_role";
const USER_KEY  = "barbergo_user_id";

export const storage = {
  async saveAuth(token: string, role: string, userId: string) {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(ROLE_KEY, role),
      SecureStore.setItemAsync(USER_KEY, userId),
    ]);
  },

  async loadAuth(): Promise<{ token: string; role: string; userId: string } | null> {
    const [token, role, userId] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(ROLE_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);
    if (!token || !role || !userId) return null;
    return { token, role, userId };
  },

  async clearAuth() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(ROLE_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
};
