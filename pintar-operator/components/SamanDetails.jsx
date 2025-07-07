import dayjs from "dayjs";
import React from "react";
import { Text } from "react-native";

const SamanDetails = ({ data }) => {
  return !data ? (
    <>
      <Text>Saman Details</Text>
      <Text>No Fine Data Found</Text>
    </>
  ) : (
    <>
      <Text>Saman Details</Text>
      {/* <Text>{JSON.stringify(data, null, 2)}</Text> */}
      <Text>Offence Ref: {data.SAMANID}</Text>
      <Text>
        Offence Date:{" "}
        {dayjs(data.CREATED_AT).format("dddd, DD/MM/YYYY hh:mm A")}
      </Text>
      <Text>Issued By: {data.operator.USERNAME}</Text>
      <Text>Issued Amount (BND): {(data.JUMLAH / 100).toFixed(2)}</Text>
      <Text>Status : {data.STATUS}</Text>
    </>
  );
};

export default SamanDetails;
