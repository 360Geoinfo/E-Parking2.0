// screens/Customer/SeasonPassScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const PassPaymentScreen = () => {

  const [selectedContent, setSelectedContent] = React.useState('content2');

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Pas Bulanan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.buttontop,
            selectedContent === 'content1' && styles.buttontopActive
          ]}
          onPress={() => navigation.navigate('SeasonPassScreen')}
        >
          <Text
            style={[
              styles.buttonText2,
              selectedContent === 'content1' ? styles.buttonTextActive : styles.buttonTextInactive
            ]}
          >
            Tambah Petak
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttontop,
            selectedContent === 'content2' && styles.buttontopActive
          ]}
          onPress={() => setSelectedContent('content2')}
        >
          <Text
            style={[
              styles.buttonText2,
              selectedContent === 'content2' ? styles.buttonTextActive : styles.buttonTextInactive
            ]}
          >
            Pas Bulanan
          </Text>
        </TouchableOpacity>
      </View>


      {selectedContent === 'content1' ? (

        <Text>Navigate to SeasonPassScreen</Text>
        
      ) : (




  <View style={{ alignItems: 'center', width: '100%', marginTop: 20, marginBottom: 10 }}>

    <View style={styles.card2}>

    <View style={styles.cardBlueSection2}>
      <Text style={styles.whiteTextbaki}>Status Pass Bulanan</Text>
      <Text style={styles.whiteText2}>Active</Text>
      <Text style={styles.whiteTextbaki}>Sah Sehingga: 1 February 2025</Text>
    </View>

    <View style={styles.cardWhiteSection}>
    <View style={styles.smallcard}>


    <View style={{ marginBottom:10 }}>
    <Text >Butiran Pass Bulanan</Text>
    </View>



    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <Text>Tarikh Mula: </Text>
      <Text>1 January 2025</Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <Text>Tarikh Tamat: </Text>
      <Text>1 February 2025</Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <Text>Plat License: </Text>
      <Text>ABC 1234</Text>
    </View>

    </View>

    </View>

    <View style={{ alignItems: 'center' }}>
    <TouchableOpacity style={styles.button2}>
      <Text style={styles.buttonText}>Batalkan Langganan</Text>
    </TouchableOpacity>
    </View>

    </View>
  </View>


)}


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
  whiteTextbaki:{
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FCB22D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  selectCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardTitleActive: {
    color: '#fff',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
  },
  cardDescActive: {
    color: '#fff',
  },
  cardtitlelable:{
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    marginBottom: 12,
    marginTop: 12,
  },
  selectCardActive2:{
    backgroundColor: '#0B477B',
    borderColor: '#0B477B',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10, // for spacing between buttons (React Native 0.71+)
  },
  
  buttontop: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttontopActive: {
    backgroundColor: '#0B477B',
  },
  
  buttonText2: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  buttonTextActive: {
    color: '#fff',
  },

  buttonTextInactive: {
    color: '#000',
  },
  card2: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',    // 🛑 Important! to clip the rounded corners properly
    width: '100%',
    height: 600,
  },
  cardBlueSection2: {
    height: 120,                // 📏 4 parts blue
    backgroundColor: '#0B477B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWhiteSection2: {
    padding: 20,                // 📏 6 parts white
    backgroundColor: '#ffffff',
    padding: 20,
  },
  whiteText2:{
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  smallcard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 20,
    marginTop: 20,
  },
  button2: {
    marginTop: 0,
    backgroundColor: '#FCB22D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },

  
});


export default PassPaymentScreen;
