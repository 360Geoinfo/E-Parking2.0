import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const WelcomeOperators = ({ navigation }) => {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        flexDirection: "column",
        paddingHorizontal: 20,
      }}
    >
      <Icon
        name="clock-o"
        size={60}
        color="#0B477B"
        style={{ marginBottom: 20 }}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#0B477B",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Belum Clock In
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#333",
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Sila clock in ke zon tugasan anda untuk mula menggunakan sistem
        pemantauan letak kereta.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("Settings", { screen: "Akaun" })}
        style={{
          backgroundColor: "#F8D07A",
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#000",
          }}
        >
          Pergi ke Clock In
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeOperators;
