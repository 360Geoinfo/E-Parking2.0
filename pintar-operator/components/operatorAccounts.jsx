import ChangePassword from "@/components/ChangePassword";
import { useSocket } from "@/context/socket";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const OperatorAccounts = ({ CardWrapper, setMenu }) => {
  const { operatorData } = useSocket();
  const [selectedSection, setSelectedSection] = useState("");

  const sections = [
    {
      path: "changePassword",
      title: "Change Password",
      icon: "lock",
      onPress: () => setSelectedSection("changePassword"),
    },
  ];

  const sectionRenderer = () => {
    switch (selectedSection) {
      case "changePassword":
        return <ChangePassword CardWrapper={CardWrapper} />;
      default:
        return null;
    }
  };

  return !selectedSection ? (
    <View style={{ flex: 1 }}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.path}
        style={{ width: "100%" }}
        renderItem={({ item }) => (
          <CardWrapper>
            <TouchableOpacity
              onPress={item.onPress}
              style={{
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: "#ddd",
              }}
            >
              <Text style={{ fontSize: 18 }}>{item.title}</Text>
            </TouchableOpacity>
          </CardWrapper>
        )}
      />
    </View>
  ) : (
    <View style={{ flex: 1 }}>{sectionRenderer()}</View>
  );
};

export default OperatorAccounts;
