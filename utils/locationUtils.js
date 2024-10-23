import * as Location from 'expo-location';
import { Platform, Linking } from 'react-native';

// check for location permission
export async function checkLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }
  const location = await Location.getCurrentPositionAsync({});
  return location ? true : false;
}

// helps the user open their phone settings page to enable location
export function openSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}
