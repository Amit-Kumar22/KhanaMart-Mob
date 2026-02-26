import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore, CartState } from '../../../store/cartStore';
import { useProfileStore } from '../../../store/profileStore';
import { useProducts, useCategories } from '../hooks/useProducts';
import { Product, ProductCategory } from '../types';
import { TabName } from '../../../components/BottomTabBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNER_DATA = [
  {
    id: '1',
    title: 'Weekly Grocery\nDiscount',
    subtitle: 'Get up to 30% off on all essentials',
    badge: '30% OFF',
    bg: '#16A34A',
  },
  {
    id: '2',
    title: 'Fresh Tiffin\nDelivery',
    subtitle: 'Homemade meals delivered daily',
    badge: '20% OFF',
    bg: '#065F46',
  },
  {
    id: '3',
    title: 'Best Deals\nToday',
    subtitle: 'Limited time offers on groceries',
    badge: '15% OFF',
    bg: '#047857',
  },
];

interface HomeScreenProps {
  onTabPress?: (tab: TabName) => void;
  onCategoryPress?: (cat: ProductCategory) => void;
  onProductPress?: (product: Product) => void;
}

const CategoryChip: React.FC<{
  item: ProductCategory;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.categoryChip}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.categoryIconBg}>
      {item.icon
        ? <Text style={styles.categoryEmoji}>{item.icon}</Text>
        : <Ionicons name="cart-outline" size={20} color="#16A34A" />
      }
    </View>
    <Text style={styles.categoryLabel} numberOfLines={1}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

const DiscountBadge: React.FC<{ price: number; discountPrice: number }> = ({
  price,
  discountPrice,
}) => {
  if (!discountPrice || discountPrice >= price) return null;
  const pct = Math.round(((price - discountPrice) / price) * 100);
  return (
    <View style={styles.discountBadge}>
      <Text style={styles.discountBadgeText}>{pct}% OFF</Text>
    </View>
  );
};

const ProductCard: React.FC<{ product: Product; onPress?: () => void }> = ({ product, onPress }) => {
  const addItem = useCartStore((s) => s.addItem);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);
  const qty = useCartStore((s) => s.getQty(product.id));
  const [wished, setWished] = useState(false);

  return (
    <View style={styles.productCard}>
      {/* Tappable area: image + name + rating + price → opens detail */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        <View style={styles.productImgWrap}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImg}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImg, styles.productImgPlaceholder]}>
              <Text style={{ fontSize: 28 }}>🍽️</Text>
            </View>
          )}
          <DiscountBadge price={product.price} discountPrice={product.discountPrice} />
          <TouchableOpacity
            style={styles.wishBtn}
            onPress={() => setWished((p) => !p)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name={wished ? 'heart' : 'heart-outline'}
              size={15}
              color={wished ? '#EF4444' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingVal}>4.5</Text>
            <Text style={styles.ratingCnt}> | 1.2k</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>
              ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
            </Text>
            {product.discountPrice > 0 && product.price > product.discountPrice && (
              <Text style={styles.mrp}>₹{product.price}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Add / Qty controls — independent from card tap */}
      <View style={[styles.productInfo, { paddingTop: 0 }]}>
        {qty > 0 ? (
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => decreaseQty(product.id)}
            >
              <Text style={styles.qtyBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{qty}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, styles.qtyBtnGreen]}
              onPress={() => increaseQty(product.id)}
            >
              <Text style={[styles.qtyBtnTxt, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addItem(product)}
            activeOpacity={0.85}
          >
            <Text style={styles.addBtnTxt}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const BannerDot: React.FC<{ active: boolean }> = ({ active }) => (
  <View
    style={[
      styles.bannerDot,
      active ? styles.bannerDotActive : styles.bannerDotInactive,
    ]}
  />
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ onTabPress, onCategoryPress, onProductPress }) => {
  const user = useAuthStore((s) => s.user);
  const { profile, fetchProfile } = useProfileStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);

  const totalItems = useCartStore((s: CartState) => s.totalItems());
  const totalPrice = useCartStore((s: CartState) => s.totalPrice());

  useEffect(() => { fetchProfile(); }, []);

  // Debounce search — API call 400ms baad hoga
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const isSearching = debouncedSearch.length >= 2;

  const { data: categoriesData, isLoading: catsLoading } = useCategories({
    page: 0,
    size: 10,
  });

  const { data: trendingData, isLoading: trendingLoading } = useProducts(
    undefined,
    { page: 0, size: 6 },
  );
  const { data: dealsData, isLoading: dealsLoading } = useProducts(
    undefined,
    { page: 0, size: 6 },
  );
  const { data: veggiesData, isLoading: veggiesLoading } = useProducts(
    'vegetable',
    { page: 0, size: 6 },
  );
  const { data: tiffinData, isLoading: tiffinLoading } = useProducts(
    'tiffin',
    { page: 0, size: 6 },
  );

  // ── Search query — sirf tab fire hoga jab isSearching true ho ──
  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useProducts(debouncedSearch, { page: 0, size: 20 }, isSearching);

  const searchProducts = useMemo(
    () => (isSearching ? searchData?.pages.flatMap((p) => p.data) ?? [] : []),
    [searchData, isSearching],
  );

  const trendingProducts = useMemo(
    () => trendingData?.pages.flatMap((p) => p.data) ?? [],
    [trendingData],
  );
  const dealsProducts = useMemo(
    () => dealsData?.pages.flatMap((p) => p.data) ?? [],
    [dealsData],
  );
  const veggiesProducts = useMemo(
    () => veggiesData?.pages.flatMap((p) => p.data) ?? [],
    [veggiesData],
  );
  const tiffinProducts = useMemo(
    () => tiffinData?.pages.flatMap((p) => p.data) ?? [],
    [tiffinData],
  );

  const categories = categoriesData?.content ?? [];

  const handleBannerScroll = useCallback((e: any) => {
    const idx = Math.round(
      e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 28),
    );
    setBannerIdx(idx);
  }, []);

  const renderSection = (
    emoji: string,
    title: string,
    products: Product[],
    loading: boolean,
    onViewMore?: () => void,
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {emoji} {title}
        </Text>
        {onViewMore && (
          <TouchableOpacity onPress={onViewMore}>
            <Text style={styles.viewMore}>View More</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <ActivityIndicator color="#16A34A" style={{ marginVertical: 16 }} />
      ) : products.length === 0 ? (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyTxt}>No items available</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProductCard product={item} onPress={() => onProductPress?.(item)} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 12 }}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandName}>
            <Text style={styles.brandKhana}>Khana</Text>
            <Text style={styles.brandMart}>Mart</Text>
          </Text>
          <TouchableOpacity style={styles.locationRow} onPress={() => onTabPress?.('Profile')}>
            <Text style={styles.deliveryLabel}>Delivering to </Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {profile?.address?.city
                ? `${profile.address.city}, ${profile.address.stateName}`
                : (user?.fullName ?? 'Set address')}
            </Text>
            <Ionicons name="chevron-down" size={13} color="#374151" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => onTabPress?.('Profile')}>
          <View style={styles.avatar}>
            {profile?.fullName
              ? <Text style={{ fontSize: 14, fontWeight: '800', color: '#16A34A' }}>
                  {profile.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </Text>
              : <Ionicons name="person" size={20} color="#16A34A" />}
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={17}
            color="#9CA3AF"
            style={{ marginLeft: 10 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for groceries, tiffin, vegetable"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={{ paddingRight: 10 }}>
            <Ionicons name="mic-outline" size={17} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search Results ── */}
        {isSearching ? (
          <View style={{ flex: 1 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🔍 Results for "{debouncedSearch}"
              </Text>
              {searchFetching && (
                <ActivityIndicator size="small" color="#16A34A" />
              )}
            </View>
            {searchLoading ? (
              <ActivityIndicator color="#16A34A" style={{ marginVertical: 24 }} />
            ) : searchProducts.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={{ fontSize: 32, textAlign: 'center' }}>😕</Text>
                <Text style={[styles.emptyTxt, { marginTop: 8 }]}>
                  No results found for "{debouncedSearch}"
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 }}>
                {searchProducts.map((item) => (
                  <View key={item.id} style={{ width: '47%' }}>
                    <ProductCard product={item} onPress={() => onProductPress?.(item)} />
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
        {/* ── Banner Carousel ── */}
        <View style={styles.bannerWrap}>
          <ScrollView
            horizontal
            pagingEnabled={false}
            snapToInterval={SCREEN_WIDTH - 28}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleBannerScroll}
          >
            {BANNER_DATA.map((b) => (
              <View
                key={b.id}
                style={[
                  styles.bannerCard,
                  { backgroundColor: b.bg, width: SCREEN_WIDTH - 28 },
                ]}
              >
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeTxt}>{b.badge}</Text>
                </View>
                <Text style={styles.bannerTitle}>{b.title}</Text>
                <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                <TouchableOpacity style={styles.shopNowBtn}>
                  <Text style={styles.shopNowTxt}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.bannerDots}>
            {BANNER_DATA.map((b, i) => (
              <BannerDot key={b.id} active={i === bannerIdx} />
            ))}
          </View>
        </View>

        {/* ── Categories Row ── */}
        <View style={styles.catsWrap}>
          {catsLoading ? (
            <ActivityIndicator color="#16A34A" style={{ marginVertical: 8 }} />
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CategoryChip
                  item={item}
                  onPress={() => {
                    if (onCategoryPress) {
                      onCategoryPress(item);
                    } else {
                      onTabPress?.('Category');
                    }
                  }}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}
            />
          )}
        </View>

        {renderSection('🔥', 'Trending', trendingProducts, trendingLoading, () =>
          onTabPress?.('Category'),
        )}
        {renderSection('💰', 'Best Deals', dealsProducts, dealsLoading, () =>
          onTabPress?.('Category'),
        )}
        {renderSection(
          '🥦',
          'Fresh Vegetables',
          veggiesProducts,
          veggiesLoading,
          () => onTabPress?.('Category'),
        )}
        {renderSection('🍱', 'Tiffin Plans', tiffinProducts, tiffinLoading, () =>
          onTabPress?.('Subscription'),
        )}

        <View style={{ height: 16 }} />
          </>
        )}
      </ScrollView>

      {/* ── Sticky cart bar ── */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          activeOpacity={0.9}
          onPress={() => onTabPress?.('Cart')}
        >
          <Text style={styles.cartBarLeft}>
            {totalItems} Item{totalItems > 1 ? 's' : ''} | ₹{totalPrice}
          </Text>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarRightTxt}>View Cart</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  headerLeft: { flex: 1 },
  brandName: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  brandKhana: { color: '#1F2937' },
  brandMart: { color: '#16A34A' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  deliveryLabel: { fontSize: 11, color: '#6B7280' },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    maxWidth: 160,
  },
  avatarBtn: { marginLeft: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  searchWrap: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  scrollContent: { paddingBottom: 8 },
  bannerWrap: {
    marginHorizontal: 14,
    marginTop: 4,
    marginBottom: 6,
  },
  bannerCard: {
    borderRadius: 14,
    padding: 16,
    minHeight: 130,
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bannerBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10,
  },
  shopNowBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  shopNowTxt: { color: '#064E3B', fontSize: 12, fontWeight: '700' },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 5,
  },
  bannerDot: { height: 6, borderRadius: 3 },
  bannerDotActive: { width: 18, backgroundColor: '#16A34A' },
  bannerDotInactive: { width: 6, backgroundColor: '#D1FAE5' },
  catsWrap: { marginBottom: 6, marginTop: 4 },
  categoryChip: { alignItems: 'center', width: 64 },
  categoryIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: { marginTop: 6, paddingLeft: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingRight: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  viewMore: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  emptyRow: { paddingVertical: 20, alignItems: 'center' },
  emptyTxt: { color: '#9CA3AF', fontSize: 13 },
  productCard: {
    width: 148,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  productImgWrap: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  productImg: { width: '100%', height: '100%' },
  productImgPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discountBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  wishBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { padding: 8 },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
    minHeight: 32,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  ratingVal: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 2,
  },
  ratingCnt: { fontSize: 10, color: '#9CA3AF' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  salePrice: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  mrp: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 6,
  },
  addBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'space-between',
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnGreen: { backgroundColor: '#064E3B' },
  qtyBtnTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 20,
  },
  qtyNum: { fontSize: 13, fontWeight: '700', color: '#1F2937' },

  // ── Sticky cart bar ──
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#16A34A',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    marginHorizontal: 12, marginBottom: 12,
    borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8,
    elevation: 6,
  },
  cartBarLeft: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cartBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartBarRightTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});