import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ResetPembayaranParking = () => {
  const navigation = useNavigation();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const transactionID = await AsyncStorage.getItem('latestTransactionID');

        if (!token || !transactionID) {
          console.error('❌ Missing token or transaction ID');
          return;
        }

        const response = await axios.post(
          'http://192.168.102.55:3001/getreceiptparking',
          { IDTransaction: transactionID },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setReceipt(response.data);
        console.log('✅ Receipt fetched:', response.data);
      } catch (error) {
        console.error('❌ Error fetching receipt:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollContent}>
          <ActivityIndicator size="large" color="#0B477B" />
          <Text>Memuatkan resit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!receipt) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollContent}>
          <Text style={{ color: 'red' }}>❌ Gagal memuatkan data resit.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format date and time
  const formattedDate = new Date(receipt.BUYDATE).toLocaleDateString('en-GB');
  const formattedTime = new Date(receipt.BUYTIME).toLocaleTimeString('en-GB');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Pass Bulanan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.iconPlaceholder}>✅</Text>
            <Text style={styles.confirmationText}>Bayaran Selesai</Text>
            <Text style={styles.transactionId}>ID Transaksi: {receipt.IDTRANSACTION}</Text>
          </View>

          <Text style={styles.cardTitle}>Resit Pembayaran</Text>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>ID Transaksi</Text>
            <Text style={styles.value}>{receipt.IDTRANSACTION}</Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>{receipt.USERNAME}</Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Kaedah Pembayaran</Text>
            <Text style={styles.value}>{receipt.PAYMENTMETHOD}</Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Tarikh Mula & Masa</Text>
            <View style={styles.row}>
              <Text style={styles.value}>{formattedDate}</Text>
              <Text style={styles.value}>{formattedTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Jumlah Bayaran</Text>
            <Text style={styles.value}>BND {parseFloat(receipt.PAYMENTAMOUNT).toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.payButton]}
            onPress={() => navigation.replace('CustomerTabs', { screen: 'Home' })}
          >
            <Text style={styles.buttonText}>Kembali</Text>
          </TouchableOpacity>

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
    color: '#fff',
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
  confirmationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconPlaceholder: {
    fontSize: 40,
    marginBottom: 10,
  },
  confirmationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B477B',
    marginBottom: 5,
  },
  transactionId: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0B477B',
    textAlign: 'center',
  },
  rowColumn: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actionButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#0B477B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResetPembayaranParking;
