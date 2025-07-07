import React from "react";
import { Text, View } from "react-native";

const PetakDetails = ({ data }) => {
  return (
    <>
      <Text>Petak Payment Details</Text>
      {!data ? (
        <>
          <Text>No Petak Data Found</Text>
        </>
      ) : (
        <>
          {/* data[0] is the initial Payment... the rest are the duration extended */}
          {/* 1 petak is equivalent to 1 hour */}
          {/* If user has 5 petak means 5 hours, so one an so forth */}
          {/* basic structure of data are as follows:
          
          [
            {
              "ID": "12345",
              "PETAK_REF": "",
              "OUTDOOR_REF": "",
              "PETAK_AMOUNT": 1,
              "DATE_USED": "YYYY/MM/DDTHH:MM:SS",
              },
              ...
          ]
          */}
          {/* Show in Table format of ID, PETAK_AMOUNT and DATE_USED(technically this is the "when did the user pay using their petak") */}
          <View style={{ padding: 10 }}>
            {data.map((item, index) => (
              <View key={index}>
                <Text>ID: {item.ID}</Text>
                <Text>Deducted Amount (Petak): {item.PETAK_AMOUNT}</Text>
                <Text>Deducted On: {item.DATE_USED}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );
};

export default PetakDetails;
