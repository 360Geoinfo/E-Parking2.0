import { Stack } from "expo-router";
import React from "react";

const DetailLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[parkingID]" />
    </Stack>
  );
};

export default DetailLayout;
