import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '@/navigation/AuthStack';
import { useForgotPassword } from '../hooks/useAuth';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../validation';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const forgotPasswordMutation = useForgotPassword();
  
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert('Success', 'Password reset email sent!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      },
      onError: (error: any) => {
        Alert.alert('Error', error?.response?.data?.message || 'An error occurred');
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="flex-1 px-6 pt-12">
        <TouchableOpacity 
          className="w-10 h-10 bg-primary rounded-full items-center justify-center mb-8"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-center mb-8">
          Forgot Password?
        </Text>

        <Text className="text-gray-500 text-center mb-8 px-4">
          Enter your email address and we'll send you a link to reset your password.
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
                    placeholder="Enter your email"
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

          <TouchableOpacity 
            className="bg-primary-dark rounded-full py-4 mt-8"
            onPress={handleSubmit(onSubmit)}
            disabled={forgotPasswordMutation.isPending}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="font-semibold text-black">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};