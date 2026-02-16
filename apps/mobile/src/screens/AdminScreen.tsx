import { Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { appStyles } from "../theme";

export function AdminScreen({
  snapshot,
  onLoadSnapshot
}: {
  snapshot: Record<string, unknown> | null;
  onLoadSnapshot: () => void | Promise<void>;
}): React.ReactElement {
  return (
    <View style={appStyles.section}>
      <Text style={appStyles.sectionTitle}>Admin Mobile Core</Text>
      <View style={appStyles.row}>
        <ActionButton label="Load Snapshot" onPress={onLoadSnapshot} />
      </View>
      <View style={appStyles.codeWrap}>
        <Text style={appStyles.code}>{JSON.stringify(snapshot ?? { empty: true }, null, 2)}</Text>
      </View>
    </View>
  );
}
