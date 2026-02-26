import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { PageableParams } from '../types';

export const QUERY_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'productCategories',
} as const;

export const useProducts = (search?: string, pageable?: PageableParams, enabled = true) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, search, pageable],
    queryFn: ({ pageParam }) =>
      productService.getProducts({
        pageable: pageable ?? { page: 0, size: 10 },
        lastId: pageParam as number | undefined,
        search,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled,
  });
};

export const useProductsByCategory = (
  categoryCode: string,
  search?: string,
  pageable?: PageableParams,
) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, categoryCode, search, pageable],
    queryFn: ({ pageParam }) =>
      productService.getProducts({
        pageable: pageable ?? { page: 0, size: 10 },
        lastId: pageParam as number | undefined,
        search,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });
};

export const useCategories = (pageable?: PageableParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, pageable],
    queryFn: () =>
      productService.getCategories({
        pageable: pageable ?? { page: 0, size: 20 },
      }),
    staleTime: 10 * 60 * 1000,
  });
};
