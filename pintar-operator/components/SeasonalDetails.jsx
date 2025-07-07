import React from "react";
import { Text, View } from "react-native";

const SeasonalDetails = ({ data }) => {
  return (
    <>
      <Text>Seasonal Details</Text>
      {!data ? (
        <>
          <Text>No Seasonal Data Found</Text>
        </>
      ) : (
        <>
          <View style={{ padding: 10 }}>
            {/* {data.map((item, index) => (
                <View key={index}>
                  <Text>ID: {item.ID}</Text>
                  <Text>Deducted Amount (Petak): {item.PETAK_AMOUNT}</Text>
                  <Text>Deducted On: {item.DATE_USED}</Text>
                </View>
              ))} */}
            <Text>{JSON.stringify(data, null, 2)}</Text>
          </View>
        </>
      )}
    </>
  );
};

export default SeasonalDetails;
