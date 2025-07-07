import { useSocket } from "@/context/socket";
import { MaterialIcons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { useEffect } from "react";

export default function TabLayout() {
  const { operatorData, zone } = useSocket();
  useEffect(() => {
    if (!operatorData?.USERID) {
      // Redirect to front screen if not logged in
      router.replace("../frontScreen");
    }
  }, []);
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Uncomment the following line to enable tab bar */}
      {/* <Tabs.TabBar /> */}
      <Tabs.Screen
        name="(index)"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
