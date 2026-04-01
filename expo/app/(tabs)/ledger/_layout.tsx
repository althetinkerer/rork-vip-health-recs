import { Stack } from "expo-router";
import React from "react";
import { colors } from "@/constants/theme";

export default function LedgerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
