import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthStack';

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View style={{ 
        flex: 1, 
        justifyContent: 'space-between', 
        paddingHorizontal: 24, 
        paddingVertical: 48 
      }}>
        <View style={{ alignItems: 'flex-end', marginTop: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: '#6B7280', fontSize: 16 }}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Text style={{ 
            fontSize: 36, 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: 16 
          }}>
            <Text style={{ color: '#16A34A' }}>Healthy &</Text>
            {'\n'}
            <Text style={{ color: '#16A34A' }}>Eating Made</Text>
            {'\n'}
            <Text style={{ color: 'black' }}>Better 🥘</Text>
          </Text>
          
          <Text style={{ 
            color: '#6B7280', 
            textAlign: 'center', 
            fontSize: 16, 
            paddingHorizontal: 32, 
            marginBottom: 48 
          }}>
            Simplify healthy eating with personalized meal plans, recipes, and groceries.
          </Text>

          <Image 
            source={require('../../../../assets/images/orboard_logo.png')}
            style={{ width: 288, height: 192 }}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity 
          style={{
            backgroundColor: '#064E3B',
            borderRadius: 25,
            paddingVertical: 16,
            marginHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginRight: 8 }}>
            Swipe to get started
          </Text>
          <Text style={{ color: 'white', fontSize: 20 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};