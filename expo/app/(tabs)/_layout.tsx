import { Tabs } from "expo-router";
import { LayoutDashboard, Calendar, FolderOpen, Pill, ArrowLeftRight } from "lucide-react-native";
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
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          tabBarIcon: ({ color, size }) => <Calendar size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "Records",
          tabBarIcon: ({ color, size }) => <FolderOpen size={size - 2} color={color} />,
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
        name="referrals"
        options={{
          title: "Referrals",
          tabBarIcon: ({ color, size }) => <ArrowLeftRight size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
