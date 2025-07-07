import LoginScreen from "@/components/login";
import ZoneSelectionScreen from "@/components/zoneSelection";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { useSocket } from "../context/socket";

export default function IndexScreen() {
  const { operatorData, isLoadingStorage, zone, refresh, setRefresh } =
    useSocket();
  const [showLogin, setShowLogin] = useState(false);
  const [showZoneSelection, setShowZoneSelection] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!isLoadingStorage || refresh) {
        if (operatorData?.USERID) {
          if (zone?.CODE) {
            router.push("(tabs)"); // ✅ navigate to main screen if zone is set
            return;
          }
          setShowLogin(false); // ✅ navigate to main screen
          setShowZoneSelection(true);
          setRefresh(false); // ✅ reset refresh state
        } else {
          setShowLogin(true);
        }
      }
    }, [isLoadingStorage, operatorData, zone, refresh])
  );

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#2567ea",
        paddingVertical: 10,
        paddingHorizontal: 30,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          alignItems: "center",
          marginBottom: 20,
          backgroundColor: "white",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <Image
          source={require("../assets/images/verticalLogo.png")}
          style={{ width: 250, height: 250, marginBottom: 20 }}
        />
        {isLoadingStorage ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : !operatorData ? (
          <LoginScreen setShowLogin={setShowLogin} />
        ) : showZoneSelection ? (
          <>
            <View
              style={{
                alignItems: "center",
                marginBottom: 20,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: "black",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Welcome
              </Text>
              {/* <Text
                style={{
                  color: "black",
                  fontSize: 20,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {operatorData?.USERNAME || operatorData?.EMAIL}
              </Text> */}
            </View>
            <ZoneSelectionScreen setShowZoneSelection={setShowZoneSelection} />
          </>
        ) : (
          <Text style={{ color: "black", fontSize: 18 }}>Logging in...</Text>
        )}
        {/* <View
          style={{
            alignItems: "center",
            marginBottom: 20,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {operatorData?.USERID && (
            <>
              <Text
                style={{ color: "black", fontSize: 16, textAlign: "center" }}
              >
                Welcome
              </Text>
              <Text
                style={{
                  color: "black",
                  fontSize: 20,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {operatorData.USERNAME || operatorData.EMAIL}
              </Text>
            </>
          )}
        </View>
        {isLoadingStorage ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : showLogin ? (
          <LoginScreen />
        ) : showZoneSelection ? (
          <ZoneSelectionScreen />
        ) : (
          <Text style={{ color: "black", fontSize: 18 }}>Logging in...</Text>
        )} */}
      </View>
    </KeyboardAvoidingView>
  );
}
