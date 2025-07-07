import React from "react";
import { Text, View } from "react-native";

const VehicleDetail = ({ data }) => {
  return !data ? (
    <>
      <Text>Vehicle Details</Text>
      <Text>No Vehicle Data Found</Text>
    </>
  ) : (
    <>
      <Text>Vehicle Details</Text>
      {/* <Text>{JSON.stringify(data, null, 2)}</Text> */}
      <View>
        <Text>Vehicle Number: {data.PLATLICENSE}</Text>
        <Text>Vehicle Model: {data.VEHICLEMODEL}</Text>
        <Text>Vehicle Type: {data.VEHICLETYPES}</Text>
        <Text>Owner Name: {data.USERID}</Text>
        <Text>Vehicle Color: {data.VEHICLECOLOUR}</Text>
      </View>
    </>
  );
};

export default VehicleDetail;
