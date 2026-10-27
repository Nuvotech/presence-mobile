import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import Constants from "expo-constants";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null | undefined;

// Native modules expo-notifications (and its expo-application dependency)
// look up when the package is first imported.
const REQUIRED_NATIVE_MODULES = [
  "ExpoApplication",
  "ExpoPushTokenManager",
  "ExpoNotificationsEmitter",
  "ExpoNotificationsHandlerModule",
  "ExpoNotificationPermissionsModule",
  "ExpoNotificationChannelManager",
  ...(Platform.OS === "android" ? ["ExpoTopicSubscriptionModule"] : []),
];

/**
 * Load expo-notifications lazily, and only when this native build actually
 * contains its native modules. On a build without them (an older dev build,
 * Expo Go) importing it fails at load time — and in development Metro reports
 * that straight to the red error screen rather than throwing it, so a
 * try/catch can't contain it. Push is optional: without it the app runs and
 * the inbox still works.
 */
function loadNotifications(): NotificationsModule | null {
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  const missing = REQUIRED_NATIVE_MODULES.filter(
    (name) => requireOptionalNativeModule(name) === null,
  );

  if (missing.length > 0) {
    console.warn(
      `Push notifications unavailable in this build (missing native modules: ${missing.join(", ")}). Rebuild the app to enable push.`,
    );
    notificationsModule = null;
    return null;
  }

  try {
    const Notifications = require("expo-notifications") as NotificationsModule;

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

    notificationsModule = Notifications;
  } catch (error) {
    console.warn("Push notifications unavailable in this build:", error);
    notificationsModule = null;
  }

  return notificationsModule;
}

/**
 * Ask for permission and return this device's Expo push token, or null when
 * permission is denied or the device can't receive remote pushes (simulators,
 * Expo Go on Android, builds without the native module). Never throws — push
 * is a bonus on top of the inbox.
 */
export async function getExpoPushToken(): Promise<string | null> {
  const Notifications = loadNotifications();
  if (!Notifications) {
    return null;
  }

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

/**
 * Listen for pushes arriving while the app is open and for taps on a push.
 * Returns an unsubscribe function (a no-op when push isn't available).
 */
export function subscribeToPushEvents(handlers: {
  onReceived: () => void;
  onTapped: () => void;
}): () => void {
  const Notifications = loadNotifications();
  if (!Notifications) {
    return () => {};
  }

  const received = Notifications.addNotificationReceivedListener(handlers.onReceived);
  const tapped = Notifications.addNotificationResponseReceivedListener(handlers.onTapped);

  return () => {
    received.remove();
    tapped.remove();
  };
}
