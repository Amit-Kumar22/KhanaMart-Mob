import React, { useEffect } from 'react';
import { View, Text, Image, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthStack';

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#16A34A', // Green background exactly like your design
      position: 'relative',
    }}>
      <StatusBar barStyle="light-content" backgroundColor="#16A34A" />
      
      {/* Decorative Green Circles - Top Right */}
      <View style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#22C55E',
        opacity: 0.3,
      }} />
      
      <View style={{
        position: 'absolute',
        top: -150,
        right: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#22C55E',
        opacity: 0.2,
      }} />

      {/* Logo Image - Top Right Corner */}
      <View style={{
        position: 'absolute',
        top: 50,
        right: 20,
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image 
          source={require('../../../../assets/images/spash_logo-1.png')}
          style={{ 
            width: 80, 
            height: 80,
          }}
          resizeMode="contain"
        />
      </View>

      {/* Decorative Green Circles - Bottom Left */}
      <View style={{
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#22C55E',
        opacity: 0.3,
      }} />
      
      <View style={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#22C55E',
        opacity: 0.2,
      }} />

      {/* Logo Image - Bottom Left Corner */}
      <View style={{
        position: 'absolute',
        bottom: 80,
        left: 20,
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image 
          source={require('../../../../assets/images/spash_logo-2.png')}
          style={{ 
            width: 80, 
            height: 80,
          }}
          resizeMode="contain"
        />
      </View>

      {/* Center Logo Card - Exactly like your design */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
      }}>
        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 40,
          paddingVertical: 30,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 15,
          alignItems: 'center',
        }}>
          {/* Logo Icon */}
          <Image 
            source={require('../../../../assets/images/spash_logo-1.png')}
            style={{ 
              width: 80, 
              height: 80, 
              marginBottom: 16,
            }}
            resizeMode="contain"
          />
          
          {/* KhanaMart Text */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#1F2937',
              letterSpacing: -1,
            }}>
              Khana 🍽️
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4,
            }}>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#1F2937',
                letterSpacing: -1,
              }}>
                🛍️ 
              </Text>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#16A34A',
                letterSpacing: -1,
                marginLeft: 4,
              }}>
                Mart
              </Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={{
            fontSize: 14,
            color: '#6B7280',
            marginTop: 8,
            textAlign: 'center',
          }}>
            Fresh Food, Fast Delivery
          </Text>
        </View>
      </View>
    </View>
  );
};