import React from "react";
import { Text, View } from "react-native";

const UserDetail = ({ data }) => {
  return !data ? (
    <>
      <Text>User Details</Text>
      <Text>No User Data Found</Text>
    </>
  ) : (
    <>
      <Text>User Details</Text>
      {/* <Text>{JSON.stringify(data, null, 2)}</Text> */}
      <View>
        <Text>Name: {data.USERNAME}</Text>
      </View>
    </>
  );
};

export default UserDetail;
