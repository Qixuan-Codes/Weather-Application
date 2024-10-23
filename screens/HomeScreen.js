import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, FlatList, Dimensions, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Video } from 'expo-av';
import { fetchWeatherData } from '../utils/fetchWeatherData';
import LocationPrompt from '../components/LocationPrompt';
import SearchModal from '../components/SearchModal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVideoSourceByCode } from '../components/GetVideoSource';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const data = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
      setWeatherData(data);
      setLoading(false);

      // Check if the location is already saved (liked)
      const savedData = await AsyncStorage.getItem('savedLocations');
      const savedLocations = savedData ? JSON.parse(savedData) : [];
      const isSaved = savedLocations.some(
        (loc) =>
          loc.name === data.location.name &&
          loc.region === data.location.region &&
          loc.country === data.location.country
      );
      setIsLiked(isSaved);

    })();
  }, []);


  // Loading animation 
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!location || !weatherData) {
    return <LocationPrompt />;
  }

  // Choose the videosource as the background of the page based on the weather condition
  const videoSource = getVideoSourceByCode(weatherData.current.condition.code);

  // Pass values gathered from the search modal and navigate to the search screen
  const handleSelectLocation = (location) => {
    const { name, region, country, lat, lon } = location;

    navigation.navigate('SearchLocationScreen', {
      locationName: name,
      latitude: lat,
      longitude: lon,
    });
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Toggle between the like state to determine whether the location has been saved
  const toggleLike = async () => {
    try {
      const savedData = await AsyncStorage.getItem('savedLocations');
      let savedLocations = savedData ? JSON.parse(savedData) : [];

      const newLocation = {
        name: weatherData.location.name,
        region: weatherData.location.region,
        country: weatherData.location.country,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      if (isLiked) {
        // Unlike (remove from saved locations)
        savedLocations = savedLocations.filter(
          (loc) =>
            !(loc.name === newLocation.name &&
              loc.region === newLocation.region &&
              loc.country === newLocation.country)
        );
        Alert.alert('Location removed', 'The location has been removed from your saved locations.');
      } else {
        // Like (add to saved locations)
        savedLocations.push(newLocation);
        Alert.alert('Location saved', 'The location has been added to your saved locations.');
      }

      await AsyncStorage.setItem('savedLocations', JSON.stringify(savedLocations));
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle like state:', error);
    }
  };

  // For the hourly forecast to ensure it starts from the current hour
  const getNext24Hours = (forecast) => {
    const currentDateTime = new Date();
    const currentHour = currentDateTime.getHours();
    
    const todayForecast = forecast[0].hour;
  
    // Filter the forecast based on the current time
    const remainingTodayHours = todayForecast.filter((hourData) => {
      const hour = new Date(hourData.time).getHours();
      return hour >= currentHour;
    });
  
    // Fetch the remaining hours from the next day if there isnt enough hours for the full 24 hours period
    const tomorrowForecast = forecast[1]?.hour || [];
    const remainingTomorrowHours = tomorrowForecast.slice(0, 24 - remainingTodayHours.length);
  
    return [...remainingTodayHours, ...remainingTomorrowHours]; // Combine the values and return to the view
  };
  
  

  function formatLocalTime(localtime) {
    const date = new Date(localtime);
    
    // Define month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Get day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Get hours and minutes
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Determine am/pm
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    // Format the final date string
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  return (
    <SafeAreaView style={styles.container}>
    {/* Sets the background based on the weather condition */}
      <Video
        source={videoSource}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
      {/* Prints the name, region, country */}
        <Text style={styles.cityName}>
          {weatherData.location.name ? `${weatherData.location.name}, ` : ''}
          {weatherData.location.region ? `${weatherData.location.region}, ` : ''}
          {weatherData.location.country ? weatherData.location.country : ''}
        </Text>
        <Text style={styles.dateText}>
          {formatLocalTime(weatherData.location.localtime)}
        </Text>

        {/* Use the icon generated by the API */}
        <Image
          style={styles.weatherIcon}
          source={{ uri: `https:${weatherData.current.condition.icon}` }}
        />

        {/* Get the current temperature and condition */}
        <Text style={styles.temperature}>{weatherData.current.temp_c}°C</Text>
        <Text style={styles.condition}>{weatherData.current.condition.text}</Text>

        {/* Display the hourly forecast by the API */}
        <View style={styles.hourlyContainer}>
          <Text style={styles.sectionTitle}>Hourly Forecast</Text>
          <FlatList
            horizontal
            data={getNext24Hours(weatherData.forecast.forecastday)}
            renderItem={({ item }) => (
              <View style={styles.hourCard}>
                <Text style={styles.hourText}>{item.time.split(" ")[1]}</Text>
                <Image source={{ uri: `https:${item.condition.icon}` }} style={styles.hourIcon} />
                <Text style={styles.hourTemp}>{item.temp_c}°C</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>


        {/* Display current weather status */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Current Weather Status</Text>
          <Text style={styles.statText}>Humidity: {weatherData.current.humidity}%</Text>
          <Text style={styles.statText}>Wind Speed: {weatherData.current.wind_kph} kph</Text>
          <Text style={styles.statText}>Wind Direction: {weatherData.current.wind_dir}</Text>
          <Text style={styles.statText}>Feels Like: {weatherData.current.feelslike_c}°C</Text>
          <Text style={styles.statText}>Pressure: {weatherData.current.pressure_mb} mb</Text>
          <Text style={styles.statText}>Visibility: {weatherData.current.vis_km} km</Text>
        </View>

        {/* Display the forecast */}
        <View style={styles.forecastContainer}>
          <Text style={styles.sectionTitle}>7-Day Forecast</Text>
          <FlatList
            horizontal
            data={weatherData.forecast.forecastday}
            renderItem={({ item }) => (
              <View style={styles.forecastCard}>
                <Text style={styles.forecastDate}>{item.date}</Text>
                <Image source={{ uri: `https:${item.day.condition.icon}` }} style={styles.forecastIcon} />
                <Text style={styles.forecastTemp}>{item.day.avgtemp_c}°C</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Display sunrise, sunset and the moon phase */}
        <View style={styles.astronomyContainer}>
          <Text style={styles.sectionTitle}>Astronomy</Text>
          <Text style={styles.astronomyText}>Sunrise: {weatherData.forecast.forecastday[0].astro.sunrise}</Text>
          <Text style={styles.astronomyText}>Sunset: {weatherData.forecast.forecastday[0].astro.sunset}</Text>
          <Text style={styles.astronomyText}>Moon Phase: {weatherData.forecast.forecastday[0].astro.moon_phase}</Text>
        </View>

        {/* Display the AQI */}
        <View style={styles.aqiContainer}>
          <Text style={styles.sectionTitle}>Air Quality Index</Text>
          <Text style={[styles.aqiText, getAQIColorStyle(weatherData.current.air_quality['us-epa-index'])]}>
            AQI: {weatherData.current.air_quality['us-epa-index']}
          </Text>
          <Text style={styles.aqiDetailText}>CO: {weatherData.current.air_quality.co.toFixed(2)} µg/m³</Text>
          <Text style={styles.aqiDetailText}>NO2: {weatherData.current.air_quality.no2.toFixed(2)} µg/m³</Text>
          <Text style={styles.aqiDetailText}>O3: {weatherData.current.air_quality.o3.toFixed(2)} µg/m³</Text>
          <Text style={styles.aqiDetailText}>SO2: {weatherData.current.air_quality.so2.toFixed(2)} µg/m³</Text>
          <Text style={styles.aqiDetailText}>PM2.5: {weatherData.current.air_quality.pm2_5.toFixed(2)} µg/m³</Text>
          <Text style={styles.aqiDetailText}>PM10: {weatherData.current.air_quality.pm10.toFixed(2)} µg/m³</Text>
        </View>
      </ScrollView>

      {/* Buttons created to navigate between pages */}
      {expanded && (
        <View style={styles.dropUpButtons}>
          <TouchableOpacity style={styles.dropUpButton} onPress={() => navigation.navigate('SavedLocationsScreen')}>
            <Ionicons name="bookmarks-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dropUpButton,
              { backgroundColor: isLiked ? 'white' : '#6200ee' }, // Change background color based on like state
            ]}
            onPress={toggleLike}
          >
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#6200ee" : "white"} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropUpButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

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

// Function to get AQI color style based on the index
function getAQIColorStyle(aqi) {
  if (aqi === 1) {
    return { color: 'green' }; // Good
  } else if (aqi === 2) {
    return { color: 'yellow' }; // Moderate
  } else if (aqi === 3) {
    return { color: 'orange' }; // Unhealthy for sensitive groups
  } else if (aqi === 4) {
    return { color: 'red' }; // Unhealthy
  } else if (aqi === 5) {
    return { color: 'purple' }; // Very Unhealthy
  } else if (aqi === 6) {
    return { color: 'maroon' }; // Hazardous
  } else {
    return { color: 'grey' }; // Unknown or unclassified
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay to enhance text readability
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20, // Add padding to the bottom to avoid overlap with the bottom edge
  },
  cityName: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 15,
  },
  dateText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
  },
  weatherIcon: {
    width: 120,
    height: 120,
    marginVertical: 10,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '300',
    color: '#ffffff',
    marginVertical: 5,
  },
  condition: {
    fontSize: 28,
    fontStyle: 'italic',
    color: '#ffffff',
    marginBottom: 30,
  },
  hourlyContainer: {
    marginTop: 10,
    width: '100%',
  },
  hourCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  hourText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  hourIcon: {
    width: 40,
    height: 40,
  },
  hourTemp: {
    fontSize: 18,
    color: '#ffffff',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent card
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statText: {
    fontSize: 20,
    color: '#ffffff',
    marginVertical: 5,
  },
  forecastContainer: {
    marginTop: 20,
    width: '100%',
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  forecastDate: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  forecastIcon: {
    width: 50,
    height: 50,
  },
  forecastTemp: {
    fontSize: 20,
    color: '#ffffff',
  },
  astronomyContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 15,
  },
  astronomyText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 5,
  },
  aqiContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  aqiText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aqiDetailText: {
    fontSize: 16,
    color: '#ffffff',
    marginVertical: 2,
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
    height: 180, // Total spacing between the additional buttons
  },
  dropUpButton: {
    backgroundColor: '#6200ee',
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});