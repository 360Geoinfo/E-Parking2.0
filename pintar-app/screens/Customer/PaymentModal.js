import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

const PaymentModal = ({ visible, onClose, onSuccess }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = async () => {
    try {
      console.log("Sending payment...");
  
      const response = await axios.post('https://api.pocketpay.com.bn/v1/payments/create', {
        card_number: '4444555566667777', // Test Card
        expiry_date: '12/29',            // Future Expiry Date
        cvv: '123',                      // Any 3-digit CVV
        amount: 5.00,
        currency: 'BND',
        description: 'Extend Parking Time',
      }, {
        headers: {
          'Authorization': 'XnUgH1PyIZ8p1iF2IbKUiOBzdrLPNnWq', // Test API Key
          'Content-Type': 'application/json',
        },
      });
  
      console.log("Response:", response.data);
  
      if (response.data?.status === 'success') {
        Alert.alert('Berjaya', 'Bayaran berjaya dan masa parkir ditambah.');
        onSuccess();
        onClose();
      } else {
        Alert.alert('Gagal', response.data.message || 'Bayaran gagal.');
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert('Ralat', error.message || 'Masalah semasa membuat bayaran.');
    }
  };  

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Maklumat Kad</Text>

          <TextInput
            placeholder="Nombor Kad"
            keyboardType="number-pad"
            value={cardNumber}
            onChangeText={setCardNumber}
            style={styles.input}
          />

          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
            <Text>{expiry || 'Tamat Tempoh (MM/YY)'}</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                  const year = selectedDate.getFullYear().toString().slice(-2);
                  setExpiry(`${month}/${year}`);
                }
              }}
            />
          )}

          <TextInput
            placeholder="CVV"
            keyboardType="number-pad"
            value={cvv}
            onChangeText={setCvv}
            style={styles.input}
          />

          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <Text style={styles.payButtonText}>Bayar $5 BND</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 12,
    paddingVertical: 8,
  },
  payButton: {
    backgroundColor: '#00796B',
    padding: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
  },
});
