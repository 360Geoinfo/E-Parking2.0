import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

// Import Screens
import Tambahpetakhistory from '../SejarahTransaksi/Tambahpetakhistory';
import PasBulananHistory from '../SejarahTransaksi/PasBulananhistory';
import PembayaranHistory from '../SejarahTransaksi/PembayaranHistory';

const SejarahTransaksi = () => {
  const [selectedContent, setSelectedContent] = useState('content1');

  const contentMapping = {
    content1: <Tambahpetakhistory />,
    content2: <PembayaranHistory />,
    content3: <PasBulananHistory />,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topheader}>
        <Text style={styles.toptitleheader}>Sejarah Transaksi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.buttonRow}>
            {['content1', 'content2', 'content3'].map((content) => (
              <TouchableOpacity
                key={content}
                style={[styles.buttontop, selectedContent === content && styles.buttontopActive]}
                onPress={() => setSelectedContent(content)}
              >
                <Text
                  style={[
                    styles.buttonText2,
                    selectedContent === content ? styles.buttonTextActive : styles.buttonTextInactive,
                  ]}
                >
                  {content === 'content1' ? 'Tambah Petak' : content === 'content2' ? 'Pembayaran' : 'Pas Bulanan'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {contentMapping[selectedContent]}
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
    justifyContent: 'flex-start',
    marginBottom: 0,
  },
  toptitleheader: {
    fontSize: 24,
    color: '#ffffff',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    minHeight: 300,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttontop: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttontopActive: {
    backgroundColor: '#0B477B',
  },
  buttonText2: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonTextInactive: {
    color: '#333',
  },
});

export default SejarahTransaksi;
