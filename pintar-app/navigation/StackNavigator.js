import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen"; // 👈 Import this
import TabNavigatorCustomer from "./TabNavigatorCustomer";
import TabNavigatorOperator from "./TabNavigatorOperator";
import { useAuth } from "../context/AuthContext";

import PengesahanBayaranBulanan from "../screens/Customer/Pembayaran/PengesahanBayaranBulanan";
import SeasonPassScreen from "../screens/Customer/Pembayaran/Pembayaran";
import PengesahanBayaranTambahPetak from "../screens/Customer/Pembayaran/PengesahanBayaranTambahPetak";
import ResetPembayaran from "../screens/Customer/Pembayaran/ResitPembayaran";

import ResetPembayaranParking from "../screens/Customer/Pembayaran/ResitPembayaranParking";
import StatusPassBulanan from "../screens/Customer/Pembayaran/StatusPassBulanan";
import BayaranWebView from "../screens/Customer/Pembayaran/Bayaranwebview";

//profilescreenmenu
import SejarahTransaksi from "../screens/Customer/SejarahTransaksi/SejarahTransaksi";
import Bahasa from "../screens/Customer/Bahasa/Bahasa";
import Berita from "../screens/Customer/Berita/Berita";
import Kenderaan from "../screens/Customer/Kenderaan/Kenderaan";
import KhidmatSokongan from "../screens/Customer/KhidmatSokongan/KhidmatSokongan";
import MengenaiKami from "../screens/Customer/MengenaiKami/MengenaiKami";
import PadamAccount from "../screens/Customer/PadamAccount/PadamAccount";
import TambahKenderaanForm from "../screens/Customer/Kenderaan/TambahKenderaanForm";
import OTPScreen from "../screens/OTPScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { userRole } = useAuth();

  const screens = {
    customer: [
      {
        name: "CustomerTabs",
        component: TabNavigatorCustomer,
      },
      {
        name: "SejarahTransaksi",
        component: SejarahTransaksi,
      },
      {
        name: "Bahasa",
        component: Bahasa,
      },
      {
        name: "Berita",
        component: Berita,
      },
      {
        name: "Kenderaan",
        component: Kenderaan,
      },
      {
        name: "KhidmatSokongan",
        component: KhidmatSokongan,
      },
      {
        name: "MengenaiKami",
        component: MengenaiKami,
      },
      {
        name: "PadamAccount",
        component: PadamAccount,
      },
      {
        name: "TambahKenderaanForm",
        component: TambahKenderaanForm,
      },
      {
        name: "PengesahanBayaranBulanan",
        component: PengesahanBayaranBulanan,
      },
      {
        name: "SeasonPassScreen",
        component: SeasonPassScreen,
      },
      {
        name: "PengesahanBayaranTambahPetak",
        component: PengesahanBayaranTambahPetak,
      },
      {
        name: "ResetPembayaran",
        component: ResetPembayaran,
      },
      {
        name: "ResetPembayaranParking",
        component: ResetPembayaranParking,
      },
      {
        name: "StatusPassBulanan",
        component: StatusPassBulanan,
      },
      {
        name: "BayaranWebView",
        component: BayaranWebView,
      },
    ],
    operator: [
      {
        name: "OperatorTabs",
        component: TabNavigatorOperator,
      },
    ],
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!userRole ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
        </>
      ) : (
        screens[userRole].map((screen) => (
          <Stack.Screen
            key={`${userRole}_${screen.name}`}
            name={screen.name}
            component={screen.component}
          />
        ))
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
