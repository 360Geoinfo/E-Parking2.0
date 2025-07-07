import { useSocket } from "@/context/socket";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const { operatorData, attendanceData } = useSocket();

  const isLoading = operatorData === undefined || attendanceData === undefined;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2567ea" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "#f0f8ff",
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          tabBarLabel: "Settings",
        }}
      />
    </Tabs>
  );
}
