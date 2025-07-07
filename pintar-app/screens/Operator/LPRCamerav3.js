import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Camera from "react-native-openalpr";

export default function LPRCamerav3() {
  const [plate, setPlate] = useState(null);
  return (
    <View style={styles.container}>
      <Camera
        country="bn"
        onPlateRecognized={(e) => {
          console.log("Plate recognized:", e);
          setPlate(e.plate);
        }}
        plateOutlineColor="#ff0000"
        showPlateOutline
        zoom={0}
        touchToFocus
      />
      <View style={{ position: "absolute", bottom: 20, left: 0, right: 0 }}>
        <Text style={{ color: "white", fontSize: 20, textAlign: "center" }}>
          {plate ? `Recognized Plate: ${plate}` : "No plate recognized yet"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
