// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './src/pages/MainScreen';

const App = () => {
  return (
    <NavigationContainer>
      <MainScreen />
    </NavigationContainer>
  );
};

export default App;
