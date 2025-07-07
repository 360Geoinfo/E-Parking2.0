// screens/Customer/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Berita = () => {


  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Berita</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.card}>
      <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>Kami sedia membantu anda</Text>
      <Text style={styles.cardSubtitle}>Tanya kami apa-apa berkenaan PINTAR Smart Parking</Text>
      <Text style={styles.cardSubtitle}>1 January 2025</Text>
      </View>
      <Text style={styles.cardArrow}>{'>'}</Text>
      </View>
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
    backgroundColor: '#A22E3B',
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
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 15,
    padding: 15,
  },
  
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  
  cardArrow: {
    fontSize: 24,
    color: '#000',
    marginLeft: 10,
  },
});

export default Berita;




















