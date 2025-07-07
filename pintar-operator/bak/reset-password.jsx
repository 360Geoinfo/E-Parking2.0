import { KeyboardAvoidingView } from "react-native";
import { TextInput, Button, Platform } from "react-native";

export default function ResetPasswordScreen() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TextInput
        placeholder="Email"
        style={{ width: "80%", marginBottom: 12 }}
      />
      <TextInput
        placeholder="Password"
        style={{ width: "80%", marginBottom: 12 }}
        secureTextEntry
      />
      <Button title="Login" onPress={() => {}} />
    </KeyboardAvoidingView>
  );
}
