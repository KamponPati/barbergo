import { Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { appStyles } from "../theme";

export function AdminScreen({
  snapshot,
  disputes,
  policy,
  onLoadSnapshot,
  onLoadDisputes,
  onLoadPolicy
}: {
  snapshot: Record<string, unknown> | null;
  disputes: unknown;
  policy: unknown;
  onLoadSnapshot: () => void | Promise<void>;
  onLoadDisputes: () => void | Promise<void>;
  onLoadPolicy: () => void | Promise<void>;
}): React.ReactElement {
  return (
    <View style={appStyles.section}>
      <Text style={appStyles.sectionTitle}>Admin Mobile Core</Text>
      <View style={appStyles.row}>
        <ActionButton label="Load Snapshot" onPress={onLoadSnapshot} />
        <ActionButton label="Load Disputes" onPress={onLoadDisputes} />
        <ActionButton label="Load Policy" onPress={onLoadPolicy} />
      </View>
      <View style={appStyles.codeWrap}>
        <Text style={appStyles.code}>{JSON.stringify(snapshot ?? { empty: true }, null, 2)}</Text>
      </View>
      {disputes ? (
        <View style={appStyles.codeWrap}>
          <Text style={appStyles.code}>{JSON.stringify(disputes, null, 2)}</Text>
        </View>
      ) : null}
      {policy ? (
        <View style={appStyles.codeWrap}>
          <Text style={appStyles.code}>{JSON.stringify(policy, null, 2)}</Text>
        </View>
      ) : null}
    </View>
  );
}
