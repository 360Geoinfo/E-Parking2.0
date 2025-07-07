// screens/Customer/SeasonPassScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SeasonPassScreen = () => {

  const [selectedCard, setSelectedCard] = React.useState(null);
  const [selectedCard2, setSelectedCard2] = React.useState(null);
  const [selectedCard3, setSelectedCard3] = React.useState(null);

  const [selectedContent, setSelectedContent] = React.useState('content1');

  const navigation = useNavigation();

  const cardDataTambahKredit = [
    { id: 1, title: '10 Petak', description: 'Price - BND$10.00'},
    { id: 2, title: '20 Petak', description: 'Price - BND$20.00'},
    { id: 3, title: '50 Petak', description: 'Price - BND$50.00'},
    { id: 4, title: '100 Petak', description: 'Price - BND$100.00'},
  ];
  
  const cardDatakaedahpembayaran = [
    { id: 1, title: '10 Petak', description: 'Price - BND$10.00'},
    { id: 2, title: '20 Petak', description: 'Price - BND$20.00'},
  ];

  const cardDatakaedahpembayaran2 = [
    { id: 1, title: 'Kad', description: ''},
    { id: 2, title: 'E-Wallet', description: ''},
  ];

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Tambah Petak</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.buttontop,
            selectedContent === 'content1' && styles.buttontopActive
          ]}
          onPress={() => setSelectedContent('content1')}
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

  <View style={styles.CardPosition}>
    <View style={styles.card}>
      <View style={styles.cardBlueSection}>
        <Text style={styles.whiteTextbaki}>Baki Petak Semasa</Text>
        <Text style={styles.whiteText}>10 Petak</Text>
      </View>

      <View style={styles.cardWhiteSection}>
        <Text style={styles.cardtitlelable}>Tambah Kredit</Text>
        <View style={styles.grid}>
          {cardDataTambahKredit.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.selectCard,
                selectedCard === item.id && styles.selectCardActive,
              ]}
              onPress={() => setSelectedCard(item.id)}
            >
              <Text style={[
                styles.cardTitle,
                selectedCard === item.id && styles.cardTitleActive,
              ]}>
                {item.title}
              </Text>
              <Text style={[
                styles.cardDesc,
                selectedCard === item.id && styles.cardDescActive,
              ]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.cardtitlelable}>Kaedah Pembayaran</Text>
        <View style={styles.grid}>
          {cardDatakaedahpembayaran.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.selectCard2,
                selectedCard2 === item.id && styles.selectCardActive2,
              ]}
              onPress={() => setSelectedCard2(item.id)}
            >
              <Text style={[
                styles.cardTitle2,
                selectedCard2 === item.id && styles.cardTitleActive2,
              ]}>
                {item.title}
              </Text>
              <Text style={[
                styles.cardDesc2,
                selectedCard2 === item.id && styles.cardDescActive2,
              ]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Tambah Petak</Text>
        </TouchableOpacity>



      </View>
    </View>
  </View>
) : (

  <View style={{ alignItems: 'center', width: '100%', marginTop: 20, marginBottom: 10 }}>

    <View style={styles.card2}>

    <View style={styles.cardBlueSection2}>
      <Text style={styles.whiteTextbaki}>Status Pass Bulanan</Text>
      <Text style={styles.whiteText2}>Tiada pas bulanan digunakan</Text>
    </View>

    <View style={styles.cardWhiteSection}>
    <View style={styles.smallcard}>

    <Text>Pas Bulanan (1 Bulan)</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <Text>1/1/2025 - 1/2/2025</Text>
      <Text>BND$60</Text>
    </View>

    </View>

    <Text style={styles.cardtitlelable}>Kaedah Pembayaran</Text>

    <View style={styles.grid}>
          {cardDatakaedahpembayaran2.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.selectCard3,
                selectedCard2 === item.id && styles.selectCardActive3,
              ]}
              onPress={() => setSelectedCard2(item.id)}
            >
              <Text style={[
                styles.cardTitle3,
                selectedCard2 === item.id && styles.cardTitleActive3,
              ]}>
                {item.title}
              </Text>
              <Text style={[
                styles.cardDesc3,
                selectedCard2 === item.id && styles.cardDescActive3,
              ]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

    </View>

    <View style={{ alignItems: 'center' }}>
    <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('PassPaymentScreen')}>
      <Text style={styles.buttonText}>Beli Pass Bulanan</Text>
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
  CardPosition :{
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',    // 🛑 Important! to clip the rounded corners properly
    width: '100%',
    height: 750,
  },
  cardBlueSection: {
    height: 120,                // 📏 4 parts blue
    backgroundColor: '#0B477B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWhiteSection: {
    padding: 20,                // 📏 6 parts white
    backgroundColor: '#ffffff',
    padding: 20,
  },
  whiteText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
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
  selectCardActive: {
    backgroundColor: '#0B477B',
    borderColor: '#0B477B',
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
  selectCard2:{
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  cardTitleActive2:{
    color: '#fff',
  },
  cardDescActive2:{
    color: '#fff',
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
    height: 80,
  },
  button2: {
    marginTop: 0,
    backgroundColor: '#FCB22D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  selectCardActive3:{
    backgroundColor: '#0B477B',
    borderColor: '#0B477B',
  },
  selectCard3:{
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  cardTitleActive3:{
    color: '#fff',
  },
  cardDescActive3:{
    color: '#fff',
  },
 

  
});


export default SeasonPassScreen;
