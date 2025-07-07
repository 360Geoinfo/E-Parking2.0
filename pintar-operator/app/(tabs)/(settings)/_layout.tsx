import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="settingsmenu"
        options={{
          headerShown: false,
          title: "Settings",
          headerStyle: {
            backgroundColor: "#2567ea",
          },
          headerTitleStyle: {
            color: "#fff",
            fontSize: 20,
          },
          headerBackButtonDisplayMode: "generic",
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}
