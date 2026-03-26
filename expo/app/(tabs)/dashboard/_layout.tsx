import { Stack } from "expo-router";
import React from "react";
import { colors } from "@/constants/theme";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
