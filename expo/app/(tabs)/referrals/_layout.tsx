import { Stack } from "expo-router";
import React from "react";
import { colors } from "@/constants/theme";

export default function ReferralsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Referrals" }} />
      <Stack.Screen name="[id]" options={{ title: "Referral Details" }} />
      <Stack.Screen name="create" options={{ title: "New Referral", presentation: "modal" }} />
    </Stack>
  );
}
