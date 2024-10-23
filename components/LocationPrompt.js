import React, { useState, useEffect } from 'react';
import { Text, View, Button, SafeAreaView, Platform } from 'react-native';
import { checkLocationPermission, openSettings } from '../utils/locationUtils';

export default function LocationPrompt() {
  const [locationEnabled, setLocationEnabled] = useState(null);

  useEffect(() => {
    (async () => {
      const enabled = await checkLocationPermission();
      setLocationEnabled(enabled);
    })();
  }, []);

  if (locationEnabled === null) {
    return <View><Text>Loading...</Text></View>; // loading state
  }

  if (locationEnabled) {
    return null; // No need to show anything if location services are enabled
  }

  return (
    <SafeAreaView style={{ padding: 20, position: 'fixed', top: '30%' }}>
      <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
        It looks like your location services are disabled. To get accurate weather information, please enable location services in your device settings:
      </Text>
      {Platform.OS === 'ios' ? (
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          - For iOS: Go to Settings &gt; Privacy &amp; Security &gt; Location Services, and enable location for this app.
        </Text>
      ) : (
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          - For Android: Go to Settings &gt; Location, and enable location for this app.
        </Text>
      )}
      <Button title="Go to Settings" onPress={openSettings} />
    </SafeAreaView>
  );
}
