import { Text, View } from "react-native";
import { appStyles } from "../theme";

export function StatTile({ label, value }: { label: string; value: string | number }): React.ReactElement {
  return (
    <View style={appStyles.statTile}>
      <Text style={appStyles.statLabel}>{label}</Text>
      <Text style={appStyles.statValue}>{value}</Text>
    </View>
  );
}
