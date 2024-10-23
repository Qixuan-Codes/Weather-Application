import React, { createContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';

// Create a Context to hold the connectivity state
export const InternetStatusContext = createContext();

export const InternetStatusProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    // Return the banner showing no internet connection
    <InternetStatusContext.Provider value={isConnected}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle={isConnected ? 'dark-content' : 'light-content'} />
        {!isConnected && (
          <SafeAreaView style={styles.noInternetBanner}>
            <Text style={styles.noInternetText}>No Internet Connection</Text>
          </SafeAreaView>
        )}
        {children}
      </View>
    </InternetStatusContext.Provider>
  );
};

const styles = StyleSheet.create({
  noInternetBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // For the notch on IOS
    paddingBottom: 20,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  noInternetText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

