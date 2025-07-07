// screens/Customer/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';


const KhidmatSokongan = () => {


  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Khidmat Sokongan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.card}>
        <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>Hubungi Kami</Text>
        <Text style={styles.cardSubtitle}>Waktu Pejabat: </Text>
        <Text style={styles.cardSubtitle}>Isnin-Jumaat, 09:00 AM - 05:00 PM</Text>
      

        <View style={styles.contactCardContainer}>
 
        <TouchableOpacity style={styles.contactCardPhone}>
        <View style={styles.iconRow}>
        <Ionicons name="call" size={20} color="#fff" style={styles.contactIcon} />
        <Text style={styles.contactCardText}>Hubungi Pejabat</Text>
        </View>
        </TouchableOpacity>



        <TouchableOpacity style={styles.contactCardWhatsApp}> 
        <View style={styles.iconRow}>
        <Ionicons name="logo-whatsapp" size={20} color="#fff" style={styles.contactIcon} />
        <Text style={styles.contactCardText}>WhatsApp</Text>
        </View> 
        <Text style={[styles.cardSubtitle, { color: '#fff' }]}>Hubungi Waktu Pejabat</Text>
        </TouchableOpacity>
        </View>


    
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
  contactCardContainer: {
    width: '100%',
    marginTop: 15,
    gap: 10,
    
  },
  
  contactCardPhone: {
    backgroundColor: '#0B477B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  
  contactCardWhatsApp: {
    backgroundColor: '#25D366',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  contactCardText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconRow: {
  flexDirection: 'row',
  alignItems: 'center',
  //marginTop: 15,
  gap: 10
},

});

export default KhidmatSokongan;




















