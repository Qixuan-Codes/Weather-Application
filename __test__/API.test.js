import { fetchWeatherData } from '../utils/fetchWeatherData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { WEATHER_API_KEY } from '@env';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

describe('fetchWeatherData', () => {
  const latitude = 1.3521;
  const longitude = 103.8198;
  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=7&aqi=yes&alerts=no`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch weather data and cache it', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    const mockResponse = {
      current: { temp_c: 25 },
      location: { name: 'Singapore' },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await fetchWeatherData(latitude, longitude);

    expect(fetch).toHaveBeenCalledWith(apiUrl);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      `weatherData_${latitude}_${longitude}`,
      expect.any(String)
    );
    expect(result).toEqual(mockResponse);
  });

  test('should return cached data if available and not expired', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    const cachedData = {
      data: { current: { temp_c: 25 }, location: { name: 'Singapore' } },
      timestamp: new Date().getTime(),
    };

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedData));

    const result = await fetchWeatherData(latitude, longitude);

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(`weatherData_${latitude}_${longitude}`);
    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual(cachedData.data);
  });

  test('should handle API errors gracefully (HTTP 500)', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await fetchWeatherData(latitude, longitude);

    expect(result).toBeNull();
  });

  test('should handle network errors', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: false }); 

    const mockCachedData = {
      data: { location: { name: 'Cached City' }, current: { temp_c: 25 } },
      timestamp: new Date().getTime(),
    };

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockCachedData));

    const data = await fetchWeatherData(latitude, longitude);

    expect(data).toEqual(mockCachedData.data);
  });
  
  test('should handle invalid cached data and fetch new data', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    const invalidCachedData = "invalid json";

    AsyncStorage.getItem.mockResolvedValueOnce(invalidCachedData);

    const mockResponse = {
      current: { temp_c: 25 },
      location: { name: 'Singapore' },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await fetchWeatherData(latitude, longitude);

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`weatherData_${latitude}_${longitude}`);
    expect(fetch).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });
  
  test('should cache data correctly after fetching new data', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    const mockApiResponse = { current: { temp_c: 25 }, location: { name: 'Singapore' } }; 

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    AsyncStorage.getItem.mockResolvedValueOnce(null); 

    const data = await fetchWeatherData(latitude, longitude);


    expect(data).toEqual(mockApiResponse);


    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      `weatherData_${latitude}_${longitude}`,
      expect.any(String)
    );


    const cachedString = AsyncStorage.setItem.mock.calls[0][1];
    const cachedData = JSON.parse(cachedString);

    expect(cachedData).toMatchObject({
      data: mockApiResponse,
      timestamp: expect.any(Number),
    });
  });

  test('should log error if unable to fetch or cache data', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const data = await fetchWeatherData(latitude, longitude);
    expect(data).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching weather data:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('should handle corrupted JSON response gracefully', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValueOnce(new Error('Corrupted JSON')),
    });

    const result = await fetchWeatherData(latitude, longitude);

    expect(result).toBeNull();
  });
  
  test('should handle incomplete data from API', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    const incompleteData = {};
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(incompleteData),
    });

    const result = await fetchWeatherData(latitude, longitude);

    expect(result).toBeNull();
  });

  test('should handle API rate limiting (HTTP 429)', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    fetch.mockResolvedValueOnce({ ok: false, status: 429 });

    const result = await fetchWeatherData(latitude, longitude);

    expect(result).toBeNull();
  });

  test('should handle empty API response', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(null),
    });

    const result = await fetchWeatherData(latitude, longitude);

    expect(result).toBeNull();
  });

  test('should remove outdated cached data and fetch new data', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });
    const expiredCachedData = {
      data: { current: { temp_c: 25 }, location: { name: 'Singapore' } },
      timestamp: new Date().getTime() - 3600001,
    };

    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(expiredCachedData));

    const mockResponse = {
      current: { temp_c: 30 },
      location: { name: 'Singapore' },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await fetchWeatherData(latitude, longitude);

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`weatherData_${latitude}_${longitude}`);
    expect(fetch).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

});
