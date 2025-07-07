import FinesIssued from "@/components/fines-issued";
import OperatorAccounts from "@/components/operatorAccounts";
import TransactionHistory from "@/components/transaction-history";
import { useSocket } from "@/context/socket";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const index = () => {
  const [settingsState, setSettingsState] = useState("");
  const {
    logout,
    operatorData,
    isLoggingOut,
    attendanceData,
    zoneList,
    clockOut,
    dayjs,
  } = useSocket();
  const settingsLink = [
    {
      id: "1",
      title: "Account",
      icon: "person",
      onPress: () => setSettingsState("Account"),
    },
    {
      id: "2",
      title: "Transaction History",
      icon: "history",
      onPress: () => setSettingsState("Transaction History"),
    },
    {
      id: "3",
      title: "Fines Issued",
      icon: "gavel",
      onPress: () => setSettingsState("Fines Issued"),
    },
  ];
  const CardWrapper = ({ children, contentStyle = {} }) => (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        ...contentStyle,
      }}
    >
      {children}
    </View>
  );

  const renderSettingsSection = () => {
    switch (settingsState) {
      case "Account":
        return (
          <OperatorAccounts
            CardWrapper={CardWrapper}
            setMenu={setSettingsState}
          />
        );
      case "Transaction History":
        return (
          <TransactionHistory
            CardWrapper={CardWrapper}
            setMenu={setSettingsState}
          />
        );
      case "Fines Issued":
        return (
          <FinesIssued CardWrapper={CardWrapper} setMenu={setSettingsState} />
        );
      default:
        return <MainView />;
    }
  };

  const displayZone = (zoneID) => {
    console.log("Zone List:", zoneList, "compare with ID:", zoneID);

    const zone = zoneList.find((z) => z.ID == zoneID); // loose equality to support both string and number

    return zone
      ? `Zon ${zone.CODE} - ${zone.NAME.trim()}`
      : "Unable to display zone";
  };

  const displayTime = (date, time) => {
    console.log("Display Time Input:", time);

    const displayDate = dayjs(`${date}T${time}`);
    console.log("Display Time:", displayDate);
    return displayDate.format("hh:mm A");
  };
  const displayDate = (date) => {
    return dayjs(date).format("dddd, MMMM D, YYYY");
  };
  const displayLastClockOut = (time) => {
    const date = dayjs(time);
    return date.format("dddd, MMMM D, YYYY hh:mm A");
  };

  const MainView = () => {
    return (
      <>
        <CardWrapper
          contentStyle={{
            gap: 10,
            paddingVertical: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <MaterialIcons name="pin-drop" size={12} color="#2567ea" />
            <Text style={{ fontSize: 12, fontWeight: "bold" }}>
              {displayZone(attendanceData?.[0].ZONE_ID)}
            </Text>
          </View>
          <View
            style={{ flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <Text style={{ fontSize: 30 }}>
              {displayTime(
                attendanceData?.[0].DATE,
                attendanceData?.[0].CLOCK_IN
              )}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {displayDate(attendanceData?.[0].DATE)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={{
                width: "100%",
                padding: 10,
                backgroundColor: "#ce4452",
                borderRadius: 5,
                alignItems: "center",
              }}
              onPress={clockOut}
            >
              <Text style={{ color: "#fff" }}>Clock Out</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12 }}>
              Terakhir clock Out:{" "}
              {attendanceData?.[1]?.CLOCK_OUT
                ? displayLastClockOut(attendanceData[1].CLOCK_OUT)
                : "Tiada rekod sebelum ini"}
            </Text>
          </View>
        </CardWrapper>
        <CardWrapper>
          <FlatList
            data={settingsLink}
            itemKeyExtractor={(item) => `settingsLink_${item.id}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={item.onPress}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  paddingVertical: 16,
                  borderBottomWidth: index === settingsLink.length - 1 ? 0 : 1,
                  borderColor: "#ccc",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <MaterialIcons name={item.icon} size={20} color="#2567ea" />
                  <Text>{item.title}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => `settings-${item.id}`}
            // contentContainerStyle={{ paddingVertical: 5 }}
            scrollEnabled={false}
          />
        </CardWrapper>
      </>
    );
  };

  return (
    <View
      style={{
        width: "100%",
        paddingTop: 50,
        paddingHorizontal: 20,
        flexDirection: "column",
        justifyContent: "space-between",
        flexGrow: 1,
        gap: 10,
      }}
    >
      <CardWrapper
        contentStyle={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          gap: 20,
          paddingVertical: 20,
        }}
      >
        <MaterialIcons name="person" size={50} color="#2567ea" />
        <View
          style={{
            flexDirection: "column",
            gap: 5,
            width: "100%",
            minWidth: 0,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {operatorData?.USERNAME || "Operator Name"}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#666",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Operator ID: {operatorData?.USERID || "123456"}
          </Text>
        </View>
      </CardWrapper>
      {settingsState !== "" && (
        <TouchableOpacity
          onPress={() => setSettingsState("")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <MaterialIcons name="chevron-left" size={24} color="black" />
          <Text style={{ fontSize: 18 }}> Back to Menu</Text>
        </TouchableOpacity>
      )}
      {!isLoggingOut && renderSettingsSection()}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingVertical: 20,
          backgroundColor: "#A22E3B",
          borderRadius: 5,
          marginBottom: 10,
        }}
        onPress={logout}
      >
        <Text style={{ color: "#fff", fontSize: 20 }}>Log Out & Clock Out</Text>
        <MaterialIcons name="logout" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default index;
