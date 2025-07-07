// screens/Customer/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Animated, Easing } from 'react-native';

const PadamAccount = () => {

  const [showConfirmation, setShowConfirmation] = useState(false);

  const slideAnim = useState(new Animated.Value(0))[0]; // Initial position

 //Nanti tah mem fixed the slide
  const slideDown = () => {
    setShowConfirmation(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const slideUp = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowConfirmation(false);
    });
  };

  const slideInterpolation = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0], // Slide from top
  });


  return (
    <SafeAreaView style={styles.container}>


      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Padam Account</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

      <View style={styles.card}>

      <View style={styles.warningCard}>
        <MaterialIcons name="error-outline" size={20} color="#D32F2F" style={styles.warningIcon} />
      <Text style={styles.warningText}>Amaran</Text>
      </View>

      <Text style={styles.cardSubtitle1}>Memadam akaun anda akan menghapuskan semua data anda secara kekal.</Text>
      
      <Text style={styles.cardSubtitle2}>Tindakan ini tidak boleh diundur</Text>
      <Text style={styles.cardSubtitle3}>Data yang akan dipadam:</Text>


      <Text style={styles.cardSubtitle4}>• Malumat profile dan akaun</Text>
      <Text style={styles.cardSubtitle4}>• Sejarah transaksi</Text>
      <Text style={styles.cardSubtitle4}>• Kenderaan berdaftar</Text>
      <Text style={styles.cardSubtitle4}>• Pas bulanan dan petak</Text>


      {!showConfirmation && (
        <TouchableOpacity style={styles.buttonpadam} onPress={slideDown}>
          <Text style={styles.buttonTextpadam}>Padam Akaun</Text>
        </TouchableOpacity>
      )}


    {showConfirmation && (
     <Animated.View
        style={[
          styles.confirmationContainer,
          { transform: [{ translateY: slideInterpolation }] },
        ]}
      >
    <Text style={styles.label}>Masukkan Kata Laluan</Text>
    <TextInput
      style={styles.input}
      placeholder="Nyatakan sebab padam akaun"
      placeholderTextColor="#888"
      multiline
    />

    <TouchableOpacity style={[styles.button, styles.redButton]}>
      <Text style={styles.buttonText}>Padam Akaun</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.button, styles.grayButton]}
      onPress={slideUp}
    >
      <Text style={styles.buttonText}>Batal</Text>
    </TouchableOpacity>
  </Animated.View>
    )}

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
    height: 650,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'left',
  },
  cardSubtitle1: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    marginLeft:20,
  },

  cardSubtitle2: {
    fontSize: 14,
    color: '#555',
    //marginBottom: 20,
    marginLeft:20,
  },
  cardSubtitle3: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    marginLeft:20,
    marginTop: 20,
    fontWeight: '600',
  },
  cardSubtitle4: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginLeft:20,
    //marginTop: 20,
  },

  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center', // ✅ This centers the card in its container
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
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%', // Full width of container
    marginBottom: 10, // Adds spacing between buttons
  },
  
  
  redButton: {
    backgroundColor: '#D32F2F',
  },
  
  grayButton: {
    backgroundColor: '#9E9E9E',
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonpadam: {
    marginTop: 10,
    marginBottom: 90,
    backgroundColor: '#A22E3B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center', // ✅ This centers the card in its container
  },
  buttonTextpadam: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 10,
  },
  

  
});

export default PadamAccount;




















