import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DataProvider, useData } from "@/context/DataContext";
import { colors } from "@/constants/theme";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isSeeded, isOnboarded } = useData();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isSeeded || isAuthenticated === null || isOnboarded === null) return;
    void SplashScreen.hideAsync();

    const inAuth = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    if (!isAuthenticated && !inAuth) {
      router.replace("/auth");
    } else if (isAuthenticated && !isOnboarded && !inOnboarding) {
      router.replace("/onboarding");
    } else if (isAuthenticated && isOnboarded && (inAuth || inOnboarding)) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isAuthenticated, isOnboarded, isSeeded, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal", title: "About" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DataProvider>
          <RootLayoutNav />
        </DataProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
