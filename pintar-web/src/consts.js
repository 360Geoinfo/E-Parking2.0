// src/pages/
import Login from "./pages/Account/Login";
import Signup from "./pages/Account/Signup";
import Home from "./pages/Home/Home";
import Parking from "./pages/Parking/Parking";
import Users from "./pages/Users/Users";
import Payment from "./pages/Payment/Payment";
import Report from "./pages/Report/Report";
import Operator from "./pages/Operator/Operator";
import { MdSpaceDashboard } from "react-icons/md";

import {
  FaCar,
  FaUsers,
  FaMoneyBillAlt,
  FaChartBar,
  FaCog,
  FaMapMarker,
} from "react-icons/fa";
import Zones from "./pages/Zones/Zones";

const links = [
  {
    path: "/home",
    name: "Dashboard",
    icon: MdSpaceDashboard,
  },
  {
    path: "/parking",
    name: "Parking",
    icon: FaCar,
  },
  {
    path: "/users",
    name: "Users",
    icon: FaUsers,
  },
  {
    path: "/payment",
    name: "Payment",
    icon: FaMoneyBillAlt,
  },
  {
    path: "/report",
    name: "Report",
    icon: FaChartBar,
  },
  {
    path: "/operator",
    name: "Operator",
    icon: FaCog,
  },
  {
    path: "/zones",
    name: "Zones",
    icon: FaMapMarker,
  },
];

const routes = [
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/parking",
    component: Parking,
  },
  {
    path: "/users",
    component: Users,
  },
  {
    path: "/payment",
    component: Payment,
  },
  {
    path: "/report",
    component: Report,
  },
  {
    path: "/operator",
    component: Operator,
  },
  {
    path: "/",
    component: Login,
  },
  {
    path: "/signup",
    component: Signup,
  },
  {
    path: "/zones",
    component: Zones,
  },
];

export { links, routes };
