import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { ExpoPushToken } from "expo-notifications";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "./AuthProvider";
import { router } from "expo-router";

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const { user, fetchUser } = useAuthContext();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const savePushToken = async (newToken: string | undefined) => {
    setExpoPushToken(newToken);

    if (!newToken || !user) return;

    console.log(newToken, user.id);

    try {
      await supabase
        .from("users")
        .update({ token: newToken })
        .eq("id", user.id);
      fetchUser();
    } catch (err) {
      console.error("Error savePushToken:", err);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log("token", token);
      savePushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
        console.log(response.notification.request.content.data.url);
        const url = response.notification.request.content.data.url;
        if (url) {
          router.push(url);
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  console.log("noti", notification);
  console.log("expoPushToken", expoPushToken);

  return <>{children}</>;
};

export default NotificationProvider;
