import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import axios from 'axios';
import { WEATHER_API_KEY } from '@env';

export default function SearchModal({ modalVisible, setModalVisible, onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(
            `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${query}`
          );
          setSuggestions(response.data);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Helper function to format item text
  const formatItemText = (item) => {
    let text = item.name ? item.name : '';
    if (item.region) {
      text += text ? `, ${item.region}` : item.region;
    }
    if (item.country) {
      text += text ? `, ${item.country}` : item.country;
    }
    return text;
  };

  // Helper function to handle closing the modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setSuggestions([]);
    setQuery('');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Search for a City</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={(text) => setQuery(text)}
            placeholder="Enter city name"
          />

          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => (item.id ? item.id.toString() : item.name)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    const location = {
                      name: item.name,
                      region: item.region,
                      country: item.country,
                      lat: item.lat,
                      lon: item.lon,
                    };
                    onSelectLocation(location);
                    handleCloseModal(); // Close modal after selecting a suggestion
                  }}
                >
                  <Text style={styles.itemText}>{formatItemText(item)}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsContainer}
            />
          )}

          <TouchableOpacity onPress={handleCloseModal}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 120, 
    width: '100%', 
    backgroundColor: 'white',
    zIndex: 2,
    borderRadius: 5,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
  closeButton: {
    fontSize: 18,
    color: '#007BFF',
    marginTop: 20,
  },
});

