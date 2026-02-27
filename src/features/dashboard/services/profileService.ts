import { api } from "@/api/axios";
import { Address } from "../../auth/types";

// ─── GET Profile Response ──────────────────────────────────────────────────────
export interface ProfileResponse {
  statusCode: string;
  message: string;
  result: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    address: Address;
    status: string;
    otpVerified: boolean;
  };
}

// ─── UPDATE Profile ────────────────────────────────────────────────────────────
export interface UpdateProfileRequest {
  name: string;
  phone: string;
  address: Address;
}

export interface UpdateProfileResponse {
  statusCode: string;
  message: string;
  result: {};
}

// ─── UPDATE Password ───────────────────────────────────────────────────────────
export interface UpdatePasswordRequest {
  password: string;
  confirmPassword: string;
  code: string;
}

// ─── GET Orders ───────────────────────────────────────────────────────────────
export interface OrderProduct {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  discountPrice: number;
  isVeg: boolean;
  preparationTime: number;
  category: {
    id: number;
    name: string;
    code: string;
    icon: string;
    description: string;
  };
}

export interface OrderItem {
  id: number;
  product: OrderProduct;
  quantity: number;
  price: number;
  discountPrice: number;
  totalPrice: number;
  active: boolean;
}

export interface OrderCoupon {
  name: string;
  startDate: string;
  endDate: string;
  couponValueType: "PERCENTAGE" | "VALUE";
  value: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface CustomerOrder {
  id: number;
  created: string;
  updated: string;
  orderNumber: string;
  items: OrderItem[];
  coupon: OrderCoupon | null;
  couponDiscount: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  customerPhone: string;
  address: Address;
}

export interface OrdersResponse {
  content: CustomerOrder[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

export interface OrdersParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export const profileService = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get("/v1/api/profile");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<UpdateProfileResponse> => {
    const response = await api.put("/v1/api/profile/update", data);
    return response.data;
  },

  updatePassword: async (
    data: UpdatePasswordRequest,
  ): Promise<UpdateProfileResponse> => {
    const response = await api.put("/v1/api/profile/update-password", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.delete("/v1/api/profile/logout");
  },

  getOrders: async (params: OrdersParams = {}): Promise<OrdersResponse> => {
    const response = await api.get("/v1/customer/orders", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        ...(params.sort?.length ? { sort: params.sort } : {}),
      },
    });
    return response.data;
  },
};
