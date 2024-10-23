import React from 'react';

// Define the mapping of weather codes to simplified video categories
const weatherVideoMap = {
  // Clear or Sunny
  1000: require('../assets/videos/clear.mp4'), // Sunny / Clear

  // Partly Cloudy
  1003: require('../assets/videos/partlycloudy.mp4'), // Partly cloudy
  1063: require('../assets/videos/partlycloudy.mp4'), // Patchy rain possible
  1066: require('../assets/videos/partlycloudy.mp4'), // Patchy snow possible
  1069: require('../assets/videos/partlycloudy.mp4'), // Patchy sleet possible
  1072: require('../assets/videos/partlycloudy.mp4'), // Patchy freezing drizzle possible
  1087: require('../assets/videos/partlycloudy.mp4'), // Thundery outbreaks possible

  // Cloudy
  1006: require('../assets/videos/cloudy.mp4'), // Cloudy
  1009: require('../assets/videos/cloudy.mp4'), // Overcast
  1030: require('../assets/videos/cloudy.mp4'), // Mist
  1135: require('../assets/videos/cloudy.mp4'), // Fog
  1147: require('../assets/videos/cloudy.mp4'), // Freezing fog

  // Rain
  1150: require('../assets/videos/rain.mp4'), // Patchy light drizzle
  1153: require('../assets/videos/rain.mp4'), // Light drizzle
  1168: require('../assets/videos/rain.mp4'), // Freezing drizzle
  1171: require('../assets/videos/rain.mp4'), // Heavy freezing drizzle
  1180: require('../assets/videos/rain.mp4'), // Patchy light rain
  1183: require('../assets/videos/rain.mp4'), // Light rain
  1186: require('../assets/videos/rain.mp4'), // Moderate rain at times
  1189: require('../assets/videos/rain.mp4'), // Moderate rain
  1192: require('../assets/videos/rain.mp4'), // Heavy rain at times
  1195: require('../assets/videos/rain.mp4'), // Heavy rain
  1198: require('../assets/videos/rain.mp4'), // Light freezing rain
  1201: require('../assets/videos/rain.mp4'), // Moderate or heavy freezing rain
  1240: require('../assets/videos/rain.mp4'), // Light rain shower
  1243: require('../assets/videos/rain.mp4'), // Moderate or heavy rain shower
  1246: require('../assets/videos/rain.mp4'), // Torrential rain shower
  1273: require('../assets/videos/rain.mp4'), // Patchy light rain with thunder
  1276: require('../assets/videos/rain.mp4'), // Moderate or heavy rain with thunder

  // Snow
  1204: require('../assets/videos/snow.mp4'), // Light sleet
  1207: require('../assets/videos/snow.mp4'), // Moderate or heavy sleet
  1210: require('../assets/videos/snow.mp4'), // Patchy light snow
  1213: require('../assets/videos/snow.mp4'), // Light snow
  1216: require('../assets/videos/snow.mp4'), // Patchy moderate snow
  1219: require('../assets/videos/snow.mp4'), // Moderate snow
  1222: require('../assets/videos/snow.mp4'), // Patchy heavy snow
  1225: require('../assets/videos/snow.mp4'), // Heavy snow
  1237: require('../assets/videos/snow.mp4'), // Ice pellets
  1249: require('../assets/videos/snow.mp4'), // Light sleet showers
  1252: require('../assets/videos/snow.mp4'), // Moderate or heavy sleet showers
  1255: require('../assets/videos/snow.mp4'), // Light snow showers
  1258: require('../assets/videos/snow.mp4'), // Moderate or heavy snow showers
  1261: require('../assets/videos/snow.mp4'), // Light showers of ice pellets
  1264: require('../assets/videos/snow.mp4'), // Moderate or heavy showers of ice pellets
  1279: require('../assets/videos/snow.mp4'), // Patchy light snow with thunder
  1282: require('../assets/videos/snow.mp4'), // Moderate or heavy snow with thunder

  // Blizzard / Severe Snow (treated as snow)
  1114: require('../assets/videos/snow.mp4'), // Blowing snow
  1117: require('../assets/videos/snow.mp4'), // Blizzard
};

// Function to get the appropriate video source based on weather condition code
export const getVideoSourceByCode = (code) => {
  return weatherVideoMap[code] || require('../assets/videos/clear.mp4'); // Fallback to clear video if code is not in the map
};
