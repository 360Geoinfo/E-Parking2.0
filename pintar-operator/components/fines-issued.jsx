import { useSocket } from "@/context/socket";
import React from "react";
import { Text, View } from "react-native";

const FinesIssued = () => {
  const { operatorData } = useSocket();
  return (
    <View style={{ flex: 1 }}>
      <Text>Fines Issued</Text>
      <Text>{JSON.stringify(operatorData)}</Text>
    </View>
  );
};

export default FinesIssued;
