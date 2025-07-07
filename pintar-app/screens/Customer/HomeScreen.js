import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');

  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
        }
      } catch (error) {
        console.error('Error fetching username:', error.message);
      }
    };

    fetchUsername();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topheader}>
        <Text style={styles.titleheader}>PINTAR Smart Parking</Text>
      </View>

      <View style={styles.secondtopheader}>
        <Text style={styles.secondheader}>Selamat Pagi</Text>
        <Text style={styles.secondheader}>{user?.username || 'Customer'}!</Text>
      </View>

      <View style={styles.floatingButtonContainer}>
      <TouchableOpacity style={styles.floatingButton}>
      <MaterialIcons name="my-location" size={30} color="#fff" />
      </TouchableOpacity>
      </View>

      <MapView style={styles.map} initialRegion={initialRegion}>
        <Marker
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="Your Car"
          description="Last parked here"
        />
      </MapView>

      {/*Bottom Card*/}
    <View style={styles.position}>
      <View style={styles.listContainer}>
        <View style={styles.positionbottomtext}>
        <Text style={styles.bottomtext}>Letak Kereta Luar Jalan</Text>
        </View>

        <View style={styles.positionbottomtextleft}>
        <Text style={styles.bottomtextgray}>Lokasi</Text>
        <Text style={styles.bottomtextblack}>Zone A (Jalan Cator)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowContainer}>
        <View style={styles.positionbottomtextleft}>
          <Text style={styles.bottomtextgray}>Kenderaan</Text>
          <Text style={styles.bottomtextblack}>BBH1234</Text>
        </View>

        <View style={styles.positionbottomtextleft}>
        <Text style={styles.bottomtextgray}>Tempoh Masa</Text>
        <Text style={styles.bottomtextblack}>Pilih</Text>
        </View>
        </View>

        <View style={styles.positionbottombutton}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Letak Kereta Sini</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B477B',
  },
  topheader: {
    width: '100%',
    backgroundColor: '#0B477B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    //marginBottom: 10,
    marginTop: 20,
  },
  titleheader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 18,
    color: '#ffffff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    top: 80,
    zIndex: 1, 
  },

  listItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: '100%',
    zIndex: 2,   
    width : '100%',       
  },
  parkingName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 4,
  },
  parkingTime: {
    fontSize: 13,
    color: '#666',
  },
  position: {
    position: 'absolute',       // ⭐ Absolute positioning relative to the parent
    bottom: 20,                 // ⭐ 90px from the bottom
    alignSelf: 'center',         // ⭐ Center horizontally
    alignItems: 'center',        // (Optional, in case it's a container)
    justifyContent: 'center',    // (Optional, for child alignment)
    width : '90%',
  },
  bottomtext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B477B',
    alignItems: 'center',        // (Optional, in case it's a container)
    justifyContent: 'center',    // (Optional, for child alignment)
  },
  positionbottomtext: {
    alignItems: 'center',        // (Optional, in case it's a container)
    justifyContent: 'center',    // (Optional, for child alignment)
  },
  positionbottomtextleft: {
    flex: 1,               // Each block takes equal width
    alignItems: 'left',  // Center inside each block
  },
  bottomtextgray:{
    color: '#999999',
  },
  bottomtextbalck:{
    color: '#000000',
  },
  divider: {
    height: 1,             // Thin line
    backgroundColor: '#ccc', // Light gray color
    width: '100%',          // Adjust width if needed
    alignSelf: 'center',   // Center the divider
    marginVertical: 10,    // Space above and below the divider
  },
    rowContainer: {
      flexDirection: 'row',          // Items side by side
      justifyContent: 'flex-start',  // ⭐ Start from the left (NOT space-between)
      alignItems: 'flex-start',       // ⭐ Align top-left
      width: '100%',
      //paddingHorizontal: 20,
      marginBottom: 10,
    },
    button: {
      backgroundColor: '#0B477B',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    positionbottombutton : {
      marginTop: 20,
    },
    floatingButtonContainer: {
      position: 'absolute',
      top: 120, // Adjust depending on your topheader height
      right: 20, // Move a bit from right edge
      zIndex: 2, // Make sure it stays above the map
    },
    
    floatingButton: {
      backgroundColor: '#0B477B', // Same green color
      width: 60,
      height: 60,
      borderRadius: 30, // Make it a perfect circle
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    floatingButtonText: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
    },
    floatingButtonContainer: {
      position: 'absolute',
      top: 160,
      right: 20,
      zIndex: 2,
    },
    floatingButton: {
      backgroundColor: '#0B477B',
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },

    secondtopheader: {
      width: '100%',
      backgroundColor: '#0B477B',
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'left',
      justifyContent: 'left',
      zIndex: 10,
      marginBottom: 20,
      //marginTop: 25,
    },
    secondheader: {
      fontSize: 14,
      color: '#ffffff',
    },
});