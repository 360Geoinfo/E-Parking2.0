import { useSocket } from "@/context/socket";
import React from "react";
import { Text, View } from "react-native";

const TransactionHistory = () => {
  const { operatorData } = useSocket();
  return (
    <View style={{ flex: 1 }}>
      <Text>Transaction History</Text>
      <Text>{JSON.stringify(operatorData)}</Text>
    </View>
  );
};

export default TransactionHistory;
