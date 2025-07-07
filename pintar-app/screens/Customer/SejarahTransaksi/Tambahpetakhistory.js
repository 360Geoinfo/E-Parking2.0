import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tambahpetakhistory = () => {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Icon name="plus-circle" size={20} color="#0B477B" />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Tambah Petak</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>+ 10 Petak</Text>
      </View>
      <Text style={[styles.menulabledate, { marginLeft: 10 }]}>1 January 2025</Text>
      <View style={styles.divider} />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Icon name="plus-circle" size={20} color="#0B477B" />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Tambah Petak</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>+ 10 Petak</Text>
      </View>
      <Text style={[styles.menulabledate, { marginLeft: 10 }]}>2 January 2025</Text>
      <View style={styles.divider} />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Icon name="plus-circle" size={20} color="#0B477B" />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Tambah Petak</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>+ 10 Petak</Text>
      </View>
      <Text style={[styles.menulabledate, { marginLeft: 10 }]}>3 January 2025</Text>
      <View style={styles.divider} />
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    marginTop: 10,
  },
  menulabledate: {
    fontSize: 12,       // Smaller text
    color: '#333',      // Optional: dark grey color
    marginTop: -6,      // Slightly shift text upward
    fontWeight: '400',  // Optional: regular weight
  },
  menulable: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    marginLeft: 10,
  },
  menulablearrow: {
    fontSize: 16,
    color: '#0B477B',
    fontWeight: 'bold',
  },
});

export default Tambahpetakhistory;
