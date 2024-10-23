import { NativeModules } from 'react-native';

// Mock NativeModules if they are used in fetchWeatherData or other API utilities.
NativeModules.ExponentLocation = {
    getCurrentPositionAsync: jest.fn().mockResolvedValue({
        coords: {
            latitude: 37.7749,
            longitude: -122.4194,
        },
    }),
    requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
        status: 'granted',
    }),
};

// Mock expo-location for location fetching in fetchWeatherData tests
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
        status: 'granted',
    }),
    getCurrentPositionAsync: jest.fn().mockResolvedValue({
        coords: {
            latitude: 37.7749,
            longitude: -122.4194,
        },
    }),
}));

// Mock for AsyncStorage to simulate caching behavior
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn((key) =>
            Promise.resolve(
                key === 'savedLocations' ? JSON.stringify([{ name: 'Mock Location' }]) : null
            )
        ),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
    },
}));

