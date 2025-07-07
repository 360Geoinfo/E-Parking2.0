import LoginScreen from "@/components/login";
import ResetPasswordScreen from "@/components/resetPassword";
import ZoneSelectionScreen from "@/components/zoneSelection";
import { useSocket } from "@/context/socket";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FrontScreen() {
  const { logout, operatorData, attendanceData, requireReset } = useSocket();
  const router = useRouter();
  const [showResetPassword, setShowResetPassword] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!hasRedirected.current && operatorData && attendanceData) {
      const timeout = setTimeout(() => {
        hasRedirected.current = true; // prevent future redirects
        router.replace("/(tabs)/(home)/main");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [attendanceData, operatorData]);

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
          source={require("../assets/images/splash-icon.png")}
          style={{ width: 250, height: 250, marginBottom: 20 }}
        />
        {!operatorData ? (
          showResetPassword ? (
            <ResetPasswordScreen
              showResetPassword={showResetPassword}
              setShowResetPassword={setShowResetPassword}
            />
          ) : (
            <LoginScreen setShowResetPassword={setShowResetPassword} />
          )
        ) : requireReset ? (
          <ResetPasswordScreen
            showResetPassword={showResetPassword}
            setShowResetPassword={setShowResetPassword}
          />
        ) : !attendanceData ? (
          <>
            <ZoneSelectionScreen />
            <TouchableOpacity onPress={() => logout()}>
              <Text style={{ color: "#2567ea", fontSize: 16 }}>Log Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text>You Will be redirected to the home screen shortly.</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
