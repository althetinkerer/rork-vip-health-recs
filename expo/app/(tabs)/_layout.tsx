import { Tabs } from "expo-router";
import { Home, FileText, Pill, Activity } from "lucide-react-native";
import React from "react";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ledger"
        options={{
          title: "Ledger",
          tabBarIcon: ({ color, size }) => <FileText size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Meds",
          tabBarIcon: ({ color, size }) => <Pill size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "Health",
          tabBarIcon: ({ color, size }) => <Activity size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="referrals"
        options={{ href: null }}
      />
    </Tabs>
  );
}
