import { useSocket } from "@/context/socket";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export default function ZoneSelectionScreen() {
  const { socket, handleZoneSelection, isLoggingOut } = useSocket();
  const [zoneList, setZoneList] = useState([]);
  useFocusEffect(
    useCallback(() => {
      const fetchZones = async () => {
        try {
          socket.emit("getZone", (response) => {
            if (response.status === 200) {
              setZoneList(response.data);
            } else {
              console.error("Failed to fetch zones:", response.message);
            }
          });
        } catch (error) {
          console.error("Failed to fetch zones:", error);
        }
      };
      fetchZones();
    }, [])
  );
  const [selectedZone, setSelectedZone] = useState({
    ID: "",
    CODE: "",
    NAME: "",
  });
  if (isLoggingOut) {
    return (
      <View style={{ padding: 20, backgroundColor: "white", width: "100%" }}>
        <Text
          style={{
            color: "#666",
            fontSize: 20,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Logging out, please wait...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, backgroundColor: "white", width: "100%" }}>
      <Text
        style={{
          color: "#666",
          fontSize: 20,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Please select your zone of operation
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          paddingHorizontal: 10,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Picker
          selectedValue={selectedZone.CODE}
          onValueChange={(itemValue) =>
            setSelectedZone(zoneList.find((z) => z.CODE === itemValue))
          }
          style={{
            width: "100%",
            height: Platform.OS === "ios" ? 200 : 50,
          }}
        >
          <Picker.Item label="Select Zone of Operation" value="" />
          {zoneList.map((zone) => (
            <Picker.Item
              key={zone.ID}
              label={`Zone ${zone.CODE} - ${zone.NAME}`}
              value={zone.CODE}
            />
          ))}
        </Picker>
      </View>
      <TouchableOpacity
        style={{
          marginTop: 20,
          width: "100%",
          padding: 12,
          backgroundColor: "#2567ea",
          borderRadius: 5,
        }}
        onPress={handleZoneSelection.bind(null, selectedZone)}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Confirm Selection
        </Text>
      </TouchableOpacity>
    </View>
  );
}
