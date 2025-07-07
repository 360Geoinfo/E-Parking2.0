// screens/Customer/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const TambahKenderaanForm = () => {
  const [noPlat, setNoPlat] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [jenis, setJenis] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topheader}>
        <View style={styles.positionHeader}>
          <Text style={styles.toptitleheader}>Tambah Kenderaan</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>


        <View style={styles.card}>

        <Text style={styles.label}>Nombor Plat License</Text>
          <TextInput
            style={styles.input}
            placeholder="No Plat"
            value={noPlat}
            onChangeText={setNoPlat}
          />

        <Text style={styles.label}>Jenis Kenderaan</Text>
        <View style={styles.pickerContainer}>
            <Picker
              selectedValue={jenis}
              onValueChange={(itemValue) => setJenis(itemValue)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Pilih Jenis Kenderaan" value="" />
              <Picker.Item label="Kereta" value="car" />
              <Picker.Item label="Motosikal" value="bike" />
              <Picker.Item label="Van" value="van" />
            </Picker>
          </View>


          <Text style={styles.label}>Model Kenderaan</Text>
          <TextInput
            style={styles.input}
            placeholder="Model Kenderaan"
            value={model}
            onChangeText={setModel}
          />

          <Text style={styles.label}>Warna Kereta</Text>
          <TextInput
            style={styles.input}
            placeholder="Warna Kereta"
            value={color}
            onChangeText={setColor}
          />


        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Tambah Kenderaan</Text>
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
    justifyContent: 'flex-start',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 50,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#0B477B',
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
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 10,
  },
  
});

export default TambahKenderaanForm;
