import { SocketProvider, useSocket } from "@/context/socket";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, SafeAreaView, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";

function LayoutContent() {
  const { operatorData, zone, isLoadingStorage } = useSocket();

  if (isLoadingStorage) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  const isLoggedIn = !!operatorData?.USERID && !!zone?.CODE;
  console.log("LayoutContent isLoggedIn:", isLoggedIn);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#2567ea",
        paddingTop: Platform.OS === "android" ? 0 : 35,
        marginBottom: Platform.OS === "android" ? 0 : -35,
        marginTop: Platform.OS === "android" ? 0 : -50,
      }}
    >
      <StatusBar style={"light"} />
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn && <Stack.Screen name="frontScreen" />}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SocketProvider>
      <PaperProvider>
        <LayoutContent />
      </PaperProvider>
    </SocketProvider>
  );
}
