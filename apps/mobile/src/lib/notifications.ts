import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

// Show in-app banners when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
  }),
});

// ── Register for push token ────────────────────────────────────────────────────
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const pushToken = await Notifications.getExpoPushTokenAsync();
    return pushToken.data ?? null;
  } catch {
    return null;
  }
}

// ── Subscribe to foreground notifications (in-app toast) ──────────────────────
export function subscribeToForegroundNotifications(
  onNavigate?: (bookingId: string) => void
): () => void {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    const { title, body, data } = notification.request.content;
    // Show simple Alert as in-app toast (replace with a toast lib later)
    Alert.alert(title ?? "BarberGo", body ?? "", [
      { text: "ปิด", style: "cancel" },
      ...(data?.booking_id
        ? [{ text: "ดูรายละเอียด", onPress: () => onNavigate?.(data.booking_id as string) }]
        : []),
    ]);
  });
  return () => sub.remove();
}

// ── Subscribe to notification-tap (background / killed → navigate) ─────────────
export function subscribeToNotificationResponse(
  onNavigate: (bookingId: string) => void
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.booking_id) {
      onNavigate(data.booking_id as string);
    }
  });
  return () => sub.remove();
}
