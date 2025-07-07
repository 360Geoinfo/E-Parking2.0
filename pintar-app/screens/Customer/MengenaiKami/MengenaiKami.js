// screens/Customer/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons';

const MengenaiKami = () => {


  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Mengenai Kami</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.card}>
      
      <Image
        source={require('../../../assets/b984c4dcf6e3893d59d7027b6c4d05c02525baad.png')}
        style={styles.Logoimage}
        />

      <Text style={styles.cardSubtitle}>Versi 1.0.0</Text>
      <Text style={styles.cardSubtitle2}>App Description</Text>

      <Text style={styles.cardSubtitle}>Dibangun oleh</Text>
      <Text style={styles.cardSubtitle2}>360 Geo Info</Text>

      <Text style={styles.cardSubtitle}>Kerjasama dengan</Text>
      <Text style={styles.cardSubtitle2}>Jabatan Bandaran</Text>


      <View style={styles.card2}>
      <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>Dasar Privacy</Text>
      </View>
      <Text style={styles.cardArrow}>{'>'}</Text>
      </View>
      </View>

      <View style={styles.card2}>
      <View style={styles.cardRow}>
      <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>Terma dan Syarat</Text>
      </View>
      <Text style={styles.cardArrow}>{'>'}</Text>
      </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',    // 🛑 Important! to clip the rounded corners properly
    width: '100%',
    height: 680,
    alignItems: 'center',
  },
  Logoimage: {
    width: '80%',
    height: 180,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    //marginBottom: 20,
  },
  cardSubtitle2: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
  },
  card2: {
    backgroundColor: '#fafafa',
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
    //fontWeight: 'bold',
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

export default MengenaiKami;




















