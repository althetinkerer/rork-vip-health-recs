import { Stack } from "expo-router";
import React from "react";
import { colors } from "@/constants/theme";

export default function RecordsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Health Records" }} />
      <Stack.Screen name="[id]" options={{ title: "Record Details" }} />
    </Stack>
  );
}
