import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../features/dashboard/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlist?: (product: Product) => void;
  onIncrease?: (product: Product) => void;
  onDecrease?: (product: Product) => void;
  cartQty?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onWishlist,
  onIncrease,
  onDecrease,
  cartQty = 0,
}) => {
  const [wished, setWished] = useState(false);
  const discount =
    product.price > 0
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={
            product.imageUrl
              ? { uri: product.imageUrl }
              : require('../assets/placeholder.png')
          }
          style={styles.image}
          resizeMode="cover"
          defaultSource={require('../assets/placeholder.png')}
        />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishBtn}
          onPress={() => {
            setWished((p) => !p);
            onWishlist?.(product);
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons
            name={wished ? 'heart' : 'heart-outline'}
            size={16}
            color={wished ? '#EF4444' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={styles.ratingText}>4.5</Text>
          <Text style={styles.ratingCount}> | 1.2k</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.discountPrice || product.price}</Text>
          {product.discountPrice > 0 && product.price > product.discountPrice && (
            <Text style={styles.mrp}>₹{product.price}</Text>
          )}
        </View>

        {cartQty > 0 ? (
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => onDecrease?.(product)}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{cartQty}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, styles.qtyBtnGreen]}
              onPress={() => onIncrease?.(product)}
            >
              <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => onAddToCart?.(product)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 148,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 10,
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
  imageContainer: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
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
  discountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
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
  info: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
    minHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 2,
  },
  ratingCount: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
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
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
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
  qtyBtnGreen: {
    backgroundColor: '#064E3B',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 20,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
});
