import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCategories, useProducts } from '../hooks/useProducts';
import { useCartStore } from '../../../store/cartStore';
import { CartState } from '../../../store/cartStore';
import { Product, ProductCategory } from '../types';

// ─── Discount Badge ──────────────────────────────────────────────────────────
const DiscountBadge: React.FC<{ price: number; discountPrice: number }> = ({
  price,
  discountPrice,
}) => {
  if (!discountPrice || discountPrice >= price) return null;
  const pct = Math.round(((price - discountPrice) / price) * 100);
  return (
    <View style={S.discBadge}>
      <Text style={S.discBadgeTxt}>{pct}% OFF</Text>
    </View>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard: React.FC<{ product: Product; onPress?: () => void }> = ({ product, onPress }) => {
  const addItem    = useCartStore((s: CartState) => s.addItem);
  const increaseQty = useCartStore((s: CartState) => s.increaseQty);
  const decreaseQty = useCartStore((s: CartState) => s.decreaseQty);
  const qty        = useCartStore((s: CartState) => s.getQty(product.id));

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <View style={S.card}>
      {/* Tappable: image + name + rating + price → opens detail */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
        <View style={S.cardImgWrap}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={S.cardImg} resizeMode="cover" />
          ) : (
            <View style={[S.cardImg, S.cardImgFallback]}>
              <Text style={{ fontSize: 30 }}>🍽️</Text>
            </View>
          )}
          <DiscountBadge price={product.price} discountPrice={product.discountPrice} />
        </View>
        <View style={S.cardBody}>
          <Text style={S.cardName} numberOfLines={2}>{product.name}</Text>
          <View style={S.cardRating}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={S.cardRatingTxt}> 4.5</Text>
          </View>
          <View style={S.cardPriceRow}>
            <Text style={S.cardPrice}>₹{displayPrice}</Text>
            {product.discountPrice > 0 && product.price > product.discountPrice && (
              <Text style={S.cardMrp}>₹{product.price}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Add / Qty controls — independent from card tap */}
      <View style={[S.cardBody, { paddingTop: 0 }]}>
        {qty > 0 ? (
          <View style={S.qtyRow}>
            <TouchableOpacity style={S.qtyBtn} onPress={() => decreaseQty(product.id)}>
              <Text style={S.qtyBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={S.qtyNum}>{qty}</Text>
            <TouchableOpacity style={[S.qtyBtn, S.qtyBtnGreen]} onPress={() => increaseQty(product.id)}>
              <Text style={[S.qtyBtnTxt, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={S.addBtn} onPress={() => addItem(product)} activeOpacity={0.85}>
            <Text style={S.addBtnTxt}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Left Sidebar Category Item ───────────────────────────────────────────────
const SidebarItem: React.FC<{
  item: ProductCategory;
  active: boolean;
  onPress: () => void;
}> = ({ item, active, onPress }) => (
  <TouchableOpacity
    style={[S.sideItem, active && S.sideItemActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {active && <View style={S.sideActiveBar} />}
    {item.icon
      ? <Text style={S.sideEmoji}>{item.icon}</Text>
      : <Ionicons name="cart-outline" size={18} color={active ? '#16A34A' : '#6B7280'} style={{ marginBottom: 2 }} />
    }
    <Text style={[S.sideLabel, active && S.sideLabelActive]} numberOfLines={2}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
type Props = {
  onTabPress?: (tab: import('../../../components/BottomTabBar').TabName) => void;
  initialCategory?: ProductCategory | null;
  onProductPress?: (product: Product) => void;
};

export const CategoriesScreen: React.FC<Props> = ({ onTabPress, initialCategory, onProductPress }) => {
  const [activeCat, setActiveCat] = useState<ProductCategory | null>(initialCategory ?? null);
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Jab HomeScreen se category aaye toh sidebar mein highlight karo
  useEffect(() => {
    if (initialCategory) setActiveCat(initialCategory);
  }, [initialCategory]);

  // 400ms debounce — same as HomeScreen
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const isSearching = debouncedSearch.length >= 2;

  const { data: categoriesData, isLoading: catsLoading } = useCategories({ page: 0, size: 20 });

  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(activeCat?.name ?? undefined, { page: 0, size: 10 });

  // ── Search query (fires only when isSearching) ──
  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useProducts(debouncedSearch, { page: 0, size: 20 }, isSearching);

  const categories = categoriesData?.content ?? [];

  const products = useMemo(() => {
    const all = productsData?.pages.flatMap((p) => p.data) ?? [];
    if (vegFilter === 'veg') return all.filter((p) => p.isVeg);
    if (vegFilter === 'nonveg') return all.filter((p) => !p.isVeg);
    return all;
  }, [productsData, vegFilter]);

  const searchProducts = useMemo(
    () => (isSearching ? searchData?.pages.flatMap((p) => p.data) ?? [] : []),
    [searchData, isSearching],
  );

  const totalItems = useCartStore((s: CartState) => s.totalItems());
  const totalPrice = useCartStore((s: CartState) => s.totalPrice());

  return (
    <SafeAreaView style={S.safeArea} edges={['top']}>

      {/* ── Top header ── */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={() => onTabPress?.('Home')}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Categories</Text>
        <TouchableOpacity
          onPress={() => {
            setSearchBarOpen((v) => !v);
            if (!searchBarOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
            else { setSearch(''); setDebouncedSearch(''); }
          }}
        >
          <Ionicons name={searchBarOpen ? 'close' : 'search-outline'} size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* ── Search bar (expandable) ── */}
      {searchBarOpen && (
        <View style={S.searchWrap}>
          <View style={S.searchBar}>
            <Ionicons name="search-outline" size={17} color="#9CA3AF" style={{ marginLeft: 10 }} />
            <TextInput
              ref={searchInputRef}
              style={S.searchInput}
              placeholder="Search for products…"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); setDebouncedSearch(''); }} style={{ paddingRight: 10 }}>
                <Ionicons name="close-circle" size={17} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Filter bar ── */}
      <View style={S.filterBar}>
        <TouchableOpacity style={S.sortBtn}>
          <Ionicons name="options-outline" size={13} color="#374151" />
          <Text style={S.sortTxt}> Sort</Text>
          <Ionicons name="chevron-down" size={12} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.filterChip, vegFilter === 'veg' && S.filterChipActive]}
          onPress={() => setVegFilter((v) => (v === 'veg' ? 'all' : 'veg'))}
        >
          <Text style={S.filterDot}>��</Text>
          <Text style={[S.filterChipTxt, vegFilter === 'veg' && S.filterChipTxtActive]}>
            Veg Only
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.filterChip, vegFilter === 'nonveg' && S.filterChipActive]}
          onPress={() => setVegFilter((v) => (v === 'nonveg' ? 'all' : 'nonveg'))}
        >
          <Text style={S.filterDot}>��</Text>
          <Text style={[S.filterChipTxt, vegFilter === 'nonveg' && S.filterChipActive && S.filterChipTxtActive]}>
            Non-Veg
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Body: search results OR sidebar + product grid ── */}
      {isSearching ? (
        /* ── Search Results View ── */
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[S.searchSection, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={S.searchSectionHeader}>
            <Text style={S.searchSectionTitle}>
              🔍 Results for "{debouncedSearch}"
            </Text>
            {searchFetching && <ActivityIndicator size="small" color="#16A34A" />}
          </View>

          {searchLoading ? (
            <ActivityIndicator color="#16A34A" style={{ marginVertical: 32 }} />
          ) : searchProducts.length === 0 ? (
            <View style={S.searchEmpty}>
              <Text style={S.searchEmptyEmoji}>😕</Text>
              <Text style={S.searchEmptyTxt}>No results found for "{debouncedSearch}"</Text>
            </View>
          ) : (
            <View style={S.searchGrid}>
              {searchProducts.map((item) => (
                <View key={item.id} style={S.searchCardWrap}>
                  <ProductCard product={item} onPress={() => onProductPress?.(item)} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        /* ── Normal: sidebar + product grid ── */
        <View style={S.body}>

          {/* Left sidebar */}
          {catsLoading ? (
            <View style={S.sidebar}>
              <ActivityIndicator color="#16A34A" style={{ marginTop: 20 }} />
            </View>
          ) : (
            <View style={S.sidebar}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {categories.map((cat) => (
                  <SidebarItem
                    key={cat.id}
                    item={cat}
                    active={activeCat?.id === cat.id}
                    onPress={() => setActiveCat((p) => (p?.id === cat.id ? null : cat))}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Right product grid */}
          {productsLoading ? (
            <View style={S.gridWrap}>
              <ActivityIndicator color="#16A34A" style={{ marginTop: 40 }} />
            </View>
          ) : (
            <FlatList
              style={S.gridWrap}
              data={products}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <ProductCard product={item} onPress={() => onProductPress?.(item)} />}
              numColumns={2}
              columnWrapperStyle={S.gridRow}
              contentContainerStyle={S.gridContent}
              showsVerticalScrollIndicator={false}
              onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isFetchingNextPage
                  ? <ActivityIndicator color="#16A34A" style={{ marginVertical: 12 }} />
                  : null
              }
              ListEmptyComponent={
                <View style={S.emptyWrap}>
                  <Text style={S.emptyEmoji}>🔍</Text>
                  <Text style={S.emptyTxt}>No items found</Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* ── Sticky cart bar ── */}
      {totalItems > 0 && (
        <TouchableOpacity style={S.cartBar} activeOpacity={0.9} onPress={() => onTabPress?.('Cart')}>
          <Text style={S.cartBarLeft}>
            {totalItems} Item{totalItems > 1 ? 's' : ''} | ₹{totalPrice}
          </Text>
          <View style={S.cartBarRight}>
            <Text style={S.cartBarRightTxt}>View Cart</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },

  // filter bar
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  sortTxt: { fontSize: 12, color: '#374151', fontWeight: '500' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  filterDot: { fontSize: 11 },
  filterChipTxt: { fontSize: 12, color: '#374151', fontWeight: '500' },
  filterChipTxtActive: { color: '#16A34A', fontWeight: '700' },

  // body
  body: { flex: 1, flexDirection: 'row' },

  // left sidebar
  sidebar: {
    width: 72,
    flexShrink: 0,
    flexGrow: 0,
    marginLeft: 8,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  sideItem: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 2,
    position: 'relative',
    minHeight: 58,
  },
  sideItemActive: { backgroundColor: '#fff' },
  sideActiveBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    backgroundColor: '#16A34A',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  sideEmoji: { fontSize: 18, marginBottom: 2 },
  sideLabel: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'left',
    fontWeight: '500',
    lineHeight: 12,
  },
  sideLabelActive: { color: '#16A34A', fontWeight: '700' },

  // right grid
  gridWrap: { flex: 1 },
  gridContent: { padding: 8, paddingBottom: 16 },
  gridRow: { justifyContent: 'space-between', marginBottom: 10 },

  // card
  card: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
    }),
  },
  cardImgWrap: { width: '100%', height: 110, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  cardImgFallback: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },

  cardBody: { padding: 7 },
  cardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
    minHeight: 32,
  },
  cardRating: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cardRatingTxt: { fontSize: 10, color: '#374151', fontWeight: '600' },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  cardMrp: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },

  addBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  addBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
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
  qtyBtnTxt: { fontSize: 16, fontWeight: '700', color: '#374151', lineHeight: 20 },
  qtyNum: { fontSize: 13, fontWeight: '700', color: '#1F2937' },

  // empty
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyTxt: { fontSize: 14, color: '#9CA3AF' },

  // sticky cart bar
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16A34A',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  cartBarLeft: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cartBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartBarRightTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // ── Search ──
  searchWrap: { paddingHorizontal: 12, paddingBottom: 8, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937', paddingHorizontal: 8 },

  // ── Search results ──
  searchSection: { paddingHorizontal: 12, paddingTop: 8 },
  searchSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  searchSectionTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  searchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  searchCardWrap: { width: '47%' },
  searchEmpty: { alignItems: 'center', paddingVertical: 40 },
  searchEmptyEmoji: { fontSize: 36, marginBottom: 8 },
  searchEmptyTxt: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
