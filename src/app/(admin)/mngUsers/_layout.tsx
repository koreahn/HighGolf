import { Stack } from "expo-router";

const UserLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="users" options={{ headerShown: false }} />
      <Stack.Screen name="manageUser" options={{ headerShown: false }} />
      <Stack.Screen name="regMbr" options={{ headerShown: false }} />
    </Stack>
  );
};

export default UserLayout;
