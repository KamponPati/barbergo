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
      style={({ pressed }) => [appStyles.button, pressed && appStyles.buttonPressed, disabled && appStyles.buttonDisabled]}
    >
      <Text style={appStyles.buttonText}>{label}</Text>
    </Pressable>
  );
}
