import React from "react";
import { Text } from "react-native";

const PaymentDetails = ({ data }) => {
  return !data ? (
    <>
      <Text>Payment Details</Text>
      <Text>No Payment to Operator Data Found</Text>
    </>
  ) : (
    <>
      <Text>Payment Details</Text>
      {/* <Text>{JSON.stringify(data, null, 2)}</Text> */}
      <Text>Payment Ref No: {data.paymentID}</Text>
      <Text>
        Payment Amount(BND): {(data.amount / 100).toFixed(2)} ({data.status})
      </Text>
      <Text>Payment Method: {data.paymentMethod}</Text>
      <Text>Received By: {data.operator.USERNAME}</Text>
    </>
  );
};

export default PaymentDetails;
