import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { FontAwesome6 } from "@expo/vector-icons";
import OTPSplash from "../assets/otpSplash.png";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OTPScreen = ({ navigation }) => {
  const { SERVER_API } = useAuth();
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(30000); // 30s default
  const [canResend, setCanResend] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [receivingEmail, setReceivingEmail] = useState(email || "");
  const [emailInput, setEmailInput] = useState("");
  const verifyOTP = async (otp) => {
    console.log("Verifying OTP:", otp);
    
    try {
      const response = await axios.post(`${SERVER_API}/verifyOTP`, {
        email: receivingEmail,
        inputOTP: otp,
      });
      if (response.status === 201 || response.status === 202) {
        console.log("response Data:", response.data);
        Alert.alert("Pengesahan Berjaya", "OTP anda telah disahkan.", [
          { text: "OK", onPress: () => navigation.replace("Login") },
        ]);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert(
        "Pengesahan Gagal",
        "Terdapat ralat semasa mengesahkan OTP. Sila cuba lagi.",
        [
          {
            text: "OK",
            onPress: () => {
              setOtpDigits(["", "", "", "", "", ""]);

              inputsRef.current[0]?.focus();
            },
          },
        ]
      );
      return;
    }
  };
  const handleFindOTP = async () => {
    if (!emailInput && !receivingEmail) {
      alert("Sila masukkan alamat e-mel anda.");
      return;
    }
    try {
      const response = await axios.post(`${SERVER_API}/fetchOTP`, {
        email: emailInput || receivingEmail,
      });
      if (response.status === 200) {
        setReceivingEmail(emailInput || receivingEmail);
        setEmailInput("");
        setCanResend(false);
        setCountdown(response.data.expiresAt - Date.now());
      }
    } catch (error) {
      alert("Tidak ada OTP bagi alamat e-mel ini.");
      return;
    }
  };
  const handleRenewOTP = async () => {
    if (!receivingEmail) {
      alert("Sila masukkan alamat e-mel anda terlebih dahulu.");
      return;
    }
    try {
      const response = await axios.post(`${SERVER_API}/renewOTP`, {
        email: receivingEmail,
      });
      if (response.status !== 200) {
        alert("Gagal menghantar semula OTP: " + response.message);
        return;
      }
    } catch (error) {
      console.error("Error renewing OTP:", error);
      alert("Gagal menghantar semula OTP. Sila cuba lagi.");
      return;
    }
  };
  // Start/resume countdown timer
  useEffect(() => {
    let interval;

    if (receivingEmail && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [receivingEmail, countdown]);
  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("email");
      setEmail(storedEmail);
    };
    fetchEmail();
  }, []);
  useEffect(() => {
    const otp = otpDigits.join("");
    console.log("Current OTP:", otp);
    
    if (otp.length === 6 && receivingEmail) {
      verifyOTP(otp);
    }
  }, [otpDigits, receivingEmail]);

  return (
    <KeyboardAvoidingView
      style={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Login")}
        >
          <FontAwesome6 name="arrow-left" size={24} color="#0B477B" />
        </TouchableOpacity>
        <Text style={styles.title}>Pengesahan OTP</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Image */}
      <Image source={OTPSplash} style={styles.otpImage} resizeMode="contain" />

      {/* Email Input or OTP Info */}
      {receivingEmail ? (
        <>
          <Text style={styles.infoText}>
            Kami telah mengirimkan kod pengesahan OTP 6 digit ke e-mel
          </Text>
          <Text style={styles.emailText}>{receivingEmail}</Text>
        </>
      ) : (
        <>
          <Text style={styles.infoText}>
            Sila masukkan alamat e-mel anda untuk menerima kod OTP
          </Text>
          <TextInput
            style={styles.emailInput}
            placeholder="Masukkan e-mel anda"
            value={emailInput}
            onChangeText={(text) => setEmailInput(text.trim())}
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={handleFindOTP}
          />
        </>
      )}

      {receivingEmail && (
        <>
          <Text style={styles.instructionText}>
            Masukkan kod OTP tersebut di bawah ini.
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => {
                  const newOtp = [...otpDigits];
                  newOtp[index] = text;
                  setOtpDigits(newOtp);
                  if (text && index < 5) inputsRef.current[index + 1]?.focus();
                  if (!text && index > 0) inputsRef.current[index - 1]?.focus();
                }}
              />
            ))}
          </View>

          {/* Countdown / Resend */}
          {!canResend ? (
            <Text style={styles.resendText}>
              Kirim lagi kod OTP dalam {Math.ceil(countdown / 1000)} saat
            </Text>
          ) : (
            <TouchableOpacity onPress={handleRenewOTP}>
              <Text
                style={[
                  styles.resendText,
                  { color: "#0B477B", fontWeight: "bold" },
                ]}
              >
                Hantar semula kod OTP
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Confirm Button (Optional) */}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          { opacity: otpDigits.join("").length === 6 ? 1 : 0.5 },
        ]}
        disabled={otpDigits.join("").length !== 6}
        onPress={() => {
          const otp = otpDigits.join("");
          if (otp.length === 6) {
            verifyOTP(otp);
          }
        }}
      >
        <Text style={styles.confirmButtonText}>Sahkan Kod</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#EAF6FF",
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B477B",
    textAlign: "center",
    flex: 1,
  },
  otpImage: {
    width: 180,
    height: 130,
    marginVertical: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    color: "#0B477B",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#0B477B",
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#0B477B",
    textAlign: "center",
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resendText: {
    fontSize: 12,
    color: "#6C6C6C",
    textAlign: "center",
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: "#4F4F4F",
    borderRadius: 8,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emailInput: {
    backgroundColor: "#ffffff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
  },
});

export default OTPScreen;
