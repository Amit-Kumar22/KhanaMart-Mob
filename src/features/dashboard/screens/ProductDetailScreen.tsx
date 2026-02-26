import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../../store/cartStore';
import { CartState } from '../../../store/cartStore';
import { Product } from '../types';

const { width: SW } = Dimensions.get('window');

// ─── Mock reviews (no reviews API available) ─────────────────────────────────
const REVIEWS = [
  { id: '1', name: 'Priya S.', initials: 'P', rating: 5, time: '2 days ago', text: 'Absolutely fresh and delicious! Will order again.' },
  { id: '2', name: 'Rahul M.', initials: 'R', rating: 4, time: '1 week ago', text: 'Good quality, packaging was excellent. Slightly delayed delivery.' },
  { id: '3', name: 'Anita K.', initials: 'A', rating: 5, time: '3 days ago', text: "Best quality I've found online. Highly recommended!" },
];

// ─── Star Row ─────────────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number; size?: number; color?: string }> = ({
  rating,
  size = 13,
  color = '#F59E0B',
}) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Ionicons
        key={s}
        name={s <= rating ? 'star' : 'star-outline'}
        size={size}
        color={color}
      />
    ))}
  </View>
);

// ─── Rating Bar ───────────────────────────────────────────────────────────────
const RatingBar: React.FC<{ star: number; pct: number }> = ({ star, pct }) => (
  <View style={S.ratingBarRow}>
    <Text style={S.ratingBarLabel}>{star}</Text>
    <View style={S.ratingBarTrack}>
      <View style={[S.ratingBarFill, { width: `${pct}%` }]} />
    </View>
  </View>
);

// ─── Related Product Card ─────────────────────────────────────────────────────
const RelatedCard: React.FC<{ product: Product; onPress: () => void }> = ({ product, onPress }) => {
  const addItem    = useCartStore((s: CartState) => s.addItem);
  const increaseQty = useCartStore((s: CartState) => s.increaseQty);
  const decreaseQty = useCartStore((s: CartState) => s.decreaseQty);
  const qty        = useCartStore((s: CartState) => s.getQty(product.id));
  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0 && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <TouchableOpacity style={S.relCard} onPress={onPress} activeOpacity={0.85}>
      <View style={S.relImgWrap}>
        {discount > 0 && (
          <View style={S.relBadge}><Text style={S.relBadgeTxt}>{discount}% OFF</Text></View>
        )}
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={S.relImg} resizeMode="cover" />
        ) : (
          <View style={[S.relImg, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 28 }}>🍽️</Text>
          </View>
        )}
      </View>
      <Text style={S.relName} numberOfLines={1}>{product.name}</Text>
      <Text style={S.relPrice}>₹{displayPrice}</Text>
      <View style={S.relBottom}>
        {qty > 0 ? (
          <View style={S.relQtyRow}>
            <TouchableOpacity style={S.relQtyBtn} onPress={() => decreaseQty(product.id)}>
              <Text style={S.relQtyBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={S.relQtyNum}>{qty}</Text>
            <TouchableOpacity style={[S.relQtyBtn, S.relQtyBtnGreen]} onPress={() => increaseQty(product.id)}>
              <Text style={[S.relQtyBtnTxt, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={S.relAddBtn} onPress={() => addItem(product)}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export interface ProductDetailScreenProps {
  product: Product;
  relatedProducts?: Product[];
  onBack: () => void;
  onProductPress?: (product: Product) => void;
  onCartPress?: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  relatedProducts = [],
  onBack,
  onProductPress,
  onCartPress,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [wishlist, setWishlist]       = useState(false);

  const addItem    = useCartStore((s: CartState) => s.addItem);
  const increaseQty = useCartStore((s: CartState) => s.increaseQty);
  const decreaseQty = useCartStore((s: CartState) => s.decreaseQty);
  const qty        = useCartStore((s: CartState) => s.getQty(product.id));
  const totalItems = useCartStore((s: CartState) => s.totalItems());

  const displayPrice   = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount    = product.discountPrice > 0 && product.price > product.discountPrice;
  const savings        = hasDiscount ? product.price - product.discountPrice : 0;
  const discountPct    = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <SafeAreaView style={S.safe} edges={['top']}>

      {/* ── Top Action Bar ── */}
      <View style={S.topBar}>
        <TouchableOpacity style={S.topBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={S.topRight}>
          <TouchableOpacity style={S.topBtn} onPress={() => setWishlist((w) => !w)}>
            <Ionicons
              name={wishlist ? 'heart' : 'heart-outline'}
              size={22}
              color={wishlist ? '#EF4444' : '#1F2937'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={S.topBtn}>
            <Ionicons name="share-social-outline" size={22} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={S.topBtn} onPress={onCartPress}>
            <Ionicons name="cart-outline" size={22} color="#1F2937" />
            {totalItems > 0 && (
              <View style={S.cartBadge}>
                <Text style={S.cartBadgeTxt}>{totalItems > 9 ? '9+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Hero Image ── */}
        <View style={S.heroWrap}>
          {discountPct > 0 && (
            <View style={S.heroBadge}>
              <Text style={S.heroBadgeTxt}>{discountPct}% OFF</Text>
            </View>
          )}
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={S.heroImg} resizeMode="cover" />
          ) : (
            <View style={[S.heroImg, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 64 }}>🍽️</Text>
            </View>
          )}
        </View>

        {/* ── Title Block ── */}
        <View style={S.titleBlock}>
          <Text style={S.productName}>{product.name}</Text>
          <Text style={S.brandTag}>KhanaMart Fresh</Text>

          <View style={S.metaRow}>
            <Stars rating={4.5} size={14} />
            <Text style={S.metaTxt}> 4.5 (1.2k reviews)</Text>
            <View style={S.metaDot} />
            <Text style={S.metaTxt}>3.4k+ sold</Text>
          </View>

          <View style={S.stockRow}>
            <View style={[S.stockDot, product.active ? S.stockDotGreen : S.stockDotRed]} />
            <Text style={[S.stockTxt, { color: product.active ? '#16A34A' : '#EF4444' }]}>
              {product.active ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>

        {/* ── Price Box ── */}
        <View style={S.priceBox}>
          <View style={S.priceRow}>
            <Text style={S.priceMain}>₹{displayPrice}</Text>
            {hasDiscount && (
              <>
                <Text style={S.priceMrp}>MRP ₹{product.price}</Text>
                <Text style={S.priceSaving}>You save ₹{savings}</Text>
              </>
            )}
          </View>
          {product.preparationTime > 0 && (
            <View style={S.deliveryRow}>
              <Ionicons name="bicycle-outline" size={14} color="#6B7280" />
              <Text style={S.deliveryTxt}> Delivery in {product.preparationTime}-{product.preparationTime + 15} mins</Text>
            </View>
          )}
        </View>

        {/* ── Size / Type Selectors ── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Select Size</Text>
          <View style={S.chipRow}>
            {[
              product.weight ? `${product.weight}g` : 'Regular',
              product.weight ? `${Math.round(product.weight * 1.5)}g` : 'Large',
            ].map((size, i) => (
              <TouchableOpacity key={size} style={[S.sizeChip, i === 0 && S.sizeChipActive]}>
                <Text style={[S.sizeChipTxt, i === 0 && S.sizeChipTxtActive]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={S.section}>
          <View style={S.chipRow}>
            <TouchableOpacity style={[S.typeChip, product.isVeg && S.typeChipVeg]}>
              <View style={[S.typeDot, { backgroundColor: '#16A34A' }]} />
              <Text style={[S.typeChipTxt, product.isVeg && S.typeChipTxtActive]}>Veg</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.typeChip, !product.isVeg && S.typeChipNonveg]}>
              <View style={[S.typeDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[S.typeChipTxt, !product.isVeg && S.typeChipTxtActive]}>Non-Veg</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Product Details Accordion ── */}
        <View style={S.accordionWrap}>
          <TouchableOpacity style={S.accordionHeader} onPress={() => setDetailsOpen((o) => !o)}>
            <Text style={S.accordionTitle}>Product Details</Text>
            <Ionicons name={detailsOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#374151" />
          </TouchableOpacity>

          {detailsOpen && (
            <View style={S.accordionBody}>
              {product.description ? (
                <View style={S.detailRow}>
                  <Text style={S.detailLabel}>Description:</Text>
                  <Text style={S.detailVal}>{product.description}</Text>
                </View>
              ) : null}

              <View style={S.detailRow}>
                <Text style={S.detailLabel}>Ingredients:</Text>
                <Text style={S.detailVal}>Fresh premium ingredients, spices, filtered water, cold-pressed oil.</Text>
              </View>

              {product.weight ? (
                <View style={S.detailRow}>
                  <Text style={S.detailLabel}>Net Weight:</Text>
                  <Text style={S.detailVal}>{product.weight}g</Text>
                </View>
              ) : null}

              <View style={S.detailRow}>
                <Text style={S.detailLabel}>Nutritional Info:</Text>
                <Text style={S.detailVal}>Calories: 320 kcal | Protein: 12g | Carbs: 45g | Fat: 10g</Text>
              </View>

              <View style={S.detailRow}>
                <Text style={S.detailLabel}>Storage:</Text>
                <Text style={S.detailVal}>Store in a cool, dry place. Consume within 2 hours of opening.</Text>
              </View>

              <View style={[S.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={S.detailLabel}>Category:</Text>
                <Text style={S.detailVal}>{product.category?.name ?? '—'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Ratings & Reviews ── */}
        <View style={S.reviewSection}>
          <View style={S.reviewTopRow}>
            <View style={S.reviewLeft}>
              <Text style={S.reviewBigRating}>4.5</Text>
              <Stars rating={4} size={16} />
              <Text style={S.reviewCount}>1.2k reviews</Text>
            </View>
            <View style={S.reviewBars}>
              <RatingBar star={5} pct={70} />
              <RatingBar star={4} pct={50} />
              <RatingBar star={3} pct={20} />
              <RatingBar star={2} pct={10} />
              <RatingBar star={1} pct={5} />
            </View>
          </View>

          {REVIEWS.map((r) => (
            <View key={r.id} style={S.reviewCard}>
              <View style={S.reviewHeader}>
                <View style={S.reviewAvatar}>
                  <Text style={S.reviewAvatarTxt}>{r.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={S.reviewNameRow}>
                    <Text style={S.reviewName}>{r.name}</Text>
                    <Text style={S.reviewTime}>{r.time}</Text>
                  </View>
                  <Stars rating={r.rating} size={12} />
                </View>
              </View>
              <Text style={S.reviewTxt}>{r.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Frequently Bought Together ── */}
        {relatedProducts.length > 0 && (
          <View style={S.relSection}>
            <Text style={S.relTitle}>Frequently Bought Together</Text>
            <FlatList
              data={relatedProducts.slice(0, 6)}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <RelatedCard
                  product={item}
                  onPress={() => onProductPress?.(item)}
                />
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* ── Sticky Bottom Bar ── */}
      <View style={S.bottomBar}>
        <View style={S.bottomPriceCol}>
          <Text style={S.bottomPrice}>₹{displayPrice}</Text>
          {hasDiscount && <Text style={S.bottomMrp}>₹{product.price}</Text>}
        </View>

        {qty > 0 ? (
          <View style={S.bottomQtyRow}>
            <TouchableOpacity style={S.bottomQtyBtn} onPress={() => decreaseQty(product.id)}>
              <Text style={S.bottomQtyBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={S.bottomQtyNum}>{qty}</Text>
            <TouchableOpacity style={[S.bottomQtyBtn, S.bottomQtyBtnGreen]} onPress={() => increaseQty(product.id)}>
              <Text style={[S.bottomQtyBtnTxt, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={S.bottomAddBtn} onPress={() => addItem(product)}>
            <Text style={S.bottomAddBtnTxt}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  // top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  topRight: { flexDirection: 'row', gap: 8 },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },

  // hero
  heroWrap: { width: SW, height: SW * 0.75, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 5,
  },
  heroBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // title block
  titleBlock: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  productName: { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 28 },
  brandTag: { fontSize: 13, color: '#6B7280', marginTop: 2, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  metaTxt: { fontSize: 12, color: '#374151' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#9CA3AF' },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockDotGreen: { backgroundColor: '#16A34A' },
  stockDotRed: { backgroundColor: '#EF4444' },
  stockTxt: { fontSize: 13, fontWeight: '600' },

  // price box
  priceBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  priceMain: { fontSize: 22, fontWeight: '800', color: '#111827' },
  priceMrp: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  priceSaving: { fontSize: 12, color: '#16A34A', fontWeight: '700', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  deliveryTxt: { fontSize: 12, color: '#6B7280' },

  // section
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },

  // size chips
  sizeChip: {
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  sizeChipActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  sizeChipTxt: { fontSize: 13, color: '#374151', fontWeight: '500' },
  sizeChipTxtActive: { color: '#16A34A', fontWeight: '700' },

  // type chips
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  typeChipVeg: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  typeChipNonveg: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeChipTxt: { fontSize: 13, color: '#374151', fontWeight: '500' },
  typeChipTxtActive: { fontWeight: '700', color: '#1F2937' },

  // accordion
  accordionWrap: { marginHorizontal: 16, marginVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#fff' },
  accordionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  accordionBody: { paddingHorizontal: 14, paddingBottom: 14, backgroundColor: '#fff' },
  detailRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 3 },
  detailVal: { fontSize: 12, color: '#6B7280', lineHeight: 18 },

  // ratings
  reviewSection: { paddingHorizontal: 16, marginTop: 8 },
  reviewTopRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  reviewLeft: { alignItems: 'center', justifyContent: 'center', width: 80 },
  reviewBigRating: { fontSize: 36, fontWeight: '800', color: '#111827', lineHeight: 42 },
  reviewCount: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  reviewBars: { flex: 1, justifyContent: 'center', gap: 4 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingBarLabel: { fontSize: 11, color: '#6B7280', width: 10 },
  ratingBarTrack: { flex: 1, height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 },

  // review cards
  reviewCard: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarTxt: { fontSize: 14, fontWeight: '700', color: '#374151' },
  reviewNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  reviewTime: { fontSize: 11, color: '#9CA3AF' },
  reviewTxt: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginTop: 4 },

  // related / frequently bought together
  relSection: { marginTop: 16, marginBottom: 8 },
  relTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12, paddingHorizontal: 16 },
  relCard: { width: 120, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4 }, android: { elevation: 3 } }),
  },
  relImgWrap: { width: '100%', height: 90, position: 'relative' },
  relImg: { width: '100%', height: '100%' },
  relBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#F59E0B', borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1, zIndex: 2 },
  relBadgeTxt: { color: '#fff', fontSize: 8, fontWeight: '800' },
  relName: { fontSize: 11, fontWeight: '600', color: '#1F2937', paddingHorizontal: 6, marginTop: 5 },
  relPrice: { fontSize: 12, fontWeight: '700', color: '#111827', paddingHorizontal: 6, marginTop: 2 },
  relBottom: { paddingHorizontal: 6, paddingBottom: 8, marginTop: 4 },
  relAddBtn: { backgroundColor: '#064E3B', borderRadius: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  relQtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  relQtyBtn: { width: 24, height: 24, borderRadius: 5, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  relQtyBtnGreen: { backgroundColor: '#064E3B' },
  relQtyBtnTxt: { fontSize: 15, fontWeight: '700', color: '#374151', lineHeight: 19 },
  relQtyNum: { fontSize: 12, fontWeight: '700', color: '#1F2937' },

  // bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 10 },
    }),
  },
  bottomPriceCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bottomPrice: { fontSize: 20, fontWeight: '800', color: '#111827' },
  bottomMrp: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through' },
  bottomAddBtn: { backgroundColor: '#064E3B', borderRadius: 10, paddingHorizontal: 28, paddingVertical: 12 },
  bottomAddBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bottomQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0, backgroundColor: '#064E3B', borderRadius: 10, overflow: 'hidden' },
  bottomQtyBtn: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center' },
  bottomQtyBtnGreen: { backgroundColor: '#064E3B' },
  bottomQtyBtnTxt: { fontSize: 20, fontWeight: '700', color: '#fff' },
  bottomQtyNum: { fontSize: 16, fontWeight: '700', color: '#fff', paddingHorizontal: 14 },
});
