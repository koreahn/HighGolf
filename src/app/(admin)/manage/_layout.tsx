import { Stack } from "expo-router";

export default function ManageStack() {
  return (
    <Stack>
      <Stack.Screen name="menus" options={{ headerShown: false }} />
      <Stack.Screen name="manageMenu" options={{ headerShown: false }} />
      <Stack.Screen name="stdData" options={{ headerShown: false }} />
      <Stack.Screen name="memberships" options={{ headerShown: false }} />
      <Stack.Screen name="manageMbr" options={{ headerShown: false }} />
      <Stack.Screen name="facilities" options={{ headerShown: false }} />
      <Stack.Screen name="manageFacility" options={{ headerShown: false }} />
      <Stack.Screen name="approvals" options={{ headerShown: false }} />
    </Stack>
  );
}
