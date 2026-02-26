import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  TextInput, StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../../store/cartStore';
import { CartState } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';
import { orderService, CouponResponse, MakeOrderResponse } from '../services/orderService';
import { OrderSuccessScreen } from './OrderSuccessScreen';

const PAYMENT_METHODS = [
  { id: 'UPI',    label: 'UPI',              sub: 'Google Pay, PhonePe, Paytm', icon: 'phone-portrait-outline' as const },
  { id: 'CARD',   label: 'Credit/Debit Card', sub: 'Visa, Mastercard, RuPay',   icon: 'card-outline' as const },
  { id: 'WALLET', label: 'Wallet',            sub: 'Paytm, Amazon Pay',          icon: 'wallet-outline' as const },
  { id: 'COD',    label: 'Cash on Delivery',  sub: 'Pay at doorstep',            icon: 'cash-outline' as const },
];

const CartItemRow: React.FC<{ item: { product: any; qty: number } }> = ({ item }) => {
  const increaseQty = useCartStore((s: CartState) => s.increaseQty);
  const decreaseQty = useCartStore((s: CartState) => s.decreaseQty);
  const removeItem  = useCartStore((s: CartState) => s.removeItem);
  const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
  const mrp   = item.product.discountPrice > 0 && item.product.price > item.product.discountPrice ? item.product.price : null;

  return (
    <View style={S.itemRow}>
      <View style={S.itemImg}>
        {item.product.imageUrl ? (
          <Image source={{ uri: item.product.imageUrl }} style={S.itemImgInner} resizeMode="cover" />
        ) : (
          <View style={[S.itemImgInner, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 22 }}>🍽️</Text>
          </View>
        )}
      </View>
      <View style={S.itemInfo}>
        <Text style={S.itemName} numberOfLines={2}>{item.product.name}</Text>
        <View style={S.itemPriceRow}>
          <Text style={S.itemPrice}>₹{price}</Text>
          {mrp && <Text style={S.itemMrp}>₹{mrp}</Text>}
        </View>
        <View style={S.itemQtyRow}>
          <TouchableOpacity style={S.qtyBtn} onPress={() => decreaseQty(item.product.id)}>
            <Text style={S.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={S.qtyNum}>{item.qty}</Text>
          <TouchableOpacity style={[S.qtyBtn, S.qtyBtnGreen]} onPress={() => increaseQty(item.product.id)}>
            <Text style={[S.qtyBtnTxt, { color: '#fff' }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={S.deleteBtn} onPress={() => removeItem(item.product.id)}>
        <Ionicons name="trash-outline" size={19} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};

export type CartTabName = 'Home' | 'Category' | 'Subscription' | 'Cart' | 'Profile';
interface CartScreenProps { onTabPress?: (tab: CartTabName) => void; }

export const CartScreen: React.FC<CartScreenProps> = ({ onTabPress }) => {
  const items      = useCartStore((s: CartState) => s.items);
  const totalItems = useCartStore((s: CartState) => s.totalItems());
  const clearCart  = useCartStore((s: CartState) => s.clearCart);
  const user       = useAuthStore((s) => s.user);
  const { profile, fetchProfile } = useProfileStore();

  // Fetch profile on mount for delivery address
  useEffect(() => { fetchProfile(); }, []);

  const address = profile?.address;
  const addressLine = address
    ? [address.buildingName, address.streetName, address.city, address.stateName, address.pin]
        .filter(Boolean).join(', ')
    : 'Fetching address...';

  const [couponCode, setCouponCode]       = useState('');
  const [coupon, setCoupon]               = useState<CouponResponse | null>(null);
  const [couponError, setCouponError]     = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponOpen, setCouponOpen]       = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [ordering, setOrdering]           = useState(false);
  const [orderResult, setOrderResult]     = useState<MakeOrderResponse | null>(null);

  const subtotal = useCartStore((s: CartState) => s.totalPrice());
  const taxAmt   = Math.round(subtotal * 0.05);

  const couponDiscount = (() => {
    if (!coupon) return 0;
    if (coupon.couponValueType === 'PERCENTAGE') return Math.round(subtotal * (coupon.value / 100));
    return Math.min(coupon.value, subtotal);
  })();

  const totalAmount = subtotal + taxAmt - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(''); setCoupon(null); setCouponLoading(true);
    try {
      const res = await orderService.getCoupon(couponCode.trim());
      if (!res.active) { setCouponError('This coupon is inactive or expired.'); }
      else { setCoupon(res); }
    } catch { setCouponError('Invalid coupon code. Please try again.'); }
    finally { setCouponLoading(false); }
  };

  const handleProceedToPayment = async () => {
    if (items.length === 0) return;
    setOrdering(true);
    try {
      const res = await orderService.makeOrder({
        itemRequests: items.map((i) => ({ productId: i.product.id, quantity: i.qty })),
        ...(coupon ? { couponCode: coupon.code } : {}),
      });
      if (res.status === 'AVAILABLE') { clearCart(); setOrderResult(res); }
      else { Alert.alert('Order Failed', res.message || 'Something went wrong.'); }
    } catch (e: any) {
      Alert.alert('Order Failed', e?.response?.data?.message ?? 'Something went wrong.');
    } finally { setOrdering(false); }
  };

  if (orderResult) {
    return (
      <OrderSuccessScreen
        orderResponse={orderResult}
        paymentMethod={PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label ?? paymentMethod}
        itemCount={totalItems}
        onTrackOrder={() => { setOrderResult(null); onTabPress?.('Home'); }}
        onBackToHome={() => { setOrderResult(null); onTabPress?.('Home'); }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={S.safe} edges={['top']}>
        <View style={S.header}>
          <TouchableOpacity onPress={() => onTabPress?.('Home')} style={S.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={S.headerTitle}>My Cart (0)</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 6 }}>Your cart is empty</Text>
          <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Add items to get started</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#16A34A', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 }}
            onPress={() => onTabPress?.('Home')}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <View style={S.header}>
        <TouchableOpacity onPress={() => onTabPress?.('Home')} style={S.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>My Cart ({totalItems})</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Cart Items */}
        <View style={S.itemsCard}>
          {items.map((item) => <CartItemRow key={item.product.id} item={item} />)}
        </View>

        {/* Apply Coupon */}
        <View style={S.sectionCard}>
          <TouchableOpacity style={S.couponHeader} onPress={() => setCouponOpen((o) => !o)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="pricetag-outline" size={18} color="#16A34A" />
              <Text style={S.couponTitle}>Apply Coupon</Text>
            </View>
            <Ionicons name={couponOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" />
          </TouchableOpacity>
          {couponOpen && (
            <>
              {coupon ? (
                <View style={S.couponApplied}>
                  <View style={{ flex: 1 }}>
                    <Text style={S.couponAppliedCode}>"{coupon.code}" Applied!</Text>
                    <Text style={S.couponAppliedSaving}>
                      You save ₹{couponDiscount}{coupon.couponValueType === 'PERCENTAGE' ? ` (${coupon.value}% off)` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => { setCoupon(null); setCouponCode(''); setCouponError(''); }}>
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={S.couponInputRow}>
                  <TextInput
                    style={S.couponInput}
                    placeholder="Enter coupon code"
                    placeholderTextColor="#9CA3AF"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                    returnKeyType="done"
                    onSubmitEditing={handleApplyCoupon}
                  />
                  <TouchableOpacity
                    style={[S.couponApplyBtn, (!couponCode.trim() || couponLoading) && { opacity: 0.6 }]}
                    onPress={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                  >
                    {couponLoading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={S.couponApplyBtnTxt}>Apply</Text>}
                  </TouchableOpacity>
                </View>
              )}
              {!!couponError && <Text style={S.couponError}>{couponError}</Text>}
            </>
          )}
        </View>

        {/* Delivery Address */}
        <View style={S.sectionCard}>
          <View style={S.addressRow}>
            <Ionicons name="location-outline" size={18} color="#16A34A" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={S.addressName}>{profile?.fullName ?? user?.fullName ?? 'User'}</Text>
              <Text style={S.addressSub} numberOfLines={2}>{addressLine}</Text>
            </View>
            <TouchableOpacity onPress={() => fetchProfile()}>
              <Text style={S.changeBtn}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={S.sectionLabel}>Payment Method</Text>
        <View style={S.paymentList}>
          {PAYMENT_METHODS.map((pm) => {
            const selected = paymentMethod === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                style={[S.paymentCard, selected && S.paymentCardActive]}
                onPress={() => setPaymentMethod(pm.id)}
                activeOpacity={0.8}
              >
                <View style={[S.paymentIconWrap, selected && S.paymentIconWrapActive]}>
                  <Ionicons name={pm.icon} size={20} color={selected ? '#16A34A' : '#6B7280'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[S.paymentLabel, selected && S.paymentLabelActive]}>{pm.label}</Text>
                  <Text style={S.paymentSub}>{pm.sub}</Text>
                </View>
                <View style={[S.radioOuter, selected && S.radioOuterActive]}>
                  {selected && <View style={S.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Summary */}
        <View style={S.summaryCard}>
          <View style={S.summaryRow}>
            <Text style={S.summaryLabel}>Subtotal</Text>
            <Text style={S.summaryValue}>₹{subtotal}</Text>
          </View>
          <View style={S.summaryRow}>
            <Text style={S.summaryLabel}>Delivery Fee</Text>
            <Text style={[S.summaryValue, { color: '#16A34A', fontWeight: '700' }]}>FREE</Text>
          </View>
          {couponDiscount > 0 && (
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>Coupon Discount</Text>
              <Text style={[S.summaryValue, { color: '#16A34A' }]}>−₹{couponDiscount}</Text>
            </View>
          )}
          <View style={S.summaryRow}>
            <Text style={S.summaryLabel}>Taxes (5%)</Text>
            <Text style={S.summaryValue}>₹{taxAmt}</Text>
          </View>
          <View style={[S.summaryRow, S.summaryTotalRow]}>
            <Text style={S.summaryTotalLabel}>Total Amount</Text>
            <Text style={S.summaryTotalValue}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Proceed to Payment */}
      <View style={S.bottomBar}>
        <TouchableOpacity
          style={[S.proceedBtn, ordering && { opacity: 0.7 }]}
          onPress={handleProceedToPayment}
          disabled={ordering}
          activeOpacity={0.88}
        >
          {ordering
            ? <ActivityIndicator color="#fff" />
            : <Text style={S.proceedBtnTxt}>Proceed to Payment — ₹{totalAmount}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  itemsCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }, android: { elevation: 2 } }) },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemImg: { width: 68, height: 68, borderRadius: 10, overflow: 'hidden', marginRight: 12 },
  itemImgInner: { width: '100%', height: '100%' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 3, lineHeight: 18 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  itemMrp: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },
  itemQtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  qtyBtnGreen: { backgroundColor: '#16A34A' },
  qtyBtnTxt: { fontSize: 16, fontWeight: '700', color: '#374151', lineHeight: 20 },
  qtyNum: { fontSize: 14, fontWeight: '700', color: '#1F2937', paddingHorizontal: 12 },
  deleteBtn: { padding: 6 },
  sectionCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }, android: { elevation: 2 } }) },
  couponHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  couponTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  couponInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  couponInput: { flex: 1, height: 44, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#1F2937', backgroundColor: '#F9FAFB' },
  couponApplyBtn: { backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 18, height: 44, alignItems: 'center', justifyContent: 'center' },
  couponApplyBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  couponError: { fontSize: 12, color: '#EF4444', marginTop: 6 },
  couponApplied: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#F0FDF4', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#BBF7D0' },
  couponAppliedCode: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  couponAppliedSaving: { fontSize: 12, color: '#15803D', marginTop: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  addressName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  addressSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  changeBtn: { fontSize: 13, color: '#16A34A', fontWeight: '700' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  paymentList: { marginHorizontal: 12, gap: 8 },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#E5E7EB', gap: 12 },
  paymentCardActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  paymentIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  paymentIconWrapActive: { backgroundColor: '#DCFCE7' },
  paymentLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  paymentLabelActive: { color: '#15803D' },
  paymentSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: '#16A34A' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16A34A' },
  summaryCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }, android: { elevation: 2 } }) },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  summaryLabel: { fontSize: 13, color: '#6B7280' },
  summaryValue: { fontSize: 13, color: '#1F2937', fontWeight: '600' },
  summaryTotalRow: { borderBottomWidth: 0, paddingVertical: 14 },
  summaryTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  summaryTotalValue: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 6 }, android: { elevation: 10 } }) },
  proceedBtn: { backgroundColor: '#16A34A', borderRadius: 12, paddingVertical: 16, alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 }, android: { elevation: 6 } }) },
  proceedBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
