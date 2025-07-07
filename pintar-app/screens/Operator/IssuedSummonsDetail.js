// IssuedSummonsDetail.js
import React from 'react';
import * as Print from 'expo-print';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';

const IssuedSummonsDetail = ({ route, navigation }) => {
  const { ticket: transaction } = route.params;

  const handlePrint = async () => {
    const htmlContent = `
      <html>
        <body>
          <h1>Resit Tiket</h1>
          <p><strong>ID Resit:</strong> ${transaction.id}</p>
          <p><strong>Plat Lesen:</strong> ABC 1234</p>
          <p><strong>Operator ID:</strong> Operator ID</p>
          <p><strong>Tarikh & Masa:</strong> ${transaction.date}</p>
          <p><strong>Zone Letak Kereta:</strong> Zone A</p>
          <p><strong>Jumlah Bayaran:</strong> BND ${transaction.title.match(/\d+/)?.[0]}</p>
          <br/>
          <p><em>Saman akan bertukar menjadi kompaun jika tidak dibayar dalam tempoh yang ditetapkan.</em></p>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({
        html: htmlContent,
      });
    } catch (error) {
      console.error('Printing error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>


      {/* Main Content Section */}
      <View style={styles.combinedSection}>      
        {/* Back Button Section */}
        <View style={styles.backButtonContainer}>
            <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            >
            <Ionicons name="arrow-back" size={24} color="#fff" style={styles.arrowIcon} />
            <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.mainSection}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Resit Tiket</Text>
            <Image
                source={require('../../assets/Logo.png')}
                style={styles.logo}
            />
            </View>

            {/* Transaction Details Section */}
            <View style={styles.detailsContainer}>
            <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>ID Resit</Text>
                <Text style={styles.detailText}>{transaction.id}</Text>
            </View>

            <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Plat Lesen</Text>
                <Text style={styles.detailText}>ABC 1234</Text>
            </View>

            <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Operator ID</Text>
                <Text style={styles.detailText}>Operator ID</Text>
            </View>

            <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Tarikh & Masa</Text>
                <Text style={styles.detailText}>{transaction.date}</Text>
            </View>

            <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Zone Letak Kereta</Text>
                <Text style={styles.detailText}>Zone A</Text>
            </View>

            <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Jumlah Bayaran</Text>
                <Text style={styles.detailText}>BND {transaction.title.match(/\d+/)?.[0]}</Text>
            </View>
            </View>

            {/* Print Button Section */}
            <TouchableOpacity
            style={styles.summonButton}
            onPress={handlePrint}
            >
            <MaterialCommunityIcons  name="printer" size={24} color="white" style={styles.printIcon} />
            <Text style={styles.summonText}>Keluarkan Resit</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B477B',
  },

  backButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },

  backText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 5,
  },

  arrowIcon: {
    color: '#000',
    marginRight: 5,
  },

  mainSection: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10, // Rounded edges for a softer look
    shadowColor: '#000', // Adds a subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
    borderColor: '#E6E6E6',
  },

  combinedSection: {
    flex: 1,
    padding: 25,
    backgroundColor: '#F0F8FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  headerContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 5,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C3E50',
  },

  logo: {
    width: 100,
    height: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },

  detailsContainer: {
    marginBottom: 25,
  },

  rowSection: {
    marginBottom: 10,
  },

  detailTitle: {
    fontSize: 16,
    color: '#666B71',
    marginBottom: 8,
  },

  detailText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 12,
  },

  summonButton: {
    backgroundColor: '#0B477B',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  summonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },

  printIcon: {
    marginRight: 10,
  },
});

export default IssuedSummonsDetail;
