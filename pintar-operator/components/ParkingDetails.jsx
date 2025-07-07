import dayjs from "dayjs";
import React from "react";
import { Text, View } from "react-native";

const ParkingDetails = ({ data }) => {
  return !data ? (
    <>
      <Text>Parking Details</Text>
      <Text>No Parking Data Found</Text>
    </>
  ) : (
    <>
      <Text>Parking Details</Text>
      {/* <Text>{JSON.stringify(data, null, 2)}</Text> */}
      <View>
        <Text>Ref No: {data.OUTDOORID}</Text>
        <Text>Duration {data.DURATION} Hr</Text>
        <Text>
          Start Date & Time:{" "}
          {dayjs([data.STARTDATE, data.STARTTIME].join("T")).format(
            // Monday, 13/12/2025 10:45 PM
            "dddd, DD/MM/YYYY hh:mm A"
          )}
        </Text>
        <Text>
          End Date & Time:{" "}
          {data.EXITDATE !== null
            ? data.EXITDATE !== data.EXITTIME
              ? dayjs([data.EXITDATE, data.EXITTIME].join("T")).format(
                  // Monday, 13/12/2025 10:45 PM
                  "dddd, DD/MM/YYYY hh:mm A"
                )
              : dayjs(data.EXITDATE || data.EXITTIME).format(
                  // Monday, 13/12/2025
                  "dddd, DD/MM/YYYY"
                )
            : "On Going"}
        </Text>
      </View>
    </>
  );
};

export default ParkingDetails;
