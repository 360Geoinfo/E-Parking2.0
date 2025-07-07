import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Bahasa = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('Malay');

  const renderLanguageButton = (language) => {
    const isSelected = selectedLanguage === language;
    return (
      <TouchableOpacity
        key={language}
        style={[styles.languageButton, isSelected ? styles.languageButtonSelected : styles.languageButtonUnselected]}
        onPress={() => setSelectedLanguage(language)}
      >
        <Text style={[styles.languageText, isSelected ? styles.languageTextSelected : styles.languageTextUnselected]}>
          {language}
        </Text>
        <Ionicons
          name="language"
          size={30}
          color={isSelected ? '#fff' : '#A22E3B'}
          style={{ marginRight: 20 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Bahasa</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderLanguageButton('Malay')}
        {renderLanguageButton('English')}
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

  languageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    width: '90%',
    marginTop: 15,
  },
  
  languageButtonSelected: {
    backgroundColor: '#0B477B',
  },
  
  languageButtonUnselected: {
    backgroundColor: '#fff',
  },
  
  languageText: {
    fontSize: 16,
    flex: 1,
  },
  
  languageTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  
  languageTextUnselected: {
    color: '#000',
    marginLeft: 10,
  },
  
  
});

export default Bahasa;




















