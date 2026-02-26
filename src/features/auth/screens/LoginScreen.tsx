import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '@/navigation/AuthStack';
import { useLogin } from '../hooks/useAuth';
import { loginSchema, LoginFormData } from '../validation';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const loginMutation = useLogin();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('🔐 Login attempt with data:', data);
    
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✅ Login mutation success:', response);
      },
      onError: (error: any) => {
        console.log('❌ Login mutation error:', error);
        
        let errorMessage = 'An error occurred';
        
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          errorMessage = 'Network error - Check if the server is running';
        } else if (error.response?.status === 404) {
          errorMessage = 'API endpoint not found - Check server configuration';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error - Try again later';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('Login Failed', errorMessage);
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="flex-1">
        <View className="bg-blue-50 px-6 pt-12 pb-8">
          <Image 
            source={require('../../../../assets/images/login_logo.png')}
            className="w-full h-64"
            resizeMode="contain"
          />
        </View>

        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-bold text-center mb-2">
            Login to Access Your
          </Text>
          <Text className="text-2xl font-bold text-primary text-center mb-8">
            Lunch Boxes
          </Text>

          <View className="space-y-4">
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                    <Text className="text-gray-400 mr-3">✉</Text>
                    <TextInput
                      placeholder="Enter your mail"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 text-base"
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>
              )}
            </View>

            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                    <Text className="text-gray-400 mr-3">🔒</Text>
                    <TextInput
                      placeholder="Enter your password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      className="flex-1 text-base"
                    />
                    <TouchableOpacity>
                      <Text className="text-gray-400">👁</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
              )}
            </View>

            <View className="flex-row justify-between items-center mt-4">
              <View className="flex-row items-center">
                <TouchableOpacity className="w-5 h-5 border border-gray-300 rounded mr-2" />
                <Text className="text-gray-600">Remember me</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="text-black font-medium">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="bg-primary-dark rounded-full py-4 mt-8"
              onPress={handleSubmit(onSubmit)}
              disabled={loginMutation.isPending}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <Text className="text-center text-gray-500 mt-6">Or login with</Text>

            <View className="flex-row justify-center space-x-4 mt-4">
              <TouchableOpacity className="flex-row items-center bg-gray-50 px-6 py-3 rounded-lg">
                <Text className="text-red-500 mr-2">G</Text>
                <Text className="text-gray-700">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center bg-gray-50 px-6 py-3 rounded-lg">
                <Text className="text-blue-600 mr-2">f</Text>
                <Text className="text-gray-700">Facebook</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="font-semibold text-black">Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};