import { Text, View } from "react-native";
import type { Booking } from "../lib/types";
import { appStyles } from "../theme";
import { ActionButton } from "../components/ActionButton";

export function PartnerScreen({
  queue,
  onboardingStatus,
  walletSummary,
  onLoadQueue,
  onConfirmFirst,
  onStartFirst,
  onCompleteFirst,
  onStartOnboarding,
  onLoadOnboardingStatus,
  onCreateBranch,
  onCreateService,
  onCreateStaff,
  onLoadWallet,
  onWithdraw
}: {
  queue: Booking[];
  onboardingStatus: unknown;
  walletSummary: unknown;
  onLoadQueue: () => void | Promise<void>;
  onConfirmFirst: () => void | Promise<void>;
  onStartFirst: () => void | Promise<void>;
  onCompleteFirst: () => void | Promise<void>;
  onStartOnboarding: () => void | Promise<void>;
  onLoadOnboardingStatus: () => void | Promise<void>;
  onCreateBranch: () => void | Promise<void>;
  onCreateService: () => void | Promise<void>;
  onCreateStaff: () => void | Promise<void>;
  onLoadWallet: () => void | Promise<void>;
  onWithdraw: () => void | Promise<void>;
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
      <View style={appStyles.row}>
        <ActionButton label="Start Onboarding" onPress={onStartOnboarding} />
        <ActionButton label="Onboarding Status" onPress={onLoadOnboardingStatus} />
        <ActionButton label="Create Branch" onPress={onCreateBranch} />
        <ActionButton label="Create Service" onPress={onCreateService} />
        <ActionButton label="Create Staff" onPress={onCreateStaff} />
        <ActionButton label="Wallet" onPress={onLoadWallet} />
        <ActionButton label="Withdraw" onPress={onWithdraw} />
      </View>
      {onboardingStatus ? (
        <View style={appStyles.codeWrap}>
          <Text style={appStyles.code}>{JSON.stringify(onboardingStatus, null, 2)}</Text>
        </View>
      ) : null}
      {walletSummary ? (
        <View style={appStyles.codeWrap}>
          <Text style={appStyles.code}>{JSON.stringify(walletSummary, null, 2)}</Text>
        </View>
      ) : null}
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
