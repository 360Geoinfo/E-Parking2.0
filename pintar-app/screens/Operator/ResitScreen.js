import React from 'react';
import * as Print from 'expo-print';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';

export default function ResitScreen({ route, navigation }) {
  const { user } = route.params;

  const handlePrint = async () => {
    const htmlContent = `
      <html>
        <body>
          <h1>Resit Saman</h1>
          <p><strong>Plate Lesen:</strong> ${user.plate}</p>
          <p><strong>Saman ID:</strong> ${user.samanId}</p>
          <p><strong>Operator ID:</strong> ${user.operatorId}</p>
          <p><strong>Tarik & Masa:</strong> ${user.time}</p>
          <p><strong>Kesalahan:</strong> ${user.reason}</p>
          <p><strong>Zone Letak Kerita:</strong> ${user.zone}</p>
          <p><strong>Jumlah Bayaran:</strong> ${user.subtotal}</p>
          <p><strong>Tarik Akhir Pembayaran:</strong> ${user.paymentDue}</p>
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
      {/* Title Section */}
      {/* <View style={styles.titleContainer}>
        <Text style={styles.title}>Carian Kenderaan</Text>
      </View> */}

      {/* Combined Section */}
      <View style={styles.combinedSection}>
        {/* Back Button Container */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Carian Kenderaan')} // Navigate to Home screen
          >
            <Ionicons name="arrow-back" size={24} color="#fff" style={styles.arrowIcon} />
            <Text style={styles.backText}>Muleh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainSection}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Resit Saman</Text>
            {/* Logo Image */}
            <Image
              source={require('../../assets/Logo.png')}  // Path to your logo image
              style={styles.logo}
            />
          </View>

          <View style={styles.resitsamanSection}>
            {/* User Details Section */}
            <View style={styles.detailsContainer}>
              {/* Underlined Sections */}
              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Plate Lesen</Text>
                <Text style={styles.detailText}>{user.plate}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Saman ID</Text>
                <Text style={styles.detailText}>{user.samanId}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Operator ID</Text>
                <Text style={styles.detailText}>{user.operatorId}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Tarik & Masa</Text>
                <Text style={styles.detailText}>{user.time}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Kesalahan</Text>
                <Text style={styles.detailText}>{user.reason}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Zone Letak Kerita</Text>
                <Text style={styles.detailText}>{user.zone}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Jumlah Bayaran</Text>
                <Text style={styles.detailText}>{user.subtotal}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Tarik Akhir Pembayaran</Text>
                <Text style={styles.detailText}>{user.paymentDue}</Text>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  Saman akan bertukar menjadi kompaun jika tidak dibayar dalam tempoh yang ditetapkan.
                </Text>
              </View>
            </View>
          </View>
        </View>

      {/* Action Buttons Section */}
      {user.status !== 'Aktif' && (
        <TouchableOpacity
          style={styles.summonButton}
          onPress={handlePrint}
        >
          <MaterialCommunityIcons name="printer" size={24} color="white" style={styles.printIcon} />
          <Text style={styles.summonText}>Keluarkan Saman</Text>
        </TouchableOpacity>
      )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B477B',
  },

  titleContainer: {
    padding: 20,
    marginBottom: 0,  // No space at the bottom
  },    

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#ffffff',   // Change text color to white
  },

  combinedSection: {
    flex: 1,
    padding: 25,
    backgroundColor: '#F0F8FF',
    shadowColor: '#000', // Adds a subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
  },

  resitsamanSection: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  mainSection: {
    paddingVertical: 25,
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

  backButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  backButton: {
    flexDirection: 'row', // Align icon and text in a row
    alignItems: 'center', // Center the items vertically
    backgroundColor: '#FFFFFF',
    paddingVertical: 12, // Slightly larger padding for the button
    paddingHorizontal: 25,
    borderRadius: 8, // Rounded edges for a softer look
    borderWidth: 1,
    borderColor: '#E6E6E6', // Darker border color for better contrast
  },

  backText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18, // Slightly larger text for readability
    marginLeft: 5, // Add space between the arrow and the text
  },

  arrowIcon: {
    color: '#000',
    marginRight: 5, // Optional margin if you want to adjust spacing between the icon and text
  },

  detailsContainer: {
    marginBottom: 25, // Increased margin for spacing
  },

  detailText: {
    fontSize: 18,
    color: '#000000', // Darker text for better readability
    marginBottom: 12, // More spacing between details
  },

  summonButton: {
    backgroundColor: '#0B477B',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',  // Align the text and icon horizontally
    justifyContent: 'center',  // Center the content
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  summonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10, // Space between the icon and text
  },

  printIcon: {
    marginRight: 10, // Optional: space between icon and text
  },

  headerContainer: {
    marginBottom: 20,
    flexDirection: 'row', // This makes it a row layout
    justifyContent: 'space-between', // This aligns the elements within the row
    alignItems: 'center', // This centers the items vertically
    width: '100%',
    borderBottomWidth: 2, // Adds a border at the bottom for the underline
    borderBottomColor: '#000', // Color of the underline
    paddingBottom: 5, // Padding below the text for spacing from the border
  },

  headerTitle: {
    paddingHorizontal: 20,
    fontSize: 26, // Increased font size for header
    fontWeight: 'bold',
    color: '#2C3E50', // Darker color for better contrast
  },

  logo: {
    width: 100,  // Adjust the size of the logo as needed
    height: 40,  // Adjust the height accordingly
    marginRight: 10,
    resizeMode: 'contain',  // Ensures the logo fits within the provided size
  },

  rowSection: {
    marginBottom: 25, // Increased margin between sections
  },

  detailTitle: {
    fontSize: 16, // Slightly larger for emphasis
    color: '#666B71',
    marginBottom: 8, // Spacing before the text
  },

  descriptionContainer: {
    marginTop: 30,
    padding: 15,
  },

  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },

  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22, // Adjusting line height for better readability
  },
});
