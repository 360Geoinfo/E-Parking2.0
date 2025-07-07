import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ZoneSelection({ setZone }) {
  const { SERVER_API, zone, socket, backupZones } = useAuth();
  const [selectedZone, setSelectedZone] = useState(zone || null);
  const [loading, setLoading] = useState(false);
  const [zoneList, setZoneList] = useState([]);

  const fetchZoneList = async () => {
    setLoading(true);
    try {
      console.log("SERVER_API:", SERVER_API);

      const res = await axios.get(`${SERVER_API}/zones`);
      if (res.status === 200 && Array.isArray(res.data)) {
        setZoneList(res.data);
      } else {
        console.warn("Unexpected response:", res);
        Alert.alert("Error", "Failed to fetch zones. Please try again later.");
      }
    } catch (error) {
      try {
        console.log("Emitting socket request for zones");

        socket.emit("getZones", (response) => {
          console.log("Socket response for zones:", response);
          if (response.status === 200) {
            setZoneList(response.data);
          } else {
            console.warn("Unexpected socket response:", response);
            throw new Error(
              "Failed to fetch zones from socket. Please try again later."
            );
          }
        });
      } catch (error) {
        throw new Error(
          "Error fetching zone list using Socket and Axios: " + error.message
        );
      } finally {
        setZoneList(backupZones || []);
        setLoading(false);
      }
    } finally {
      setZoneList(backupZones || []);
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      try {
        fetchZoneList();
      } catch (error) {
        console.log(backupZones);
        setZoneList(backupZones || []);
      }
    }, [])
  );

  return (
    <View
      style={{ width: "100%", paddingHorizontal: 10, backgroundColor: "#fff" }}
    >
      <Text>Select Zone:</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 10 }}
        />
      ) : (
        <Picker
          selectedValue={selectedZone}
          onValueChange={(itemValue) => {
            setSelectedZone(itemValue);
          }}
          style={{
            width: "100%",
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 5,
            marginTop: 10,
            color: "#333",
          }}
        >
          <Picker.Item label="Select a zone" value={null} />
          {zoneList?.map((zone) => (
            <Picker.Item
              key={zone.id}
              label={`Zon ${zone.code} - ${zone.name}`}
              value={zone.code}
              style={{ fontSize: 15, color: "#333" }}
            />
          ))}
        </Picker>
      )}
      <TouchableOpacity
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          borderRadius: 5,
          marginTop: 10,
        }}
        onPress={async () => {
          setZone(selectedZone); // update context
          await AsyncStorage.setItem("zone", selectedZone); // persist to device
        }}
      >
        <Text
          style={{
            color: "#fff",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Confirm
        </Text>
      </TouchableOpacity>
    </View>
  );
}
