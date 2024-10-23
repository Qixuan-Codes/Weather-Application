# Weather Application
This application provides real-time weather updates and forecasts using **WeatherAPI.com**. It allows users to retrieve current weather conditions for their location, search for weather in other cities, and save frequently accessed locations for quick reference. Additionally, the app offers detailed air quality data and astronomy-related information.

### Technologies Used
- **React Native**: A framework for building native apps using React.
- **Expo**: A framework and platform for universal React applications, which simplifies the development and deployment of React Native apps.
- **Axios**: A promise-based HTTP client for making requests to the WeatherAPI.com.
- **React Navigation**: A routing and navigation library for React Native that enables smooth transitions between different screens in the app.
- **React Native Paper**: A library that provides Material Design components for React Native.
- **React Native Async Storage**: A simple, asynchronous, persistent, key-value storage system for React Native apps.
- **React Testing Library**: Used for testing components in a way that simulates user interaction.

### Features
- **Current Location Weather**: Automatically fetches weather data for the user's current location.
- **Search for Locations**: Users can search for any city and view its weather information.
- **Saved Locations**: Users can save or remove locations, allowing them to access weather information for saved cities.
- **Hourly Forecast**: Displays the next 24 hours of weather starting from the current hour.
- **7-Day Forecast**: Shows the weather forecast for the next 7 days.
- **Air Quality Index (AQI)**: Displays AQI along with details like CO, NO2, O3, SO2, PM2.5, and PM10.
- **Astronomy**: Information about sunrise, sunset, and the moon phase.

### Prerequisites
Before running the app, make sure you have the following:
- Node.js installed (v16 or higher).
- Expo CLI installed globally (`npm install -g expo-cli`).
- An Expo account (for publishing and deploying the app).
- A `.env` file with your API key for WeatherAPI.com. You need to create a file named `.env` in the root directory of your project and add the following line:
```
WEATHER_API_KEY=YOUR_API_KEY
```

### Steps to Run the Application
1. Run `npm install` to install the required dependencies.
2. Run `npx expo start` to start the development server and open the app in a simulator or on a physical device.
3. Run `npx jest` to run the unit tests and ensure that the components work as expected.

### Project Structure
The project is organized to facilitate easy navigation and maintenance. Here are some key components and their purposes:

- **App.js**: The main entry point of the application, where navigation is set up.
- **screens/**: Contains different screens of the app (e.g., Home, Search, Saved Locations).
- **components/**: Reusable components like weather cards, input fields, and buttons.
- **services/**: Contains the logic for API calls (using Axios to interact with WeatherAPI.com).
- **utils/**: Helper functions and constants used throughout the app.
- **tests/**: Contains unit tests for various components and functionalities to ensure quality and reliability.

### Dependencies
This project relies on several key dependencies listed in the `package.json`:

- **Core Dependencies**:
  - `@expo/vector-icons`: For using vector icons throughout the app.
  - `expo-location`: For fetching the user's current location.
  - `expo-av`: For handling audio and video playback if needed.
  - `axios`: For making HTTP requests to the weather API.
  
- **Development Dependencies**:
  - `jest`: For unit testing.
  - `@testing-library/react-native`: For testing React Native components.
  - `babel-plugin-dotenv`: For loading environment variables from a `.env` file.

By leveraging these technologies and features, the Weather Application aims to provide users with a seamless and informative weather experience.
