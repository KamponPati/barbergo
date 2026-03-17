import { Pressable, Text } from "react-native";
import { appStyles } from "../theme";

export function ActionButton({
  label,
  onPress,
  disabled
}: {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <Pressable
      onPress={() => void onPress()}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      accessibilityLabel={label}
      style={({ pressed }) => [appStyles.btn, appStyles.btnPrimary, pressed && appStyles.btnDisabled, disabled && appStyles.btnDisabled]}
    >
      <Text style={appStyles.btnText}>{label}</Text>
    </Pressable>
  );
}
