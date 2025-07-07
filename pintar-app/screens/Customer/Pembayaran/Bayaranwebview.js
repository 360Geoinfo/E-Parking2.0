import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import uuid from 'react-native-uuid';

const BayaranWebView = ({ route }) => {
  const navigation = useNavigation();
  const { paymentUrl } = route.params;

  const [paymentInfo, setPaymentInfo] = useState({
    username: '',
    paymentMethod: '',
    creditAmount: '',
    creditPrice: '',
    token: '',
    userID: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        const paymentMethod = await AsyncStorage.getItem('selectedPaymentMethod');
        const creditAmount = await AsyncStorage.getItem('monthlyCreditAmount');
        const creditPrice = await AsyncStorage.getItem('monthlyCreditPrice');
        const token = await AsyncStorage.getItem('token');
        const userID = await AsyncStorage.getItem('userID');

        setPaymentInfo({
          username: username || '',
          paymentMethod: paymentMethod || '',
          creditAmount: creditAmount || '',
          creditPrice: creditPrice || '',
          token: token || '',
          userID: userID || '',
        });
      } catch (error) {
        console.error('❌ Error retrieving AsyncStorage values:', error);
      }
    };

    loadData();
  }, []);

  const handleNavigationChange = async (navState) => {
    const { url } = navState;

    if (url.includes('successIndicator') || url.includes('Message=Successful')) {
      console.log('✅ Payment complete, sending POST to /petakpayment...');

      const transactionID = uuid.v4(); // generate random UUID for transaction

      const payload = {
        userID: paymentInfo.userID,
        PETAKDIGIT: paymentInfo.creditAmount,
        IDTRANSACTION: transactionID,
        USERNAME: paymentInfo.username,
        PAYMENTSTATUS: 'Paid',
        PAYMENTAMOUNT: paymentInfo.creditPrice,
        PAYMENTMETHOD: paymentInfo.paymentMethod,
      };

      try {
        const response = await axios.post(
          'http://192.168.102.55:3001/petakpayment',
          payload,
          {
            headers: {
              Authorization: `Bearer ${paymentInfo.token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('✅ Payment data submitted:', response.data);
        
        // ✅ Store the transaction ID in AsyncStorage
        await AsyncStorage.setItem('latestTransactionID', transactionID);
        console.log('💾 Stored transaction ID in AsyncStorage:', transactionID);


        navigation.replace('ResetPembayaranParking');
      } catch (error) {
        console.error('❌ Error posting to /petakpayment:', error.response?.data || error.message);
        // Optionally, show error UI or retry logic
      }
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color="#0B477B" size="large" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BayaranWebView;
