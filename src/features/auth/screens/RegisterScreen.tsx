import React from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StatusBar, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '@/navigation/AuthStack';
import { useRegister } from '../hooks/useAuth';
import { registerSchema, RegisterFormData } from '../validation';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const registerMutation = useRegister();
  
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { name, email, password } = data;
    
    registerMutation.mutate({ name, email, password }, {
      onError: (error: any) => {
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
        
        Alert.alert('Registration Failed', errorMessage);
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <ScrollView className="flex-1">
        <View className="px-6 pt-12">
          <TouchableOpacity 
            className="w-10 h-10 bg-primary rounded-full items-center justify-center mb-8"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Image 
              source={require('../../../../assets/images/sigup_logo.png')}
              className="w-64 h-48"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold text-center mb-2">
            Sign Up to Explore and
          </Text>
          <Text className="text-2xl font-bold text-primary text-center mb-8">
            Book Tiffins
          </Text>

          <View className="space-y-4">
            <View>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                    <Text className="text-gray-400 mr-3">👤</Text>
                    <TextInput
                      placeholder="Enter your name"
                      value={value}
                      onChangeText={onChange}
                      className="flex-1 text-base"
                    />
                  </View>
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
              )}
            </View>

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

            <View>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                    <Text className="text-gray-400 mr-3">🔒</Text>
                    <TextInput
                      placeholder="Confirm Password"
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
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</Text>
              )}
            </View>

            <View className="flex-row items-center mt-4">
              <TouchableOpacity className="w-5 h-5 border border-gray-300 rounded mr-2" />
              <Text className="text-gray-600">Remember me</Text>
            </View>

            <TouchableOpacity 
              className="bg-primary-dark rounded-full py-4 mt-8"
              onPress={handleSubmit(onSubmit)}
              disabled={registerMutation.isPending}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {registerMutation.isPending ? 'Signing up...' : 'Sign Up'}
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

            <View className="flex-row justify-center mt-6 mb-8">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="font-semibold text-black">login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};