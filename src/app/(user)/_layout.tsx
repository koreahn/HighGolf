import React from "react";
import { Redirect, Stack } from "expo-router";
import { useAuthContext } from "@/providers/AuthProvider";

export default function UserLayout() {
  const { session } = useAuthContext();
  if (!session) {
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
