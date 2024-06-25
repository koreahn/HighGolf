import { Stack } from "expo-router";

const StatusLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="booking" options={{ headerShown: false }} />
      <Stack.Screen name="order" options={{ headerShown: false }} />
    </Stack>
  );
};

export default StatusLayout;
