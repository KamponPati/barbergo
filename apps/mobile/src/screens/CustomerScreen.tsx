import { Pressable, Text, TextInput, View } from "react-native";
import type { Booking, Shop } from "../lib/types";
import { appStyles } from "../theme";
import { ActionButton } from "../components/ActionButton";

export function CustomerScreen({
  search,
  setSearch,
  filteredShops,
  selectedShopId,
  setSelectedShopId,
  history,
  onLoadShops,
  onLoadDetail,
  onLoadAvailability,
  onQuoteCheckout,
  onLoadHistory
  ,
  onPostService,
  onCreateDispute
}: {
  search: string;
  setSearch: (value: string) => void;
  filteredShops: Shop[];
  selectedShopId: string;
  setSelectedShopId: (value: string) => void;
  history: Booking[];
  onLoadShops: () => void | Promise<void>;
  onLoadDetail: () => void | Promise<void>;
  onLoadAvailability: () => void | Promise<void>;
  onQuoteCheckout: () => void | Promise<void>;
  onLoadHistory: () => void | Promise<void>;
  onPostService: () => void | Promise<void>;
  onCreateDispute: () => void | Promise<void>;
}): React.ReactElement {
  return (
    <View style={appStyles.section}>
      <Text style={appStyles.sectionTitle}>Customer Mobile Core</Text>
      <TextInput
        style={appStyles.input}
        value={search}
        onChangeText={setSearch}
        placeholder="Search shops"
        placeholderTextColor="#64748b"
      />
      <View style={appStyles.pillRow}>
        {filteredShops.slice(0, 8).map((shop) => (
          <Pressable
            key={shop.id}
            style={[appStyles.pill, shop.id === selectedShopId && appStyles.pillActive]}
            onPress={() => setSelectedShopId(shop.id)}
          >
            <Text style={appStyles.pillText}>{shop.name}</Text>
          </Pressable>
        ))}
      </View>
      <View style={appStyles.row}>
        <ActionButton label="Load Shops" onPress={onLoadShops} />
        <ActionButton label="Shop Detail" onPress={onLoadDetail} disabled={!selectedShopId} />
        <ActionButton label="Availability" onPress={onLoadAvailability} disabled={!selectedShopId} />
        <ActionButton label="Quote + Checkout" onPress={onQuoteCheckout} disabled={!selectedShopId} />
        <ActionButton label="History" onPress={onLoadHistory} />
        <ActionButton label="Post Service" onPress={onPostService} disabled={history.length === 0} />
        <ActionButton label="Create Dispute" onPress={onCreateDispute} disabled={history.length === 0} />
      </View>
      {history.slice(0, 5).map((booking) => (
        <View key={booking.id} style={appStyles.card}>
          <Text style={appStyles.cardTitle}>{booking.id}</Text>
          <Text style={appStyles.cardMeta}>{booking.status}</Text>
          <Text style={appStyles.cardMeta}>{booking.amount} THB</Text>
        </View>
      ))}
    </View>
  );
}
