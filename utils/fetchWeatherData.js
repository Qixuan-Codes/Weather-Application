import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { WEATHER_API_KEY } from '@env';

export const fetchWeatherData = async (latitude, longitude) => {
  let cachedData = null;

  try {
    const cacheKey = `weatherData_${latitude}_${longitude}`;
    cachedData = await AsyncStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        const currentTime = new Date().getTime();
        const dataAge = currentTime - parsedData.timestamp;

        // Check network status
        const netInfo = await NetInfo.fetch();

        // Use cached data if it's less than 10 minutes old
        if (dataAge < 600000) {
          console.log("Using cached weather data (less than 10 minutes old)");
          return parsedData.data;
        }

        // Delete cached data if it's more than 1 hour old and there is an internet connection
        if (dataAge > 3600000 && netInfo.isConnected) {
          console.log("Cached data is more than 1 hour old and connected to the internet. Deleting cached data.");
          await AsyncStorage.removeItem(cacheKey);
        }

        // Use cached data if there is no internet connection
        if (!netInfo.isConnected) {
          console.log("No internet connection. Using cached weather data.");
          return parsedData.data;
        }

      } catch (parseError) {
        console.error("Error parsing cached data:", parseError);
        await AsyncStorage.removeItem(cacheKey);
      }
    }

    // If no valid cached data or connected to the internet, fetch new data from API
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=7&aqi=yes&alerts=no`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded');
      }
      throw new Error('Failed to fetch weather data from API');
    }

    const data = await response.json();

    if (!data || Object.keys(data).length === 0 || !data.current || !data.location) {
      throw new Error('Incomplete or empty data from API');
    }

    // Save new data to AsyncStorage with timestamp
    const newData = {
      data,
      timestamp: new Date().getTime(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(newData));

    return data;

  } catch (error) {
    console.error("Error fetching weather data:", error);

    if (cachedData) {
      console.log("Error occurred. Using cached weather data.");
      try {
        return JSON.parse(cachedData).data;
      } catch (parseError) {
        console.error("Error parsing fallback cached data:", parseError);
        return null;
      }
    }

    return null;
  }
};
