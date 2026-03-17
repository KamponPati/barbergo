import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface PartnerState {
  partnerId: string;
  shopId:    string;
  isOnline:  boolean;
  setIds:    (partnerId: string, shopId: string) => void;
  toggleOnline: () => Promise<void>;
}

const ONLINE_KEY = "barbergo_partner_online";

export const usePartnerStore = create<PartnerState>((set, get) => ({
  partnerId: "partner_1",
  shopId:    "shop_1",
  isOnline:  false,

  setIds: (partnerId, shopId) => set({ partnerId, shopId }),

  toggleOnline: async () => {
    const next = !get().isOnline;
    set({ isOnline: next });
    await SecureStore.setItemAsync(ONLINE_KEY, next ? "1" : "0");
  },
}));

export async function hydratePartnerOnline() {
  const val = await SecureStore.getItemAsync(ONLINE_KEY);
  usePartnerStore.setState({ isOnline: val === "1" });
}
