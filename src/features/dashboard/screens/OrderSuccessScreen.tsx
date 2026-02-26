import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MakeOrderResponse } from '../services/orderService';

export interface OrderSuccessScreenProps {
  orderResponse: MakeOrderResponse;
  paymentMethod: string;
  itemCount: number;
  onTrackOrder: () => void;
  onBackToHome: () => void;
}

export const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  orderResponse,
  paymentMethod,
  itemCount,
  onTrackOrder,
  onBackToHome,
}) => {
  return (
    <SafeAreaView style={S.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity onPress={onBackToHome} style={S.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>My Cart ({itemCount})</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={S.body}>
        {/* Success Icon */}
        <View style={S.iconOuter}>
          <View style={S.iconInner}>
            <Ionicons name="checkmark" size={36} color="#16A34A" />
          </View>
        </View>

        {/* Title */}
        <Text style={S.title}>Order Placed!</Text>
        <Text style={S.subtitle}>Your order has been placed successfully</Text>

        {/* Order Info Card */}
        <View style={S.infoCard}>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>Order ID</Text>
            <Text style={S.infoValue}>#{orderResponse.orderNumber}</Text>
          </View>
          <View style={S.divider} />
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>Estimated Delivery</Text>
            <Text style={S.infoValue}>60-75 min</Text>
          </View>
          <View style={S.divider} />
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>Payment</Text>
            <Text style={S.infoValue}>{paymentMethod}</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={S.trackBtn} onPress={onTrackOrder} activeOpacity={0.88}>
          <Text style={S.trackBtnTxt}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onBackToHome} activeOpacity={0.75}>
          <Text style={S.backHomeTxt}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },

  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },

  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },

  infoCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 13, color: '#9CA3AF' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },

  trackBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  trackBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

  backHomeTxt: {
    fontSize: 15,
    color: '#16A34A',
    fontWeight: '600',
    textAlign: 'center',
  },
});
