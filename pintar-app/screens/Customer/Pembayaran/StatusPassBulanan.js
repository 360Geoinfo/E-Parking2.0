import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const StatusPassBulanan = () => {
  const [selectedContent, setSelectedContent] = useState('content2');
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Pass Bulanan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.buttontop, selectedContent === 'content1' && styles.buttontopActive]}
            onPress={() => {
              setSelectedContent('content1');
              navigation.navigate('SeasonPassScreen');
            }}
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
            style={[styles.buttontop, selectedContent === 'content2' && styles.buttontopActive]}
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
              <TouchableOpacity onPress={() => navigation.navigate('PengesahanBayaran')}>
                <Text>Navigate to SeasonPassScreen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', width: '100%', marginTop: 20, marginBottom: 10 }}>
            <View style={styles.card2}>
              <View style={styles.cardBlueSection2}>
                <Text style={styles.whiteTextbaki}>Status Pass Bulanan</Text>
                <Text style={styles.whiteText2}>Aktif</Text>
                <Text style={styles.whiteTextbaki}>Sah sehingga: 1 February 2025</Text>
              </View>

              <View style={styles.cardWhiteSection}>
                <View style={styles.smallcard}>
                  <Text style={styles.detailTitle}>Butiran Pas Bulanan</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tarikh Mula:</Text>
                    <Text style={styles.detailValue}>1 Januari 2025</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tarikh Tamat:</Text>
                    <Text style={styles.detailValue}>1 Februari 2025</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plat License:</Text>
                    <Text style={styles.detailValue}>KJ360</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kenderan:</Text>
                    <Text style={styles.detailValue}>SUV - Toyota Corollia - Merah</Text>
                  </View>
                </View>
              </View>

              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('SeasonPassScreen')}>
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
  cardWhiteSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  whiteTextbaki: {
    color: '#ffffff',
    fontSize: 16,
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
  },
  button2: {
    backgroundColor: '#FCB22D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
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
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0B477B',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
});

export default StatusPassBulanan;
