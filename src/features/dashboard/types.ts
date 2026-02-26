export interface ProductCategory {
  id: number;
  name: string;
  code: string;
  icon: string;
  description: string;
}

export interface Product {
  id: number;
  created: string;
  updated: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  discountPrice: number;
  productCode: string;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  isDeleted: boolean;
  preparationTime: number;
  quantity: number;
  weight: number;
  active: boolean;
}

export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface ProductsParams {
  pageable?: PageableParams;
  lastId?: number;
  search?: string;
}

export interface ProductsResponse {
  data: Product[];
  pageSize: number;
  nextCursor: number;
  hasNext: boolean;
}

export interface CategoriesParams {
  pageable?: PageableParams;
}

export interface CategoriesResponse {
  content: ProductCategory[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}
