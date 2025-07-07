import { VehicleTypes } from "@/constants/VehicleTypes";
import { useSocket } from "@/context/socket";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { CameraView } from "expo-camera";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FineParking = ({ onClose, vehiclePlate = null, imageLink = null }) => {
  const cameraRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const { socket, attendanceData, operatorData } = useSocket();
  const [capturedImage, setCapturedImage] = useState(imageLink || "");
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleId: "",
    plate: vehiclePlate || "",
    type: "",
    model: "",
    color: "",
    imageLink: imageLink || "",
  });
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      socket.emit(
        "issueFine",
        {
          vehicleDetails,
          zone: attendanceData.ZONE_ID,
          operatorId: operatorData.USERID,
        },
        (response) => {
          if (response.status === 200) {
            Alert.alert("Success", "Fine issued successfully.");
          } else {
            Alert.alert("Error", "Failed to issue fine. Please try again.");
          }
        }
      );
    } catch (error) {
      console.error("Error submitting fine:", error);
      Alert.alert("Error", "Failed to submit fine. Please try again.");
    } finally {
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 1000);
    }
  };

  const steps = {
    1: {
      title: "Picture of Vehicle",
      content: capturedImage ? (
        <>
          <Image
            source={{ uri: capturedImage }}
            style={{ width: "100%", height: 400, borderRadius: 8 }}
          />
          <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#ccc",
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => setCapturedImage("")}
            >
              <Text style={{ textAlign: "center" }}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#2567ea",
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => {
                setVehicleDetails({
                  ...vehicleDetails,
                  imageLink: capturedImage,
                });
                setStep(2);
              }}
            >
              <Text style={{ textAlign: "center", color: "#fff" }}>
                Use Photo
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <CameraView
            ref={cameraRef}
            style={{ width: "100%", height: 400, borderRadius: 8 }}
            facing="back"
          />
          <TouchableOpacity
            style={{
              marginTop: 10,
              backgroundColor: "#2567ea",
              padding: 10,
              borderRadius: 8,
            }}
            onPress={async () => {
              if (cameraRef.current) {
                try {
                  const photo = await cameraRef.current.takePictureAsync();
                  setCapturedImage(photo.uri);
                } catch (e) {
                  console.error("Failed to take picture:", e);
                }
              }
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Take Picture
            </Text>
          </TouchableOpacity>
        </>
      ),
    },
    2: {
      title: "Vehicle Details",
      content: (
        <>
          <TextInput
            placeholder="Plate Number"
            value={vehicleDetails.plate.trim().toUpperCase()}
            onChangeText={(text) =>
              setVehicleDetails({
                ...vehicleDetails,
                plate: text.trim().toUpperCase(),
              })
            }
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TouchableOpacity
            style={{
              marginTop: 10,
              backgroundColor: "#2567ea",
              padding: 10,
              borderRadius: 8,
            }}
            onPress={() => setStep(3)}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>Next</Text>
          </TouchableOpacity>
        </>
      ),
    },
    3: {
      title: "More Vehicle Details",
      content: (
        <>
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
            {VehicleTypes.map((type) => (
              <Picker.Item
                key={type.value}
                label={type.label}
                value={type.value}
              />
            ))}
          </Picker>
          <TextInput
            placeholder="Model"
            value={vehicleDetails.model.toUpperCase()}
            onChangeText={(text) =>
              setVehicleDetails({
                ...vehicleDetails,
                model: text.toUpperCase(),
              })
            }
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Color"
            value={vehicleDetails.color.toUpperCase()}
            onChangeText={(text) =>
              setVehicleDetails({
                ...vehicleDetails,
                color: text.toUpperCase(),
              })
            }
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TouchableOpacity
            style={{
              marginTop: 10,
              backgroundColor: "#16A34A",
              padding: 10,
              borderRadius: 8,
            }}
            onPress={handleSubmit}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Submit Fine
            </Text>
          </TouchableOpacity>
        </>
      ),
    },
  };

  const currentStep = steps[step];

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
        }}
      >
        <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end" }}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          {currentStep.title}
        </Text>
        {currentStep.content}
      </View>
    </KeyboardAvoidingView>
  );
};

export default FineParking;
