// navigation/TabNavigatorCustomer.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Customer/Home/HomeScreen';
import ProfileScreen from '../screens/Customer/Tetapan/ProfileScreen';
import ActiveScreen from '../screens/Customer/Active/ActiveScreen';  
import CompoundScreen from '../screens/Customer/Compound/CompoundScreen';  
import Pembayaran from '../screens/Customer/Pembayaran/Pembayaran';  
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const hide = true; // or true to hide the screen

const TabNavigatorCustomer = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Active') {
            iconName = 'car-outline';
          } else if (route.name === 'Compound') {
            iconName = 'md-business-outline';
          } else if (route.name === 'Pembayaran') {
            iconName = 'card-outline';
          } else if (route.name === 'Tetapan') {
            iconName = 'settings-outline';  
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Active" component={ActiveScreen} />
      <Tab.Screen name="Compound" component={CompoundScreen} />
      <Tab.Screen name="Pembayaran" component={Pembayaran} />
      <Tab.Screen name="Tetapan" component={ProfileScreen} />
    </Tab.Navigator>



  );
};

export default TabNavigatorCustomer;
