import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, LayoutAnimation, UIManager, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import SearchModal from '../components/SearchModal';


// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SavedLocationsScreen() {
  const [savedLocations, setSavedLocations] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const swipeableRefs = useRef({});

  useEffect(() => {
    const fetchSavedLocations = async () => {
      const savedData = await AsyncStorage.getItem('savedLocations');
      if (savedData) {
        setSavedLocations(JSON.parse(savedData));
      }
    };

    fetchSavedLocations();
  }, []);

  // Navigate to the ViewSavedLocationScreen with the parameters chosen by the user
  const handleLocationPress = (location) => {
    navigation.navigate('ViewSavedLocationScreen', {
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  // Delete saved location
  const handleDeleteLocation = async (locationToDelete, index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const updatedLocations = savedLocations.filter(
      (location) =>
        location.name !== locationToDelete.name ||
        location.latitude !== locationToDelete.latitude ||
        location.longitude !== locationToDelete.longitude
    );

    setSavedLocations(updatedLocations);
    await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));

    if (swipeableRefs.current[index]) {
      swipeableRefs.current[index].close();
    }
  };

  // Pass the parameters and navigate to the search page
  const handleSelectLocation = (location) => {
    navigation.navigate('SearchLocationScreen', {
      locationName: location.name,
      latitude: location.lat,
      longitude: location.lon,
    });
  };

  // Delete button
  const renderRightActions = (location, index) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          Alert.alert(
            'Delete Location',
            'Are you sure you want to delete this location?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => handleDeleteLocation(location, index),
              },
            ]
          )
        }
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };


  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={savedLocations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const locationDisplay = [item.name, item.region, item.country]
            .filter(value => value && value.trim() !== '')
            .join(', ');

          return (
            <Swipeable
              ref={(ref) => swipeableRefs.current[index] = ref}
              renderRightActions={() => renderRightActions(item, index)}
            >
              <TouchableOpacity onPress={() => handleLocationPress(item)} style={styles.locationItem}>
                <Text style={{ fontSize: 18 }}>
                  {locationDisplay}
                </Text>
                <Text style={{ color: 'gray' }}>
                  Lat: {item.latitude}, Long: {item.longitude}
                </Text>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
      />

      {/* Drop-Up Buttons */}
      {expanded && (
        <View style={styles.dropUpButtons}>
          <TouchableOpacity style={styles.dropUpButton} onPress={() => navigation.navigate('HomeScreen')}>
            <Ionicons name="home-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropUpButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="search-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Floating Button */}
      <TouchableOpacity
        style={[styles.fab, expanded && styles.fabExpanded]}
        onPress={toggleExpand}
      >
        <Ionicons name={expanded ? "remove" : "add"} size={24} color={expanded ? "#6200ee" : "white"} />
      </TouchableOpacity>

      <SearchModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onSelectLocation={handleSelectLocation}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  locationItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6200ee',
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabExpanded: {
    backgroundColor: 'white',
  },
  dropUpButtons: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 120, // Total spacing between the additional buttons
  },
  dropUpButton: {
    backgroundColor: '#6200ee',
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    marginBottom: 10,
  },
});
