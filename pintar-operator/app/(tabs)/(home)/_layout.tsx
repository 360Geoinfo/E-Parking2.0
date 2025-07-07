import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="main" options={{ title: "" }} />
      <Stack.Screen name="lprCamera" options={{ title: "LPR Camera" }} />
      <Stack.Screen
        name="detail"
        options={{
          title: "Parking Detail",
          headerShown: true,
          headerBackVisible: true,
          headerBackTitle: "Back",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
