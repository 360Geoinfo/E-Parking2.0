import React, { createRef, forwardRef, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Operator/HomeScreen";
import PayForCustomerScreen from "../screens/Operator/PayForCustomerScreen";
import SettingScreen from "../screens/Operator/SettingScreen";
import ResitScreen from "../screens/Operator/ResitScreen";
import ResitPembayaranScreen from "../screens/Operator/ResitPaymentScreen";
import TransactionStatusScreen from "../screens/Operator/TransactionStatusScreen";
import AccountScreen from "../screens/Operator/AccountScreen";
import TransactionHistoryScreen from "../screens/Operator/TransactionHistoryScreen";
import TransactionDetailScreen from "../screens/Operator/TransactionDetailScreen";
import IssuedSummonsScreen from "../screens/Operator/IssuedSummonsScreen";
import IssuedSummonsDetailScreen from "../screens/Operator/IssuedSummonsDetail";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WelcomeOperators from "../screens/Operator/WelcomeOperators";
import { useAuth } from "../context/AuthContext";
import { StackActions } from "@react-navigation/native";
// import LPRCamerav3 from "../screens/Operator/LPRCamerav3";
import LPRCamerav2 from "../screens/Operator/LPRCamerav2";
import LPRCamera from "../screens/Operator/LPRCamera";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const homeStackRef = createRef();
const paymentStackRef = createRef();
const settingStackRef = createRef();

const screens = {
  HomeStack: [
    {
      name: "Carian Kenderaan",
      component: HomeScreen,
    },
    {
      name: "Resit Saman",
      component: ResitScreen,
    },
    {
      name: "LPR Camera",
      component: LPRCamerav2,
    },
  ],
  PayForCustomerStack: [
    {
      name: "Pembayaran",
      component: PayForCustomerScreen,
    },
    {
      name: "Resit Pembayaran",
      component: ResitPembayaranScreen,
    },
    {
      name: "Transaction Status",
      component: TransactionStatusScreen,
    },
  ],
  SettingStack: [
    {
      name: "Akaun",
      component: SettingScreen,
    },
    {
      name: "Keterangan Diri",
      component: AccountScreen,
    },
    {
      name: "Sejarah Transaksi",
      component: TransactionHistoryScreen,
    },
    {
      name: "Keterangan Transaksi",
      component: TransactionDetailScreen,
    },
    {
      name: "Saman Dikeluarkan",
      component: IssuedSummonsScreen,
    },
    {
      name: "Keterangan Saman",
      component: IssuedSummonsDetailScreen,
    },
  ],
};

// Stack navigator for Home tab
const HomeStack = forwardRef((props, ref) => {
  const { attendanceData } = useAuth();
  return (
    <Stack.Navigator
      ref={ref}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0B477B" },
        headerTintColor: "#fff",
      }}
    >
      {attendanceData.zone &&
      attendanceData.clockin &&
      !attendanceData.clockout ? (
        screens.HomeStack.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))
      ) : (
        <Stack.Screen name="WelcomeOperators" component={WelcomeOperators} />
      )}
    </Stack.Navigator>
  );
});

// Stack navigator for Pay For Customer tab
const PayForCustomerStack = forwardRef((props, ref) => {
  const { attendanceData } = useAuth();
  return (
    <Stack.Navigator
      ref={ref}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0B477B" },
        headerTintColor: "#fff", // Optional: makes back button and title white
      }}
    >
      {attendanceData.zone &&
      attendanceData.clockin &&
      !attendanceData.clockout ? (
        screens.PayForCustomerStack.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))
      ) : (
        <Stack.Screen name="WelcomeOperators" component={WelcomeOperators} />
      )}
    </Stack.Navigator>
  );
});

// Stack navigator for Settings tab
const SettingStack = forwardRef((props, ref) => {
  return (
    <Stack.Navigator
      ref={ref}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0B477B" },
        headerTintColor: "#fff", // Optional: makes back button and title white
      }}
    >
      {screens.SettingStack.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Stack.Navigator>
  );
});

const TabNavigatorOperator = () => {
  // Use a ref to access the navigation object

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Carian Kenderaan") {
            iconName = "magnify";
          } else if (route.name === "Pembayaran") {
            iconName = "cash-multiple";
          } else if (route.name === "Settings") {
            iconName = "cog-outline";
          }
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#1e88e5",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Carian Kenderaan"
        listeners={{
          tabPress: (e) => {
            if (homeStackRef.current) {
              homeStackRef.current.dispatch(StackActions.popToTop());
            }
          },
        }}
      >
        {() => <HomeStack ref={homeStackRef} />}
      </Tab.Screen>

      <Tab.Screen
        name="Pembayaran"
        listeners={{
          tabPress: (e) => {
            if (paymentStackRef.current) {
              paymentStackRef.current.dispatch(StackActions.popToTop());
            }
          },
        }}
      >
        {() => <PayForCustomerStack ref={paymentStackRef} />}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        listeners={{
          tabPress: (e) => {
            if (settingStackRef.current) {
              settingStackRef.current.dispatch(StackActions.popToTop());
            }
          },
        }}
      >
        {() => <SettingStack ref={settingStackRef} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigatorOperator;
