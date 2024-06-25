import { Redirect, Stack } from "expo-router";
import { useAuthContext } from "@/providers/AuthProvider";

export default function AdminLayout() {
  const { session, isAdmin } = useAuthContext();

  if (!session || !isAdmin) {
    return <Redirect href={"/"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
