import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Pembayaran = () => {
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(null);
  const [selectedContent, setSelectedContent] = React.useState('content1');

  const navigation = useNavigation();

  const cardDataTambahKredit = [
    { id: 1, title: '10', lablepetak:'10 Petak', description: '10.00', lable: 'BND$10.00'},
    { id: 2, title: '20', lablepetak:'20 Petak', description: '20.00', lable: 'BND$20.00'},
    { id: 3, title: '50', lablepetak:'50 Petak', description: '50.00', lable: 'BND$50.00' },
    { id: 4, title: '75', lablepetak:'75 Petak', description: '75.00', lable: 'BND$75.00' },
  ];

  const cardDatakaedahpembayaran = [
    { id: 1, title: 'Kad', lablepetak: 'Kad', description: '' },
    { id: 2, title: 'E-Wallet', lablepetak: 'E-Wallet', description: '' },
  ];

  const CardSection = ({ title, data, selectedCard, setSelectedCard }) => (
    <View>
      <Text style={styles.cardtitlelable}>{title}</Text>
      <View style={styles.grid}>
        {data.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.selectCard,
              selectedCard === item.id && styles.selectCardActive,
            ]}
            onPress={() => setSelectedCard(item.id)}
          >
            <Text style={[styles.cardTitle, selectedCard === item.id && styles.cardTitleActive]}>
              {item.lablepetak}
            </Text>
            <Text style={[styles.cardDesc, selectedCard === item.id && styles.cardDescActive]}>
              {item.lable}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ButtonRow = ({ content, selectedContent, setSelectedContent }) => (
    <View style={styles.buttonRow}>
      {['content1', 'content2'].map((contentType) => (
        <TouchableOpacity
          key={contentType}
          style={[styles.buttontop, selectedContent === contentType && styles.buttontopActive]}
          onPress={() => setSelectedContent(contentType)}
        >
          <Text
            style={[
              styles.buttonText2,
              selectedContent === contentType ? styles.buttonTextActive : styles.buttonTextInactive,
            ]}
          >
            {content[contentType]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Tambah Petak</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ButtonRow content={{ content1: 'Tambah Petak', content2: 'Pas Bulanan' }} selectedContent={selectedContent} setSelectedContent={setSelectedContent} />

        {selectedContent === 'content1' ? (
          <View style={styles.CardPosition}>
            <View style={styles.card}>
              <View style={styles.cardBlueSection}>
                <Text style={styles.whiteTextbaki}>Baki Petak Semasa</Text>







                <Text style={styles.whiteText}>10 Petak</Text>









              </View>

              <View style={styles.cardWhiteSection}>
                <CardSection
                  title="Tambah Kredit"
                  data={cardDataTambahKredit}
                  selectedCard={selectedCard}
                  setSelectedCard={setSelectedCard}
                />
                <View style={styles.divider} />
                <Text style={styles.cardtitlelable}>Kaedah Pembayaran</Text>
                <CardSection
                  title=""
                  data={cardDatakaedahpembayaran}
                  selectedCard={selectedPaymentMethod}
                  setSelectedCard={setSelectedPaymentMethod}
                />


                <TouchableOpacity
                  style={styles.button}
                  onPress={async () => {
                    try {
                      const selectedCredit = cardDataTambahKredit.find(item => item.id === selectedCard);
                      const selectedPayment = cardDatakaedahpembayaran.find(item => item.id === selectedPaymentMethod);

                      if (!selectedCredit || !selectedPayment) {
                        alert('Sila pilih jumlah petak dan kaedah pembayaran.');
                        return;
                      }

                      // Store selected values
                      await AsyncStorage.setItem('monthlyCreditAmount', selectedCredit.title);
                      await AsyncStorage.setItem('monthlyCreditPrice', selectedCredit.description);
                      await AsyncStorage.setItem('selectedPaymentMethod', selectedPayment.title);


                      // Debug log
                      console.log('Saved to AsyncStorage:', {
                        creditTitle: selectedCredit.title,
                        creditPrice: selectedCredit.description,
                        paymentMethod: selectedPayment.title,
                      });

                      navigation.navigate('PengesahanBayaranTambahPetak');
                    } catch (error) {
                      console.error('Error saving to AsyncStorage:', error);
                      alert('Ralat semasa menyimpan pilihan anda.');
                    }
                  }}
                >
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
                    <Text>75 Petak</Text>
                  </View>
                </View>

                <Text style={styles.cardtitlelable}>Kaedah Pembayaran</Text>

                <CardSection
                  title=""
                  data={cardDatakaedahpembayaran}
                  selectedCard={selectedPaymentMethod}
                  setSelectedCard={setSelectedPaymentMethod}
                />

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PengesahanBayaranBulanan')}>
                <Text style={styles.buttonText}>Tambah Petak</Text>
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
  },
  toptitleheader: {
    fontSize: 24,
    color: '#ffffff',
  },
  positionHeader: {
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  CardPosition: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    height: 750,
  },
  cardBlueSection: {
    height: 120,
    backgroundColor: '#0B477B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWhiteSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  whiteText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  whiteTextbaki: {
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
  cardtitlelable: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    marginBottom: 12,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
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
    overflow: 'hidden',
    width: '100%',
    height: 600,
  },
  cardBlueSection2: {
    height: 120,
    backgroundColor: '#0B477B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWhiteSection2: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  whiteText2: {
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
});

export default Pembayaran;
