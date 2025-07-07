// ActiveScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const ActiveScreen = () => {

  const [selectedValue, setSelectedValue] = useState('');

  const [reminded30, setReminded30] = useState(false);
  const [reminded15, setReminded15] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState(31 * 60); // 31 minutes
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

  const [blueHeightRatio, setBlueHeightRatio] = useState(0.5); // 50% blue, 50% white

  const carData = {
    licensePlate: 'ABC1234',
    parkingDuration: 120,
    parkingDate: '16 April 2025, 10:00 AM',
    parkingZone: 'Zone A',
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeRemaining === 1800 && !reminded30) {
      Alert.alert('Peringatan', 'Masa parking biskita tinggal 30 minit.');
      setReminded30(true);
    }
    if (timeRemaining === 900 && !reminded15) {
      Alert.alert('Peringatan', 'Masa parking biskita tinggal 15 minit.');
      setReminded15(true);
    }
  }, [timeRemaining]);

  const handleExtendTime = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = () => {
    setTimeRemaining((prev) => prev + 3600); // add 1 hour
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours} jam : ${minutes} minit : ${seconds} saat`;
  };  

  return (

    <SafeAreaView style={styles.container}>
    <View style={styles.topheader}>
      <View style={styles.positionHeader}>
        <Text style={styles.toptitleheader}>Active</Text>
      </View>
    </View>
  
    <ScrollView contentContainerStyle={styles.scrollContainer}>

      <View style={styles.CardPosition}>
        <View style={styles.card}>
          <View style={styles.cardBlueSection}>
            <Text style={styles.whiteText}>Tempoh Tamat Kereta</Text>
            <Text style={styles.whiteTimeText}>{formatTime(timeRemaining)}</Text>
          </View>
  
          <View style={styles.cardWhiteSection}>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color="#444" />
              <Text style={styles.infoText}>{carData.parkingDate}</Text>
            </View>
  
            <View style={styles.infoRow}>
              <MaterialIcons name="directions-car" size={20} color="#444" />
              <Text style={styles.infoText}>{carData.licensePlate}</Text>
            </View>
  
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#444" />
              <Text style={styles.infoText}>{carData.parkingZone}</Text>
            </View>
  
            <View style={styles.dropdownWrapper}>
              <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue) => setSelectedValue(itemValue)}
                mode="dropdown"
                style={styles.picker}
                dropdownIconColor="#000"
              >
                <Picker.Item label="Sambung Tempoh Letak Kereta" value="" />
                <Picker.Item label="1 Jam 1 petak" value="30" />
                <Picker.Item label="2 Jam 2 petak" value="60" />
                <Picker.Item label="3 Jam 3 petak" value="90" />
              </Picker>


              {/* for IOS not yet
              {Platform.OS === 'ios' ? (
                  // Custom dropdown or modal selector for iOS
                ) : (
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={(itemValue) => setSelectedValue(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Sambung Tempoh Letak Kereta" value="" />
                  <Picker.Item label="1 Jam 1 petak" value="30" />
                  <Picker.Item label="2 Jam 2 petak" value="60" />
                  <Picker.Item label="3 Jam 3 petak" value="90" />
                </Picker>
              )}
              */}

            </View>
  
            <TouchableOpacity style={styles.button} onPress={handleExtendTime}>
              <Text style={styles.buttonText}>Bayar & Sambung</Text>
            </TouchableOpacity>
  
            <View style={styles.warningCard}>
              <MaterialIcons name="error-outline" size={20} color="#D32F2F" style={styles.warningIcon} />
              <Text style={styles.warningText}>
                Saman akan dikeluarkan 10 minit selepas tempoh letak kereta tamat.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
};


export default ActiveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //padding: 20,
    //paddingTop: 50,
    backgroundColor: '#d5f5ff',
  },
  timeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  timeExpired: {
    color: '#D32F2F',
  },
  subText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FCB22D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topheader: {
    width: '100%',
    backgroundColor: '#0B477B',
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'left',
    justifyContent: 'left',
    zIndex: 10,
    marginBottom: 20,
    //marginTop: 25,
  },
  toptitleheader: {
    fontSize: 24,
    color: '#ffffff',
  },
  positionHeader : {
    marginTop: 10,
  },
  CardPosition :{
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',    // 🛑 Important! to clip the rounded corners properly
    width: '90%',
    height: 750,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  cardBlueSection: {
    flex: 4,                 // 📏 4 parts blue
    backgroundColor: '#0B477B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  cardWhiteSection: {
    flex: 6,                 // 📏 6 parts white
    backgroundColor: '#ffffff',
    padding: 20,
  },
  
  whiteText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  whiteTimeText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    height: 65,
  },
  inputIOS: {
    height: 40,
    fontSize: 16,
    paddingVertical: 10,
    color: 'black',
  },
  inputAndroid: {
    height: 40,
    fontSize: 16,
    paddingVertical: 10,
    color: 'black',
  },
  picker: {
    height: 60,
    width: '100%',
    color: '#000',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    justifyContent: 'center',
  },
  
  warningIcon: {
    marginRight: 10,
  },
  
  warningText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
});
