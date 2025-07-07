import { ParkingDuration } from "@/constants/ParkingDuration";
import { VehicleTypes } from "@/constants/VehicleTypes";
import { useSocket } from "@/context/socket";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const AddParkingForm = ({ onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Vehicle Details, 2: Parking Details
  const { socket, operatorData, attendanceData, zoneList } = useSocket();
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleId: "",
    plate: "",
    type: "",
    model: "",
    color: "",
  });
  const findZoneData = (identifier) => {
    let zone = zoneList.find((zone) => zone.ID === parseInt(identifier));

    if (!zone) {
      zone = zoneList.find((zone) => zone.CODE === identifier);
    }

    return zone;
  };
  const [parkingDetails, setParkingDetails] = useState({
    duration: "",
    startDate: dayjs().format("YYYY-MM-DD"),
    startTime: new Date(),
    zone: findZoneData(attendanceData[0]?.ZONE_ID)?.CODE,
  });

  const vehicleTypes = VehicleTypes;

  const parkingDurations = ParkingDuration;

  const handleCheckExistingManualPlate = () => {
    if (vehicleDetails.plate.length < 3) {
      Alert.alert("Invalid Plate", "Please enter a valid plate number.");
      return;
    }
    socket.emit(
      "checkExistingManualPlate",
      { plate: vehicleDetails.plate },
      (response) => {
        if (response.status === 200) {
          setVehicleDetails(response.data);
          Alert.alert(
            "Success",
            `Manually Entered Vehicle found with the Plate Number ${vehicleDetails.plate}`,
            [{ text: "OK", onPress: () => setStep(3) }]
          );
        } else {
          Alert.alert(
            "Error",
            `No Existing Parking found with the Plate Number ${vehicleDetails.plate}`,
            [{ text: "OK", onPress: () => setStep(2) }]
          );
        }
      }
    );
  };

  const handleCheckExistingParking = () => {
    if (vehicleDetails.plate.length < 3) {
      Alert.alert("Invalid Plate", "Please enter a valid plate number.");
      return;
    }

    socket.emit(
      "checkExistingParking",
      { plate: vehicleDetails.plate, zone: parkingDetails.zone },
      (response) => {
        if (response.status === 200) {
          setStep(step + 1);
        } else {
          Alert.alert(
            "Error",
            `An Existing Parking is found with the Plate Number ${vehicleDetails.plate}`,
            [{ text: "OK", onPress: () => setStep(step - 1) }]
          );
        }
      }
    );
  };

  const vehiclePlateComponent = () => {
    return (
      <>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Vehicle Plate
        </Text>
        <TextInput
          placeholder="License Plate"
          value={vehicleDetails.plate}
          onChangeText={(text) =>
            setVehicleDetails({
              ...vehicleDetails,
              plate: text.toLocaleUpperCase(),
            })
          }
          style={{
            width: "100%",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "#ccc",
            fontSize: 20,
            color: "#333",
          }}
        />
      </>
    );
  };

  const vehicleDetailsComponent = () => {
    return (
      <>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Vehicle Details
        </Text>
        <Picker
          selectedValue={vehicleDetails.type}
          onValueChange={(itemValue) =>
            setVehicleDetails({ ...vehicleDetails, type: itemValue })
          }
          style={{
            width: "100%",
            height: Platform.OS === "ios" ? 150 : 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "#ccc",
            fontSize: 20,
            color: "#333",
            overflow: "hidden",
          }}
        >
          <Picker.Item label="Select Vehicle Type" value="" />
          {vehicleTypes.map((type) => (
            <Picker.Item
              key={type.value}
              label={type.label}
              value={type.value}
            />
          ))}
        </Picker>
        <TextInput
          placeholder="Model"
          value={vehicleDetails.model}
          onChangeText={(text) =>
            setVehicleDetails({
              ...vehicleDetails,
              model: text.toLocaleUpperCase(),
            })
          }
          style={{
            width: "100%",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "#ccc",
            fontSize: 20,
            color: "#333",
          }}
        />
        <TextInput
          placeholder="Color"
          value={vehicleDetails.color}
          onChangeText={(text) =>
            setVehicleDetails({
              ...vehicleDetails,
              color: text.toLocaleUpperCase(),
            })
          }
          style={{
            width: "100%",
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "#ccc",
            fontSize: 20,
            color: "#333",
          }}
        />
      </>
    );
  };

  const parkingDetailsComponent = () => {
    return (
      <>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Parking Details
        </Text>
        {Platform.OS === "ios" && (
          <Text
            style={{
              fontSize: 16,
              color: "#666",
            }}
          >
            Parking Duration in Hours
          </Text>
        )}
        <Picker
          style={{
            width: "100%",
            height: Platform.OS === "ios" ? 150 : 50,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: "#ccc",
            fontSize: 20,
            color: "#333",
            overflow: "hidden",
          }}
          placeholder="Parking Duration in Hours"
          selectedValue={parkingDetails.duration}
          onValueChange={(itemValue) =>
            setParkingDetails({ ...parkingDetails, duration: itemValue })
          }
        >
          <Picker.Item label="Select Parking Duration" value="" />
          {parkingDurations.map((duration) => (
            <Picker.Item
              key={duration.value}
              label={duration.label}
              value={duration.value}
            />
          ))}
        </Picker>
        <Text>Start Time</Text>
        <SafeAreaView
          style={{
            position: "relative",
            width: "100%",
          }}
        >
          <DateTimePicker
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 5,
            }}
            value={parkingDetails.startTime || new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.select({ ios: "spinner", android: "clock" })}
            onChange={(event, date) => {
              if (date) {
                setParkingDetails({
                  ...parkingDetails,
                  startTime: date, // keep as Date object
                });
              }
            }}
            maximumDate={dayjs().add(5, "minutes").toDate()}
            minimumDate={dayjs().subtract(1, "hours").toDate()}
            minuteInterval={1}
          />
        </SafeAreaView>
      </>
    );
  };

  const confirmationComponent = () => {
    return (
      <View>
        <Text>Confirm Your Details</Text>
        <Text>Vehicle Type: {vehicleDetails.type}</Text>
        <Text>Model: {vehicleDetails.model}</Text>
        <Text>Color: {vehicleDetails.color}</Text>
        <Text>Parking Duration: {parkingDetails.duration} Hr</Text>
        <Text>
          Start Time: {dayjs(parkingDetails.startTime).format("HH:mm")}
        </Text>
      </View>
    );
  };

  const handleSubmit = () => {
    if (
      vehicleDetails.type &&
      vehicleDetails.model &&
      vehicleDetails.color &&
      parkingDetails.duration &&
      parkingDetails.startTime
    ) {
      socket.emit(
        "newParking",
        {
          operatorId: operatorData.USERID,
          userId: "MANUAL",
          ...vehicleDetails,
          ...parkingDetails,
        },
        ({ status, message }) => {
          if (status === 201) {
            Alert.alert("Success", message, [
              {
                text: "OK",
                onPress: () => {
                  setStep(1);
                  setVehicleDetails({
                    plate: "",
                    type: "",
                    model: "",
                    color: "",
                  });
                  setParkingDetails({
                    duration: "",
                    startDate: dayjs().format("YYYY-MM-DD"),
                    startTime: new Date(),
                    zone: findZoneData(attendanceData[0]?.ZONE_ID)?.CODE,
                  });
                  router.replace("/(tabs)/(home)/main");
                },
              },
            ]);
          } else {
            Alert.alert("Error", message);
          }
        }
      );
    } else {
      Alert.alert(
        "Incomplete Form",
        "Please fill in all the details before submitting."
      );
    }
  };

  const steps = {
    1: {
      title: "Vehicle Plate",
      component: vehiclePlateComponent,
      onPressNext: handleCheckExistingManualPlate,
    },
    2: {
      title: "Vehicle Details",
      component: vehicleDetailsComponent,
      onPressNext: handleCheckExistingParking,
    },
    3: {
      title: "Parking Details",
      component: parkingDetailsComponent,
      onPressNext: () => setStep(step + 1),
    },
    4: {
      title: "Confirmation",
      component: confirmationComponent,
      onPressNext: handleSubmit,
    },
  };

  const stepRender = () => {
    return (steps[step].component || (() => <></>))();
  };

  return (
    <KeyboardAvoidingView
      style={{
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View
        style={{
          width: "100%",
          padding: 20,
          backgroundColor: "#fff",
          borderRadius: 10,
          gap: 10,
          display: "relative",
        }}
      >
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons
            name="close"
            size={20}
            color="#000"
            style={{ position: "absolute", top: 0, right: 0, padding: 10 }}
          />
        </TouchableOpacity>
        {stepRender()}
        <View
          style={{
            flexGrow: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
          }}
        >
          {step > 1 ? (
            <TouchableOpacity
              style={{ padding: 10, backgroundColor: "#ccc", borderRadius: 5 }}
              onPress={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  minWidth: 100,
                  textAlign: "center",
                }}
              >
                Prev
              </Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}

          <Text style={{ flexGrow: 1, textAlign: "center" }}>
            {step} of {Object.keys(steps).length}
          </Text>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: "#2567ea", borderRadius: 5 }}
            onPress={steps[step].onPressNext}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                minWidth: 100,
                textAlign: "center",
              }}
            >
              {step < 4 ? "Next" : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddParkingForm;
