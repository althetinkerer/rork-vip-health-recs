import { Stack } from "expo-router";
import React from "react";
import { colors } from "@/constants/theme";

export default function AppointmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Appointments" }} />
      <Stack.Screen name="[id]" options={{ title: "Details" }} />
      <Stack.Screen name="create" options={{ title: "Book Appointment", presentation: "modal" }} />
    </Stack>
  );
}
