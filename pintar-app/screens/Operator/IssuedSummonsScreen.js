import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const dummyIssuedTickets = [
  { id: '1', title: 'Saman RM50', date: '2024-07-15', status: 'Dikeluarkan' },
  { id: '2', title: 'Saman RM20', date: '2024-07-13', status: 'Dikeluarkan' },
  { id: '3', title: 'Saman RM30', date: '2024-07-10', status: 'Dikeluarkan' },
  { id: '4', title: 'Saman RM25', date: '2024-07-09', status: 'Dikeluarkan' },
  { id: '5', title: 'Saman RM10', date: '2024-07-08', status: 'Dikeluarkan' },
  { id: '6', title: 'Saman RM100', date: '2024-07-07', status: 'Dikeluarkan' },
  { id: '7', title: 'Saman RM80', date: '2024-07-06', status: 'Dikeluarkan' },
  { id: '8', title: 'Saman RM60', date: '2024-07-05', status: 'Dikeluarkan' },
  { id: '9', title: 'Saman RM40', date: '2024-07-04', status: 'Dikeluarkan' },
  { id: '10', title: 'Saman RM90', date: '2024-07-03', status: 'Dikeluarkan' },
];

const itemsPerPage = 4;

const IssuedTicketsScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTickets = dummyIssuedTickets.filter(item =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedData = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.rowContainer}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
          <Text
            style={[
              styles.transactionStatus,
              item.status === 'Dikeluarkan' ? styles.issued : styles.failed,
            ]}
          >
            {item.status}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            // Navigate to the TicketDetailScreen and pass the current item as a parameter
            navigation.navigate('Keterangan Saman', { ticket: item });
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.detailButtonText}>Butiran </Text>
            <Ionicons name="chevron-forward" size={14} color="#000" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalPages }, (_, index) => (
        <TouchableOpacity
          key={index + 1}
          style={[styles.pageButton, currentPage === index + 1 && styles.activePage]}
          onPress={() => setCurrentPage(index + 1)}
        >
          <Text
            style={[styles.pageButtonText, currentPage === index + 1 && styles.activePageText]}
          >
            {index + 1}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.backgroundSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari saman..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setCurrentPage(1); // Reset to first page on search
          }}
        />

        <FlatList
          data={paginatedData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />

        {renderPagination()}
      </View>
    </View>
  );
};

export default IssuedTicketsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    padding: 20,
  },

  backgroundSection: {
    flex: 1,
    paddingVertical: 25,
    paddingHorizontal: 25,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderColor: '#E6E6E6',
  },

  backButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#E6E6E6',
    borderWidth: 1,
  },

  backText: {
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    fontSize: 16,
  },

  listContainer: {
    paddingBottom: 20,
  },

  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  transactionDate: {
    fontSize: 14,
    color: '#888',
    marginVertical: 4,
  },

  transactionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  issued: {
    color: 'green',
  },

  failed: {
    color: 'red',
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4,
    borderRadius: 6,
  },

  activePage: {
    backgroundColor: '#F8D07A',
  },

  pageButtonText: {
    fontSize: 16,
    color: '#333',
  },

  activePageText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },

  detailButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F8D07A',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 5,
  },

  detailButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
