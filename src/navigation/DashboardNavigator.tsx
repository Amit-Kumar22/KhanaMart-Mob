import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../features/dashboard/screens/HomeScreen';
import { CategoriesScreen } from '../features/dashboard/screens/CategoriesScreen';
import { CartScreen } from '../features/dashboard/screens/CartScreen';
import { ProfileScreen } from '../features/dashboard/screens/ProfileScreen';
import { SubscriptionScreen } from '../features/dashboard/screens/SubscriptionScreen';
import { ProductDetailScreen } from '../features/dashboard/screens/ProductDetailScreen';
import { BottomTabBar, TabName } from '../components/BottomTabBar';
import { useCartStore } from '../store/cartStore';
import { CartState } from '../store/cartStore';
import { Product, ProductCategory } from '../features/dashboard/types';
import { useProducts } from '../features/dashboard/hooks/useProducts';

export type MainTabParamList = {
  Home: undefined;
  Category: undefined;
  Subscription: undefined;
  Cart: undefined;
  Profile: undefined;
};

export const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab]           = useState<TabName>('Home');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [activeProduct, setActiveProduct]   = useState<Product | null>(null);
  const [prevTab, setPrevTab]               = useState<TabName>('Home');
  const cartCount = useCartStore((s: CartState) => s.totalItems());

  // Related products for detail screen (same category)
  const { data: relatedData } = useProducts(
    activeProduct?.category?.name ?? undefined,
    { page: 0, size: 10 },
    !!activeProduct,
  );
  const relatedProducts = (relatedData?.pages.flatMap((p) => p.data) ?? [])
    .filter((p) => p.id !== activeProduct?.id);

  const handleTabPress = (tab: TabName) => {
    setActiveProduct(null);
    if (tab !== 'Category') setSelectedCategory(null);
    setActiveTab(tab);
  };

  const handleCategoryPress = (cat: ProductCategory) => {
    setActiveProduct(null);
    setSelectedCategory(cat);
    setActiveTab('Category');
  };

  const handleProductPress = (product: Product) => {
    setPrevTab(activeTab);
    setActiveProduct(product);
  };

  const handleProductBack = () => {
    setActiveProduct(null);
  };

  // If a product is open — show detail screen (full screen, no bottom tab)
  if (activeProduct) {
    return (
      <SafeAreaProvider>
        <ProductDetailScreen
          product={activeProduct}
          relatedProducts={relatedProducts}
          onBack={handleProductBack}
          onProductPress={handleProductPress}
          onCartPress={() => { setActiveProduct(null); setActiveTab('Cart'); }}
        />
      </SafeAreaProvider>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <HomeScreen
            onTabPress={handleTabPress}
            onCategoryPress={handleCategoryPress}
            onProductPress={handleProductPress}
          />
        );
      case 'Category':
        return (
          <CategoriesScreen
            onTabPress={handleTabPress}
            initialCategory={selectedCategory}
            onProductPress={handleProductPress}
          />
        );
      case 'Subscription':
        return <SubscriptionScreen />;
      case 'Cart':
        return <CartScreen onTabPress={(tab) => handleTabPress(tab as TabName)} />;
      case 'Profile':
        return <ProfileScreen onTabPress={(tab) => handleTabPress(tab as TabName)} />;
      default:
        return (
          <HomeScreen
            onTabPress={handleTabPress}
            onCategoryPress={handleCategoryPress}
            onProductPress={handleProductPress}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flex: 1 }}>{renderScreen()}</View>
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={setActiveTab}
          cartCount={cartCount}
        />
      </View>
    </SafeAreaProvider>
  );
};
