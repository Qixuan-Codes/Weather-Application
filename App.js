import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SearchLocationScreen from './screens/SearchLocationScreen';
import SavedLocationsScreen from './screens/SavedLocationsScreen';
import ViewSavedLocationScreen from './screens/ViewSavedLocationScreen';
import { InternetStatusProvider } from './components/InternetStatusProvider';

const Stack = createStackNavigator();

export default function App() {
  return (
    <InternetStatusProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{headerTitleAlign: 'center'}}>
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Current Location', headerLeft: null }} />
          <Stack.Screen name="SearchLocationScreen" component={SearchLocationScreen} options={{ title: 'Searched Location', headerLeft: null  }} />
          <Stack.Screen name="SavedLocationsScreen" component={SavedLocationsScreen} options={{ title: 'Saved Locations', headerLeft: null  }} />
          <Stack.Screen name="ViewSavedLocationScreen" component={ViewSavedLocationScreen} options={{ title: 'View Saved Locations', headerLeft: null  }} />
        </Stack.Navigator>
      </NavigationContainer>
    </InternetStatusProvider>
  );
}