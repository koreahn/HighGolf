import { Stack } from "expo-router";

export default function OrderStack() {
  return (
    <Stack>
      <Stack.Screen name="order" options={{ headerShown: false }} />
      <Stack.Screen name="orderStatus" options={{ headerShown: false }} />
    </Stack>
  );
}
