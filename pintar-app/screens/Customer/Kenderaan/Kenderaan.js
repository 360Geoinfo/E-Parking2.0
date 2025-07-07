// screens/Customer/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Kenderaan = () => {

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Kenderaan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TambahKenderaanForm')}>
        <Text style={styles.buttonText}>+ Tambah Kenderaan</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>ABC1234</Text>
        <Ionicons name="trash-outline" size={30} color="#A22E3B" style={{ marginRight: 20, marginTop: 10 }} />
        </View>
        <Text style={[styles.menulabledate, {marginLeft: 10 }]}>Skyline GTR Evo Twin Turbo</Text>
      </View>

      
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>ABC1234</Text>
        <Ionicons name="trash-outline" size={30} color="#A22E3B" style={{ marginRight: 20, marginTop: 10 }} />
        </View>
        <Text style={[styles.menulabledate, {marginLeft: 10 }]}>Tesla AI</Text>
      </View>

    </ScrollView>
    </SafeAreaView>
 
);
};
   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d5f5ff',
  },
  topheader: {
    width: '100%',
    backgroundColor: '#0B477B',
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'left',
    justifyContent: 'left',
    zIndex: 10,
    marginBottom: 0,
    //marginTop: 25,
  },
  toptitleheader: {
    fontSize: 24,
    color: '#ffffff',
  },
  positionHeader : {
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#0B477B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',    // 🛑 Important! to clip the rounded corners properly
    width: '90%',
    height: 80,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    //marginBottom: 12,
    marginTop: 10,
  },
  menulabledate: {
    fontSize: 12,       // Smaller text
    color: '#333',      // Optional: dark grey color
    marginTop: -6,      // Slightly shift text upward
    fontWeight: '400',  // Optional: regular weight
  },
  menulable:{
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    marginLeft: 10,
    //marginBottom: 20,
  },
});

export default Kenderaan;




















