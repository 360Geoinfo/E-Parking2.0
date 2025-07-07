import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CompoundScreen = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Kompaun</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari mengikut nombor plat atau id kompound"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

          <View style={styles.warningCard}>
            <MaterialIcons name="error-outline" size={20} color="#D32F2F" style={styles.warningIcon} />
            <Text style={styles.warningText}>Saman akan bertukar menjadi kompaun jika tidak dibayar dalam tempoh 14 hari dari tarikh dikeluarkan.
            </Text>
          </View>

        <View style={styles.compoundCardSaman}>

        <View style={styles.compoundRow}>
          <Text style={styles.compoundtextdata}>BBH1234</Text>
          <Text style={styles.compoundTextTitle}>Saman</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={styles.compounlabletext}>ID</Text>
          <Text style={styles.compoundtextdata}>ID-12345</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={styles.compounlabletext}>Sebab</Text>
          <Text style={styles.compoundtextdata}>Tidak membayar letak kereta</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={styles.compounlabletext}>Tempoh Masa</Text>
          <Text style={styles.compoundtextdata}>27 April 2025, 10:00AM</Text>
        </View>

        <View style={styles.divider} />

        <View style={{ marginBottom: 13 }}>
        <Text style={styles.compounlabletext}>Jumlah Bayaran</Text>
        </View>
        <View style={styles.compoundRow2}>
        <Text style={styles.compoundtextdata}>10 Petak</Text> 

        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Bayar Sekarang</Text>
        </TouchableOpacity>
        </View>
        </View>

        {/* Add a gap between cards here, if needed */}
        <View style={{ height: 10 }} />

          <View style={styles.compoundCardkompound}>

          <View style={styles.compoundRow}>
            <Text style={styles.compoundtextdata}>KJ1234</Text>
            <Text style={styles.compoundTextTitle}>Kompaun</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
          <Text style={styles.compounlabletext}>ID</Text>
          <Text style={styles.compoundtextdata}>ID-12345</Text>
        </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.compounlabletext}>Sebab</Text>
            <Text style={styles.compoundtextdata}>Tidak membayar letak kereta</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.compounlabletext}>Tempoh Masa</Text>
            <Text style={styles.compoundtextdata}>1 January 2025, 10:00AM</Text>
          </View>

          <View style={styles.divider} />

          <View style={{ marginBottom: 13 }}>
          <Text style={styles.compounlabletext}>Jumlah Bayaran</Text>
          </View>
          <View style={styles.compoundRow2}>
          <Text style={styles.compoundtextdata}>BND $50</Text> 

          <View style={styles.warningCard}>
            <MaterialIcons name="error-outline" size={20} color="#D32F2F" style={styles.warningIcon} />
            <Text style={styles.warningText}>Sila bayar di balai polis bandar</Text>
          </View>

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
    justifyContent: 'flex-start',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    //paddingVertical: 8,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,       
    borderColor: '#000000',       
    height: 55
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  compoundCardSaman: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 12,
    marginTop: 0,
    marginBottom: 10,
    justifyContent: 'center',
  },
  warningIcon: {
    marginRight: 3,
  },
  warningText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  compoundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // This pushes items to edges
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  compoundRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // This pushes items to edges
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  compoundTextTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  compoundtextdata:{
    fontSize: 14,
    color: '#333',
  },
  compounlabletext:{
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    marginBottom: 12,
    marginTop: 12,
  },
  payButton: {
    backgroundColor: '#0B477B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start', 
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  compoundCardkompound:{
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
  },
});


export default CompoundScreen;