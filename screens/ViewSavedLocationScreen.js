import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, FlatList, Dimensions, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Video } from 'expo-av';
import { fetchWeatherData } from '../utils/fetchWeatherData';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchModal from '../components/SearchModal'; 
import { getVideoSourceByCode } from '../components/GetVideoSource';

const { width, height } = Dimensions.get('window');

export default function ViewSavedLocationScreen({ route, navigation }) {
  const { locationName, latitude, longitude } = route.params; 
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 
  const [isLiked, setIsLiked] = useState(false); 

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWeatherData(latitude, longitude);
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
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        setLoading(false);
      }
    })();
  }, [latitude, longitude]);

  // Toggle the like state to determine whether the location has been saved
  const toggleLike = async () => {
    try {
      const savedData = await AsyncStorage.getItem('savedLocations');
      let savedLocations = savedData ? JSON.parse(savedData) : [];

      const newLocation = {
        name: weatherData.location.name,
        region: weatherData.location.region,
        country: weatherData.location.country,
        latitude: weatherData.location.lat,
        longitude: weatherData.location.lon,
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
        const isAlreadySaved = savedLocations.some(
          (loc) =>
            loc.name === newLocation.name &&
            loc.region === newLocation.region &&
            loc.country === newLocation.country
        );

        if (!isAlreadySaved) {
          savedLocations.push(newLocation);
          Alert.alert('Location saved', 'The location has been added to your saved locations.');
        } else {
          Alert.alert('Location already saved', 'This location is already in your saved locations.');
        }
      }

      await AsyncStorage.setItem('savedLocations', JSON.stringify(savedLocations));
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle like state:', error);
    }
  };

  const getNext24HoursForLocation = (forecast, locationTime) => {
    // Parse locationTime directly to get the hour
    const locationHour = new Date(locationTime).getHours();
      
    // Get today's forecast
    const todayForecast = forecast[0].hour;
  
    // Filter today's forecast starting from the location's current hour
    const remainingTodayHours = todayForecast.filter((hourData) => {
      const hour = new Date(hourData.time).getHours();
      return hour >= locationHour;
    });
  
    // Get the next day's forecast if today's forecast does not cover 24 hours
    const tomorrowForecast = forecast[1]?.hour || [];
    const remainingTomorrowHours = tomorrowForecast.slice(0, 24 - remainingTodayHours.length);
  
    return [...remainingTodayHours, ...remainingTomorrowHours];
  };  
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!weatherData || !weatherData.current) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not fetch weather data.</Text>
      </View>
    );
  }

  // Choose which video to use as the background based on the weather condition
  const videoSource = getVideoSourceByCode(weatherData.current.condition.code);

  const toggleExpand = () => {
    setExpanded(!expanded);
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
      {/* Sets the video background based on the condition */}
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
        {/* DIsplay name, region, country */}
        <Text style={styles.cityName}>
          {weatherData.location.name ? `${weatherData.location.name}, ` : ''}
          {weatherData.location.region ? `${weatherData.location.region}, ` : ''}
          {weatherData.location.country ? weatherData.location.country : ''}
        </Text>
        <Text style={styles.dateText}>
          {formatLocalTime(weatherData.location.localtime)}
        </Text>

        {/* Current Weather Condition */}
        <Image
          style={styles.weatherIcon}
          source={{ uri: `https:${weatherData.current.condition.icon}` }}
        />
        <Text style={styles.temperature}>{weatherData.current.temp_c}°C</Text>
        <Text style={styles.condition}>{weatherData.current.condition.text}</Text>

        {/* Display the hourly forecast for a searched or saved location */}
        <View style={styles.hourlyContainer}>
          <Text style={styles.sectionTitle}>Hourly Forecast</Text>
          <FlatList
            horizontal
            data={getNext24HoursForLocation(
              weatherData.forecast.forecastday,
              weatherData.location.localtime
            )}
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


        {/* Weather Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Current Weather Status</Text>
          <Text style={styles.statText}>Humidity: {weatherData.current.humidity}%</Text>
          <Text style={styles.statText}>Wind Speed: {weatherData.current.wind_kph} kph</Text>
          <Text style={styles.statText}>Wind Direction: {weatherData.current.wind_dir}</Text>
          <Text style={styles.statText}>Feels Like: {weatherData.current.feelslike_c}°C</Text>
          <Text style={styles.statText}>Pressure: {weatherData.current.pressure_mb} mb</Text>
          <Text style={styles.statText}>Visibility: {weatherData.current.vis_km} km</Text>
        </View>

        {/* 7-Day Forecast */}
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

        {/* Astronomy Data */}
        <View style={styles.astronomyContainer}>
          <Text style={styles.sectionTitle}>Astronomy</Text>
          <Text style={styles.astronomyText}>Sunrise: {weatherData.forecast.forecastday[0].astro.sunrise}</Text>
          <Text style={styles.astronomyText}>Sunset: {weatherData.forecast.forecastday[0].astro.sunset}</Text>
          <Text style={styles.astronomyText}>Moon Phase: {weatherData.forecast.forecastday[0].astro.moon_phase}</Text>
        </View>

        {/* Air Quality Index (AQI) */}
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

      {/* Drop-Up Buttons */}
      {expanded && (
        <View style={styles.dropUpButtons}>
          <TouchableOpacity style={styles.dropUpButton} onPress={() => navigation.navigate('HomeScreen')}>
            <Ionicons name="home-outline" size={24} color="white" />
          </TouchableOpacity>
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

      {/* Main Floating Button */}
      <TouchableOpacity
        style={[styles.fab, expanded && styles.fabExpanded]}
        onPress={toggleExpand}
      >
        <Ionicons name={expanded ? "remove" : "add"} size={24} color={expanded ? "#6200ee" : "white"} />
      </TouchableOpacity>

      {/* Search Modal */}
      <SearchModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onSelectLocation={(location) => navigation.navigate('SearchLocationScreen', { locationName: location.name, latitude: location.lat, longitude: location.lon })}
      />
    </SafeAreaView>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff0000',
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
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
    height: 240, // Total spacing between the additional buttons
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
