import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, TextInput, ActivityIndicator, Alert, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useProfileStore } from '../../../store/profileStore';
import { profileService } from '../services/profileService';
import { Address } from '../../auth/types';

// ─── Sub-screens ──────────────────────────────────────────────────────────────
type SubScreen =
  | 'main' | 'delivery-addresses' | 'edit-profile' | 'notifications'
  | 'payment-methods' | 'change-password' | 'order-history'
  | 'coupons' | 'subscription' | 'reviews' | 'faqs';

// ─── ADDRESS TYPES ────────────────────────────────────────────────────────────
const ADDRESS_TYPES: Array<'HOME' | 'OFFICE' | 'OTHER'> = ['HOME', 'OFFICE', 'OTHER'];

// ─── FILE-LEVEL reusable input (NO re-mount on parent state change) ───────────
interface FieldProps {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
  editable?: boolean;
  icon?: string;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
}
const FormField: React.FC<FieldProps> = ({
  label, value, onChangeText, placeholder, keyboardType = 'default',
  editable = true, icon, secureTextEntry = false, rightElement,
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={S.fieldLabel}>{label}</Text>
    <View style={S.fieldInput}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        style={[S.fieldInputText, !editable && { color: '#9CA3AF' }]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {icon && <Ionicons name={icon as any} size={18} color="#9CA3AF" />}
      {rightElement}
    </View>
  </View>
);

// ─── Reusable header ──────────────────────────────────────────────────────────
const SubHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <View style={S.subHeader}>
    <TouchableOpacity onPress={onBack} style={S.backBtn}>
      <Ionicons name="arrow-back" size={22} color="#1F2937" />
    </TouchableOpacity>
    <Text style={S.subHeaderTitle}>{title}</Text>
    <View style={{ width: 36 }} />
  </View>
);

// ─── Initials avatar ──────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; size?: number; fontSize?: number }> = ({
  name, size = 52, fontSize = 18,
}) => {
  const initials = (name ?? 'U')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={[S.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[S.avatarText, { fontSize }]}>{initials}</Text>
    </View>
  );
};


const AddressModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  /** If provided, pre-fills with existing address data for editing */
  initialAddress?: Address | null;
}> = ({ visible, onClose, initialAddress }) => {
  const { profile, fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);

  const [building, setBuilding]   = useState('');
  const [street, setStreet]       = useState('');
  const [landmark, setLandmark]   = useState('');
  const [district, setDistrict]   = useState('');
  const [city, setCity]           = useState('');
  const [pin, setPin]             = useState('');
  const [stateName, setStateName] = useState('');
  const [addrType, setAddrType]   = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');

  // Pre-fill: if editing use initialAddress, else blank (profile name/phone kept)
  useEffect(() => {
    if (!visible) return;
    const a = initialAddress ?? null;
    setBuilding(a?.buildingName ?? '');
    setStreet(a?.streetName ?? '');
    setLandmark(a?.landmark ?? '');
    setDistrict(a?.district ?? '');
    setCity(a?.city ?? '');
    setPin(a?.pin ?? '');
    setStateName(a?.stateName ?? '');
    setAddrType((a?.type as any) ?? 'HOME');
  }, [visible, initialAddress]);

  const handleSave = async () => {
    if (!building.trim() || !city.trim() || !pin.trim()) {
      Alert.alert('Required', 'Building, City and PIN are required');
      return;
    }
    setLoading(true);
    try {
      await profileService.updateProfile({
        name: profile?.fullName ?? '',
        phone: profile?.phone ?? '',
        address: {
          buildingName: building.trim(),
          streetName: street.trim(),
          landmark: landmark.trim(),
          district: district.trim(),
          city: city.trim(),
          pin: pin.trim(),
          stateName: stateName.trim(),
          latitude: initialAddress?.latitude ?? profile?.address?.latitude ?? '',
          longitude: initialAddress?.longitude ?? profile?.address?.longitude ?? '',
          type: addrType,
        },
      });
      await fetchProfile();
      Alert.alert('Success', 'Address saved successfully!');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save address');
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={S.modalOverlay}>
        <View style={[S.modalSheet, { maxHeight: '92%' }]}>
          <View style={S.modalHeader}>
            <Text style={S.modalTitle}>
              {initialAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity onPress={onClose} style={S.modalClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Show who this address belongs to */}
          <View style={S.addrModalOwner}>
            <View style={S.addrModalAvatar}>
              <Text style={S.addrModalAvatarTxt}>
                {(profile?.fullName ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.addrModalOwnerName}>{profile?.fullName ?? ''}</Text>
              <Text style={S.addrModalOwnerPhone}>{profile?.phone ?? ''} · {profile?.email ?? ''}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={S.modalSectionLabel}>Address Details</Text>

            <FormField label="Building / Flat No. *" value={building} onChangeText={setBuilding} placeholder="e.g. B-42, Tower A" />
            <FormField label="Street / Area" value={street} onChangeText={setStreet} placeholder="e.g. Sector 62" />
            <FormField label="Landmark" value={landmark} onChangeText={setLandmark} placeholder="e.g. Near Metro Station" />
            <FormField label="District" value={district} onChangeText={setDistrict} placeholder="e.g. Gautam Budh Nagar" />
            <FormField label="City *" value={city} onChangeText={setCity} placeholder="e.g. Noida" />
            <FormField label="State" value={stateName} onChangeText={setStateName} placeholder="e.g. Uttar Pradesh" />
            <FormField label="PIN Code *" value={pin} onChangeText={setPin} placeholder="e.g. 201301" keyboardType="numeric" />

            <Text style={S.fieldLabel}>Address Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {ADDRESS_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setAddrType(t)}
                  style={[S.typeChip, addrType === t && S.typeChipActive]}
                >
                  <Text style={[S.typeChipTxt, addrType === t && S.typeChipTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={S.modalBtnRow}>
              <TouchableOpacity style={S.cancelBtn} onPress={onClose}>
                <Text style={S.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[S.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={S.saveBtnTxt}>Save Address</Text>}
              </TouchableOpacity>
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Delivery Addresses Sub-Screen ────────────────────────────────────────────
const DeliveryAddresses: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { profile, fetchProfile } = useProfileStore();
  const addr = profile?.address;
  const [modalVisible, setModalVisible] = useState(false);
  const [editAddr, setEditAddr] = useState<Address | null>(null);

  const formatAddr = (a?: Address | null) =>
    a ? [a.buildingName, a.streetName, a.landmark, a.city, a.stateName, a.pin].filter(Boolean).join(', ') : '';

  const openAdd  = () => { setEditAddr(null); setModalVisible(true); };
  const openEdit = (a: Address) => { setEditAddr(a); setModalVisible(true); };

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <SubHeader title="My Profile" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={S.sectionTitle}>Delivery Addresses</Text>
        <Text style={S.sectionSubtitle}>Where we charge and deliver</Text>

        <View style={S.card}>
          <View style={S.cardRow}>
            <Text style={S.cardBoldTitle}>Delivery Addresses</Text>
            <View style={S.savedBadge}>
              <Text style={S.savedBadgeTxt}>{addr ? '1 saved' : '0 saved'}</Text>
            </View>
          </View>

          {addr ? (
            <View style={S.addrItem}>
              {/* Tags */}
              <View style={S.tagRow}>
                <View style={S.tag}>
                  <Text style={S.tagTxt}>{addr.type ?? 'HOME'}</Text>
                </View>
                <View style={[S.tag, S.tagDefault]}>
                  <Text style={S.tagTxt}>Default</Text>
                </View>
              </View>

              {/* Name + phone */}
              <Text style={S.addrName}>
                {profile?.fullName ?? ''} · {profile?.phone ?? ''}
              </Text>

              {/* Full address */}
              <Text style={S.addrText}>{formatAddr(addr)}</Text>

              {/* Actions */}
              <View style={S.addrActions}>
                <TouchableOpacity
                  style={S.addrEditBtn}
                  onPress={() => openEdit(addr)}
                >
                  <Ionicons name="pencil-outline" size={14} color="#16A34A" />
                  <Text style={S.addrEditBtnTxt}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Ionicons name="location-outline" size={36} color="#D1D5DB" />
              <Text style={{ color: '#9CA3AF', marginTop: 8, fontSize: 13 }}>
                No address saved yet
              </Text>
            </View>
          )}

          {/* Divider */}
          {addr && <View style={[S.divider, { marginVertical: 12 }]} />}

          {/* Add button */}
          <TouchableOpacity style={S.addBtn} onPress={openAdd} activeOpacity={0.85}>
            <Text style={S.addBtnTxt}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Address Modal */}
      <AddressModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialAddress={editAddr}
      />
    </SafeAreaView>
  );
};

const EditProfileModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible, onClose,
}) => {
  const { profile, fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);

  // Personal fields
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');

  // Address fields — all pre-filled from profile.address
  const [building, setBuilding]   = useState('');
  const [street, setStreet]       = useState('');
  const [landmark, setLandmark]   = useState('');
  const [district, setDistrict]   = useState('');
  const [city, setCity]           = useState('');
  const [pin, setPin]             = useState('');
  const [stateName, setStateName] = useState('');
  const [addrType, setAddrType]   = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');

  // Pre-fill whenever modal opens or profile changes
  useEffect(() => {
    if (visible && profile) {
      setName(profile.fullName ?? '');
      setPhone(profile.phone ?? '');
      const a = profile.address;
      if (a) {
        setBuilding(a.buildingName ?? '');
        setStreet(a.streetName ?? '');
        setLandmark(a.landmark ?? '');
        setDistrict(a.district ?? '');
        setCity(a.city ?? '');
        setPin(a.pin ?? '');
        setStateName(a.stateName ?? '');
        setAddrType((a.type as any) ?? 'HOME');
      }
    }
  }, [visible, profile]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
    setLoading(true);
    try {
      await profileService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: {
          buildingName: building.trim(),
          streetName: street.trim(),
          landmark: landmark.trim(),
          district: district.trim(),
          city: city.trim(),
          pin: pin.trim(),
          stateName: stateName.trim(),
          latitude: profile?.address?.latitude ?? '',
          longitude: profile?.address?.longitude ?? '',
          type: addrType,
        },
      });
      await fetchProfile();
      Alert.alert('Success', 'Profile updated successfully!');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={S.modalOverlay}>
        <View style={[S.modalSheet, { maxHeight: '92%' }]}>
          {/* Header */}
          <View style={S.modalHeader}>
            <Text style={S.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={S.modalClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* ── Personal Info ── */}
            <Text style={S.modalSectionLabel}>Personal Information</Text>

            <FormField label="Full Name" value={name} onChangeText={setName} placeholder="Full Name" />
            <FormField label="Mobile Number" value={phone} onChangeText={setPhone} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
            <FormField label="Email" value={profile?.email ?? ''} placeholder="Email" editable={false} icon="mail-outline" />

            {/* ── Address ── */}
            <Text style={[S.modalSectionLabel, { marginTop: 8 }]}>Delivery Address</Text>

            <FormField label="Building / Flat No." value={building} onChangeText={setBuilding} placeholder="e.g. B-42, Tower A" />
            <FormField label="Street / Area" value={street} onChangeText={setStreet} placeholder="e.g. Sector 62" />
            <FormField label="Landmark" value={landmark} onChangeText={setLandmark} placeholder="e.g. Near Metro Station" />
            <FormField label="District" value={district} onChangeText={setDistrict} placeholder="e.g. Gautam Budh Nagar" />
            <FormField label="City" value={city} onChangeText={setCity} placeholder="e.g. Noida" />
            <FormField label="State" value={stateName} onChangeText={setStateName} placeholder="e.g. Uttar Pradesh" />
            <FormField label="PIN Code" value={pin} onChangeText={setPin} placeholder="e.g. 201301" keyboardType="numeric" />

            {/* Address Type */}
            <Text style={S.fieldLabel}>Address Type</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {ADDRESS_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setAddrType(t)}
                  style={[
                    S.typeChip,
                    addrType === t && S.typeChipActive,
                  ]}
                >
                  <Text style={[S.typeChipTxt, addrType === t && S.typeChipTxtActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <View style={S.modalBtnRow}>
              <TouchableOpacity style={S.cancelBtn} onPress={onClose}>
                <Text style={S.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[S.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={S.saveBtnTxt}>Save Changes</Text>}
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Notifications Sub-Screen ─────────────────────────────────────────────────
// File-level to prevent re-mount on state change
const ToggleRow: React.FC<{ label: string; sub: string; val: boolean; onToggle: () => void }> = ({
  label, sub, val, onToggle,
}) => (
  <View style={S.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={S.toggleLabel}>{label}</Text>
      <Text style={S.toggleSub}>{sub}</Text>
    </View>
    <Switch
      value={val}
      onValueChange={onToggle}
      trackColor={{ false: '#D1D5DB', true: '#16A34A' }}
      thumbColor="#fff"
    />
  </View>
);

const NotificationsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [orderUpdates, setOrderUpdates]     = useState(true);
  const [deliveryAlerts, setDeliveryAlerts] = useState(true);
  const [promotions, setPromotions]         = useState(false);
  const [profileVis, setProfileVis]         = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <SubHeader title="My Profile" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={S.sectionTitle}>Notifications & Privacy</Text>
        <Text style={S.sectionSubtitle}>Stay updated and control sharing</Text>

        <View style={S.card}>
          <View style={S.cardRow}>
            <Text style={S.cardBoldTitle}>Push Notifications</Text>
            <View style={S.recommendedBadge}><Text style={S.recommendedTxt}>Recommended</Text></View>
          </View>
          <ToggleRow label="Order Updates" sub="Status changes for your orders" val={orderUpdates} onToggle={() => setOrderUpdates((v) => !v)} />
          <View style={S.divider} />
          <ToggleRow label="Delivery Alerts" sub="Real-time delivery tracking" val={deliveryAlerts} onToggle={() => setDeliveryAlerts((v) => !v)} />
          <View style={S.divider} />
          <ToggleRow label="Promotions & Offers" sub="Deals, discounts, and coupons" val={promotions} onToggle={() => setPromotions((v) => !v)} />
        </View>

        <View style={[S.card, { marginTop: 12 }]}>
          <ToggleRow label="Profile Visibility" sub="Allow others to see your profile" val={profileVis} onToggle={() => setProfileVis((v) => !v)} />
          <View style={S.divider} />
          <ToggleRow label="Location Access" sub="Allow app to access your location" val={locationAccess} onToggle={() => setLocationAccess((v) => !v)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Payment Methods Sub-Screen ───────────────────────────────────────────────
const PaymentMethodsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const METHODS = [
    { id: 'upi',    label: 'UPI',    sub: 'rishi@upi',                isDefault: true },
    { id: 'card',   label: 'Card',   sub: '•••• 4521',                isDefault: false },
    { id: 'wallet', label: 'Wallet', sub: 'KhanaMart Wallet — ₹250',  isDefault: false },
  ];

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <SubHeader title="My Profile" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={S.sectionTitle}>Payments Details</Text>
        <Text style={S.sectionSubtitle}>Where you can change the payment option</Text>

        <View style={S.card}>
          <View style={S.cardRow}>
            <Text style={S.cardBoldTitle}>Payment Methods</Text>
            <View style={S.savedBadge}><Text style={[S.savedBadgeTxt, { color: '#16A34A' }]}>Default: UPI</Text></View>
          </View>
          {METHODS.map((m, idx) => (
            <View key={m.id}>
              {idx > 0 && <View style={S.divider} />}
              <View style={S.payMethodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.payMethodLabel}>{m.label}</Text>
                  <Text style={S.payMethodSub}>{m.sub}</Text>
                </View>
                {m.isDefault && (
                  <View style={S.defaultBadge}><Text style={S.defaultBadgeTxt}>Default</Text></View>
                )}
                <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => Alert.alert('Remove', `Remove ${m.label}?`)}>
                  <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={S.addBtn} onPress={() => Alert.alert('Add Method', 'Feature coming soon!')}>
            <Text style={S.addBtnTxt}>+ Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Change Password Sub-Screen ───────────────────────────────────────────────
const ChangePasswordScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [current, setCurrent]         = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleUpdate = async () => {
    if (!current || !newPwd || !confirm) { Alert.alert('Error', 'Please fill all fields'); return; }
    if (newPwd !== confirm) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (newPwd.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await profileService.updatePassword({ password: newPwd, confirmPassword: confirm, code: current });
      Alert.alert('Success', 'Password updated successfully!');
      setCurrent(''); setNewPwd(''); setConfirm('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <SubHeader title="My Profile" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={S.sectionTitle}>Security</Text>
        <Text style={S.sectionSubtitle}>Update your password</Text>

        <View style={S.card}>
          <FormField
            label="Current Password"
            value={current}
            onChangeText={setCurrent}
            placeholder="••••••••"
            secureTextEntry={!showCurrent}
            rightElement={
              <TouchableOpacity onPress={() => setShowCurrent((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showCurrent ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            }
          />
          <FormField
            label="New Password"
            value={newPwd}
            onChangeText={setNewPwd}
            placeholder="Create a strong password"
            secureTextEntry={!showNew}
            rightElement={
              <TouchableOpacity onPress={() => setShowNew((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showNew ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            }
          />
          <FormField
            label="Confirm New Password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter new password"
            secureTextEntry={!showConfirm}
            rightElement={
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={[S.addBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={S.addBtnTxt}>Update Password</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Main Profile Screen ──────────────────────────────────────────────────────
interface ProfileScreenProps { onTabPress?: (tab: string) => void; }

// File-level: prevents re-mount when parent state changes
const MenuRow: React.FC<{ label: string; sub: string; icon: string; action: () => void }> = ({
  label, sub, icon, action,
}) => (
  <TouchableOpacity style={S.menuRow} onPress={action} activeOpacity={0.7}>
    <View style={S.menuIconWrap}>
      <Ionicons name={icon as any} size={20} color="#16A34A" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={S.menuLabel}>{label}</Text>
      {!!sub && <Text style={S.menuSub} numberOfLines={2}>{sub}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
  </TouchableOpacity>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onTabPress }) => {
  const { logout } = useAuthStore();
  const { profile, fetchProfile, isLoading } = useProfileStore();
  const [subScreen, setSubScreen] = useState<SubScreen>('main');
  const [editVisible, setEditVisible] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  // Sub-screen routing
  if (subScreen === 'delivery-addresses') return <DeliveryAddresses onBack={() => setSubScreen('main')} />;
  if (subScreen === 'notifications')     return <NotificationsScreen onBack={() => setSubScreen('main')} />;
  if (subScreen === 'payment-methods')  return <PaymentMethodsScreen onBack={() => setSubScreen('main')} />;
  if (subScreen === 'change-password')  return <ChangePasswordScreen onBack={() => setSubScreen('main')} />;

  const displayName = profile?.fullName ?? 'User';
  const memberYear  = new Date().getFullYear() - 1;

  const MENU_ACCOUNT = [
    { label: 'Order History',       sub: 'View past orders & reorder',     icon: 'bag-check-outline',        action: () => Alert.alert('Coming Soon', 'Order History') },
    { label: 'Payment Methods',     sub: 'Saved cards, UPI, wallet',        icon: 'card-outline',             action: () => setSubScreen('payment-methods') },
    { label: 'Delivery Addresses',  sub: 'Add/edit/delete addresses',       icon: 'location-outline',         action: () => setSubScreen('delivery-addresses') },
    { label: 'Coupons & Offers',    sub: 'Available discount coupons',      icon: 'ticket-outline',           action: () => Alert.alert('Coming Soon', 'Coupons') },
    { label: 'Subscription Plans',  sub: 'Active & past subscriptions',     icon: 'calendar-outline',         action: () => onTabPress?.('Subscription') },
  ];

  const MENU_REVIEWS = [
    { label: 'Your overall rating', sub: '⭐ 4.6 | 32 reviews', icon: 'star-outline',      action: () => Alert.alert('Coming Soon', 'Reviews') },
    { label: 'Recent review',       sub: '"Great quality veggies and on-time delivery!"\n2 days ago', icon: 'document-text-outline', action: () => Alert.alert('Coming Soon', 'Reviews') },
  ];

  const MENU_SECURITY = [
    { label: 'Change Password',              sub: '',                              icon: 'lock-closed-outline',    action: () => setSubScreen('change-password') },
    { label: 'Notification & Privacy Settings', sub: '',                          icon: 'shield-outline',         action: () => setSubScreen('notifications') },
    { label: 'FAQs',                         sub: 'Frequently asked questions',   icon: 'help-circle-outline',    action: () => Alert.alert('Coming Soon', 'FAQs') },
  ];

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <View style={S.subHeader}>
        <TouchableOpacity onPress={() => onTabPress?.('Home')} style={S.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={S.subHeaderTitle}>My Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Card */}
        <View style={[S.card, { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
          <View>
            <Avatar name={displayName} size={56} fontSize={20} />
            <View style={S.cameraWrap}>
              <Ionicons name="camera" size={12} color="#16A34A" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            {isLoading
              ? <ActivityIndicator color="#16A34A" />
              : <>
                  <Text style={S.profileName}>{displayName}</Text>
                  <Text style={S.profilePhone}>{profile?.phone ?? ''}</Text>
                  <Text style={S.profileEmail}>{profile?.email ?? ''}</Text>
                  <Text style={S.profileMember}>Member since Jan {memberYear}</Text>
                </>}
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={S.editProfileBtn} onPress={() => setEditVisible(true)} activeOpacity={0.8}>
          <Text style={S.editProfileTxt}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Favourites */}
        <View style={[S.card, { marginTop: 12 }]}>
          <View style={S.cardRow}>
            <Ionicons name="heart" size={18} color="#EF4444" />
            <Text style={[S.cardBoldTitle, { marginLeft: 6 }]}>My aavorites (4)</Text>
          </View>
          {[
            { name: 'Paneer Butter Masala', price: 149, mrp: 199 },
            { name: 'Chicken Biryani',      price: 179, mrp: 249 },
          ].map((item, idx) => (
            <View key={idx} style={[S.favRow, idx > 0 && { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 10, paddingTop: 10 }]}>
              <View style={S.favImg}>
                <Text style={{ fontSize: 22 }}>🍽️</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={S.favName}>{item.name}</Text>
                <Text style={S.favPrice}>₹{item.price} <Text style={S.favMrp}>₹{item.mrp}</Text></Text>
              </View>
              <TouchableOpacity style={S.addToCartBtn} onPress={() => Alert.alert('Added', `${item.name} added to cart!`)}>
                <Text style={S.addToCartTxt}>Add to cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Account Section */}
        <Text style={S.groupLabel}>Account</Text>
        <View style={S.card}>
          {MENU_ACCOUNT.map((item, idx) => (
            <View key={item.label}>
              {idx > 0 && <View style={S.divider} />}
              <MenuRow {...item} />
            </View>
          ))}
        </View>

        {/* Reviews & Ratings */}
        <Text style={S.groupLabel}>Reviews & Ratings</Text>
        <View style={S.card}>
          {MENU_REVIEWS.map((item, idx) => (
            <View key={item.label}>
              {idx > 0 && <View style={S.divider} />}
              <MenuRow {...item} />
            </View>
          ))}
        </View>

        {/* Security */}
        <Text style={S.groupLabel}>Security</Text>
        <View style={S.card}>
          {MENU_SECURITY.map((item, idx) => (
            <View key={item.label}>
              {idx > 0 && <View style={S.divider} />}
              <MenuRow {...item} />
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={S.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={S.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },

  // Sub header
  subHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 2 },
  subHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },

  // Avatar
  avatarCircle: { backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: '#16A34A' },
  cameraWrap: {
    position: 'absolute', bottom: 0, right: 0,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },

  // Card
  card: {
    backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardBoldTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },

  // Profile info
  profileName: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  profilePhone: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  profileEmail: { fontSize: 12, color: '#6B7280' },
  profileMember: { fontSize: 12, color: '#16A34A', marginTop: 2 },

  // Edit profile button
  editProfileBtn: {
    marginHorizontal: 12, marginTop: 10,
    borderWidth: 1.5, borderColor: '#16A34A', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff',
  },
  editProfileTxt: { fontSize: 14, fontWeight: '700', color: '#16A34A' },

  // Favourites
  favRow: { flexDirection: 'row', alignItems: 'center' },
  favImg: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  favName: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginBottom: 3 },
  favPrice: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  favMrp: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through', fontWeight: '400' },
  addToCartBtn: { backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginRight: 4 },
  addToCartTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Section labels
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginHorizontal: 16, marginTop: 16, marginBottom: 2 },
  sectionSubtitle: { fontSize: 12, color: '#9CA3AF', marginHorizontal: 16, marginBottom: 10 },
  groupLabel: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginHorizontal: 16, marginTop: 20, marginBottom: 8 },

  // Menu rows
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  menuIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  menuSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 0 },

  // Badges
  savedBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  savedBadgeTxt: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  recommendedBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  recommendedTxt: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  defaultBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  defaultBadgeTxt: { fontSize: 11, color: '#6B7280', fontWeight: '600' },

  // Address
  addrRow: { paddingVertical: 6 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  tag: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tagDefault: { backgroundColor: '#F3F4F6' },
  tagTxt: { fontSize: 12, color: '#374151', fontWeight: '600' },
  addrName: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  addrText: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Toggle
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  toggleSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },

  // Payment
  payMethodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  payMethodLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  payMethodSub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },

  // Add button
  addBtn: {
    backgroundColor: '#16A34A', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 14,
  },
  addBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  fieldLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#F0FDF4', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    flexDirection: 'row', alignItems: 'center',
  },
  fieldInputText: { flex: 1, fontSize: 14, color: '#1F2937' },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelBtnTxt: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  saveBtn: { flex: 1, backgroundColor: '#16A34A', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },

  // Logout
  logoutBtn: {
    marginHorizontal: 12, marginTop: 20,
    backgroundColor: '#EF4444', borderRadius: 12,
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  logoutTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Edit Profile Modal extras
  modalSectionLabel: {
    fontSize: 13, fontWeight: '800', color: '#16A34A',
    marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  typeChipActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  typeChipTxt: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  typeChipTxtActive: { color: '#16A34A' },

  // Address Modal owner strip
  addrModalOwner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  addrModalAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center',
  },
  addrModalAvatarTxt: { fontSize: 14, fontWeight: '800', color: '#16A34A' },
  addrModalOwnerName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  addrModalOwnerPhone: { fontSize: 12, color: '#6B7280', marginTop: 1 },

  // Delivery address item
  addrItem: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, marginTop: 10,
  },
  addrActions: { flexDirection: 'row', marginTop: 10, gap: 10 },
  addrEditBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#16A34A', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  addrEditBtnTxt: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
});
