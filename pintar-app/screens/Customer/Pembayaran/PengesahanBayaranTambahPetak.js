import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const PengesahanBayaranBulanan = () => {

  const navigation = useNavigation();

   const [username, setUsername] = useState('');
   const [payment, setPayment] = useState('');
   const [jumlah, setJumlah] = useState('');
   const [harga, setHarga] = useState('');



 useEffect(() => {
  const fetchData = async () => {
    try {

      const storedUsername = await AsyncStorage.getItem('username');
      const paymentMethod = await AsyncStorage.getItem('selectedPaymentMethod');
      const creditAmount = await AsyncStorage.getItem('monthlyCreditAmount');
      const creditPrice = await AsyncStorage.getItem('monthlyCreditPrice');

      if (storedUsername) setUsername(storedUsername);
      if (paymentMethod) setPayment(paymentMethod);
      if (creditAmount) setJumlah(creditAmount);
      if (creditPrice) setHarga(creditPrice);

    } catch (error) {
      console.error('Error reading data from AsyncStorage', error);
    }
  };

  fetchData();
}, []);


//testpocket -----------------------------------------------------------------------------------
class PaymentService {
  constructor({ apiKey, salt, environment }) {
    this.apiKey =
      environment === 'test'
        ? "XnUgH1PyIZ8p1iF2IbKUiOBzdrLPNnWq"
        : apiKey;
    this.salt =
      environment === 'test'
        ? "FOLzaoJSdbgaNiVVA73vGiIR7yovZury4OdOalPFoWTdKmDVxfoJCJYTs4nhUFS2"
        : salt;

    const baseURL =
      environment === 'test'
        ? 'http://pay.threeg.asia'
        : 'https://pocket-pay.threeg.asia';

    // Then inside constructor
    this.client = axios.create({
     baseURL,
    headers: { 'Content-Type': 'application/json' },
    });
    }

  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || error.response.data,
      };
    }
    return { status: 500, message: "Unknown error occurred." };
  }

  
  async generateHashedData(data) {
  const endpoint = '/payments/hash';
  try {
    const response = await this.client.post(endpoint, {
      api_key: this.apiKey,
      salt: this.salt,
      ...data,
    });
    return response.data;
  } catch (error) {
    const formattedError = this.handleError(error);
    throw formattedError;
  }
}


  async getNewOrderId() {
    const endpoint = '/payments/getNewOrderId';
    try {
      const response = await this.client.post(endpoint, {
        api_key: this.apiKey,
        salt: this.salt,
      });
      return response.data;
    } catch (error) {
      const formattedError = this.handleError(error);
      throw formattedError;
    }
  }
}


const handlePayNow = async () => {
  console.log('🟡 handlePayNow() triggered...');

  // Step 0: Setup API keys and service
  const apiKey = 'XnUgH1PyIZ8p1iF2IbKUiOBzdrLPNnWq';
  const salt = 'FOLzaoJSdbgaNiVVA73vGiIR7yovZury4OdOalPFoWTdKmDVxfoJCJYTs4nhUFS2';

  // Initialize service with test environment
  const service = new PaymentService({
    apiKey,
    salt,
    environment: 'test',
  });

  try {
    // Step 1: Get new order ID
    console.log('📦 Step 1: Getting order ID...');
    const orderResponse = await service.getNewOrderId();
    const orderId = orderResponse.new_id;
    console.log('✅ Step 1 - Order ID:', orderId);

    // Step 2: Prepare payment data payload
    console.log('📝 Step 2: Preparing payment details...');
    const paymentDetails = {
      subamount_1: 1000,
      subamount_2: 0,
      subamount_3: 0,
      subamount_4: 0,
      subamount_5: 0,
      subamount_1_label: 'Order Total',
      subamount_2_label: 'string',
      subamount_3_label: 'string',
      subamount_4_label: 'string',
      subamount_5_label: 'string',
      order_id: orderId,
      order_info: `This is the order info ${orderId}.`,
      order_desc: 'Description',
      return_url: 'https://dummy.return.url/after-payment',
      callback_url: 'http://pocket-api.threeg.asia/callbase',
      discount: 0,
      promo: 'string',
      promo_code: 'string',
    };

    // Step 2: Generate hash from payment data
    console.log('🔐 Step 2: Generating hashed data...');
    const hashResponse = await service.generateHashedData(paymentDetails);
    const hashedData = hashResponse.hashed_data;
    console.log('✅ Step 2 - Hashed Data:', hashedData);

    // Step 3: Send final create payment request
    console.log('🚀 Step 3: Sending final payment request...');
    const finalPayload = {
      ...paymentDetails,
      api_key: apiKey,
      salt,
      hashed_data: hashedData,
    };

    const res = await fetch('http://pay.threeg.asia/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
    });

    const result = await res.json();
    console.log('✅ Step 3 - Payment URL:', result.payment_url);

    // Step 4: Navigate to WebView screen with payment URL
    if (result.payment_url) {
      console.log('🌐 Navigating to WebView with payment URL...');
      navigation.navigate('BayaranWebView', { paymentUrl: result.payment_url });
    } else {
      console.warn('⚠️ Payment URL is missing in response.');
      Alert.alert('Ralat', 'Gagal mendapatkan pautan pembayaran.');
    }
  } catch (error) {
    // Catch any errors and display alert
    console.error('❌ Error during payment process:', error);
    Alert.alert('Ralat', error.message || 'Proses pembayaran gagal');
  }
};
//testpocket -----------------------------------------------------------------------------------


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Pass Bulanan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pengesahan Bayaran</Text>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>{username || 'Memuatkan...'}</Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Kaedah Pembayaran</Text>
            <Text style={styles.value}>{payment || 'Memuatkan...'}</Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Jumlah</Text>
            <Text style={styles.value}>{jumlah || 'Memuatkan...'}</Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Jumlah Bayaran</Text>
            <Text style={styles.value}>BND${harga || 'Memuatkan...'}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => navigation.replace('CustomerTabs', { screen: 'Pembayaran' })}
            >
              <Text style={styles.buttonTextCancel}>Batal</Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
               onPress={handlePayNow}
            >
              <Text style={styles.buttonText}>Bayar Sekarang</Text>
            </TouchableOpacity>
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
  },
  positionHeader: {
    marginTop: 10,
  },
  toptitleheader: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 180,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0B477B',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowColumn: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  payButton: {
    backgroundColor: '#0B477B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextCancel: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PengesahanBayaranBulanan;
