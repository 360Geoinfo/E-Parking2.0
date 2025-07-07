import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PengesahanBayaranBulanan = () => {

const navigation = useNavigation();

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
            <Text style={styles.value}>Ali bin Abu</Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Kenderaan</Text>
            <Text style={styles.value}>KJ360</Text>
            <Text style={styles.value}>SUV - Toyota Corrolla - Merah</Text>
          </View>


           <View style={styles.row}>
            <Text style={styles.label}>Tarikh Mula</Text>
            <Text style={styles.label}>Tarikh Tamat</Text>
          </View>


          <View style={styles.row}>
            <Text style={styles.value}>1/1/2025</Text>
            <Text style={styles.value}>1/2/2025</Text>
          </View>


          <View style={styles.rowColumn}>
            <Text style={styles.label}>Kaedah Pembayaran</Text>
            <Text style={styles.value}>Kad</Text>
          </View>

          <View style={styles.rowColumn}>
            <Text style={styles.label}>Jumlah</Text>
            <Text style={styles.value}>75 Petak</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Jumlah Bayaran</Text>
            <Text style={styles.value}>BND 75.00</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => console.log('Batal')}>
              <Text style={styles.buttonText2}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.payButton]} onPress={() => navigation.navigate('ResetPembayaran')}>
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
      buttonText2: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
      },
      rowColumn: {
        flexDirection: 'column',
        marginBottom: 12,
      },
      
  });
  
  export default PengesahanBayaranBulanan;