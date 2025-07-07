import { SocketProvider } from "@/context/socket";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <SocketProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#2567ea" },
          headerTitleStyle: { color: "#fff", fontSize: 20 },
          headerBackVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="(tabs)" options={{ title: "" }} />
      </Stack>
    </SocketProvider>
  );
}
