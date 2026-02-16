import { Text, View } from "react-native";
import type { Booking } from "../lib/types";
import { appStyles } from "../theme";
import { ActionButton } from "../components/ActionButton";

export function PartnerScreen({
  queue,
  onLoadQueue,
  onConfirmFirst,
  onStartFirst,
  onCompleteFirst
}: {
  queue: Booking[];
  onLoadQueue: () => void | Promise<void>;
  onConfirmFirst: () => void | Promise<void>;
  onStartFirst: () => void | Promise<void>;
  onCompleteFirst: () => void | Promise<void>;
}): React.ReactElement {
  return (
    <View style={appStyles.section}>
      <Text style={appStyles.sectionTitle}>Partner Mobile Core</Text>
      <View style={appStyles.row}>
        <ActionButton label="Load Queue" onPress={onLoadQueue} />
        <ActionButton label="Confirm First" onPress={onConfirmFirst} disabled={queue.length === 0} />
        <ActionButton label="Start First" onPress={onStartFirst} disabled={queue.length === 0} />
        <ActionButton label="Complete First" onPress={onCompleteFirst} disabled={queue.length === 0} />
      </View>
      {queue.slice(0, 6).map((booking) => (
        <View key={booking.id} style={appStyles.card}>
          <Text style={appStyles.cardTitle}>{booking.id}</Text>
          <Text style={appStyles.cardMeta}>Status: {booking.status}</Text>
          <Text style={appStyles.cardMeta}>Slot: {booking.slot_at}</Text>
        </View>
      ))}
    </View>
  );
}
