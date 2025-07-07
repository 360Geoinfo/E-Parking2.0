// screens/Customer/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../context/AuthContext';


const ProfileScreen = () => {
  // Hardcoded sample data for this example
const navigation = useNavigation();

const { logout } = useAuth();

const handleLogout = () => {
  // You can clear storage or context here if needed
  navigation.replace('Login'); // Replace with your actual login/welcome screen
};


  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Tetapan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.card}>

      <TouchableOpacity
        onPress={() => navigation.navigate('SejarahTransaksi')}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Icon name="history" size={20} color="#0B477B" style={{ marginLeft: 20 }} />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Sejarah Transaksi</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.divider} />


      <TouchableOpacity
        onPress={() => navigation.navigate('Kenderaan')}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Icon name="car" size={20} color="#0B477B" style={{ marginLeft: 20 }} />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Kenderaan</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.divider} />


      <TouchableOpacity
        onPress={() => navigation.navigate('Bahasa')}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Icon name="history" size={20} color="#0B477B" style={{ marginLeft: 20 }} />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Bahasa</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>{'>'}</Text>
      </TouchableOpacity>

      </View>



      <View style={styles.card2}>

      <TouchableOpacity
        onPress={() => navigation.navigate('Berita')}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Icon name="report" size={20} color="#0B477B" style={{ marginLeft: 20 }} />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Berita</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity
        onPress={() => navigation.navigate('KhidmatSokongan')}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Icon name="support" size={20} color="#0B477B" style={{ marginLeft: 20 }} />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Khidmat Sokongan</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity
        onPress={() => navigation.navigate('MengenaiKami')}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Icon name="info" size={20} color="#0B477B" style={{ marginLeft: 20 }} />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Mengenai Kami</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity
        onPress={() => navigation.navigate('PadamAccount')}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
      >
        <Icon name="recycke" size={20} color="#0B477B" style={{ marginLeft: 20 }} />
        <Text style={[styles.menulable, { flex: 1, marginLeft: 10 }]}>Padam Account</Text>
        <Text style={[styles.menulablearrow, { marginRight: 20 }]}>{'>'}</Text>
      </TouchableOpacity>


      </View>
      <TouchableOpacity style={[styles.row, { backgroundColor: '#A22E3B' }]} onPress={handleLogout}>
        <Text style={[styles.rowText, { color: '#fff' }]}>Log Keluar</Text>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.arrowIcon} />
 
      </TouchableOpacity>

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
    alignItems: 'left',
    justifyContent: 'left',
    zIndex: 10,
    marginBottom: 0,
    //marginTop: 25,
  },
  toptitleheader: {
    fontSize: 24,
    color: '#ffffff',
  },
  positionHeader : {
    marginTop: 10,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#A22E3B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',    // 🛑 Important! to clip the rounded corners properly
    width: '100%',
    height: 220,
    marginBottom: 20, // ✅ Add this line to create space between card1 and card2
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    width: '100%',
    //marginBottom: 12,
    //marginTop: 5,
  },
  menulable:{
    fontSize: 16,
    color: '#000',
    marginTop: 20,
    marginLeft: 10,
    marginBottom: 20,
  },
  menulablearrow:{
    fontSize: 30,
    color: '#000',
  },
  card2: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',    // 🛑 Important! to clip the rounded corners properly
    width: '100%',
    height: 290,
    marginBottom: 20, // ✅ Add this line to create space between card1 and card2
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#fff', // or your preferred base
  },
  rowText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default ProfileScreen;




















