import { api } from '@/api/axios';
import {
  ProductsParams,
  ProductsResponse,
  CategoriesParams,
  CategoriesResponse,
  ProductCategory,
} from '../types';

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  BRK: '🌅',
  LUN: '🍛',
  DIN: '🍽️',
  SNK: '🍿',
  BEV: '🥤',
  DST: '🍰',
  VEG: '🥦',
  FRU: '🍎',
  GRO: '🛒',
  TIF: '🍱',
  TRD: '🔥',
  BDS: '💰',
};

const enrichCategory = (cat: ProductCategory): ProductCategory => ({
  ...cat,
  icon: cat.icon || CATEGORY_EMOJI_MAP[cat.code] || '🛒',
});

export const productService = {
  getProducts: async (params: ProductsParams = {}): Promise<ProductsResponse> => {
    const { pageable, lastId, search } = params;
    const queryParams: Record<string, any> = {};

    // Flatten pageable into top-level params
    if (pageable?.page !== undefined) queryParams.page = pageable.page;
    if (pageable?.size !== undefined) queryParams.size = pageable.size;
    if (pageable?.sort?.length) queryParams.sort = pageable.sort;

    if (lastId !== undefined) queryParams.lastId = lastId;
    if (search) queryParams.search = search;

    const response = await api.get('/v1/api/free/products', { params: queryParams });
    const data: ProductsResponse = response.data;
    return {
      ...data,
      data: data.data.map((p) => ({
        ...p,
        category: enrichCategory(p.category),
      })),
    };
  },

  getCategories: async (params: CategoriesParams = {}): Promise<CategoriesResponse> => {
    const { pageable } = params;
    const queryParams: Record<string, any> = {};

    // Flatten pageable into top-level params
    if (pageable?.page !== undefined) queryParams.page = pageable.page;
    if (pageable?.size !== undefined) queryParams.size = pageable.size;
    if (pageable?.sort?.length) queryParams.sort = pageable.sort;

    const response = await api.get('/v1/api/product-categories', { params: queryParams });
    const data: CategoriesResponse = response.data;
    return {
      ...data,
      content: data.content.map(enrichCategory),
    };
  },
};
