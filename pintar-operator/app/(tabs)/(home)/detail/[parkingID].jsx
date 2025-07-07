import ParkingDetails from "@/components/ParkingDetails";
import PaymentDetails from "@/components/PaymentDetails";
import PetakDetails from "@/components/PetakDetails";
import SamanDetails from "@/components/SamanDetails";
import SeasonalDetails from "@/components/SeasonalDetails";
import UserDetail from "@/components/UserDetail";
import VehicleDetail from "@/components/VehicleDetail";
import { useSocket } from "@/context/socket";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Text, View } from "react-native";

const Card = ({ children }) => {
  return (
    <View
      style={{
        padding: 10,
        marginVertical: 5,
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
      }}
    >
      {children}
    </View>
  );
};

const parkingDetail = () => {
  const { parkingID } = useLocalSearchParams();
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ALGORITHM:
  // ------------

  const fetchAllRelevantData = () => {
    try {
      socket.emit("fetchAllData", { parkingID }, (response) => {
        if (response.status === 200) {
          setData(response.data);
        } else {
          Alert.alert(
            "Error",
            response.message || "Failed to fetch data. Please try again."
          );
        }
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (parkingID) {
      fetchAllRelevantData();
    }
  }, [parkingID]);
  // Parking ID -> Checks in Outdoor Parking -> Outdoor Parking Data
  // Parking ID -> Checks in Payment To Operator -> Payment Data + Operator ID
  // Parking ID -> Checks in Saman -> Saman Data + Operator ID
  // Outdoor Parking Data -> Checks in Zone using Zone Code -> Zone Data
  // Outdoor Parking Data -> Checks in Vehicle using Vehicle ID -> Vehicle Data + User ID

  // User ID -> Checks in Public User -> User Data
  // User ID -> Checks in Petak -> Petak Data
  // Operator ID -> Checks in Operators using Operator ID -> Operator Data

  return (
    <SafeAreaView>
      {loading && <Text>Loading...</Text>}
      {!loading && !data && <Text>No data available.</Text>}
      {/* Render other components or data as needed */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {data && (
          <>
            <Card>
              <VehicleDetail data={data.vehicleData} />
            </Card>
            <Card>
              <UserDetail data={data.userData} />
            </Card>
            <Card>
              <ParkingDetails data={data.outdoor} />
            </Card>
            <Card>
              <PaymentDetails data={data.paymentData} />
            </Card>
            <Card>
              {data.seasonalData ? (
                <SeasonalDetails data={data.seasonalData} />
              ) : (
                <PetakDetails data={data.petakData} />
              )}
            </Card>
            <Card>
              <SamanDetails data={data.samanData} />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default parkingDetail;
