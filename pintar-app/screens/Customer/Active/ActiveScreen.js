import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ActiveScreen = () => {

  const [selectedValue, setSelectedValue] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(31 * 60); // 31 minutes

   const [carData, setCarData] = useState({
    licensePlate: '',
    parkingDuration: '',
    parkingDate: '',
    parkingZone: '',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);


useEffect(() => {
  const loadParkingData = async () => {
    try {
      const storedPayload = await AsyncStorage.getItem('lastOutdoorParkingPayload');
      if (storedPayload) {
        const parsed = JSON.parse(storedPayload);
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        const durationInHours = parseInt(parsed.Duration, 10);
        const durationInSeconds = durationInHours * 3600;

        setCarData({
          licensePlate: parsed.PlatLicense,
          parkingDuration: parsed.Duration,
          parkingDate: formattedDate,
          parkingZone: parsed.location,
        });

        setTimeRemaining(durationInSeconds);

        console.log('🚘 Loaded parking data from AsyncStorage:', parsed);
      }
    } catch (error) {
      console.error('❌ Failed to load parking data:', error);
    }
  };

  loadParkingData(); // <-- ❗️ Call the function here
}, []);


  const handleExtendTime = () => {
    
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
      <View style={styles.topHeader}>
        <Text style={styles.topTitle}>Active</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Blue section */}
            <View style={styles.cardBlueSection}>
              <Text style={styles.whiteText}>Tempoh Tamat Kereta</Text>
              <Text style={styles.whiteTimeText}>{formatTime(timeRemaining)}</Text>
            </View>

            {/* White section */}
            <View style={styles.cardWhiteSection}>
              <View style={styles.infoRow}>
                <MaterialIcons name="calendar-today" size={20} color="#444" />
                <Text style={styles.infoText}>{carData.parkingDate}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="watch" size={20} color="#444" />
                <Text style={styles.infoText}>{carData.parkingDuration} Hours</Text>
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
                  //mode="dropdown" // ✅ Dropdown mode works on Android; iOS ignores this and uses wheel
                  style={styles.picker}
                  dropdownIconColor="#000" // ✅ Android only
                >
                  <Picker.Item label="Sambung Tempoh Letak Kereta" value="" />
                  <Picker.Item label="1 Jam 1 petak" value="30" />
                  <Picker.Item label="2 Jam 2 petak" value="60" />
                  <Picker.Item label="3 Jam 3 petak" value="90" />
                </Picker>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleExtendTime}>
                <Text style={styles.buttonText}>Pilih Tempoh Sebelum Lanjut</Text>
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
    backgroundColor: '#d5f5ff',
  },
  topHeader: {
    width: '100%',
    backgroundColor: '#0B477B',
    paddingVertical: 30,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  topTitle: {
    fontSize: 24,
    color: '#fff',
    marginTop: 10,
  },
  scrollContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    width: '90%',
    height: 750,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBlueSection: {
    flex: 4,
    backgroundColor: '#0B477B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWhiteSection: {
    flex: 6,
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
 dropdownWrapper: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  width: '100%',
  paddingHorizontal: 10,
  backgroundColor: '#fff',
  ...Platform.select({
    ios: {
      height: 150, // 📱 iOS wheel needs more space
      justifyContent: 'center',
    },
    android: {
      height: 65,
    },
  }),
},
picker: {
  width: '100%',
  color: '#000',
  ...Platform.select({
    ios: {
      height: 150, // Ensure full wheel is visible on iOS
    },
    android: {
      height: 60,
    },
  }),
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
});
