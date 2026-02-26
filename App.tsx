import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { AuthStack } from './src/navigation/AuthStack';
import { MainTabNavigator as DashboardNavigator } from './src/navigation/DashboardNavigator';
import { queryClient } from './src/api/queryClient';
import { useAuthStore } from './src/store/authStore';

// Import CSS for web
if (Platform.OS === 'web') {
  require('./global.css');
}

export default function App() {
  const { isLoading, isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: 'white', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="dark" />
        {isAuthenticated ? <DashboardNavigator /> : <AuthStack />}
      </NavigationContainer>
    </QueryClientProvider>
  );
}