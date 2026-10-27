import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// Show pushes as a banner even while the app is open — the parent inbox
// refreshes itself from the same event.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Ask for permission and return this device's Expo push token, or null when
 * permission is denied or the device can't receive remote pushes (simulators,
 * Expo Go on Android). Never throws — push is a bonus on top of the inbox.
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    if (Platform.OS === "android") {
      // Must exist before requesting a token on Android 13+.
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    const status =
      existing === "granted"
        ? existing
        : (await Notifications.requestPermissionsAsync()).status;

    if (status !== "granted") {
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch {
    return null;
  }
}
