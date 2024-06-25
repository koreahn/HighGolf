import { Stack } from "expo-router";

export default function BookStack() {
  return (
    <Stack>
      <Stack.Screen name="practice" options={{ headerShown: false }} />
      <Stack.Screen name="screen" options={{ headerShown: false }} />
      <Stack.Screen name="lesson" options={{ headerShown: false }} />
    </Stack>
  );
}
