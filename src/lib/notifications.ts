import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
async function sendPushNotification(
  // expoPushToken: Notifications.ExpoPushToken,
  expoPushToken: string,
  title: string,
  body: string,
  url: string
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: { url: url },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      })
    ).data;
  } else {
    // alert("Must use physical device for Push Notifications");
  }

  return token;
}

const getUserToken = async (user_id: number) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("token")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error fetching user token:", error);
      return null;
    }

    return data?.token ?? null;
  } catch (err) {
    console.error("Error savePushToken:", err);
    return null;
  }
};

const getTokens = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("token")
      .in("user_type", ["DIRECTOR", "ADMIN"]);

    if (error) {
      console.error("Error fetching tokens:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error savePushToken:", err);
    return [];
  }
};

export const sendPushNotificationToUser = async (
  title: string,
  body: string,
  url: string,
  user_id?: number
) => {
  let token: string | null = null;
  let tokens: { token: string | null }[] = [];

  if (user_id) {
    token = await getUserToken(user_id);
  } else {
    tokens = await getTokens();
  }

  if (user_id) {
    if (token) sendPushNotification(token, title, body, url);
  } else {
    for (const { token } of tokens) {
      if (token) {
        sendPushNotification(token, title, body, url);
      }
    }
  }
};
