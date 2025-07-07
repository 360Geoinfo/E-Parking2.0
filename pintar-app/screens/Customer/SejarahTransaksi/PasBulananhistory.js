import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const PasBulananhistory = () => {
  const pasBulanans = [
    { date: '1 January 2025', details: '+ 50 Petak' },
    { date: '2 February 2025', details: '+ 30 Petak' },
    { date: '3 March 2025', details: '+ 20 Petak' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {pasBulanans.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.row}>
              <Text style={styles.menulable}>Pembelian Pas Bulanan</Text>
              <Text style={styles.menulablearrow}>{item.details}</Text>
            </View>
            <Text style={styles.menulabledate}>{item.date}</Text>
            {index < pasBulanans.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    padding: 20,
  },
  itemContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  menulable: {
    fontSize: 16,
    color: '#000',
    flex: 1,
    marginLeft: 10,
  },
  menulablearrow: {
    fontSize: 16,
    color: '#A22E3B',
    marginRight: 20,
  },
  menulabledate: {
    fontSize: 12,
    color: '#333',
    marginTop: -6,
    fontWeight: '400',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    marginTop: 10,
  },
});

export default PasBulananhistory;
