import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
// import { useColorScheme } from "@components/useColorScheme";
import CommDataProvider from "@/providers/CommDataProvider";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import { StatusBar } from "expo-status-bar";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <QueryProvider>
          <NotificationProvider>
            <CommDataProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                    headerLeft: undefined,
                  }}
                />
                <Stack.Screen
                  name="(user)"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                    headerLeft: undefined,
                  }}
                />
                <Stack.Screen
                  name="(admin)"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                    headerLeft: undefined,
                  }}
                />
                <Stack.Screen name="account" />
              </Stack>
              <StatusBar hidden={false} style="dark" />
            </CommDataProvider>
          </NotificationProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
